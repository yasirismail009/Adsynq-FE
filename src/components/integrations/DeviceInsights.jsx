import React from 'react';
import { 
  DevicePhoneMobileIcon,
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  CurrencyDollarIcon,
  VideoCameraIcon,
  ComputerDesktopIcon
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

const DeviceInsights = ({ 
  insightsDevice, 
  metrics, 
  formatMetric 
}) => {
  if (!insightsDevice?.result?.insights_data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Device Performance Insights</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Performance breakdown by device types
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400">
              Device Analysis
            </span>
          </div>
        </div>

        <div className="text-center py-12">
          <DevicePhoneMobileIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No device performance data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            This data shows performance breakdown by device types
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const chartData = insightsDevice.result.insights_data.map((device, index) => {
    const impressions = parseFloat(device.impressions) || 0;
    const clicks = parseFloat(device.clicks) || 0;
    const spend = parseFloat(device.spend) || 0;
    const ctr = parseFloat(device.ctr) || 0;
    const cpc = parseFloat(device.cpc) || 0;
    const cpm = parseFloat(device.cpm) || 0;
    
    // Extract video engagement data
    const video30s = device.video_30_sec_watched_actions?.[0]?.value || 0;
    const videoP25 = device.video_p25_watched_actions?.[0]?.value || 0;
    const videoP50 = device.video_p50_watched_actions?.[0]?.value || 0;
    const videoP75 = device.video_p75_watched_actions?.[0]?.value || 0;
    const videoP100 = device.video_p100_watched_actions?.[0]?.value || 0;
    
    // Format device name for better display
    const formatDeviceName = (deviceName) => {
      const deviceMap = {
        'android_smartphone': 'Android Smartphone',
        'android_tablet': 'Android Tablet',
        'desktop': 'Desktop',
        'ipad': 'iPad',
        'iphone': 'iPhone'
      };
      return deviceMap[deviceName] || deviceName;
    };
    
    return {
      device: formatDeviceName(device.impression_device),
      deviceRaw: device.impression_device,
      impressions,
      clicks,
      spend,
      ctr,
      cpc,
      cpm,
      video30s,
      videoP25,
      videoP50,
      videoP75,
      videoP100,
      // Normalized values for better chart scaling
      impressionsNorm: impressions / 1000,
      clicksNorm: clicks / 100,
      spendNorm: spend / 10
    };
  });

  // Helper functions to safely get max values with fallbacks
  const getTopDeviceByImpressions = () => {
    if (!chartData || chartData.length === 0) {
      return { device: 'No Data', impressions: 0 };
    }
    return chartData.reduce((max, item) => item.impressions > max.impressions ? item : max);
  };

  const getBestCTRDevice = () => {
    if (!chartData || chartData.length === 0) {
      return { device: 'No Data', ctr: 0 };
    }
    return chartData.reduce((max, item) => item.ctr > max.ctr ? item : max);
  };

  const getHighestSpendDevice = () => {
    if (!chartData || chartData.length === 0) {
      return { device: 'No Data', spend: 0 };
    }
    return chartData.reduce((max, item) => item.spend > max.spend ? item : max);
  };

  const getTopVideoEngagementDevice = () => {
    if (!chartData || chartData.length === 0) {
      return { device: 'No Data', video30s: 0 };
    }
    return chartData.reduce((max, item) => item.video30s > max.video30s ? item : max);
  };

  // Colors for charts
  const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16'];

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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Device Performance Insights</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Performance breakdown by device types
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400">
            Device Analysis
          </span>
        </div>
      </div>

      {/* Top Performing Devices Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Top Device by Impressions */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Top Device</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {getTopDeviceByImpressions().device}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {formatMetric(getTopDeviceByImpressions().impressions)} impressions
              </p>
            </div>
            <DevicePhoneMobileIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Best CTR Device */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Best CTR</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatMetric(getBestCTRDevice().ctr, 'percentage')}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {getBestCTRDevice().device}
              </p>
            </div>
            <CursorArrowRaysIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Highest Spend Device */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Highest Spend</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatMetric(getHighestSpendDevice().spend, 'currency', metrics.currency)}
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {getHighestSpendDevice().device}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        {/* Top Video Engagement Device */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Top Video Engagement</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {formatMetric(getTopVideoEngagementDevice().video30s)}
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {getTopVideoEngagementDevice().device}
              </p>
            </div>
            <VideoCameraIcon className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* Device Performance Chart */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
            Device Performance Analysis
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Performance metrics breakdown by device types
          </p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="deviceSpendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="deviceImpressionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="deviceCTRGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="device" 
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
                  fill="url(#deviceSpendGradient)"
                  radius={[4, 4, 0, 0]}
                  name="Spend"
                  opacity={0.8}
                />
                
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="url(#deviceImpressionsGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                  name="Impressions"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="ctr" 
                  stroke="url(#deviceCTRGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
                  name="CTR"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Show message when no data */}
          {(!chartData || chartData.length === 0) && (
            <div className="text-center py-8">
              <DevicePhoneMobileIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No device performance data available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Device performance metrics will appear here when available
              </p>
            </div>
          )}
        </div>

        {/* Device Video Engagement Chart */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <VideoCameraIcon className="w-5 h-5 mr-2 text-teal-600" />
            Device Video Engagement Analysis
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Video engagement metrics breakdown by device types
          </p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData.filter(item => item.video30s > 0)}>
                <defs>
                  <linearGradient id="video30sGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="videoP25Gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#BE185D" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="videoP50Gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="device" 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  axisLine={{ stroke: '#6B7280' }}
                  tickLine={{ stroke: '#6B7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#6B7280' }}
                  tickLine={{ stroke: '#6B7280' }}
                  tickFormatter={(value) => formatMetric(value)}
                />
                
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#6B7280' }} iconType="circle" />
                
                <Bar 
                  dataKey="video30s" 
                  fill="url(#video30sGradient)"
                  radius={[4, 4, 0, 0]}
                  name="Video 30s Views"
                  opacity={0.8}
                />
                <Bar 
                  dataKey="videoP25" 
                  fill="url(#videoP25Gradient)"
                  radius={[4, 4, 0, 0]}
                  name="Video 25% Views"
                  opacity={0.8}
                />
                <Bar 
                  dataKey="videoP50" 
                  fill="url(#videoP50Gradient)"
                  radius={[4, 4, 0, 0]}
                  name="Video 50% Views"
                  opacity={0.8}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Fallback message if no video data */}
          {(!chartData || chartData.filter(item => item.video30s > 0).length === 0) && (
            <div className="text-center py-8">
              <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No video engagement data available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Video engagement metrics will appear here when available
              </p>
            </div>
          )}
        </div>

        {/* Device Performance Table */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ComputerDesktopIcon className="w-5 h-5 mr-2 text-teal-600" />
            Device Performance Summary
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Complete breakdown of performance metrics by device type
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Device
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Video 30s
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {chartData && chartData.length > 0 ? (
                  chartData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.device}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatMetric(item.video30s)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <DevicePhoneMobileIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No device performance data available</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceInsights;
