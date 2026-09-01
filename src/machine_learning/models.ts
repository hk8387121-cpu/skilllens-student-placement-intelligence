import { kmeans } from 'ml-kmeans';
import { DecisionTreeClassifier } from 'ml-cart';
import { Apriori } from 'node-apriori';
import { db, StudentRecord } from '../backend/db';

let dtClassifier: any = null;

// Helper to shuffle and split data
function trainTestSplit(data: any[], testSize = 0.2) {
  const shuffled = [...data].sort(() => 0.5 - Math.random());
  const splitIdx = Math.floor(data.length * (1 - testSize));
  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx)
  };
}

function calculateFeatureImportance(data: any[]) {
  // We approximate feature importance using absolute Pearson correlation with placement_status
  // In a real scikit-learn DT, this would be Gini importance.
  const features = ['ssc_percentage', 'hsc_percentage', 'degree_percentage', 'cgpa', 'technical_skill_score', 'soft_skill_score', 'internship_count', 'certifications', 'attendance_percentage', 'backlogs'];
  
  const y = data.map(r => r.placement_status);
  const meanY = y.reduce((a, b) => a + b, 0) / y.length;
  
  const importances = features.map(feat => {
    const x = data.map(r => (r as any)[feat]);
    const meanX = x.reduce((a, b) => a + b, 0) / x.length;
    
    let num = 0, denX = 0, denY = 0;
    for(let i=0; i<data.length; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    const r = num / Math.sqrt(denX * denY);
    return { feature: feat, importance: isNaN(r) ? 0 : Math.abs(r) };
  });
  
  const totalImp = importances.reduce((s, f) => s + f.importance, 0);
  return importances.map(f => ({
    feature: f.feature.replace(/_/g, ' ').replace(/\bw/g, l => l.toUpperCase()),
    importance: (f.importance / totalImp) * 100
  })).sort((a, b) => b.importance - a.importance);
}

export function trainDecisionTree() {
  const data = db.getAllRecords();
  if (data.length === 0) return null;
  
  // Create Train / Test split
  const { train, test } = trainTestSplit(data, 0.2);

  // Features: ssc, hsc, degree, cgpa, tech, soft, intern, cert, att, backlogs
  const getFeatures = (r: StudentRecord) => [
    r.ssc_percentage, r.hsc_percentage, r.degree_percentage, r.cgpa,
    r.technical_skill_score, r.soft_skill_score, r.internship_count,
    r.certifications, r.attendance_percentage, r.backlogs
  ];

  const X_train = train.map(getFeatures);
  const y_train = train.map(r => r.placement_status);
  
  const X_test = test.map(getFeatures);
  const y_test = test.map(r => r.placement_status);

  dtClassifier = new DecisionTreeClassifier();
  dtClassifier.train(X_train, y_train);
  
  // Evaluate on Test set
  const predictions = dtClassifier.predict(X_test);
  let correct = 0;
  let tp=0, fp=0, tn=0, fn=0;
  
  for(let i=0; i<y_test.length; i++) {
    if(predictions[i] === y_test[i]) correct++;
    if(predictions[i]===1 && y_test[i]===1) tp++;
    if(predictions[i]===1 && y_test[i]===0) fp++;
    if(predictions[i]===0 && y_test[i]===0) tn++;
    if(predictions[i]===0 && y_test[i]===1) fn++;
  }
  
  const accuracy = correct / y_test.length;
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = 2 * (precision * recall) / (precision + recall) || 0;
  
  return {
    accuracy,
    precision,
    recall,
    f1,
    confusionMatrix: [[tn, fp], [fn, tp]],
    featureImportance: calculateFeatureImportance(train)
  };
}

export function predictPlacement(features: number[]) {
  if (!dtClassifier) {
    trainDecisionTree();
  }
  
  // Add heuristic guardrails to prevent ML overfitting on synthetic dataset edge cases
  const cgpa = features[3];
  const tech = features[4];
  const soft = features[5];
  const intern = features[6];
  const cert = features[7];
  const backlogs = features[9];
  
  if (cgpa < 6.0 || intern === 0) {
    return 0;
  }
  
  const score = cgpa * 10 + tech + soft + intern * 5 + cert * 5 - backlogs * 5;
  if (score < 200 || backlogs > 3) {
    return 0;
  }

  if (!dtClassifier) return 0;
  const pred = dtClassifier.predict([features]);
  return pred[0];
}

export function runKMeans() {
  const data = db.getAllRecords();
  if (data.length === 0) return null;
  
  // Cluster on cgpa, tech skill, soft skill
  const X = data.map(r => [r.cgpa, r.technical_skill_score, r.soft_skill_score]);
  
  // 3 clusters
  const result = kmeans(X, 3, { initialization: 'kmeans++' });
  
  // Map clusters
  const centroids = result.centroids.map((c: any, i: number) => ({ index: i, score: c[0] + c[1]/10 + c[2]/10 }));
  centroids.sort((a, b) => b.score - a.score);
  
  const clusterMapping: Record<number, string> = {};
  if (centroids[0]) clusterMapping[centroids[0].index] = 'High Placement Potential';
  if (centroids[1]) clusterMapping[centroids[1].index] = 'Medium Placement Potential';
  if (centroids[2]) clusterMapping[centroids[2].index] = 'Low Placement Potential';
  
  const clustersCount = { High: 0, Medium: 0, Low: 0 };
  const mappedData = data.map((r, i) => {
    const clusterLabel = clusterMapping[result.clusters[i]] || 'Low Placement Potential';
    if (clusterLabel.includes('High')) clustersCount.High++;
    if (clusterLabel.includes('Medium')) clustersCount.Medium++;
    if (clusterLabel.includes('Low')) clustersCount.Low++;
    return { ...r, cluster: clusterLabel };
  });

  return {
    counts: clustersCount,
    centroids: result.centroids
  };
}

export async function runApriori(): Promise<any[]> {
  const data = db.getAllRecords();
  if (data.length === 0) return [];
  
  const transactions = data.map(r => {
    const t: string[] = [];
    if (r.cgpa >= 8) t.push('High_CGPA');
    if (r.internship_count > 0) t.push('Has_Internship');
    if (r.certifications > 0) t.push('Has_Certifications');
    if (r.technical_skill_score >= 80) t.push('High_Tech_Skill');
    if (r.placement_status === 1) t.push('Placement_Yes');
    return t;
  });

  return new Promise((resolve) => {
    const apriori = new Apriori(0.1); // 10% minimum support
    const rules: any[] = [];
    apriori.on('data', (itemset: any) => {
      if (itemset.items.includes('Placement_Yes') && itemset.items.length > 1) {
        // node-apriori returns the matched transaction count in this version,
        // while the UI expects support as a fraction between 0 and 1.
        // Normalize defensively so the API always returns a valid support value.
        const rawSupport = Number(itemset.support);
        const support = rawSupport > 1 ? rawSupport / data.length : rawSupport;
        rules.push({
          items: itemset.items,
          support: Math.max(0, Math.min(1, support))
        });
      }
    });
    apriori.exec(transactions).then(() => {
      rules.sort((a, b) => b.support - a.support);
      resolve(rules.slice(0, 10)); // return top 10 rules
    });
  });
}
