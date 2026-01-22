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
  CursorArrowRaysIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { redirectToGoogleAuth } from '../../utils/google-oauth-handler';
import { usePlanType } from '../../hooks/useSubscription';

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
  googleAccounts = null,
  metaConnections = null,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onConnect,
  onDisconnect,
  onSubscribe,
  onRefreshTokens,
  hasSubscription,
  isConnecting = false,
  isDisconnecting = false,
  isNavigating = false,
  isRefreshing = false
}) => {
  const { t } = useTranslation();
  const { isFree } = usePlanType();
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
      color: 'bg-[#174A6E]', 
      icon: '/assets/facebook.svg',
      brandColor: '#1877F2',
      bgColor: '#e7f3ff',
      description: t('integrations.metaDescription')
    }
  };

  // Get the primary platform (first active one, or first one if none active)
  const primaryPlatform = integrations.find(p => p.status === 'active') || integrations[0];
  const platform = platformConfig[primaryPlatform?.type] || platformConfig.google;
  
  // Determine connection status: connected if status is 'active' OR if platform connections exist
  const hasPlatformConnections = (primaryPlatform?.type === 'google' && googleAccounts && googleAccounts.length > 0) ||
                                  (primaryPlatform?.type === 'meta' && metaConnections && metaConnections.length > 0);
  const isConnected = status === 'active' || hasPlatformConnections;
  const isInactive = status === 'inactive';
  
  // Check if this specific card's connection(s) need refresh (per platform).
  // Only show when needs_refresh is strictly boolean true; hide when false, undefined, or non-boolean.
  const g0 = googleAccounts?.[0];
  const m0 = metaConnections?.[0];
  const googleNeedsRefresh = Boolean(googleAccounts?.length && typeof g0?.needs_refresh === 'boolean' && g0.needs_refresh === true);
  const metaNeedsRefresh = Boolean(metaConnections?.length && typeof m0?.needs_refresh === 'boolean' && m0.needs_refresh === true);
  const needsRefresh = googleNeedsRefresh || metaNeedsRefresh;
  
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

  // Debug: Log googleAccounts and metaConnections data
  console.log('IntegrationCard - googleAccounts:', googleAccounts, 'metaConnections:', metaConnections, 'platformType:', primaryPlatform?.type);

  // Handle connect button click for different platforms (currently only Google and Meta supported)
  const handleConnect = (isRefresh = false) => {
    const platformType = integrations[0]?.type;
    
    // If onConnect is provided, use it (it will handle the refresh flag)
    if (onConnect) {
      // Create integration object from props to pass to onConnect
      const integrationData = {
        id,
        title,
        domain,
        integrations,
        metrics,
        status,
        paymentStatus,
        createdDate,
        updatedDate,
        userData,
        platformData
      };
      onConnect(integrationData, isRefresh);
      return;
    }
    
    // Fallback to direct OAuth redirect (for backward compatibility)
    if (platformType === 'google') {
      // Use the new Google OAuth utility function
      redirectToGoogleAuth();
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    handleConnect(true); // Pass isRefresh = true
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

      {/* Google Accounts Display */}
      {googleAccounts && googleAccounts.length > 0 && (
        <div className="mb-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            {t('integrations.googleAccounts', 'Google Accounts')}
          </h3>
          {googleAccounts.map((account) => {
            const selectedCustomers = account.selected_customers?.filter(c => c.is_selected) || [];
            const nonSelectedCustomers = account.selected_customers?.filter(c => !c.is_selected) || [];
            const hasAnyCustomers = selectedCustomers.length > 0 || nonSelectedCustomers.length > 0;
            
            return (
              <div key={account.google_account_id} className="space-y-3 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Account Header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    {account.google_account?.picture && (
                      <img
                        src={account.google_account.picture}
                        alt={account.google_account.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {account.google_account?.name || 'Google Account'}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {account.google_account?.email}
                      </p>
                    </div>
                  </div>
                  {hasAnyCustomers && (
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-900 dark:text-white">
                        {selectedCustomers.length} {t('integrations.customers.selected', 'selected')}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {account.selected_customers?.length || 0} {t('integrations.customers.total', 'total')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Customers */}
                {selectedCustomers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      {t('integrations.customers.selectedCustomers', 'Selected Customers')}
                    </h4>
                    <div className="space-y-3">
                      {selectedCustomers.map((customer) => {
                        const selectedCampaigns = customer.selected_campaigns || [];
                        return (
                          <div
                            key={customer.id}
                            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg overflow-hidden"
                          >
                            {/* Customer Header */}
                            <div className="flex items-center justify-between p-3">
                              <div className="flex items-center space-x-3">
                                <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {customer.descriptive_name || `Customer ${customer.customer_id}`}
                                  </h5>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    ID: {customer.customer_id} • {customer.currency_code}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {selectedCampaigns.length > 0 && (
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                    {selectedCampaigns.length} {t('common.campaigns', 'Campaigns')}
                                  </span>
                                )}
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                  {t('integrations.customers.active', 'Active')}
                                </span>
                              </div>
                            </div>

                            {/* Selected Campaigns */}
                            {selectedCampaigns.length > 0 && (
                              <div className="border-t border-green-200 dark:border-green-800 bg-white dark:bg-gray-800/50 px-3 py-2">
                                <div className="space-y-1.5">
                                  {selectedCampaigns.map((campaign) => (
                                    <div
                                      key={campaign.id || campaign.campaign_id}
                                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-green-100 dark:border-green-900/30"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <ChartBarIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                        <div>
                                          <p className="text-xs font-medium text-gray-900 dark:text-white">
                                            {campaign.name || campaign.campaign_name}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            ID: {campaign.campaign_id} • {campaign.status || 'Active'}
                                          </p>
                                        </div>
                                      </div>
                                      <CheckCircleIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Non-Selected Customers (Blurred with Premium Icon) */}
                {nonSelectedCustomers.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t('integrations.customers.otherCustomers', 'Other Customers')}
                      </h4>
                      {isFree && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                          <SparklesIcon className="w-3 h-3" />
                          <span>{t('integrations.customers.premiumRequired', 'Premium Required')}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 relative">
                      {nonSelectedCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="relative flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                          style={{ 
                            opacity: 0.5,
                            filter: 'blur(3px)'
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                            <div>
                              <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {customer.descriptive_name || `Customer ${customer.customer_id}`}
                              </h5>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                ID: {customer.customer_id} • {customer.currency_code}
                              </p>
                            </div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <div className="flex items-center space-x-1 bg-gradient-to-r from-[#174A6E] to-[#0B3049] text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                              <SparklesIcon className="w-3 h-3" />
                              <span>{t('integrations.customers.premium', 'Premium')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Meta Connections Display */}
      {metaConnections && metaConnections.length > 0 && primaryPlatform?.type === 'meta' && (
        <div className="mb-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            {t('integrations.metaConnections', 'Meta Connections')}
          </h3>
          {metaConnections.map((connection) => {
            const selectedAdAccounts = connection.selected_ad_accounts?.filter(acc => acc.is_selected) || [];
            const nonSelectedAdAccounts = connection.selected_ad_accounts?.filter(acc => !acc.is_selected) || [];
            const hasAnyAdAccounts = selectedAdAccounts.length > 0 || nonSelectedAdAccounts.length > 0;
            
            return (
              <div key={connection.connection_id} className="space-y-3 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Connection Header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#174A6E] rounded-full flex items-center justify-center">
                      <BuildingOfficeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {connection.account_name || 'Meta Account'}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {connection.account_email}
                      </p>
                    </div>
                  </div>
                  {hasAnyAdAccounts && (
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-900 dark:text-white">
                        {selectedAdAccounts.length} {t('integrations.adAccounts.selected', 'selected')}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {connection.selected_ad_accounts?.length || 0} {t('integrations.adAccounts.total', 'total')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Ad Accounts */}
                {selectedAdAccounts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      {t('integrations.adAccounts.selectedAdAccounts', 'Selected Ad Accounts')}
                    </h4>
                    <div className="space-y-3">
                      {selectedAdAccounts.map((adAccount) => {
                        const selectedCampaigns = adAccount.campaigns?.filter(c => c.is_selected) || [];
                        return (
                          <div
                            key={adAccount.id}
                            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg overflow-hidden"
                          >
                            {/* Ad Account Header */}
                            <div className="flex items-center justify-between p-3">
                              <div className="flex items-center space-x-3">
                                <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {adAccount.ad_account_name || `Account ${adAccount.ad_account_id}`}
                                  </h5>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    ID: {adAccount.ad_account_id} • {adAccount.currency}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {selectedCampaigns.length > 0 && (
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                    {selectedCampaigns.length} {t('common.campaigns', 'Campaigns')}
                                  </span>
                                )}
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                  {t('integrations.customers.active', 'Active')}
                                </span>
                              </div>
                            </div>

                            {/* Selected Campaigns */}
                            {selectedCampaigns.length > 0 && (
                              <div className="border-t border-green-200 dark:border-green-800 bg-white dark:bg-gray-800/50 px-3 py-2">
                                <div className="space-y-1.5">
                                  {selectedCampaigns.map((campaign) => (
                                    <div
                                      key={campaign.id || campaign.campaign_id}
                                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-green-100 dark:border-green-900/30"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <ChartBarIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                        <div>
                                          <p className="text-xs font-medium text-gray-900 dark:text-white">
                                            {campaign.campaign_name || campaign.name}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            ID: {campaign.campaign_id} • {campaign.status || 'Active'}
                                          </p>
                                        </div>
                                      </div>
                                      <CheckCircleIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Non-Selected Ad Accounts (Blurred with Premium Icon) */}
                {nonSelectedAdAccounts.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t('integrations.adAccounts.otherAdAccounts', 'Other Ad Accounts')}
                      </h4>
                      {isFree && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                          <SparklesIcon className="w-3 h-3" />
                          <span>{t('integrations.customers.premiumRequired', 'Premium Required')}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 relative">
                      {nonSelectedAdAccounts.map((adAccount) => (
                        <div
                          key={adAccount.id}
                          className="relative flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                          style={{ 
                            opacity: 0.5,
                            filter: 'blur(3px)'
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                            <div>
                              <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {adAccount.ad_account_name || `Account ${adAccount.ad_account_id}`}
                              </h5>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                ID: {adAccount.ad_account_id} • {adAccount.currency}
                              </p>
                            </div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <div className="flex items-center space-x-1 bg-gradient-to-r from-[#174A6E] to-[#0B3049] text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                              <SparklesIcon className="w-3 h-3" />
                              <span>{t('integrations.customers.premium', 'Premium')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Show refresh connection warning and button if needs refresh */}
        {isConnected && needsRefresh && (
          <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                {t('integrations.connectionNeedsRefresh', 'Connection needs refresh')}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isConnecting || isDisconnecting}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rtl:flex-row-reverse"
            >
              {isConnecting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <ArrowPathIcon className="w-4 h-4" />
              )}
              <span className="text-sm">
                {isConnecting ? t('integrations.connecting', 'Connecting...') : t('integrations.refreshConnection', 'Refresh Connection')}
              </span>
            </button>
          </div>
        )}
        
        {isConnected ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={primaryPlatform?.type === 'google' ? '/google' : primaryPlatform?.type === 'meta' ? `/meta/${id}` : `/platform/${id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium bg-[#174A6E] dark:bg-[#174A6E] text-white hover:bg-[#0B3049] dark:hover:bg-[#0B3049] shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 rtl:flex-row-reverse"
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
        ) : !hasSubscription ? (
          <button
            onClick={onSubscribe}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-[#174A6E] to-[#0B3049] hover:from-[#0B3049] hover:to-[#174A6E] shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 rtl:flex-row-reverse"
          >
            <CurrencyDollarIcon className="w-5 h-5" />
            <span className="text-sm">{t('integrations.subscribe')}</span>
          </button>
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