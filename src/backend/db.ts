import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';
import csv from 'csv-parser';

export interface StudentRecord {
  student_id: number;
  gender: string;
  ssc_percentage: number;
  hsc_percentage: number;
  degree_percentage: number;
  cgpa: number;
  entrance_exam_score: number;
  technical_skill_score: number;
  soft_skill_score: number;
  internship_count: number;
  live_projects: number;
  work_experience_months: number;
  certifications: number;
  attendance_percentage: number;
  backlogs: number;
  extracurricular_activities: string;
  placement_status: number;
  salary_package_lpa: number;
}

class Database {
  private data: StudentRecord[] = [];
  private db: any = null;

  private async readCsv(csvPath: string): Promise<StudentRecord[]> {
    return new Promise((resolve, reject) => {
      const rows: StudentRecord[] = [];
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (r: any) => {
          rows.push({
            student_id: Number(r.student_id),
            gender: String(r.gender || '').trim().replace(/^./, c => c.toUpperCase()),
            ssc_percentage: Number(r.ssc_percentage),
            hsc_percentage: Number(r.hsc_percentage),
            degree_percentage: Number(r.degree_percentage),
            cgpa: Number(r.cgpa),
            entrance_exam_score: Number(r.entrance_exam_score),
            technical_skill_score: Number(r.technical_skill_score),
            soft_skill_score: Number(r.soft_skill_score),
            internship_count: Number(r.internship_count),
            live_projects: Number(r.live_projects),
            work_experience_months: Number(r.work_experience_months),
            certifications: Number(r.certifications),
            attendance_percentage: Number(r.attendance_percentage),
            backlogs: Number(r.backlogs),
            extracurricular_activities: String(r.extracurricular_activities || '').trim().replace(/^./, c => c.toUpperCase()),
            placement_status: Number(r.placement_status),
            salary_package_lpa: Number(r.salary_package_lpa || 0)
          });
        })
        .on('end', () => resolve(rows))
        .on('error', reject);
    });
  }

  private buildWarehouse(SQL: any, rows: StudentRecord[]) {
    this.db = new SQL.Database();
    this.db.run(`
      CREATE TABLE Dim_Student (
        student_sk INTEGER PRIMARY KEY,
        student_id INTEGER UNIQUE NOT NULL,
        gender TEXT,
        extracurricular_activities TEXT
      );
      CREATE TABLE Dim_Academic (
        academic_sk INTEGER PRIMARY KEY,
        ssc_percentage REAL,
        hsc_percentage REAL,
        degree_percentage REAL,
        cgpa REAL,
        backlogs INTEGER
      );
      CREATE TABLE Dim_Skills (
        skill_sk INTEGER PRIMARY KEY,
        entrance_exam_score REAL,
        technical_skill_score REAL,
        soft_skill_score REAL,
        certifications INTEGER,
        attendance_percentage REAL
      );
      CREATE TABLE Dim_Experience (
        experience_sk INTEGER PRIMARY KEY,
        internship_count INTEGER,
        live_projects INTEGER,
        work_experience_months INTEGER
      );
      CREATE TABLE Fact_Placement (
        fact_id INTEGER PRIMARY KEY,
        student_sk INTEGER,
        academic_sk INTEGER,
        skill_sk INTEGER,
        experience_sk INTEGER,
        placement_status INTEGER,
        salary_package_lpa REAL,
        FOREIGN KEY (student_sk) REFERENCES Dim_Student(student_sk),
        FOREIGN KEY (academic_sk) REFERENCES Dim_Academic(academic_sk),
        FOREIGN KEY (skill_sk) REFERENCES Dim_Skills(skill_sk),
        FOREIGN KEY (experience_sk) REFERENCES Dim_Experience(experience_sk)
      );
    `);

    const insertStudent = this.db.prepare('INSERT INTO Dim_Student VALUES (?, ?, ?, ?)');
    const insertAcademic = this.db.prepare('INSERT INTO Dim_Academic VALUES (?, ?, ?, ?, ?, ?)');
    const insertSkills = this.db.prepare('INSERT INTO Dim_Skills VALUES (?, ?, ?, ?, ?, ?)');
    const insertExperience = this.db.prepare('INSERT INTO Dim_Experience VALUES (?, ?, ?, ?)');
    const insertFact = this.db.prepare('INSERT INTO Fact_Placement VALUES (?, ?, ?, ?, ?, ?, ?)');

    try {
      rows.forEach((r, i) => {
        const key = i + 1;
        insertStudent.run([key, r.student_id, r.gender, r.extracurricular_activities]);
        insertAcademic.run([key, r.ssc_percentage, r.hsc_percentage, r.degree_percentage, r.cgpa, r.backlogs]);
        insertSkills.run([key, r.entrance_exam_score, r.technical_skill_score, r.soft_skill_score, r.certifications, r.attendance_percentage]);
        insertExperience.run([key, r.internship_count, r.live_projects, r.work_experience_months]);
        insertFact.run([key, key, key, key, key, r.placement_status, r.salary_package_lpa]);
      });
    } finally {
      insertStudent.free();
      insertAcademic.free();
      insertSkills.free();
      insertExperience.free();
      insertFact.free();
    }
  }

  async loadData(): Promise<void> {
    const dbPath = path.join(process.cwd(), 'database', 'skilllens_dw.sqlite');
    const csvPath = path.join(process.cwd(), 'dataset', 'student_placement.csv');
    const SQL = await initSqlJs();

    if (fs.existsSync(dbPath)) {
      try {
        const filebuffer = fs.readFileSync(dbPath);
        this.db = new SQL.Database(filebuffer);
      } catch (error) {
        console.warn('Committed SQLite warehouse is invalid; rebuilding an in-memory Star Schema from the source CSV.');
        this.db = null;
      }
    }

    if (!this.db) {
      if (!fs.existsSync(csvPath)) throw new Error(`Neither a valid warehouse nor source CSV was found: ${csvPath}`);
      const rows = await this.readCsv(csvPath);
      this.buildWarehouse(SQL, rows);
    }

    const query = `
      SELECT
        ds.student_id, ds.gender, da.ssc_percentage, da.hsc_percentage, da.degree_percentage, da.cgpa,
        dsk.entrance_exam_score, dsk.technical_skill_score, dsk.soft_skill_score,
        de.internship_count, de.live_projects, de.work_experience_months,
        dsk.certifications, dsk.attendance_percentage, da.backlogs,
        ds.extracurricular_activities, fp.placement_status, fp.salary_package_lpa
      FROM Fact_Placement fp
      JOIN Dim_Student ds ON fp.student_sk = ds.student_sk
      JOIN Dim_Academic da ON fp.academic_sk = da.academic_sk
      JOIN Dim_Skills dsk ON fp.skill_sk = dsk.skill_sk
      JOIN Dim_Experience de ON fp.experience_sk = de.experience_sk
      ORDER BY ds.student_id;
    `;

    const results = this.db.exec(query);
    if (!results.length) throw new Error('Data Warehouse contains no placement records.');
    const columns = results[0].columns;
    this.data = results[0].values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, idx: number) => { obj[col] = row[idx]; });
      return obj as StudentRecord;
    });
    console.log(`Loaded ${this.data.length} records from Data Warehouse (Star Schema).`);
  }

  getAllRecords(): StudentRecord[] { return this.data; }

  getKPIs() {
    if (!this.db) return { totalStudents: 0, totalPlaced: 0, placementPercentage: 0, avgSalary: 0, highestSalary: 0 };
    const res = this.db.exec(`
      SELECT COUNT(*), SUM(placement_status), (SUM(placement_status) * 100.0 / COUNT(*)),
             AVG(CASE WHEN placement_status = 1 THEN salary_package_lpa ELSE NULL END), MAX(salary_package_lpa)
      FROM Fact_Placement
    `);
    const row = res[0].values[0];
    return { totalStudents: row[0], totalPlaced: row[1] || 0, placementPercentage: row[2] || 0, avgSalary: row[3] || 0, highestSalary: row[4] || 0 };
  }
}

export const db = new Database();
