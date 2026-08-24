import { db } from './src/backend/db.js';
import { trainDecisionTree, predictPlacement } from './src/machine_learning/models.js';

// We need to load db first.
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

async function test() {
  await db.loadData(path.join(process.cwd(), 'dataset/student_placement.csv'));
  const res = trainDecisionTree();
  console.log('Train accuracy:', res.accuracy);
  
  // Try predicting
  const lowCgpa = [75, 70, 72, 5.0, 80, 75, 0, 1, 85, 0];
  console.log('Prediction for low cgpa:', predictPlacement(lowCgpa));
}
test();
