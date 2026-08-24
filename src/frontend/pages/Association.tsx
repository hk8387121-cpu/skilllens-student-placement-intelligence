import React, { useEffect, useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';

export default function Association() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ml/apriori').then(r => r.json()).then(data => {
      setRules(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-white">Mining Frequent Itemsets using Apriori...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-pink-500/20 text-pink-400 rounded-xl">
          <LinkIcon size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Association Rules</h2>
          <p className="text-gray-400 mt-1">Apriori algorithm finding factors frequently associated with Placements.</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-900 text-gray-400 text-sm uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Rule (Conditions → Placement)</th>
              <th className="px-6 py-4">Support</th>
              <th className="px-6 py-4">Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {rules.map((rule, idx) => {
              const items = rule.items.filter((i: string) => i !== 'Placement_Yes');
              return (
                <tr key={idx} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                      {items.map((item: string) => (
                        <span key={item} className="px-2 py-1 bg-gray-700 rounded text-xs">{item.replace('_', ' ')}</span>
                      ))}
                    </div>
                    <span className="text-gray-500">→</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">Placed</span>
                  </td>
                  <td className="px-6 py-4">{(rule.support * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${rule.support * 100}%` }}></div>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rules.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No significant rules found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
