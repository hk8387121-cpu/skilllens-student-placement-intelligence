import fs from 'fs';
import path from 'path';
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

  async loadData(csvFilePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const results: StudentRecord[] = [];
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push({
            student_id: parseInt(data.student_id),
            gender: data.gender,
            ssc_percentage: parseFloat(data.ssc_percentage),
            hsc_percentage: parseFloat(data.hsc_percentage),
            degree_percentage: parseFloat(data.degree_percentage),
            cgpa: parseFloat(data.cgpa),
            entrance_exam_score: parseFloat(data.entrance_exam_score),
            technical_skill_score: parseFloat(data.technical_skill_score),
            soft_skill_score: parseFloat(data.soft_skill_score),
            internship_count: parseInt(data.internship_count),
            live_projects: parseInt(data.live_projects),
            work_experience_months: parseInt(data.work_experience_months),
            certifications: parseInt(data.certifications),
            attendance_percentage: parseFloat(data.attendance_percentage),
            backlogs: parseInt(data.backlogs),
            extracurricular_activities: data.extracurricular_activities,
            placement_status: parseInt(data.placement_status),
            salary_package_lpa: parseFloat(data.salary_package_lpa),
          });
        })
        .on('end', () => {
          this.data = results;
          console.log(`Loaded ${this.data.length} records into Data Warehouse.`);
          resolve();
        })
        .on('error', (err) => reject(err));
    });
  }

  getAllRecords(): StudentRecord[] {
    return this.data;
  }

  getKPIs() {
    const total = this.data.length;
    if (total === 0) return { total: 0, placed: 0, placementPercentage: 0, avgSalary: 0, maxSalary: 0 };
    const placed = this.data.filter(r => r.placement_status === 1);
    const avgSalary = placed.reduce((sum, r) => sum + r.salary_package_lpa, 0) / (placed.length || 1);
    const maxSalary = Math.max(0, ...placed.map(r => r.salary_package_lpa));
    return {
      totalStudents: total,
      totalPlaced: placed.length,
      placementPercentage: (placed.length / total) * 100,
      avgSalary,
      highestSalary: maxSalary
    };
  }
}

export const db = new Database();
