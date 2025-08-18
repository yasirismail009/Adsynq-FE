import React from 'react';
import { 
  UserGroupIcon,
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  CurrencyDollarIcon,
  VideoCameraIcon
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

const BreakdownInsights = ({ 
  insightsBreakdowns, 
  metrics, 
  formatMetric 
}) => {
  if (!insightsBreakdowns?.result?.insights_data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Demographic Performance Insights</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Performance breakdown by age and gender demographics
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Demographic Analysis
            </span>
          </div>
        </div>

        <div className="text-center py-12">
          <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No demographic performance data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            This data shows performance breakdown by age and gender demographics
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const chartData = insightsBreakdowns.result.insights_data.map((breakdown, index) => {
    const impressions = parseFloat(breakdown.impressions) || 0;
    const clicks = parseFloat(breakdown.clicks) || 0;
    const spend = parseFloat(breakdown.spend) || 0;
    const ctr = parseFloat(breakdown.ctr) || 0;
    const cpc = parseFloat(breakdown.cpc) || 0;
    const cpm = parseFloat(breakdown.cpm) || 0;
    
    // Extract demographic info
    const age = breakdown.age || 'Unknown';
    const gender = breakdown.gender || 'Unknown';
    const demographic = `${age} ${gender}`;
    
    // Extract video engagement data
    const video30s = breakdown.video_30_sec_watched_actions?.[0]?.value || 0;
    const videoP25 = breakdown.video_p25_watched_actions?.[0]?.value || 0;
    const videoP50 = breakdown.video_p50_watched_actions?.[0]?.value || 0;
    const videoP75 = breakdown.video_p75_watched_actions?.[0]?.value || 0;
    const videoP100 = breakdown.video_p100_watched_actions?.[0]?.value || 0;
    
    return {
      demographic,
      age,
      gender,
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

  // Group data by age for age-based analysis
  const ageGroupData = chartData.reduce((acc, item) => {
    const age = item.age;
    if (!acc[age]) {
      acc[age] = {
        age,
        totalImpressions: 0,
        totalClicks: 0,
        totalSpend: 0,
        totalVideo30s: 0,
        count: 0
      };
    }
    acc[age].totalImpressions += item.impressions;
    acc[age].totalClicks += item.clicks;
    acc[age].totalSpend += item.spend;
    acc[age].totalVideo30s += item.video30s;
    acc[age].count += 1;
    return acc;
  }, {});

  const ageChartData = Object.values(ageGroupData).map(item => ({
    age: item.age,
    impressions: item.totalImpressions,
    clicks: item.totalClicks,
    spend: item.totalSpend,
    video30s: item.totalVideo30s,
    avgCTR: item.totalClicks > 0 ? (item.totalClicks / item.totalImpressions) * 100 : 0
  }));

  // Group data by gender for gender-based analysis
  const genderGroupData = chartData.reduce((acc, item) => {
    const gender = item.gender;
    if (!acc[gender]) {
      acc[gender] = {
        gender,
        totalImpressions: 0,
        totalClicks: 0,
        totalSpend: 0,
        totalVideo30s: 0,
        count: 0
      };
    }
    acc[gender].totalImpressions += item.impressions;
    acc[gender].totalClicks += item.clicks;
    acc[gender].totalSpend += item.spend;
    acc[gender].totalVideo30s += item.video30s;
    acc[gender].count += 1;
    return acc;
  }, {});

  const genderChartData = Object.values(genderGroupData).map(item => ({
    gender: item.gender,
    impressions: item.totalImpressions,
    clicks: item.totalClicks,
    spend: item.totalSpend,
    video30s: item.totalVideo30s,
    avgCTR: item.totalClicks > 0 ? (item.totalClicks / item.totalImpressions) * 100 : 0
  }));

  // Colors for charts
  const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16'];

  // Helper functions to safely get max values with fallbacks
  const getTopAgeGroupByImpressions = () => {
    if (!ageChartData || ageChartData.length === 0) {
      return { age: 'No Data', impressions: 0 };
    }
    return ageChartData.reduce((max, item) => item.impressions > max.impressions ? item : max);
  };

  const getTopGenderByImpressions = () => {
    if (!genderChartData || genderChartData.length === 0) {
      return { gender: 'No Data', impressions: 0 };
    }
    return genderChartData.reduce((max, item) => item.impressions > max.impressions ? item : max);
  };

  const getBestCTRDemographic = () => {
    if (!chartData || chartData.length === 0) {
      return { demographic: 'No Data', ctr: 0 };
    }
    return chartData.reduce((max, item) => item.ctr > max.ctr ? item : max);
  };

  const getTopVideoEngagementDemographic = () => {
    if (!chartData || chartData.length === 0) {
      return { demographic: 'No Data', video30s: 0 };
    }
    return chartData.reduce((max, item) => item.video30s > max.video30s ? item : max);
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
            } else if (entry.dataKey === 'ctr' || entry.dataKey === 'avgCTR') {
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Demographic Performance Insights</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Performance breakdown by age and gender demographics
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Demographic Analysis
          </span>
        </div>
      </div>

      {/* Top Performing Demographics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Top Age Group */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Top Age Group</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {getTopAgeGroupByImpressions().age}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {formatMetric(getTopAgeGroupByImpressions().impressions)} impressions
              </p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Top Gender */}
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-4 border border-pink-200 dark:border-pink-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Top Gender</p>
              <p className="text-2xl font-bold text-pink-900 dark:text-pink-100 capitalize">
                {getTopGenderByImpressions().gender}
              </p>
              <p className="text-sm text-pink-700 dark:text-pink-300">
                {formatMetric(getTopGenderByImpressions().impressions)} impressions
              </p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-pink-600" />
          </div>
        </div>

        {/* Best CTR */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Best CTR</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatMetric(getBestCTRDemographic().ctr, 'percentage')}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {getBestCTRDemographic().demographic}
              </p>
            </div>
            <CursorArrowRaysIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Highest Video Engagement */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Top Video Engagement</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatMetric(getTopVideoEngagementDemographic().video30s)}
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {getTopVideoEngagementDemographic().demographic}
              </p>
            </div>
            <VideoCameraIcon className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* Age Group Performance Chart */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
            Age Group Performance Analysis
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Performance metrics breakdown by age groups
          </p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={ageChartData}>
                <defs>
                  <linearGradient id="ageSpendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="ageImpressionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="ageCTRGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="age" 
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
                <Legend wrapperStyle={{ color: '#6B7280' }} iconType="circle" />
                
                <Bar 
                  yAxisId="right"
                  dataKey="spend" 
                  fill="url(#ageSpendGradient)"
                  radius={[4, 4, 0, 0]}
                  name="Spend"
                  opacity={0.8}
                />
                
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="url(#ageImpressionsGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                  name="Impressions"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="avgCTR" 
                  stroke="url(#ageCTRGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
                  name="Avg CTR"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Performance Chart */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <UserGroupIcon className="w-5 h-5 mr-2 text-pink-600" />
            Gender Performance Analysis
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Performance metrics breakdown by gender
          </p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={genderChartData}>
                <defs>
                  <linearGradient id="genderSpendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#BE185D" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="genderImpressionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="genderCTRGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="gender" 
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
                <Legend wrapperStyle={{ color: '#6B7280' }} iconType="circle" />
                
                <Bar 
                  yAxisId="right"
                  dataKey="spend" 
                  fill="url(#genderSpendGradient)"
                  radius={[4, 4, 0, 0]}
                  name="Spend"
                  opacity={0.8}
                />
                
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="url(#genderImpressionsGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#F59E0B', strokeWidth: 2 }}
                  name="Impressions"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="avgCTR" 
                  stroke="url(#genderCTRGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#EF4444', strokeWidth: 2 }}
                  name="Avg CTR"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

                 {/* Video Engagement Chart */}
         <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
             <VideoCameraIcon className="w-5 h-5 mr-2 text-purple-600" />
             Video Engagement by Demographics
           </h3>
           <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
             Video engagement breakdown across different demographics
           </p>
           
           {/* Show bar chart if there's video data, otherwise show pie chart */}
           {chartData.filter(item => item.video30s > 0).length > 0 ? (
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
                     dataKey="demographic" 
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
           ) : (
             <div className="text-center py-8">
               <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
               <p className="text-gray-500 dark:text-gray-400">No video engagement data available</p>
               <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                 Video engagement metrics will appear here when available
               </p>
             </div>
           )}
         </div>

        {/* Detailed Demographics Table */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <EyeIcon className="w-5 h-5 mr-2 text-indigo-600" />
            Detailed Demographics Performance
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Complete breakdown of performance metrics by demographic segments
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Demographic
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
                    Video 30s
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {chartData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.demographic}
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
                      {formatMetric(item.video30s)}
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

export default BreakdownInsights;
