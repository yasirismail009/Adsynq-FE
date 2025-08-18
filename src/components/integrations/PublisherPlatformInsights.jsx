import React from 'react';
import { 
  BuildingStorefrontIcon,
  PhotoIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon
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
  Area,
  AreaChart
} from 'recharts';

const PublisherPlatformInsights = ({ 
  insightsPublisherPlatform, 
  metrics, 
  formatMetric 
}) => {
  if (!insightsPublisherPlatform?.result?.insights_data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Publisher Platform Performance</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Performance breakdown by Facebook and Instagram platforms
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
              Platform Analysis
            </span>
          </div>
        </div>

        <div className="text-center py-12">
          <BuildingStorefrontIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No publisher platform data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            This data shows performance breakdown by Facebook and Instagram platforms
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for charts with normalized values for better visualization
  const chartData = insightsPublisherPlatform.result.insights_data.map(platform => {
    const impressions = parseFloat(platform.impressions) || 0;
    const clicks = parseFloat(platform.clicks) || 0;
    const spend = parseFloat(platform.spend) || 0;
    const ctr = parseFloat(platform.ctr) || 0;
    const cpc = parseFloat(platform.cpc) || 0;
    const cpm = parseFloat(platform.cpm) || 0;
    
    return {
      platform: platform.publisher_platform,
      impressions: impressions,
      clicks: clicks,
      spend: spend,
      ctr: ctr,
      cpc: cpc,
      cpm: cpm,
      // Normalized values for better chart scaling
      impressionsNorm: impressions / 1000, // Scale down for better visualization
      clicksNorm: clicks / 100, // Scale down for better visualization
      spendNorm: spend / 10, // Scale down for better visualization
      video30s: platform.video_30_sec_watched_actions?.[0]?.value || 0
    };
  });

  // Custom gradient definitions
  const gradientDefs = [
    { id: 'spendGradient', startColor: '#3B82F6', endColor: '#1D4ED8' },
    { id: 'impressionsGradient', startColor: '#10B981', endColor: '#059669' },
    { id: 'clicksGradient', startColor: '#EC4899', endColor: '#BE185D' },
    { id: 'ctrGradient', startColor: '#8B5CF6', endColor: '#7C3AED' },
    { id: 'cpcGradient', startColor: '#F59E0B', endColor: '#D97706' },
    { id: 'cpmGradient', startColor: '#EF4444', endColor: '#DC2626' }
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 dark:bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
          <p className="text-white font-medium mb-2 capitalize">{label}</p>
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Publisher Platform Performance</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Performance breakdown by Facebook and Instagram platforms
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
            Platform Analysis
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Platform Statistics Cards - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insightsPublisherPlatform.result.insights_data.map((platform, index) => {
            const platformName = platform.publisher_platform;
            const isFacebook = platformName === 'facebook';
            const isInstagram = platformName === 'instagram';
            
            return (
              <div key={index} className={`rounded-xl p-6 border-2 ${
                isFacebook 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  : 'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isFacebook 
                        ? 'bg-blue-600 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    }`}>
                      {isFacebook ? (
                        <BuildingStorefrontIcon className="w-6 h-6" />
                      ) : (
                        <PhotoIcon className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {platformName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isFacebook ? 'Social Network' : 'Photo & Video'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simplified Platform Metrics - Only Key Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(platform.impressions)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Impressions</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(platform.ctr, 'percentage')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">CTR</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(platform.spend, 'currency', metrics.currency)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Spend</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Combined Chart with Gradient Effects */}
        {chartData.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
              Comprehensive Platform Performance Dashboard
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Interactive visualization showing all key metrics across platforms
            </p>
            
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <defs>
                    {/* Gradient definitions */}
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#BE185D" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="ctrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="cpcGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="cpmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="platform" 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#6B7280' }}
                    tickLine={{ stroke: '#6B7280' }}
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
                  <Legend 
                    wrapperStyle={{ color: '#6B7280' }}
                    iconType="circle"
                  />
                  
                  {/* Bar Charts for Spend and CPM */}
                  <Bar 
                    yAxisId="right"
                    dataKey="spend" 
                    fill="url(#spendGradient)"
                    radius={[4, 4, 0, 0]}
                    name="Spend"
                    opacity={0.8}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="cpm" 
                    fill="url(#cpmGradient)"
                    radius={[4, 4, 0, 0]}
                    name="CPM"
                    opacity={0.8}
                  />
                  
                  {/* Line Charts for Impressions, Clicks, CTR, CPC */}
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="impressions" 
                    stroke="url(#impressionsGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                    name="Impressions"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="url(#clicksGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#EC4899', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#EC4899', strokeWidth: 2 }}
                    name="Clicks"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="ctr" 
                    stroke="url(#ctrGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
                    name="CTR"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="cpc" 
                    stroke="url(#cpcGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#F59E0B', strokeWidth: 2 }}
                    name="CPC"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Legend with Enhanced Styling */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Spend</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-600 to-green-800 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Impressions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-pink-600 to-pink-800 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Clicks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-purple-800 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">CTR</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-orange-600 to-orange-800 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">CPC</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-red-600 to-red-800 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">CPM</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Impressions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <EyeIcon className="w-5 h-5 mr-2 text-blue-600" />
              Impressions
            </h4>
            <div className="space-y-3">
              {insightsPublisherPlatform.result.insights_data.map((platform, index) => {
                const platformName = platform.publisher_platform;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {platformName}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatMetric(platform.impressions)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clicks */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <CursorArrowRaysIcon className="w-5 h-5 mr-2 text-green-600" />
              Clicks
            </h4>
            <div className="space-y-3">
              {insightsPublisherPlatform.result.insights_data.map((platform, index) => {
                const platformName = platform.publisher_platform;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {platformName}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatMetric(platform.clicks)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTR */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-purple-600" />
              CTR
            </h4>
            <div className="space-y-3">
              {insightsPublisherPlatform.result.insights_data.map((platform, index) => {
                const platformName = platform.publisher_platform;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {platformName}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatMetric(platform.ctr, 'percentage')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CPC */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-orange-600" />
              CPC
            </h4>
            <div className="space-y-3">
              {insightsPublisherPlatform.result.insights_data.map((platform, index) => {
                const platformName = platform.publisher_platform;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {platformName}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatMetric(platform.cpc, 'currency', metrics.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CPM */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-red-600" />
              CPM
            </h4>
            <div className="space-y-3">
              {insightsPublisherPlatform.result.insights_data.map((platform, index) => {
                const platformName = platform.publisher_platform;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {platformName}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatMetric(platform.cpm, 'currency', metrics.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Video Engagement */}
          {insightsPublisherPlatform.result.insights_data.some(p => p.video_30_sec_watched_actions) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <PhotoIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Video Engagement
              </h4>
              <div className="space-y-3">
                {insightsPublisherPlatform.result.insights_data.map((platform, index) => {
                  const platformName = platform.publisher_platform;
                  const video30s = platform.video_30_sec_watched_actions?.[0]?.value || 0;
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {platformName}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {video30s}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublisherPlatformInsights;
