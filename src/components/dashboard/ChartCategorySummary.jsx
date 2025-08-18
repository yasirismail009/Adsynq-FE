import React from 'react';

const ChartCategorySummary = ({ categoriesWithCharts }) => {
  // Validate categoriesWithCharts
  if (!categoriesWithCharts || !Array.isArray(categoriesWithCharts)) {
    console.error('ChartCategorySummary - Invalid categoriesWithCharts:', categoriesWithCharts);
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
      {categoriesWithCharts.map(([key, category]) => (
        <div key={key} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">{category?.title}</h3>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{category?.charts?.length || 0} charts</p>
        </div>
      ))}
    </div>
  );
};

export default ChartCategorySummary;
