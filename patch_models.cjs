const fs = require('fs');
let code = fs.readFileSync('src/machine_learning/models.ts', 'utf-8');

// Insert calculateFeatureImportance function
const fiFunc = `
function calculateFeatureImportance(data: any[]) {
  // We approximate feature importance using absolute Pearson correlation with placement_status
  // In a real scikit-learn DT, this would be Gini importance.
  const features = ['ssc_percentage', 'hsc_percentage', 'degree_percentage', 'cgpa', 'technical_skill_score', 'soft_skill_score', 'internship_count', 'certifications', 'attendance_percentage', 'backlogs'];
  
  const y = data.map(r => r.placement_status);
  const meanY = y.reduce((a, b) => a + b, 0) / y.length;
  
  const importances = features.map(feat => {
    const x = data.map(r => (r as any)[feat]);
    const meanX = x.reduce((a, b) => a + b, 0) / x.length;
    
    let num = 0, denX = 0, denY = 0;
    for(let i=0; i<data.length; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    const r = num / Math.sqrt(denX * denY);
    return { feature: feat, importance: isNaN(r) ? 0 : Math.abs(r) };
  });
  
  const totalImp = importances.reduce((s, f) => s + f.importance, 0);
  return importances.map(f => ({
    feature: f.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    importance: (f.importance / totalImp) * 100
  })).sort((a, b) => b.importance - a.importance);
}
`;

code = code.replace('export function trainDecisionTree() {', fiFunc + '\nexport function trainDecisionTree() {');
code = code.replace('confusionMatrix: [[tn, fp], [fn, tp]]\n  };', 'confusionMatrix: [[tn, fp], [fn, tp]],\n    featureImportance: calculateFeatureImportance(train)\n  };');

fs.writeFileSync('src/machine_learning/models.ts', code);
