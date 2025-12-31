import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  EyeIcon, 
  PencilIcon, 
  DocumentDuplicateIcon, 
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  XMarkIcon,
  UserIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  EyeIcon as ViewIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';
import { redirectToGoogleAuth } from '../../utils/google-oauth-handler';

const IntegrationCard = ({ 
  id,
  title, 
  domain, 
  integrations = [], 
  metrics = {}, 
  status = 'active',
  paymentStatus = 'paid',
  createdDate,
  updatedDate,
  userData = null,
  platformData = null,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onConnect,
  onDisconnect,
  isConnecting = false,
  isDisconnecting = false,
  isNavigating = false
}) => {
  const { t } = useTranslation();
  const platformConfig = {
    google: { 
      name: t('integrations.googleAds'), 
      color: 'bg-blue-500', 
      icon: '/assets/google.svg',
      brandColor: '#4285F4',
      bgColor: '#f8ff94',
      description: t('integrations.googleDescription')
    },
    meta: { 
      name: t('integrations.metaAds'), 
      color: 'bg-blue-600', 
      icon: '/assets/facebook.svg',
      brandColor: '#1877F2',
      bgColor: '#e7f3ff',
      description: t('integrations.metaDescription')
    }
  };

  // Get the primary platform (first active one, or first one if none active)
  const primaryPlatform = integrations.find(p => p.status === 'active') || integrations[0];
  const platform = platformConfig[primaryPlatform?.type] || platformConfig.google;
  
  // Handle different connection statuses
  const isConnected = status === 'active';
  const isInactive = status === 'inactive';
  
  // Get status display info
  const getStatusInfo = () => {
    if (isConnected) {
      return {
        icon: CheckCircleIcon,
        text: t('integrations.connected'),
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        iconColor: 'text-green-500'
      };
    } else {
      return {
        icon: XMarkIcon,
        text: t('integrations.notConnected'),
        color: 'text-gray-500 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        iconColor: 'text-gray-400'
      };
    }
  };
  
  const statusInfo = getStatusInfo();

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

  // Get platform-specific metrics (currently only Google and Meta supported)
  const getPlatformMetrics = () => {
    // Default advertising metrics for Google and Meta
    return [
      { label: 'Campaigns', value: formatMetric(metrics.campaigns || 0), icon: ChartBarIcon },
      { label: 'Impressions', value: formatMetric(metrics.impressions || 0), icon: ViewIcon },
      { label: 'Clicks', value: formatMetric(metrics.clicks || 0), icon: CursorArrowRaysIcon },
      { label: 'Spend', value: formatMetric(metrics.spend || 0, 'currency'), icon: CurrencyDollarIcon }
    ];
  };

  const platformMetrics = getPlatformMetrics();

  // Handle connect button click for different platforms (currently only Google and Meta supported)
  const handleConnect = () => {
    const platformType = integrations[0]?.type;
    
    if (platformType === 'google') {
      // Use the new Google OAuth utility function
      redirectToGoogleAuth();
    } else {
      onConnect();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full"
    >
      {/* Platform Icon, Title, and Connected Status */}
      <div className="flex items-center gap-4 mb-4 rtl:flex-row-reverse">
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
        <div className="flex-1">
          <div className="flex items-center gap-3 rtl:flex-row-reverse">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {platform.name}
            </h2>
            {isConnected && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full rtl:flex-row-reverse">
                <CheckCircleIcon className="w-3 h-3" />
                {t('integrations.connected')}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {platform.description}
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-6">

        {/* Account Info - Show for all statuses if userData exists */}
        {(userData || platformData?.note) && (
          <div className={`${statusInfo.bgColor} rounded-lg p-4 border border-gray-100 dark:border-gray-600`}>
            {userData && (
              <div className="flex items-center gap-3 mb-3 rtl:flex-row-reverse">
                {/* User Avatar */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: platform.bgColor }}
                >
                  {userData.image ? (
                    <img 
                      src={userData.image} 
                      alt={userData.name || 'User'} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                
                {/* User Details */}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {userData.name || 'Account'}
                  </div>
                  {userData.email && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {userData.email}
                    </div>
                  )}
                  {updatedDate && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Last updated: {new Date(updatedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Platform Note */}
            {platformData?.note && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                {platformData.note}
              </div>
            )}
            
            {/* Additional Status Info */}
            {platformData?.connectionHealth && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Health: {platformData.connectionHealth}
              </div>
            )}
            
            {/* Platform-specific counts */}
            {platformData && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                {platformData.adAccountsCount !== undefined && (
                  <div>Ad Accounts: {platformData.adAccountsCount}</div>
                )}
                {platformData.pagesCount !== undefined && (
                  <div>Pages: {platformData.pagesCount}</div>
                )}
                {platformData.advertisersCount !== undefined && (
                  <div>Advertisers: {platformData.advertisersCount}</div>
                )}
                {platformData.productsCount !== undefined && (
                  <div>Products: {platformData.productsCount}</div>
                )}
                {platformData.collectionsCount !== undefined && (
                  <div>Collections: {platformData.collectionsCount}</div>
                )}
                {platformData.companyPagesCount !== undefined && (
                  <div>Company Pages: {platformData.companyPagesCount}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        {isConnected ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={primaryPlatform?.type === 'google' ? '/google' : primaryPlatform?.type === 'meta' ? `/meta/${id}` : `/platform/${id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 rtl:flex-row-reverse"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span className="text-sm">{t('common.dashboard')}</span>
            </a>
            <button
              onClick={onView}
              disabled={isConnecting || isDisconnecting || isNavigating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 rtl:flex-row-reverse"
            >
              {isNavigating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-400"></div>
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
              <span className="text-sm">{isNavigating ? t('integrations.navigating') : t('common.view')}</span>
            </button>
            <button
              onClick={onDisconnect}
              disabled={isConnecting || isDisconnecting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-red-200 rtl:flex-row-reverse"
            >
              <XMarkIcon className="w-5 h-5" />
              <span className="text-sm">{isDisconnecting ? t('integrations.disconnecting') : t('common.disconnect')}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none rtl:flex-row-reverse"
            style={{ backgroundColor: platform.brandColor }}
          >
            {isConnecting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <PlusIcon className="w-5 h-5" />
            )}
            <span className="text-sm">{isConnecting ? t('integrations.connecting') : t('common.connect')}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default IntegrationCard; 