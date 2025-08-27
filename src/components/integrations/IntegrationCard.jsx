import { motion } from 'framer-motion';
import { useState } from 'react';
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
import { redirectToShopifyAuth } from '../../utils/shopify-oauth-handler';
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
  // Shopify domain input state
  const [showShopifyInput, setShowShopifyInput] = useState(false);
  const [shopifyDomain, setShopifyDomain] = useState('');
  const [shopifyInputError, setShopifyInputError] = useState('');
  const platformConfig = {
    google: { 
      name: 'Google Ads', 
      color: 'bg-blue-500', 
      icon: '/assets/google.svg',
      brandColor: '#4285F4',
      bgColor: '#f8ff94',
      description: 'Manage Google Ads campaigns, track performance, and optimize ad spend'
    },
    meta: { 
      name: 'Meta Ads', 
      color: 'bg-blue-600', 
      icon: '/assets/facebook.svg',
      brandColor: '#1877F2',
      bgColor: '#e7f3ff',
      description: 'Manage Facebook and Instagram advertising campaigns'
    },
    tiktok: { 
      name: 'TikTok Ads', 
      color: 'bg-black', 
      icon: '/assets/tiktok.svg',
      brandColor: '#000000',
      bgColor: '#f0f0f0',
      description: 'Create and manage TikTok advertising campaigns'
    },
    shopify: { 
      name: 'Shopify', 
      color: 'bg-green-500', 
      icon: '/assets/shopify.svg',
      brandColor: '#95BF47',
      bgColor: '#f0f8e7',
      description: 'Connect your Shopify store for e-commerce analytics'
    },
    linkedin: { 
      name: 'LinkedIn Ads', 
      color: 'bg-blue-700', 
      icon: '/assets/linkdln.svg',
      brandColor: '#0A66C2',
      bgColor: '#e8f4fd',
      description: 'Manage LinkedIn advertising campaigns and B2B marketing'
    },
    apple: { 
      name: 'Apple Search Ads', 
      color: 'bg-gray-800', 
      icon: '🍎',
      brandColor: '#000000',
      bgColor: '#f5f5f7',
      description: 'Manage Apple Search Ads campaigns'
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
        text: 'Connected',
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        iconColor: 'text-green-500'
      };
    } else {
      return {
        icon: XMarkIcon,
        text: 'Not Connected',
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

  // Get platform-specific metrics
  const getPlatformMetrics = () => {
    const platformType = primaryPlatform?.type;
    
    if (platformType === 'shopify') {
      return [
        { label: 'Orders', value: metrics.total_orders || 0, icon: ChartBarIcon },
        { label: 'Revenue', value: formatMetric(metrics.total_revenue || 0, 'currency'), icon: CurrencyDollarIcon },
        { label: 'Customers', value: formatMetric(metrics.total_customers || 0), icon: UserIcon },
        { label: 'Products', value: formatMetric(platformData?.productsCount || 0), icon: ChartBarIcon }
      ];
    } else {
      // Default advertising metrics
      return [
        { label: 'Campaigns', value: formatMetric(metrics.campaigns || 0), icon: ChartBarIcon },
        { label: 'Impressions', value: formatMetric(metrics.impressions || 0), icon: ViewIcon },
        { label: 'Clicks', value: formatMetric(metrics.clicks || 0), icon: CursorArrowRaysIcon },
        { label: 'Spend', value: formatMetric(metrics.spend || 0, 'currency'), icon: CurrencyDollarIcon }
      ];
    }
  };

  const platformMetrics = getPlatformMetrics();

  // Shopify domain validation and submission
  const handleShopifyDomainSubmit = () => {
    if (!shopifyDomain.trim()) {
      setShopifyInputError('Please enter a Shopify store domain');
      return;
    }
    
    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
    if (!domainRegex.test(shopifyDomain.trim())) {
      setShopifyInputError('Please enter a valid Shopify domain (e.g., mystore.myshopify.com)');
      return;
    }
    
    setShopifyInputError('');
    setShowShopifyInput(false);
    
    // Redirect to Shopify OAuth
    redirectToShopifyAuth(shopifyDomain.trim());
  };

  // Handle connect button click for different platforms
  const handleConnect = () => {
    const platformType = integrations[0]?.type;
    
    if (platformType === 'shopify') {
      setShowShopifyInput(true);
      setShopifyDomain('');
      setShopifyInputError('');
    } else if (platformType === 'google') {
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
      <div className="flex items-center gap-4 mb-4">
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
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {platform.name}
            </h2>
            {isConnected && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                <CheckCircleIcon className="w-3 h-3" />
                Connected
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
              <div className="flex items-center gap-3 mb-3">
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

      {/* Shopify Domain Input Form */}
      {showShopifyInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <div className="space-y-3">
            <div>
              <label htmlFor="shopifyDomain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shopify Store Domain
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="shopifyDomain"
                  value={shopifyDomain}
                  onChange={(e) => {
                    setShopifyDomain(e.target.value);
                    setShopifyInputError('');
                  }}
                  placeholder="mystore.myshopify.com"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleShopifyDomainSubmit();
                    }
                  }}
                />
                <button
                  onClick={handleShopifyDomainSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Connect
                </button>
                <button
                  onClick={() => {
                    setShowShopifyInput(false);
                    setShopifyDomain('');
                    setShopifyInputError('');
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
              {shopifyInputError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {shopifyInputError}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your Shopify store domain (e.g., mystore.myshopify.com)
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto">
        {isConnected ? (
          <div className="flex gap-2">
            <a
              href={primaryPlatform?.type === 'google' ? '/google' : primaryPlatform?.type === 'meta' ? `/facebook/${id}` : `/platform/${id}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
            >
              <ChartBarIcon className="w-4 h-4" />
              Dashboard
            </a>
            <button
              onClick={onView}
              disabled={isConnecting || isDisconnecting || isNavigating}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isNavigating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
              {isNavigating ? 'Navigating...' : 'View'}
            </button>
            <button
              onClick={onDisconnect}
              disabled={isConnecting || isDisconnecting}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <XMarkIcon className="w-4 h-4" />
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: platform.brandColor }}
          >
            {isConnecting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <PlusIcon className="w-4 h-4" />
            )}
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default IntegrationCard; 