import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { useIntegrations } from '../../hooks/useIntegrations';

const PlatformDashboard = () => {
  const { platformId } = useParams();
  const navigate = useNavigate();
  const { integrations, loading } = useIntegrations();
  const [platformData, setPlatformData] = useState(null);

  useEffect(() => {
    if (integrations.length > 0 && platformId) {
      const integration = integrations.find(integ => integ.id === platformId);
      setPlatformData(integration);
    }
  }, [integrations, platformId]);

  // Platform configuration
  const platformConfig = {
    google: { 
      name: 'Google Ads', 
      icon: '/assets/google.svg',
      color: 'bg-blue-500',
      brandColor: '#4285F4',
      bgColor: '#f8ff94',
      description: 'Manage Google Ads campaigns, track performance, and optimize ad spend'
    },
    meta: { 
      name: 'Meta Ads', 
      icon: '/assets/facebook.svg',
      color: 'bg-[#174A6E]',
      brandColor: '#1877F2',
      bgColor: '#e7f3ff',
      description: 'Manage Facebook and Instagram advertising campaigns'
    },
    tiktok: { 
      name: 'TikTok Ads', 
      icon: '/assets/tiktok.svg',
      color: 'bg-black',
      brandColor: '#000000',
      bgColor: '#f0f0f0',
      description: 'Create and manage TikTok advertising campaigns'
    },
    shopify: { 
      name: 'Shopify', 
      icon: '/assets/shopify.svg',
      color: 'bg-green-500',
      brandColor: '#95BF47',
      bgColor: '#f0f8e7',
      description: 'Connect your Shopify store for e-commerce analytics'
    },
    linkedin: { 
      name: 'LinkedIn Ads', 
      icon: '/assets/linkdln.svg',
      color: 'bg-blue-700',
      brandColor: '#0A66C2',
      bgColor: '#e8f4fd',
      description: 'Manage LinkedIn advertising campaigns and B2B marketing'
    },
    apple: { 
      name: 'Apple Search Ads', 
      icon: '🍎',
      color: 'bg-gray-800',
      brandColor: '#000000',
      bgColor: '#f5f5f7',
      description: 'Manage Apple Search Ads campaigns'
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!platformData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">Platform not found</p>
        <button 
          onClick={() => navigate('/integrations')}
          className="px-4 py-2 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg transition-colors"
        >
          Back to Integrations
        </button>
      </div>
    );
  }

  const primaryPlatform = platformData.integrations.find(p => p.status === 'active') || platformData.integrations[0];
  const platformType = primaryPlatform?.type || 'google';
  const platform = platformConfig[platformType] || platformConfig.google;

  // Format metrics for display
  const formatMetric = (value, type = 'number') => {
    if (value === null || value === undefined) return '0';
    
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    if (type === 'number') {
      return new Intl.NumberFormat('en-US').format(value);
    }
    
    return value.toString();
  };

  // Get platform-specific metrics
  const getPlatformMetrics = () => {
    if (platformType === 'shopify') {
      return [
        { label: 'Orders', value: platformData.metrics.total_orders || 0, icon: ChartBarIcon },
        { label: 'Revenue', value: formatMetric(platformData.metrics.total_revenue || 0, 'currency'), icon: CurrencyDollarIcon },
        { label: 'Customers', value: formatMetric(platformData.metrics.total_customers || 0), icon: UserIcon },
        { label: 'Products', value: formatMetric(platformData.platformData?.productsCount || 0), icon: ChartBarIcon }
      ];
    } else {
      return [
        { label: 'Campaigns', value: formatMetric(platformData.metrics.campaigns || 0), icon: ChartBarIcon },
        { label: 'Impressions', value: formatMetric(platformData.metrics.impressions || 0), icon: EyeIcon },
        { label: 'Clicks', value: formatMetric(platformData.metrics.clicks || 0), icon: CursorArrowRaysIcon },
        { label: 'Spend', value: formatMetric(platformData.metrics.spend || 0, 'currency'), icon: CurrencyDollarIcon }
      ];
    }
  };

  const platformMetrics = getPlatformMetrics();

  // Get status info
  const getStatusInfo = () => {
    if (platformData.status === 'active') {
      return {
        icon: CheckCircleIcon,
        text: 'Connected',
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        iconColor: 'text-green-500'
      };
    } else if (platformData.status === 'needs_refresh') {
      return {
        icon: ExclamationTriangleIcon,
        text: 'Needs Refresh',
        color: 'text-yellow-700 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        iconColor: 'text-yellow-500'
      };
    } else {
      return {
        icon: ExclamationTriangleIcon,
        text: 'Not Connected',
        color: 'text-gray-500 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        iconColor: 'text-gray-400'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/integrations')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden"
              >
                {platform.icon.endsWith('.svg') ? (
                  <img 
                    src={platform.icon} 
                    alt={platform.name} 
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="text-white text-xl font-bold">
                    {platform.icon}
                  </span>
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {platform.name} Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {platform.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center gap-2 px-3 py-1 ${statusInfo.bgColor} ${statusInfo.color} text-sm font-medium rounded-full`}>
              <StatusIcon className="w-4 h-4" />
              {statusInfo.text}
            </span>
            
                         {platformData.status === 'needs_refresh' && (
               <button className="flex items-center gap-2 px-3 py-2 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg text-sm font-medium transition-colors">
                 <ArrowPathIcon className="w-4 h-4" />
                 Refresh
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Account Information */}
      {platformData.userData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
          
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: platform.bgColor }}
            >
              {platformData.userData.image ? (
                <img 
                  src={platformData.userData.image} 
                  alt={platformData.userData.name || 'User'} 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {platformData.userData.name || 'Account'}
              </h3>
              {platformData.userData.email && (
                <p className="text-gray-600 dark:text-gray-400">
                  {platformData.userData.email}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Connected: {platformData.createdDate}</span>
                </div>
                {platformData.updatedDate && (
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="w-4 h-4" />
                    <span>Updated: {platformData.updatedDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {metric.value}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Platform Details */}
      {platformData.platformData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Connection Health */}
            {platformData.platformData.connectionHealth && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Connection Health</h3>
                <p className="text-gray-900 dark:text-white">{platformData.platformData.connectionHealth}</p>
              </div>
            )}

            {/* Token Status */}
            {platformData.platformData.tokenStatus && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Token Status</h3>
                <p className="text-gray-900 dark:text-white">{platformData.platformData.tokenStatus}</p>
              </div>
            )}

            {/* Available Platforms */}
            {platformData.platformData.availablePlatforms && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Available Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {platformData.platformData.availablePlatforms.map((platform, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-full"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Account Age */}
            {platformData.platformData.accountAgeDays && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Account Age</h3>
                <p className="text-gray-900 dark:text-white">{platformData.platformData.accountAgeDays} days</p>
              </div>
            )}
          </div>

          {/* Platform Note */}
          {platformData.platformData.note && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Note</h3>
              <p className="text-gray-900 dark:text-white">{platformData.platformData.note}</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg transition-colors">
            <ChartBarIcon className="w-5 h-5" />
            <span>View Analytics</span>
          </button>
          
                     <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
             <ArrowPathIcon className="w-5 h-5" />
             <span>Refresh Data</span>
           </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg transition-colors">
            <LinkIcon className="w-5 h-5" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
