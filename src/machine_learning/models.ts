import { kmeans } from 'ml-kmeans';
import { DecisionTreeClassifier } from 'ml-cart';
import { Apriori } from 'node-apriori';
import { db, StudentRecord } from '../backend/db';

let dtClassifier: any = null;
let dtMetrics: any = null;
let kmeansCache: any = null;
let aprioriCache: any[] | null = null;

function trainTestSplit(data: any[], testSize = 0.2) {
  const shuffled = [...data].sort(() => 0.5 - Math.random());
  const splitIdx = Math.floor(data.length * (1 - testSize));
  return { train: shuffled.slice(0, splitIdx), test: shuffled.slice(splitIdx) };
}

function calculateFeatureImportance(data: any[]) {
  const features = ['ssc_percentage', 'hsc_percentage', 'degree_percentage', 'cgpa', 'technical_skill_score', 'soft_skill_score', 'internship_count', 'certifications', 'attendance_percentage', 'backlogs'];
  const y = data.map(r => r.placement_status), meanY = y.reduce((a, b) => a + b, 0) / y.length;
  const importances = features.map(feat => {
    const x = data.map(r => (r as any)[feat]), meanX = x.reduce((a, b) => a + b, 0) / x.length;
    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < data.length; i++) { const dx = x[i] - meanX, dy = y[i] - meanY; num += dx * dy; denX += dx * dx; denY += dy * dy; }
    const r = num / Math.sqrt(denX * denY);
    return { feature: feat, importance: Number.isNaN(r) ? 0 : Math.abs(r) };
  });
  const totalImp = importances.reduce((s, f) => s + f.importance, 0) || 1;
  return importances.map(f => ({ feature: f.feature.replace(/_/g, ' ').replace(/\bw/g, l => l.toUpperCase()), importance: f.importance / totalImp * 100 })).sort((a, b) => b.importance - a.importance);
}

export function trainDecisionTree(force = false) {
  if (dtMetrics && dtClassifier && !force) return dtMetrics;
  const data = db.getAllRecords();
  if (!data.length) return null;
  const { train, test } = trainTestSplit(data, 0.2);
  const getFeatures = (r: StudentRecord) => [r.ssc_percentage, r.hsc_percentage, r.degree_percentage, r.cgpa, r.technical_skill_score, r.soft_skill_score, r.internship_count, r.certifications, r.attendance_percentage, r.backlogs];
  const X_train = train.map(getFeatures), y_train = train.map(r => r.placement_status), X_test = test.map(getFeatures), y_test = test.map(r => r.placement_status);
  dtClassifier = new DecisionTreeClassifier();
  dtClassifier.train(X_train, y_train);
  const predictions = dtClassifier.predict(X_test);
  let correct = 0, tp = 0, fp = 0, tn = 0, fn = 0;
  for (let i = 0; i < y_test.length; i++) { if (predictions[i] === y_test[i]) correct++; if (predictions[i] === 1 && y_test[i] === 1) tp++; if (predictions[i] === 1 && y_test[i] === 0) fp++; if (predictions[i] === 0 && y_test[i] === 0) tn++; if (predictions[i] === 0 && y_test[i] === 1) fn++; }
  const accuracy = y_test.length ? correct / y_test.length : 0, precision = tp / (tp + fp) || 0, recall = tp / (tp + fn) || 0, f1 = 2 * precision * recall / (precision + recall) || 0;
  dtMetrics = { accuracy, precision, recall, f1, confusionMatrix: [[tn, fp], [fn, tp]], featureImportance: calculateFeatureImportance(train) };
  return dtMetrics;
}

export function predictPlacement(features: number[]) {
  if (!dtClassifier) trainDecisionTree();
  const cgpa = features[3], tech = features[4], soft = features[5], intern = features[6], cert = features[7], backlogs = features[9];
  if (cgpa < 6 || intern === 0) return 0;
  const score = cgpa * 10 + tech + soft + intern * 5 + cert * 5 - backlogs * 5;
  if (score < 200 || backlogs > 3) return 0;
  return dtClassifier ? dtClassifier.predict([features])[0] : 0;
}

export function runKMeans() {
  if (kmeansCache) return kmeansCache;
  const data = db.getAllRecords();
  if (!data.length) return null;
  const X = data.map(r => [r.cgpa, r.technical_skill_score, r.soft_skill_score]);
  const result = kmeans(X, 3, { initialization: 'kmeans++' });
  const centroids = result.centroids.map((c: any, i: number) => ({ index: i, score: c[0] + c[1] / 10 + c[2] / 10 })).sort((a, b) => b.score - a.score);
  const clusterMapping: Record<number, string> = {};
  if (centroids[0]) clusterMapping[centroids[0].index] = 'High Placement Potential';
  if (centroids[1]) clusterMapping[centroids[1].index] = 'Medium Placement Potential';
  if (centroids[2]) clusterMapping[centroids[2].index] = 'Low Placement Potential';
  const counts = { High: 0, Medium: 0, Low: 0 };
  result.clusters.forEach((cluster: number) => { const label = clusterMapping[cluster] || 'Low Placement Potential'; if (label.includes('High')) counts.High++; else if (label.includes('Medium')) counts.Medium++; else counts.Low++; });
  kmeansCache = { counts, centroids: result.centroids };
  return kmeansCache;
}

export async function runApriori(): Promise<any[]> {
  if (aprioriCache) return aprioriCache;
  const data = db.getAllRecords();
  if (!data.length) return [];
  const transactions = data.map(r => { const t: string[] = []; if (r.cgpa >= 8) t.push('High_CGPA'); if (r.internship_count > 0) t.push('Has_Internship'); if (r.certifications > 0) t.push('Has_Certifications'); if (r.technical_skill_score >= 80) t.push('High_Tech_Skill'); if (r.placement_status === 1) t.push('Placement_Yes'); return t; });
  aprioriCache = await new Promise<any[]>(resolve => {
    const apriori = new Apriori(0.1), rules: any[] = [];
    apriori.on('data', (itemset: any) => { if (itemset.items.includes('Placement_Yes') && itemset.items.length > 1) { const raw = Number(itemset.support), support = raw > 1 ? raw / data.length : raw; rules.push({ items: itemset.items, support: Math.max(0, Math.min(1, support)) }); } });
    apriori.exec(transactions).then(() => { rules.sort((a, b) => b.support - a.support); resolve(rules.slice(0, 10)); });
  });
  return aprioriCache;
}
