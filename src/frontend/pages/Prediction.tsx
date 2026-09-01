import React, { useState, useEffect } from 'react';
import { BrainCircuit, BarChart3, Loader2 } from 'lucide-react';
import { getJson, apiUrl } from '../api';

export default function Prediction() {
  const [form, setForm] = useState({ ssc: 75, hsc: 70, degree: 72, cgpa: 7.5, tech: 80, soft: 75, intern: 1, cert: 1, attendance: 85, backlogs: 0 });
  const [result, setResult] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { let active = true; getJson('/api/ml/decision-tree').then(d => { if (active) setMetrics(d); }).catch(e => { if (active) setError(e.message || 'Unable to load model metrics.'); }).finally(() => { if (active) setMetricsLoading(false); }); return () => { active = false; }; }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const features = [form.ssc, form.hsc, form.degree, form.cgpa, form.tech, form.soft, form.intern, form.cert, form.attendance, form.backlogs];
    try { const res = await fetch(apiUrl('/api/ml/predict'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ features }) }); if (!res.ok) throw new Error(`Prediction failed (${res.status})`); setResult(await res.json()); } catch (e: any) { setError(e.message || 'Prediction failed.'); } finally { setLoading(false); }
  };

  return <div className="p-8 max-w-5xl mx-auto"><div className="flex items-center gap-4 mb-8"><div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl"><BrainCircuit size={32} /></div><div><h2 className="text-3xl font-bold text-white">Placement Prediction</h2><p className="text-gray-400 mt-1">Uses Decision Tree Classification to predict placement outcomes.</p></div></div>
    {metricsLoading && <div className="mb-8 text-gray-400 flex items-center gap-2"><Loader2 className="animate-spin" size={18} />Loading model metrics...</div>}
    {error && <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">{error}</div>}
    {metrics && <><div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">{[['Accuracy',metrics.accuracy],['Precision',metrics.precision],['Recall',metrics.recall],['F1 Score',metrics.f1]].map(([t,v]: any)=><MetricCard key={t} title={t} value={`${(v * 100).toFixed(1)}%`} />)}</div>{metrics.featureImportance && <div className="mb-8 bg-gray-800 p-8 rounded-xl border border-gray-700"><h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><BarChart3 className="text-indigo-400" />Feature Importance</h3><div className="space-y-4">{metrics.featureImportance.map((f: any)=><div key={f.feature}><div className="flex justify-between text-sm text-gray-400 mb-1"><span>{f.feature}</span><span>{f.importance.toFixed(1)}%</span></div><div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${f.importance}%` }} /></div></div>)}</div></div>}</>}
    <div className="bg-gray-800 p-8 rounded-xl border border-gray-700"><form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 gap-6">{[['SSC Percentage','ssc'],['HSC Percentage','hsc'],['Degree Percentage','degree'],['CGPA','cgpa'],['Technical Skill Score','tech'],['Soft Skill Score','soft'],['Internship Count','intern'],['Certifications','cert'],['Attendance %','attendance'],['Backlogs','backlogs']].map(([label,key]: any)=><Input key={key} label={label} type="number" step={key === 'cgpa' ? '0.1' : '1'} value={(form as any)[key]} onChange={(v: number) => setForm({...form, [key]: v})} />)}<div className="md:col-span-2 pt-4 border-t border-gray-700 flex justify-end"><button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50">{loading ? 'Analyzing...' : 'Predict Placement'}</button></div></form></div>
    {result && <div className="mt-8 bg-gray-800 p-8 rounded-xl border border-gray-700"><h3 className="text-xl font-bold text-white mb-6">Prediction Result</h3><div className="flex gap-8"><div className={`flex-1 p-6 rounded-xl border ${result.placement_status === 1 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}><p className="text-sm uppercase tracking-wider mb-2 font-semibold text-gray-400">Status</p><p className="text-3xl font-bold">{result.placement_status === 1 ? 'High Chance of Placement' : 'Low Chance of Placement'}</p></div>{result.placement_status === 1 && <div className="flex-1 p-6 rounded-xl border bg-blue-500/10 border-blue-500/20 text-blue-400"><p className="text-sm uppercase tracking-wider mb-2 font-semibold text-gray-400">Expected Salary</p><p className="text-3xl font-bold">{result.expected_salary} LPA</p></div>}</div>{result.placement_status === 0 && result.improvements?.length > 0 && <div className="mt-6 p-6 rounded-xl border bg-amber-500/10 border-amber-500/20"><h4 className="text-lg font-semibold text-amber-400 mb-3">Areas for Improvement</h4><ul className="list-disc pl-5 space-y-2 text-amber-200">{result.improvements.map((x: string,i: number)=><li key={i}>{x}</li>)}</ul></div>}</div>}
  </div>;
}

function Input({ label, type, value, onChange, step }: any) { return <div><label className="block text-sm font-medium text-gray-300 mb-2">{label}</label><input type={type} value={value} onChange={e => onChange(Math.max(0, parseFloat(e.target.value) || 0))} step={step || 1} min={0} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" /></div>; }
function MetricCard({ title, value }: any) { return <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center"><p className="text-gray-400 text-sm mb-1">{title}</p><p className="text-2xl font-bold text-indigo-400">{value}</p></div>; }
