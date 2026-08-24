import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import initSqlJs from 'sql.js';

const dbPath = path.join(process.cwd(), 'database', 'skilllens_dw.sqlite');
const csvPath = path.join(process.cwd(), 'dataset', 'student_placement.csv');

async function runETL() {
  console.log('Starting ETL Process...');
  
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  
  // 1. Create Star Schema
  db.run(`
    CREATE TABLE Dim_Student (student_sk INTEGER PRIMARY KEY, student_id INTEGER UNIQUE, gender TEXT, extracurricular_activities TEXT);
    CREATE TABLE Dim_Academic (academic_sk INTEGER PRIMARY KEY, ssc_percentage REAL, hsc_percentage REAL, degree_percentage REAL, cgpa REAL, backlogs INTEGER);
    CREATE TABLE Dim_Skills (skill_sk INTEGER PRIMARY KEY, entrance_exam_score REAL, technical_skill_score REAL, soft_skill_score REAL, certifications INTEGER, attendance_percentage REAL);
    CREATE TABLE Dim_Experience (experience_sk INTEGER PRIMARY KEY, internship_count INTEGER, live_projects INTEGER, work_experience_months INTEGER);
    CREATE TABLE Fact_Placement (
      fact_id INTEGER PRIMARY KEY, student_sk INTEGER, academic_sk INTEGER, skill_sk INTEGER, experience_sk INTEGER,
      placement_status INTEGER, salary_package_lpa REAL
    );
  `);

  // 2. Extract & Transform
  const records: any[] = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath).pipe(csv())
      .on('data', row => records.push(row)).on('end', resolve).on('error', reject);
  });

  console.log(`Extracted ${records.length} records. Loading into Data Warehouse...`);

  // 3. Load
  db.run('BEGIN TRANSACTION');
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const sk = i + 1;
    
    db.run('INSERT INTO Dim_Student VALUES (?, ?, ?, ?)', [sk, parseInt(r.student_id), r.gender, r.extracurricular_activities]);
    db.run('INSERT INTO Dim_Academic VALUES (?, ?, ?, ?, ?, ?)', [sk, parseFloat(r.ssc_percentage), parseFloat(r.hsc_percentage), parseFloat(r.degree_percentage), parseFloat(r.cgpa), parseInt(r.backlogs)]);
    db.run('INSERT INTO Dim_Skills VALUES (?, ?, ?, ?, ?, ?)', [sk, parseFloat(r.entrance_exam_score), parseFloat(r.technical_skill_score), parseFloat(r.soft_skill_score), parseInt(r.certifications), parseFloat(r.attendance_percentage)]);
    db.run('INSERT INTO Dim_Experience VALUES (?, ?, ?, ?)', [sk, parseInt(r.internship_count), parseInt(r.live_projects), parseInt(r.work_experience_months)]);
    db.run('INSERT INTO Fact_Placement VALUES (?, ?, ?, ?, ?, ?, ?)', [sk, sk, sk, sk, sk, parseInt(r.placement_status), parseFloat(r.salary_package_lpa)]);
  }
  db.run('COMMIT');

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log('ETL Process Completed Successfully. Data Warehouse is ready at ' + dbPath);
}
runETL();
