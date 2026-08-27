import { trainDecisionTree } from './src/machine_learning/models';
import { db } from './src/backend/db';
(async () => {
  await db.loadData();
  const metrics = trainDecisionTree();
  console.log(JSON.stringify(metrics, null, 2));
})();
