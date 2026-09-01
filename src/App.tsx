import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, BrainCircuit, Network, Link as LinkIcon, FileText, Info, Download, Loader2 } from 'lucide-react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './frontend/pages/Dashboard';
import StudentRecords from './frontend/pages/StudentRecords';
import Prediction from './frontend/pages/Prediction';
import Clustering from './frontend/pages/Clustering';
import Association from './frontend/pages/Association';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function Sidebar() {
  const location = useLocation();
  const navItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/records', name: 'Student Records', icon: <Users size={20} /> },
    { path: '/prediction', name: 'Prediction', icon: <BrainCircuit size={20} /> },
    { path: '/clusters', name: 'Cluster Analysis', icon: <Network size={20} /> },
    { path: '/association', name: 'Association Rules', icon: <LinkIcon size={20} /> },
    { path: '/reports', name: 'Reports', icon: <FileText size={20} /> },
    { path: '/about', name: 'About Project', icon: <Info size={20} /> },
  ];
  return (
    <div className="w-64 bg-gray-900 h-screen flex flex-col border-r border-gray-800 shrink-0">
      <div className="p-6"><h1 className="text-2xl font-bold text-white flex items-center gap-2"><BrainCircuit className="text-indigo-500" />SkillLens</h1><p className="text-gray-400 text-xs mt-1">Student Placement Intelligence</p></div>
      <nav className="flex-1 px-4 space-y-2">{navItems.map(item => <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>{item.icon}<span className="font-medium">{item.name}</span></Link>)}</nav>
    </div>
  );
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[^\x20-\x7E]/g, '?');
}

function createPdf(title: string, lines: string[]) {
  const pageLines = [title, '', ...lines].slice(0, 48);
  const stream = ['BT', '/F1 20 Tf', '50 770 Td', `(${escapePdfText(pageLines[0])}) Tj`, '/F1 10 Tf', '0 -28 Td', ...pageLines.slice(1).map(line => `(${escapePdfText(line)}) Tj 0 -15 Td`), 'ET'].join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  ];
  let pdf = '%PDF-1.4\n%1234\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets[index + 1] = pdf.length; pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

function average(records: any[], key: string) { return records.length ? records.reduce((sum, row) => sum + Number(row[key] || 0), 0) / records.length : 0; }
function median(values: number[]) { if (!values.length) return 0; const sorted = [...values].sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; }

function buildReportLines(report: string, records: any[]) {
  const placed = records.filter(r => Number(r.placement_status) === 1);
  const notPlaced = records.length - placed.length;
  const placementRate = records.length ? placed.length / records.length * 100 : 0;
  const salaries = placed.map(r => Number(r.salary_package_lpa || 0)).filter(v => v > 0);

  if (report === 'Placement Report') {
    const male = records.filter(r => r.gender === 'Male');
    const female = records.filter(r => r.gender === 'Female');
    return [`Generated from ${records.length} student records`, `Placed Students: ${placed.length}`, `Not Placed Students: ${notPlaced}`, `Overall Placement Rate: ${placementRate.toFixed(2)}%`, `Average Salary of Placed Students: ${average(placed, 'salary_package_lpa').toFixed(2)} LPA`, `Highest Salary: ${Math.max(0, ...salaries).toFixed(2)} LPA`, '', `Male: ${male.length} total, ${male.filter(r => Number(r.placement_status) === 1).length} placed`, `Female: ${female.length} total, ${female.filter(r => Number(r.placement_status) === 1).length} placed`, '', 'Placement analysis summarizes outcomes and placement performance across the dataset.'];
  }
  if (report === 'Salary Report') {
    return [`Generated from ${placed.length} placed-student records`, `Average Salary: ${average(placed, 'salary_package_lpa').toFixed(2)} LPA`, `Median Salary: ${median(salaries).toFixed(2)} LPA`, `Minimum Salary: ${salaries.length ? Math.min(...salaries).toFixed(2) : '0.00'} LPA`, `Maximum Salary: ${salaries.length ? Math.max(...salaries).toFixed(2) : '0.00'} LPA`, `Salary records available: ${salaries.length}`, '', 'Salary values represent the package recorded for placed students.', 'This report can be used to compare compensation outcomes with student attributes.'];
  }
  if (report === 'Skill Analysis Report') {
    const internshipRate = records.length ? records.filter(r => Number(r.internship_count) > 0).length / records.length * 100 : 0;
    const certificationRate = records.length ? records.filter(r => Number(r.certification_count) > 0).length / records.length * 100 : 0;
    const highTech = records.filter(r => Number(r.technical_skill_score) >= 75);
    return [`Generated from ${records.length} student records`, `Average Technical Skill Score: ${average(records, 'technical_skill_score').toFixed(2)}`, `Average Soft Skill Score: ${average(records, 'soft_skill_score').toFixed(2)}`, `Students with Internship Experience: ${internshipRate.toFixed(2)}%`, `Students with Certifications: ${certificationRate.toFixed(2)}%`, `High Technical Skill (>=75): ${highTech.length} students`, `High Technical Skill Placement Rate: ${highTech.length ? (highTech.filter(r => Number(r.placement_status) === 1).length / highTech.length * 100).toFixed(2) : '0.00'}%`, '', 'Skill analysis highlights technical, soft-skill, internship and certification factors.'];
  }
  const top = [...records].sort((a, b) => Number(b.cgpa) - Number(a.cgpa)).slice(0, 10);
  return [`Generated from ${records.length} student records`, `Average CGPA: ${average(records, 'cgpa').toFixed(2)}`, `Average Attendance: ${average(records, 'attendance_percentage').toFixed(2)}%`, `Average Backlogs: ${average(records, 'backlogs').toFixed(2)}`, `Placed Students: ${placed.length}`, `Not Placed Students: ${notPlaced}`, '', 'Top 10 Students by CGPA:', ...top.map((r, i) => `${i + 1}. ID ${r.student_id} | CGPA ${Number(r.cgpa).toFixed(2)} | ${Number(r.placement_status) === 1 ? 'Placed' : 'Not Placed'}`)];
}

