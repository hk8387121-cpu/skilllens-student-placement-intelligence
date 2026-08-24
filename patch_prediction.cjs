const fs = require('fs');
let code = fs.readFileSync('src/frontend/pages/Prediction.tsx', 'utf-8');

const importReplacement = `import { BrainCircuit, Activity, BarChart3 } from 'lucide-react';`;
code = code.replace(/import { BrainCircuit, Activity } from 'lucide-react';/, importReplacement);

const featureHtml = `
      {metrics && metrics.featureImportance && (
        <div className="mb-8 bg-gray-800 p-8 rounded-xl border border-gray-700 animate-in fade-in">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><BarChart3 className="text-indigo-400" /> Feature Importance</h3>
          <div className="space-y-4">
            {metrics.featureImportance.map((f: any) => (
              <div key={f.feature}>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>{f.feature}</span>
                  <span>{f.importance.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: \`\${f.importance}%\` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
`;

code = code.replace(/<div className="bg-gray-800 p-8 rounded-xl border border-gray-700">\s*<form onSubmit={handlePredict}/, featureHtml + '<form onSubmit={handlePredict}');

fs.writeFileSync('src/frontend/pages/Prediction.tsx', code);
