import { kmeans } from 'ml-kmeans';
import { DecisionTreeClassifier } from 'ml-cart';
import { Apriori } from 'node-apriori';
import { db, StudentRecord } from '../backend/db';

let dtClassifier: any = null;

export function trainDecisionTree() {
  const data = db.getAllRecords();
  if (data.length === 0) return null;
  
  // Features: ssc, hsc, degree, cgpa, tech, soft, intern, cert, att, backlogs
  const X = data.map(r => [
    r.ssc_percentage,
    r.hsc_percentage,
    r.degree_percentage,
    r.cgpa,
    r.technical_skill_score,
    r.soft_skill_score,
    r.internship_count,
    r.certifications,
    r.attendance_percentage,
    r.backlogs
  ]);
  const y = data.map(r => r.placement_status);

  dtClassifier = new DecisionTreeClassifier();
  dtClassifier.train(X, y);
  
  // Predict on same data for simplicity to get accuracy/confusion matrix
  const predictions = dtClassifier.predict(X);
  let correct = 0;
  let tp=0, fp=0, tn=0, fn=0;
  for(let i=0; i<y.length; i++) {
    if(predictions[i] === y[i]) correct++;
    if(predictions[i]===1 && y[i]===1) tp++;
    if(predictions[i]===1 && y[i]===0) fp++;
    if(predictions[i]===0 && y[i]===0) tn++;
    if(predictions[i]===0 && y[i]===1) fn++;
  }
  
  const accuracy = correct / y.length;
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = 2 * (precision * recall) / (precision + recall) || 0;

  return {
    accuracy,
    precision,
    recall,
    f1,
    confusionMatrix: [[tn, fp], [fn, tp]]
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
  
  // User specifically requested these exact boundaries
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
  
  // Map clusters to High, Medium, Low potential based on centroids avg
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
    const t = [];
    if (r.cgpa >= 8) t.push('High_CGPA');
    if (r.internship_count > 0) t.push('Has_Internship');
    if (r.certifications > 0) t.push('Has_Certifications');
    if (r.technical_skill_score >= 80) t.push('High_Tech_Skill');
    if (r.placement_status === 1) t.push('Placement_Yes');
    return t;
  });

  // Apriori requires itemsets
  return new Promise((resolve) => {
    const apriori = new Apriori(0.1); // 10% support
    const rules: any[] = [];
    apriori.on('data', (itemset: any) => {
        // We only care about frequent itemsets containing Placement_Yes
        if(itemset.items.includes('Placement_Yes') && itemset.items.length > 1) {
            rules.push({
                items: itemset.items,
                support: itemset.support
            });
        }
    });
    apriori.exec(transactions).then(() => {
        rules.sort((a, b) => b.support - a.support);
        resolve(rules.slice(0, 10)); // return top 10 rules
    });
  });
}
