import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BrainCircuit, Network, Link as LinkIcon, FileText, Info, Menu } from 'lucide-react';
import Dashboard from './frontend/pages/Dashboard';
import StudentRecords from './frontend/pages/StudentRecords';
import Prediction from './frontend/pages/Prediction';
import Clustering from './frontend/pages/Clustering';
import Association from './frontend/pages/Association';

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
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BrainCircuit className="text-indigo-500" />
          SkillLens
        </h1>
        <p className="text-gray-400 text-xs mt-1">Student Placement Intelligence</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Reports() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Generated Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['Placement Report', 'Salary Report', 'Skill Analysis Report', 'Student Performance Report'].map(r => (
          <div key={r} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText className="text-indigo-400" size={32} />
              <h3 className="text-lg font-semibold text-white">{r}</h3>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">Download PDF</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="p-8 text-gray-300 max-w-4xl">
      <h2 className="text-3xl font-bold text-white mb-6">About SkillLens</h2>
      <div className="space-y-6 bg-gray-800 p-8 rounded-xl border border-gray-700 leading-relaxed">
        <section>
          <h3 className="text-xl font-bold text-white mb-2">Problem Statement</h3>
          <p>Educational institutions struggle to analyze student data and predict placement outcomes effectively. Traditional systems lack predictive analytics and data mining techniques to offer actionable insights.</p>
        </section>
        <section>
          <h3 className="text-xl font-bold text-white mb-2">Objectives</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Build a robust Data Warehouse for student records.</li>
            <li>Implement ETL pipelines for data preprocessing.</li>
            <li>Utilize Decision Trees for placement prediction.</li>
            <li>Apply K-Means Clustering to group students by potential.</li>
            <li>Generate meaningful Apriori Association Rules.</li>
            <li>Visualize insights in a professional Power BI-style dashboard.</li>
          </ul>
        </section>
        <section>
          <h3 className="text-xl font-bold text-white mb-2">System Architecture</h3>
          <p>The system comprises a React (TypeScript) frontend communicating with an Express.js backend. Data is ingested from CSV, cleaned, and stored in an in-memory Data Warehouse simulating a star schema. Machine learning models (Decision Tree, K-Means, Apriori) process the warehouse data to deliver predictions, clusters, and association rules via a REST API.</p>
        </section>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-950 font-sans">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/records" element={<StudentRecords />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/clusters" element={<Clustering />} />
            <Route path="/association" element={<Association />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
