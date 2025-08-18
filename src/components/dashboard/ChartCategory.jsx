import React from 'react';

const ChartCategory = ({ categoryKey, category }) => {
  // Validate category structure
  if (!category || !category?.charts || !Array.isArray(category.charts)) {
    console.error('ChartCategory - Invalid category structure:', category);
    return null;
  }

  // Filter out invalid charts
  const validCharts = category.charts.filter(chart => {
    if (!chart || !chart?.id || !chart?.component) {
      console.error('ChartCategory - Invalid chart in category:', chart);
      return false;
    }
    
    // Ensure component is a valid React element
    if (typeof chart.component !== 'object' || !chart.component?.$$typeof) {
      console.error('ChartCategory - Invalid chart component:', chart.component);
      return false;
    }
    
    return true;
  });

  if (validCharts.length === 0) {
    console.log(`ChartCategory - No valid charts in category ${categoryKey}`);
    return null;
  }

  console.log(`ChartCategory - Rendering ${validCharts.length} charts for category ${categoryKey}`);

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category?.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{category?.description}</p>
      </div>
      
      {/* Render charts in this category in a responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {validCharts.map((chart, index) => {
          console.log(`ChartCategory - Rendering chart ${index} in category ${categoryKey}:`, chart?.id);
          
          return (
            <div key={`${categoryKey}-${chart?.id}`}>
              {(() => {
                try {
                  // Double-check that the component is valid before rendering
                  if (!chart?.component || typeof chart.component !== 'object') {
                    throw new Error(`Invalid chart component for ${chart?.id}`);
                  }
                  
                  return chart.component;
                } catch (error) {
                  console.error(`ChartCategory - Error rendering chart ${chart?.id} in category ${categoryKey}:`, error);
                  return (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-red-700 dark:text-red-400 text-sm">Error rendering chart: {chart?.id}</p>
                      <p className="text-xs text-red-600 dark:text-red-300 mt-1">Category: {category?.title}</p>
                      <p className="text-xs text-red-600 dark:text-red-300">Error: {error?.message}</p>
                    </div>
                  );
                }
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartCategory;
