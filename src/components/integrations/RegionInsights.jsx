import React from 'react';
import { 
  MapPinIcon,
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  CurrencyDollarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const RegionInsights = ({ 
  insightsRegion, 
  metrics, 
  formatMetric 
}) => {
  if (!insightsRegion?.result?.insights_data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Regional Performance Insights</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Performance breakdown by geographic regions
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
              Regional Analysis
            </span>
          </div>
        </div>

        <div className="text-center py-12">
          <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No regional performance data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            This data shows performance breakdown by geographic regions
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const chartData = insightsRegion.result.insights_data.map((region, index) => {
    const impressions = parseFloat(region.impressions) || 0;
    const clicks = parseFloat(region.clicks) || 0;
    const spend = parseFloat(region.spend) || 0;
    const ctr = parseFloat(region.ctr) || 0;
    const cpc = parseFloat(region.cpc) || 0;
    const cpm = parseFloat(region.cpm) || 0;
    
    return {
      region: region.region || 'Unknown',
      country: region.country || 'Unknown',
      impressions,
      clicks,
      spend,
      ctr,
      cpc,
      cpm,
      // Normalized values for better chart scaling
      impressionsNorm: impressions / 1000,
      clicksNorm: clicks / 100,
      spendNorm: spend / 10
    };
  });

  // Colors for charts
  const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16'];

  // Helper functions to safely get max values with fallbacks
  const getTopRegionByImpressions = () => {
    if (!chartData || chartData.length === 0) {
      return { region: 'No Data', impressions: 0 };
    }
    return chartData.reduce((max, item) => item.impressions > max.impressions ? item : max);
  };

  const getBestCTRRegion = () => {
    if (!chartData || chartData.length === 0) {
      return { region: 'No Data', ctr: 0 };
    }
    return chartData.reduce((max, item) => item.ctr > max.ctr ? item : max);
  };

  const getHighestSpendRegion = () => {
    if (!chartData || chartData.length === 0) {
      return { region: 'No Data', spend: 0 };
    }
    return chartData.reduce((max, item) => item.spend > max.spend ? item : max);
  };

  const getMostClicksRegion = () => {
    if (!chartData || chartData.length === 0) {
      return { region: 'No Data', clicks: 0 };
    }
    return chartData.reduce((max, item) => item.clicks > max.clicks ? item : max);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 dark:bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry, index) => {
            let value = entry.value;
            let formattedValue = '';
            
            // Format values based on data key
            if (entry.dataKey === 'spend' || entry.dataKey === 'cpc' || entry.dataKey === 'cpm') {
              formattedValue = formatMetric(value, 'currency', metrics.currency);
            } else if (entry.dataKey === 'ctr') {
              formattedValue = formatMetric(value, 'percentage');
            } else {
              formattedValue = formatMetric(value);
            }
            
            return (
              <div key={index} className="flex items-center space-x-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-300 text-sm">
                  {entry.name}: <span className="text-white font-semibold">{formattedValue}</span>
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Regional Performance Insights</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Performance breakdown by geographic regions
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
            Regional Analysis
          </span>
        </div>
      </div>

      {/* Top Performing Regions Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Top Region by Impressions */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Top Region</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {getTopRegionByImpressions().region}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {formatMetric(getTopRegionByImpressions().impressions)} impressions
              </p>
            </div>
            <MapPinIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Best CTR Region */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Best CTR</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatMetric(getBestCTRRegion().ctr, 'percentage')}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {getBestCTRRegion().region}
              </p>
            </div>
            <CursorArrowRaysIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Highest Spend Region */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Highest Spend</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatMetric(getHighestSpendRegion().spend, 'currency', metrics.currency)}
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {getHighestSpendRegion().region}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        {/* Most Clicks Region */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Most Clicks</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {formatMetric(getMostClicksRegion().clicks)}
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {getMostClicksRegion().region}
              </p>
            </div>
            <EyeIcon className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* Regional Performance Chart */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
            Regional Performance Analysis
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Performance metrics breakdown by regions
          </p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="regionSpendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="regionImpressionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="regionCTRGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="region" 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  axisLine={{ stroke: '#6B7280' }}
                  tickLine={{ stroke: '#6B7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#6B7280' }}
                  tickLine={{ stroke: '#6B7280' }}
                  tickFormatter={(value) => formatMetric(value)}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#6B7280' }}
                  tickLine={{ stroke: '#6B7280' }}
                  tickFormatter={(value) => formatMetric(value, 'currency', metrics.currency)}
                />
                
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#6B7280' }} iconType="circle" />
                
                <Bar 
                  yAxisId="right"
                  dataKey="spend" 
                  fill="url(#regionSpendGradient)"
                  radius={[4, 4, 0, 0]}
                  name="Spend"
                  opacity={0.8}
                />
                
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="url(#regionImpressionsGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                  name="Impressions"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="ctr" 
                  stroke="url(#regionCTRGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
                  name="CTR"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Spend Distribution Pie Chart */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <GlobeAltIcon className="w-5 h-5 mr-2 text-indigo-600" />
            Regional Spend Distribution
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Spend distribution across different regions
          </p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ region, spend }) => `${region}: ${formatMetric(spend, 'currency', metrics.currency)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="spend"
                  nameKey="region"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value, name) => [formatMetric(value, 'currency', metrics.currency), 'Spend']}
                />
                <Legend 
                  wrapperStyle={{ color: '#6B7280' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Performance Table */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MapPinIcon className="w-5 h-5 mr-2 text-indigo-600" />
            Regional Performance Summary
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Complete breakdown of performance metrics by region
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Spend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    CPC
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {chartData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatMetric(item.impressions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatMetric(item.clicks)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatMetric(item.ctr, 'percentage')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatMetric(item.spend, 'currency', metrics.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatMetric(item.cpc, 'currency', metrics.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionInsights;