function Reports() {
  const reports = ['Placement Report', 'Salary Report', 'Skill Analysis Report', 'Student Performance Report'];
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/students`).then(response => { if (!response.ok) throw new Error(`API request failed (${response.status})`); return response.json(); }).then(data => { if (!Array.isArray(data)) throw new Error('Invalid student data received'); setRecords(data); setError(''); }).catch(err => setError(err.message || 'Unable to load report data.')).finally(() => setLoading(false));
  }, []);

  const downloadReport = (report: string) => {
    if (!records.length) return;
    setDownloading(report);
    try {
      const blob = createPdf(report, buildReportLines(report, records));
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${report.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
    } finally { setTimeout(() => setDownloading(''), 300); }
  };

  return (
    <div className="p-8">
      <div className="mb-8"><h2 className="text-3xl font-bold text-white">Generated Reports</h2><p className="text-gray-400 mt-2">Generate downloadable PDF reports from the live student placement dataset.</p></div>
      {loading && <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-gray-300 flex items-center gap-3"><Loader2 className="animate-spin text-indigo-400" size={22} />Loading report data...</div>}
      {!loading && error && <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 text-red-300 mb-6">Unable to load report data: {error}. Please verify the Render API is running and refresh the page.</div>}
      {!loading && !error && <><div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6 text-gray-300">Report source: <span className="text-white font-semibold">{records.length} student records</span> from the SkillLens API.</div><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{reports.map(report => <div key={report} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center justify-between gap-5"><div className="flex items-center gap-4 min-w-0"><FileText className="text-indigo-400 shrink-0" size={32} /><h3 className="text-lg font-semibold text-white">{report}</h3></div><button onClick={() => downloadReport(report)} disabled={!records.length || !!downloading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center gap-2 shrink-0">{downloading === report ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}{downloading === report ? 'Generating...' : 'Download PDF'}</button></div>)}</div></>}
    </div>
  );
}

function About() {
  return <div className="p-8 text-gray-300 max-w-4xl"><h2 className="text-3xl font-bold text-white mb-6">About SkillLens</h2><div className="space-y-6 bg-gray-800 p-8 rounded-xl border border-gray-700 leading-relaxed"><section><h3 className="text-xl font-bold text-white mb-2">Problem Statement</h3><p>Educational institutions struggle to analyze student data and predict placement outcomes effectively. Traditional systems lack predictive analytics and data mining techniques to offer actionable insights.</p></section><section><h3 className="text-xl font-bold text-white mb-2">Objectives</h3><ul className="list-disc list-inside space-y-1 ml-4"><li>Build a robust Data Warehouse for student records.</li><li>Implement ETL pipelines for data preprocessing.</li><li>Utilize Decision Trees for placement prediction.</li><li>Apply K-Means Clustering to group students by potential.</li><li>Generate meaningful Apriori Association Rules.</li><li>Visualize insights in a professional Power BI-style dashboard.</li></ul></section><section><h3 className="text-xl font-bold text-white mb-2">System Architecture</h3><p>The system comprises a React (TypeScript) frontend communicating with an Express.js backend. Data is ingested from CSV, cleaned, and stored in an in-memory Data Warehouse simulating a star schema. Machine learning models (Decision Tree, K-Means, Apriori) process the warehouse data to deliver predictions, clusters, and association rules via a REST API.</p></section></div></div>;
}

export default function App() {
  return <Router><div className="flex h-screen bg-gray-950 font-sans"><Sidebar /><div className="flex-1 overflow-auto"><Routes><Route path="/" element={<Dashboard />} /><Route path="/records" element={<StudentRecords />} /><Route path="/prediction" element={<Prediction />} /><Route path="/clusters" element={<Clustering />} /><Route path="/association" element={<Association />} /><Route path="/reports" element={<Reports />} /><Route path="/about" element={<About />} /></Routes></div></div></Router>;
}
