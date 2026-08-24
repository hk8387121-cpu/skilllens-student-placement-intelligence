import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

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

  async loadData(): Promise<void> {
    const dbPath = path.join(process.cwd(), 'database', 'skilllens_dw.sqlite');
    if (!fs.existsSync(dbPath)) {
      console.warn('Data Warehouse not found. Please run ETL first.');
      return;
    }

    const SQL = await initSqlJs();
    const filebuffer = fs.readFileSync(dbPath);
    this.db = new SQL.Database(filebuffer);

    // Perform an OLAP-style query joining the star schema to flatten it for ML and UI
    const query = `
      SELECT 
        ds.student_id, ds.gender, ds.extracurricular_activities,
        da.ssc_percentage, da.hsc_percentage, da.degree_percentage, da.cgpa, da.backlogs,
        dsk.entrance_exam_score, dsk.technical_skill_score, dsk.soft_skill_score, dsk.certifications, dsk.attendance_percentage,
        de.internship_count, de.live_projects, de.work_experience_months,
        fp.placement_status, fp.salary_package_lpa
      FROM Fact_Placement fp
      JOIN Dim_Student ds ON fp.student_sk = ds.student_sk
      JOIN Dim_Academic da ON fp.academic_sk = da.academic_sk
      JOIN Dim_Skills dsk ON fp.skill_sk = dsk.skill_sk
      JOIN Dim_Experience de ON fp.experience_sk = de.experience_sk
    `;
    
    const results = this.db.exec(query);
    if (results.length > 0) {
      const columns = results[0].columns;
      this.data = results[0].values.map((row: any[]) => {
        const obj: any = {};
        columns.forEach((col: string, idx: number) => {
          obj[col] = row[idx];
        });
        return obj as StudentRecord;
      });
      console.log(`Loaded ${this.data.length} records from Data Warehouse (Star Schema).`);
    }
  }

  getAllRecords(): StudentRecord[] {
    return this.data;
  }

  getKPIs() {
    // We can either do this via SQL or via the flattened array.
    // Doing it via SQL to demonstrate DWDM principles.
    if (!this.db) return { totalStudents: 0, totalPlaced: 0, placementPercentage: 0, avgSalary: 0, highestSalary: 0 };
    
    const res = this.db.exec(`
      SELECT 
        COUNT(*) as totalStudents,
        SUM(placement_status) as totalPlaced,
        (SUM(placement_status) * 100.0 / COUNT(*)) as placementPercentage,
        AVG(CASE WHEN placement_status = 1 THEN salary_package_lpa ELSE NULL END) as avgSalary,
        MAX(salary_package_lpa) as highestSalary
      FROM Fact_Placement
    `);
    
    const row = res[0].values[0];
    return {
      totalStudents: row[0],
      totalPlaced: row[1],
      placementPercentage: row[2],
      avgSalary: row[3] || 0,
      highestSalary: row[4] || 0
    };
  }
}

export const db = new Database();
