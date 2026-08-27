import express from 'express';
import { db } from './db';
import { trainDecisionTree, runKMeans, runApriori, predictPlacement } from '../machine_learning/models';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
  app.use(express.json());
  const PORT = Number(process.env.PORT) || 3000;

  await db.loadData();
  trainDecisionTree();

  // Render hosts the API only. The React/Vite frontend is deployed separately on GitHub Pages.
  app.get('/', (req, res) => res.json({
    status: 'ok',
    service: 'SkillLens Student Placement Intelligence API',
    records: db.getAllRecords().length,
    frontend: 'https://hk8387121-cpu.github.io/skilllens-student-placement-intelligence/'
  }));
  app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Student Placement Intelligence System', records: db.getAllRecords().length }));
  app.get('/api/dashboard/kpis', (req, res) => res.json(db.getKPIs()));
  app.get('/api/dashboard/charts', (req, res) => {
    const data = db.getAllRecords();
    const placed = data.filter(d => d.placement_status === 1).length;
    const notPlaced = data.length - placed;
    const malePlaced = data.filter(d => d.gender === 'Male' && d.placement_status === 1).length;
    const femalePlaced = data.filter(d => d.gender === 'Female' && d.placement_status === 1).length;
    const maleNot = data.filter(d => d.gender === 'Male' && d.placement_status === 0).length;
    const femaleNot = data.filter(d => d.gender === 'Female' && d.placement_status === 0).length;
    const cgpaBins = { '5-6': 0, '6-7': 0, '7-8': 0, '8-9': 0, '9-10': 0 };
    data.forEach(d => { if (d.cgpa < 6) cgpaBins['5-6']++; else if (d.cgpa < 7) cgpaBins['6-7']++; else if (d.cgpa < 8) cgpaBins['7-8']++; else if (d.cgpa < 9) cgpaBins['8-9']++; else cgpaBins['9-10']++; });
    res.json({ placementStatus: { Placed: placed, 'Not Placed': notPlaced }, placementByGender: { Male: { placed: malePlaced, notPlaced: maleNot }, Female: { placed: femalePlaced, notPlaced: femaleNot } }, cgpaDistribution: cgpaBins });
  });
  app.get('/api/students', (req, res) => res.json(db.getAllRecords()));
  app.get('/api/ml/decision-tree', (req, res) => res.json(trainDecisionTree()));
  app.post('/api/ml/predict', (req, res) => {
    const { features } = req.body;
    if (!Array.isArray(features) || features.length !== 10 || features.some((v: any) => typeof v !== 'number' || !Number.isFinite(v))) return res.status(400).json({ error: 'features must be an array of 10 numeric values' });
    const status = predictPlacement(features);
    let salary: string | number = 0;
    if (status === 1) {
      const [, , , cgpa, tech, soft, intern, cert, , backlogs] = features;
      let calcSalary = 4.5;
      if (cgpa >= 6.0) calcSalary += (cgpa - 6.0) * 1.5;
      if (tech >= 60) calcSalary += (tech - 60) * 0.1;
      if (soft >= 60) calcSalary += (soft - 60) * 0.05;
      calcSalary += intern * 0.8 + cert * 0.5 - backlogs * 1.0;
      salary = Math.max(3.0, Math.min(25.0, calcSalary)).toFixed(2);
    }
    const improvements: string[] = [];
    if (status === 0) {
      const [, , , cgpa, tech, soft, intern, cert, att, backlogs] = features;
      if (cgpa < 7.0) improvements.push('Focus on improving your CGPA (aim for 7.0+)');
      if (tech < 75) improvements.push('Enhance your technical skills through projects and practice');
      if (soft < 75) improvements.push('Work on soft skills like communication and teamwork');
      if (intern === 0) improvements.push('Secure at least one internship to gain industry experience');
      if (cert === 0) improvements.push('Complete relevant technical certifications');
      if (backlogs > 0) improvements.push('Clear all active backlogs before placement season');
      if (att < 75) improvements.push('Maintain higher attendance (above 75%)');
      if (improvements.length === 0) improvements.push('Participate in live projects and build a stronger resume');
    }
    res.json({ placement_status: status, expected_salary: salary, improvements });
  });
  app.get('/api/ml/kmeans', (req, res) => res.json(runKMeans()));
  app.get('/api/ml/apriori', async (req, res) => res.json(await runApriori()));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

startServer().catch(error => { console.error('Failed to start server:', error); process.exit(1); });
