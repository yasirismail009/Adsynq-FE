import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  trend,
  trendDirection = 'up',
  icon: Icon = CurrencyDollarIcon,
  color = 'blue',
  dataSources = []
}) => {
  const { t } = useTranslation();
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  const iconClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100',
  };

  // Use new trend props if provided, otherwise fall back to old change props
  const displayTrend = trend || change;
  const displayTrendDirection = trendDirection || (changeType === 'positive' ? 'up' : 'down');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between rtl:flex-row-reverse">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
          
          {displayTrend && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {displayTrendDirection === 'up' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                displayTrendDirection === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {displayTrend}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('common.vsLastMonth')}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end space-y-2 rtl:items-start">
          <div className={`p-3 rounded-lg ${iconClasses[color]}`}>
            <Icon className={`w-6 h-6 ${colorClasses[color]}`} />
          </div>
          
                     {/* Data Sources */}
           {dataSources.length > 0 && (
             <div className="flex items-center space-x-1 rtl:space-x-reverse">
               {dataSources.map((source, index) => {
                 let iconSrc;
                 
                 switch (source) {
                   case 'meta':
                     iconSrc = '/assets/facebook.svg';
                     break;
                   case 'google':
                     iconSrc = '/assets/google.svg';
                     break;
                   case 'tiktok':
                     iconSrc = '/assets/tiktok.svg';
                     break;
                   case 'shopify':
                     iconSrc = '/assets/shopify.svg';
                     break;
                   case 'email':
                     return (
                       <div key={index} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                         <span className="text-gray-600 dark:text-gray-400 text-lg font-bold">@</span>
                       </div>
                     );
                   default:
                     return null;
                 }
                 
                 return (
                   <div key={index} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                     <img 
                       src={iconSrc} 
                       alt={source} 
                       className="w-4 h-4 object-contain"
                     />
                   </div>
                 );
               })}
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard; 