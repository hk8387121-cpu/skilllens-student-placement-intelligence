import React, { useEffect, useState } from 'react';
import { Network, Loader2 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getJson } from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Clustering() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => { let active = true; getJson('/api/ml/kmeans').then(d => { if (active) setData(d); }).catch(e => { if (active) setError(e.message || 'Unable to load clustering data.'); }); return () => { active = false; }; }, []);
  if (error) return <div className="p-8 text-red-300">Unable to load Cluster Analysis: {error}</div>;
  if (!data) return <div className="p-8 text-white flex items-center gap-3"><Loader2 className="animate-spin text-indigo-400" />Loading Cluster Analysis...</div>;
  const chartData = { labels: ['High Potential', 'Medium Potential', 'Low Potential'], datasets: [{ label: 'Number of Students', data: [data.counts.High, data.counts.Medium, data.counts.Low], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }] };
  return <div className="p-8"><div className="flex items-center gap-4 mb-8"><div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl"><Network size={32} /></div><div><h2 className="text-3xl font-bold text-white">Cluster Analysis</h2><p className="text-gray-400 mt-1">K-Means algorithm grouped students by CGPA, Tech, and Soft Skills.</p></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">{[['High Potential',data.counts.High,'text-green-400'],['Medium Potential',data.counts.Medium,'text-yellow-400'],['Low Potential',data.counts.Low,'text-red-400']].map(([title,count,color]: any)=><div key={title} className="bg-gray-800 p-6 rounded-xl border border-gray-700"><h3 className={`text-lg font-semibold ${color} mb-2`}>{title}</h3><p className="text-4xl font-bold text-white">{count}</p><p className="text-sm text-gray-400 mt-2">Students</p></div>)}</div><div className="bg-gray-800 p-6 rounded-xl border border-gray-700"><h3 className="text-lg font-semibold text-white mb-4">Cluster Distribution</h3><div className="h-96"><Bar data={chartData} options={{ maintainAspectRatio: false }} /></div></div></div>;
}
