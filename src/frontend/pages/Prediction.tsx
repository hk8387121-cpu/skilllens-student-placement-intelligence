import React, { useState, useEffect } from 'react';
import { BrainCircuit, Activity } from 'lucide-react';

export default function Prediction() {
  const [form, setForm] = useState({
    ssc: 75, hsc: 70, degree: 72, cgpa: 7.5,
    tech: 80, soft: 75, intern: 1, cert: 1,
    attendance: 85, backlogs: 0
  });
  const [result, setResult] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/ml/decision-tree').then(r => r.json()).then(setMetrics);
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const features = [form.ssc, form.hsc, form.degree, form.cgpa, form.tech, form.soft, form.intern, form.cert, form.attendance, form.backlogs];
    
    try {
      const res = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features })
      });
      const data = await res.json();
      setResult(data);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
          <BrainCircuit size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Placement Prediction</h2>
          <p className="text-gray-400 mt-1">Uses Decision Tree Classification to predict placement outcomes.</p>
        </div>
      </div>

      {metrics && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Accuracy" value={`${(metrics.accuracy * 100).toFixed(1)}%`} />
          <MetricCard title="Precision" value={`${(metrics.precision * 100).toFixed(1)}%`} />
          <MetricCard title="Recall" value={`${(metrics.recall * 100).toFixed(1)}%`} />
          <MetricCard title="F1 Score" value={`${(metrics.f1 * 100).toFixed(1)}%`} />
        </div>
      )}

      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
        <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="SSC Percentage" type="number" value={form.ssc} onChange={v => setForm({...form, ssc: v})} />
          <Input label="HSC Percentage" type="number" value={form.hsc} onChange={v => setForm({...form, hsc: v})} />
          <Input label="Degree Percentage" type="number" value={form.degree} onChange={v => setForm({...form, degree: v})} />
          <Input label="CGPA" type="number" step="0.1" value={form.cgpa} onChange={v => setForm({...form, cgpa: v})} />
          <Input label="Technical Skill Score" type="number" value={form.tech} onChange={v => setForm({...form, tech: v})} />
          <Input label="Soft Skill Score" type="number" value={form.soft} onChange={v => setForm({...form, soft: v})} />
          <Input label="Internship Count" type="number" value={form.intern} onChange={v => setForm({...form, intern: v})} />
          <Input label="Certifications" type="number" value={form.cert} onChange={v => setForm({...form, cert: v})} />
          <Input label="Attendance %" type="number" value={form.attendance} onChange={v => setForm({...form, attendance: v})} />
          <Input label="Backlogs" type="number" value={form.backlogs} onChange={v => setForm({...form, backlogs: v})} />
          
          <div className="md:col-span-2 pt-4 border-t border-gray-700 flex justify-end">
            <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50">
              {loading ? 'Analyzing...' : 'Predict Placement'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="mt-8 bg-gray-800 p-8 rounded-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xl font-bold text-white mb-6">Prediction Result</h3>
          <div className="flex gap-8">
            <div className={`flex-1 p-6 rounded-xl border ${result.placement_status === 1 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <p className="text-sm uppercase tracking-wider mb-2 font-semibold text-gray-400">Status</p>
              <p className="text-3xl font-bold">{result.placement_status === 1 ? 'High Chance of Placement' : 'Low Chance of Placement'}</p>
            </div>
            {result.placement_status === 1 && (
              <div className="flex-1 p-6 rounded-xl border bg-blue-500/10 border-blue-500/20 text-blue-400">
                <p className="text-sm uppercase tracking-wider mb-2 font-semibold text-gray-400">Expected Salary</p>
                <p className="text-3xl font-bold">{result.expected_salary} LPA</p>
              </div>
            )}
          </div>
          {result.placement_status === 0 && result.improvements && result.improvements.length > 0 && (
            <div className="mt-6 p-6 rounded-xl border bg-amber-500/10 border-amber-500/20">
              <h4 className="text-lg font-semibold text-amber-400 mb-3">Areas for Improvement</h4>
              <ul className="list-disc pl-5 space-y-2 text-amber-200">
                {result.improvements.map((improvement: string, idx: number) => (
                  <li key={idx}>{improvement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Input({ label, type, value, onChange, step }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(Math.max(0, parseFloat(e.target.value) || 0))} 
        step={step || 1}
        min={0}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
      />
    </div>
  );
}

function MetricCard({ title, value }: any) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center">
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-indigo-400">{value}</p>
    </div>
  );
}
