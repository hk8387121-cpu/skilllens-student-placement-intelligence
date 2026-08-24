import React, { useEffect, useState, useMemo } from 'react';
import { Users, CheckCircle, TrendingUp, DollarSign, Award } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

ChartJS.defaults.color = '#9ca3af';
ChartJS.defaults.borderColor = '#374151';

export default function Dashboard() {
  const [allData, setAllData] = useState<any[]>([]);
  const [genderFilter, setGenderFilter] = useState('All Genders');
  const [statusFilter, setStatusFilter] = useState('All Status');

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(setAllData);
  }, []);

  const filteredData = useMemo(() => {
    return allData.filter(d => {
      if (genderFilter !== 'All Genders' && d.gender !== genderFilter) return false;
      if (statusFilter === 'Placed' && d.placement_status !== 1) return false;
      if (statusFilter === 'Not Placed' && d.placement_status !== 0) return false;
      return true;
    });
  }, [allData, genderFilter, statusFilter]);

  if (allData.length === 0) return <div className="p-8 text-white">Loading Dashboard Data...</div>;

  const total = filteredData.length;
  const placed = filteredData.filter(r => r.placement_status === 1);
  const placedCount = placed.length;
  const notPlacedCount = total - placedCount;
  const placementPercentage = total > 0 ? (placedCount / total) * 100 : 0;
  const avgSalary = placedCount > 0 ? placed.reduce((sum, r) => sum + r.salary_package_lpa, 0) / placedCount : 0;
  const highestSalary = placedCount > 0 ? Math.max(...placed.map(r => r.salary_package_lpa)) : 0;

  const malePlaced = filteredData.filter(d => d.gender === 'Male' && d.placement_status === 1).length;
  const femalePlaced = filteredData.filter(d => d.gender === 'Female' && d.placement_status === 1).length;
  const maleNot = filteredData.filter(d => d.gender === 'Male' && d.placement_status === 0).length;
  const femaleNot = filteredData.filter(d => d.gender === 'Female' && d.placement_status === 0).length;

  const cgpaBins = { '5-6': 0, '6-7': 0, '7-8': 0, '8-9': 0, '9-10': 0 };
  filteredData.forEach(d => {
    if (d.cgpa < 6) cgpaBins['5-6']++;
    else if (d.cgpa < 7) cgpaBins['6-7']++;
    else if (d.cgpa < 8) cgpaBins['7-8']++;
    else if (d.cgpa < 9) cgpaBins['8-9']++;
    else cgpaBins['9-10']++;
  });

  const placementData = {
    labels: ['Placed', 'Not Placed'],
    datasets: [{
      data: [placedCount, notPlacedCount],
      backgroundColor: ['#4f46e5', '#374151'],
      borderWidth: 0,
    }]
  };

  const genderData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        label: 'Placed',
        data: [malePlaced, femalePlaced],
        backgroundColor: '#4f46e5',
      },
      {
        label: 'Not Placed',
        data: [maleNot, femaleNot],
        backgroundColor: '#374151',
      }
    ]
  };

  const cgpaData = {
    labels: Object.keys(cgpaBins),
    datasets: [{
      label: 'Students count',
      data: Object.values(cgpaBins),
      backgroundColor: '#10b981',
    }]
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Placement Analytics</h2>
        <div className="flex gap-4">
          <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2">
            <option>All Genders</option>
            <option>Male</option>
            <option>Female</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2">
            <option>All Status</option>
            <option>Placed</option>
            <option>Not Placed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <KPICard title="Total Students" value={total} icon={<Users />} color="text-blue-500" />
        <KPICard title="Placed Students" value={placedCount} icon={<CheckCircle />} color="text-green-500" />
        <KPICard title="Placement %" value={`${placementPercentage.toFixed(1)}%`} icon={<TrendingUp />} color="text-indigo-500" />
        <KPICard title="Avg Salary" value={`${avgSalary.toFixed(2)} LPA`} icon={<DollarSign />} color="text-yellow-500" />
        <KPICard title="Highest Salary" value={`${highestSalary.toFixed(2)} LPA`} icon={<Award />} color="text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Placement Status</h3>
          <div className="h-64 flex justify-center">
            <Pie data={placementData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Placement by Gender</h3>
          <div className="h-64">
            <Bar data={genderData} options={{ maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }} />
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">CGPA Distribution</h3>
          <div className="h-64">
            <Bar data={cgpaData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, color }: any) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center">
      <div className={`p-3 bg-gray-900 rounded-full mb-4 ${color}`}>
        {icon}
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
  );
}
