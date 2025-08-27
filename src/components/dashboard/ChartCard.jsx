import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTheme } from '../../hooks/useTheme';

const ChartCard = ({ 
  title, 
  subtitle, 
  data, 
  type = 'line', 
  height = 300,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  noDataMessage = "No data available",
  gradient = false,
  multiLine = false
}) => {
  const { isDarkMode } = useTheme();
  
  // Dynamic tooltip styles based on theme
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
    border: `1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
    borderRadius: '8px',
    boxShadow: isDarkMode 
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    color: isDarkMode ? '#FFFFFF' : '#231F23'
  };
  const renderChart = () => {
    const gridColor = isDarkMode ? '#4B5563' : '#E5E7EB';
    const textColor = isDarkMode ? '#D1D5DB' : '#6B7280';
    
    switch (type) {
      case 'line':
        // Get all data keys except 'name' for multi-line support
        const dataKeys = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'name') : [];
        
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
                             <defs>
                 {gradient && dataKeys.map((key, index) => (
                   <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.6}/>
                     <stop offset="30%" stopColor={colors[index % colors.length]} stopOpacity={0.4}/>
                     <stop offset="70%" stopColor={colors[index % colors.length]} stopOpacity={0.2}/>
                     <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.05}/>
                   </linearGradient>
                 ))}
               </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="name" 
                stroke={textColor} 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke={textColor} 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                  return value.toLocaleString();
                }}
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toLocaleString() : value,
                  name
                ]}
              />
              {multiLine && dataKeys.length > 1 ? (
                // Multiple lines for different metrics
                dataKeys.map((key, index) => (
                  <Line 
                    key={key}
                    type="monotone" 
                    dataKey={key} 
                    stroke={gradient ? `url(#gradient-${key})` : colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
                  />
                ))
              ) : (
                // Single line (backward compatibility)
                <Line 
                  type="monotone" 
                  dataKey={dataKeys[0] || "value"} 
                  stroke={gradient ? `url(#gradient-${dataKeys[0] || "value"})` : colors[0]} 
                  strokeWidth={2}
                  dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

             case 'area':
         // Get all data keys except 'name' for multi-area support
         const areaDataKeys = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'name') : [];
         
         return (
           <ResponsiveContainer width="100%" height={height}>
             <AreaChart data={data}>
               <defs>
                 {gradient && areaDataKeys.map((key, index) => (
                   <linearGradient key={key} id={`area-gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                     <stop offset="30%" stopColor={colors[index % colors.length]} stopOpacity={0.6}/>
                     <stop offset="70%" stopColor={colors[index % colors.length]} stopOpacity={0.3}/>
                     <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.1}/>
                   </linearGradient>
                 ))}
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
               <XAxis 
                 dataKey="name" 
                 stroke={textColor} 
                 fontSize={12}
                 tickLine={false}
                 axisLine={false}
               />
               <YAxis 
                 stroke={textColor} 
                 fontSize={12}
                 tickLine={false}
                 axisLine={false}
                 tickFormatter={(value) => {
                   if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                   if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                   return value.toLocaleString();
                 }}
               />
               <Tooltip 
                 contentStyle={tooltipStyle}
                 formatter={(value, name) => [
                   typeof value === 'number' ? value.toLocaleString() : value,
                   name
                 ]}
               />
               {multiLine && areaDataKeys.length > 1 ? (
                 // Multiple areas for different metrics
                 areaDataKeys.map((key, index) => (
                   <Area 
                     key={key}
                     type="monotone" 
                     dataKey={key} 
                     stroke={colors[index % colors.length]}
                     fill={gradient ? `url(#area-gradient-${key})` : colors[index % colors.length]}
                     fillOpacity={gradient ? 1 : 0.3}
                     strokeWidth={2}
                   />
                 ))
               ) : (
                 // Single area (backward compatibility)
                 <Area 
                   type="monotone" 
                   dataKey={areaDataKeys[0] || "value"} 
                   stroke={colors[0]}
                   fill={gradient ? `url(#area-gradient-${areaDataKeys[0] || "value"})` : colors[0]}
                   fillOpacity={gradient ? 1 : 0.3}
                   strokeWidth={2}
                 />
               )}
             </AreaChart>
           </ResponsiveContainer>
         );

             case 'bar':
         // Get all data keys except 'name' for multi-bar support
         const barDataKeys = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'name') : [];
         
         return (
           <ResponsiveContainer width="100%" height={height}>
             <BarChart data={data}>
               <defs>
                 {gradient && barDataKeys.map((key, index) => (
                   <linearGradient key={key} id={`bar-gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.9}/>
                     <stop offset="50%" stopColor={colors[index % colors.length]} stopOpacity={0.7}/>
                     <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.4}/>
                   </linearGradient>
                 ))}
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
               <XAxis 
                 dataKey="name" 
                 stroke={textColor} 
                 fontSize={12}
                 tickLine={false}
                 axisLine={false}
               />
               <YAxis 
                 stroke={textColor} 
                 fontSize={12}
                 tickLine={false}
                 axisLine={false}
                 tickFormatter={(value) => {
                   if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                   if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                   return value.toLocaleString();
                 }}
               />
               <Tooltip 
                 contentStyle={tooltipStyle}
                 formatter={(value, name) => [
                   typeof value === 'number' ? value.toLocaleString() : value,
                   name
                 ]}
               />
               {multiLine && barDataKeys.length > 1 ? (
                 // Multiple bars for different metrics
                 barDataKeys.map((key, index) => (
                   <Bar 
                     key={key}
                     dataKey={key} 
                     fill={gradient ? `url(#bar-gradient-${key})` : colors[index % colors.length]}
                     radius={[4, 4, 0, 0]}
                   />
                 ))
               ) : (
                 // Single bar (backward compatibility)
                 <Bar 
                   dataKey={barDataKeys[0] || "value"} 
                   fill={gradient ? `url(#bar-gradient-${barDataKeys[0] || "value"})` : colors[0]}
                   radius={[4, 4, 0, 0]}
                 />
               )}
             </BarChart>
           </ResponsiveContainer>
         );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={tooltipStyle}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      
      <div className="w-full">
        {!data || data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm font-medium">{noDataMessage}</p>
            </div>
          </div>
        ) : (
          renderChart()
        )}
      </div>
    </motion.div>
  );
};

export default ChartCard; 