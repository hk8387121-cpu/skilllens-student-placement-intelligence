import React, { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { getJson } from '../api';

export default function StudentRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const recordsPerPage = 100;

  useEffect(() => {
    let active = true;
    getJson<any[]>('/api/students').then(data => { if (active) setRecords(data); }).catch(e => { if (active) setError(e.message || 'Unable to load student records.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="p-8 text-white flex items-center gap-3"><Loader2 className="animate-spin text-indigo-400" />Loading Student Records...</div>;
  if (error) return <div className="p-8 text-red-300">Unable to load student records: {error}</div>;

  const filtered = records.filter(r => (genderFilter === 'All' || r.gender === genderFilter) && (statusFilter === 'All' || (statusFilter === 'Placed' ? r.placement_status === 1 : r.placement_status === 0)) && (String(r.student_id).includes(search) || String(r.gender).toLowerCase().includes(search.toLowerCase())));
  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const paginated = filtered.slice((page - 1) * recordsPerPage, page * recordsPerPage);

  return <div className="p-8">
    <div className="flex justify-between items-center mb-8"><h2 className="text-3xl font-bold text-white">Student Records</h2><div className="flex gap-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Search ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500" /></div><select value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setPage(1); }} className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"><option value="All">All Genders</option><option value="Male">Male</option><option value="Female">Female</option></select><select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"><option value="All">All Status</option><option value="Placed">Placed</option><option value="Not Placed">Not Placed</option></select></div></div>
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col"><div className="overflow-x-auto"><table className="w-full text-left text-gray-300"><thead className="bg-gray-900 text-gray-400 text-sm uppercase font-semibold"><tr>{['ID','Gender','CGPA','Tech Score','Soft Score','Internships','Status','Salary (LPA)'].map(h => <th key={h} className="px-6 py-4">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-700">{paginated.map(r => <tr key={r.student_id} className="hover:bg-gray-750 transition-colors"><td className="px-6 py-4 font-medium text-white">#{r.student_id}</td><td className="px-6 py-4">{r.gender}</td><td className="px-6 py-4">{Number(r.cgpa).toFixed(2)}</td><td className="px-6 py-4">{r.technical_skill_score}</td><td className="px-6 py-4">{r.soft_skill_score}</td><td className="px-6 py-4">{r.internship_count}</td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.placement_status === 1 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{r.placement_status === 1 ? 'Placed' : 'Not Placed'}</span></td><td className="px-6 py-4">{r.salary_package_lpa > 0 ? r.salary_package_lpa : '-'}</td></tr>)}{!paginated.length && <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No records found.</td></tr>}</tbody></table></div>{totalPages > 1 && <div className="p-4 border-t border-gray-700 bg-gray-900 flex items-center justify-between"><span className="text-gray-400 text-sm">Showing {(page - 1) * recordsPerPage + 1} to {Math.min(page * recordsPerPage, filtered.length)} of {filtered.length} records</span><div className="flex gap-2"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-50">Previous</button><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-50">Next</button></div></div>}</div>
  </div>;
}
