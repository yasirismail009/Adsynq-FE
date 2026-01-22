import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
  LinkIcon,
  UsersIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  FireIcon,
  BuildingStorefrontIcon,
  PhotoIcon,
  VideoCameraIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { 
  fetchMetaOverallStats,
  selectMetaOverallStats,
  selectMetaLoading, 
  selectMetaErrors 
} from '../../store/slices/metaSlice';
import { selectPlatformConnections } from '../../store/slices/dashboardSlice';

const FacebookDashboard = () => {
  const { t } = useTranslation();
  const { platformId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('impressions');

  // Redux selectors
  const metaOverallStats = useSelector(selectMetaOverallStats);
  const metaLoading = useSelector(selectMetaLoading);
  const metaErrors = useSelector(selectMetaErrors);
  const platformConnections = useSelector(selectPlatformConnections);

  // Create platformData from overall stats
  const platformData = metaOverallStats?.result ? {
    status: 'active',
    userData: {
      name: metaOverallStats.result.summary?.connection_name || 
            metaOverallStats.result.ad_accounts?.[0]?.meta_connection?.account_name || 
            'Meta Business Account',
      email: metaOverallStats.result.ad_accounts?.[0]?.meta_connection?.account_email || '',
      image: null
    },
    createdDate: new Date().toLocaleDateString('en-GB')
  } : null;

  // Check if Meta connection needs refresh and redirect to integrations page
  useEffect(() => {
    if (platformConnections?.error === false && platformConnections?.result?.meta_connections) {
      const firstMetaConnection = platformConnections.result.meta_connections[0];
      if (firstMetaConnection?.needs_refresh === true) {
        console.log('Meta connection needs refresh, redirecting to integrations page');
        navigate('/integrations', { replace: true });
        return;
      }
    }
  }, [platformConnections, navigate]);

  // Fetch Meta overall stats on mount
  useEffect(() => {
    dispatch(fetchMetaOverallStats({ 
      date_from: '2023-01-01', 
      date_to: '2025-12-31' 
    }));
  }, [dispatch]);

  // Helper function to aggregate overall stats from all accounts
  const getOverallStats = () => {
    if (!metaOverallStats?.result?.ad_accounts) {
      return {
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        reach: 0,
        frequency: 0,
        purchaseValue: 0,
        cartValue: 0,
        checkoutValue: 0,
        paymentValue: 0,
        roas: 0,
        roi: 0,
        costPerConversion: 0,
        conversionRate: 0
      };
    }

    const accounts = metaOverallStats.result.ad_accounts;
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalReach = 0;
    let totalFrequency = 0;
    let totalPurchaseValue = 0;
    let totalCartValue = 0;
    let totalCheckoutValue = 0;
    let totalPaymentValue = 0;
    let totalROI = 0;
    let accountsWithROI = 0;

    // Aggregate data from all accounts
    accounts.forEach(account => {
      if (account.insights) {
        totalSpend += parseFloat(account.insights.spend || 0);
        totalImpressions += parseInt(account.insights.impressions || 0);
        totalClicks += parseInt(account.insights.clicks || 0);
        totalReach += parseInt(account.insights.reach || 0);
        totalFrequency += parseFloat(account.insights.frequency || 0);
      }
      if (account.conversion_totals) {
        totalPurchaseValue += parseFloat(account.conversion_totals.purchase_value || 0);
        totalCartValue += parseFloat(account.conversion_totals.cart_value || 0);
        totalCheckoutValue += parseFloat(account.conversion_totals.checkout_value || 0);
        totalPaymentValue += parseFloat(account.conversion_totals.payment_value || 0);
      }
      if (account.roi !== null && account.roi !== undefined) {
        totalROI += parseFloat(account.roi || 0);
        accountsWithROI++;
      }
    });

    // Get total conversions from result-level conversion_totals
    const totalConversions = parseInt(metaOverallStats.result.conversion_totals?.total_conversions || 0);
    
    // Get conversion values from result-level conversion_totals
    const conversionTotals = metaOverallStats.result.conversion_totals || {};
    const overallPurchaseValue = parseFloat(conversionTotals.total_purchase_value || totalPurchaseValue);
    const overallCartValue = parseFloat(conversionTotals.total_cart_value || totalCartValue);
    const overallCheckoutValue = parseFloat(conversionTotals.total_checkout_value || totalCheckoutValue);
    const overallPaymentValue = parseFloat(conversionTotals.total_payment_value || totalPaymentValue);

    // Calculate derived metrics
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cpc = totalClicks > 0 ? (totalSpend / totalClicks) : 0;
    const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
    const averageFrequency = accounts.length > 0 ? (totalFrequency / accounts.length) : 0;
    const roas = totalSpend > 0 ? (overallPurchaseValue / totalSpend) : 0;
    const averageROI = accountsWithROI > 0 ? (totalROI / accountsWithROI) : (metaOverallStats.result.summary?.average_roi || 0);
    const costPerConversion = totalConversions > 0 ? (totalSpend / totalConversions) : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    return {
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      conversions: totalConversions,
      ctr: ctr,
      cpc: cpc,
      cpm: cpm,
      reach: totalReach,
      frequency: averageFrequency,
      purchaseValue: overallPurchaseValue,
      cartValue: overallCartValue,
      checkoutValue: overallCheckoutValue,
      paymentValue: overallPaymentValue,
      roas: roas,
      roi: averageROI,
      costPerConversion: costPerConversion,
      conversionRate: conversionRate
    };
  };

  // Process data from overall stats API
  const processAdAccountsData = () => {
    if (!metaOverallStats?.result?.ad_accounts) {
      return {
        adAccounts: [],
        campaigns: [],
        performance: {
          totalSpend: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          averageCTR: 0,
          averageCPC: 0,
          averageCPM: 0,
          averageCAC: 0
        },
        summary: {
          totalAccounts: 0,
          activeAccounts: 0,
          totalBalance: 0,
          totalCampaigns: 0
        }
      };
    }

    const accounts = metaOverallStats.result.ad_accounts;
    const overallStats = getOverallStats();

    // Process ad accounts from overall stats
    const processedAccounts = accounts.map(account => {
      return {
        id: account.account_id || account.clean_id,
        name: account.account_name,
        status: account.account_status === 3 ? 'active' : 'inactive',
        balance: parseFloat(account.balance || 0),
        currency: account.currency || 'USD',
        age: account.age || 0,
        owner: account.owner || '',
        accountId: account.account_id || account.clean_id,
        totals: account.insights || {},
        insights: account.insights || {}
      };
    });

    // Collect all campaigns from all accounts
    const allCampaigns = [];
    accounts.forEach(account => {
      if (account.campaigns && Array.isArray(account.campaigns)) {
        account.campaigns.forEach(campaign => {
          allCampaigns.push({
            id: campaign.campaign_id,
            name: campaign.campaign_name,
            status: campaign.status?.toLowerCase() || 'unknown',
            objective: campaign.objective,
            accountId: account.account_id || account.clean_id,
            insights: campaign.insights || {}
          });
        });
      }
    });

    return {
      adAccounts: processedAccounts,
      campaigns: allCampaigns,
      performance: {
        totalSpend: overallStats.spend,
        totalImpressions: overallStats.impressions,
        totalClicks: overallStats.clicks,
        totalConversions: overallStats.conversions,
        averageCTR: overallStats.ctr,
        averageCPC: overallStats.cpc,
        averageCPM: overallStats.cpm,
        averageCAC: 0
      },
      summary: {
        totalAccounts: metaOverallStats.result.summary?.total_accounts || accounts.length,
        activeAccounts: metaOverallStats.result.summary?.active_accounts || 0,
        totalBalance: metaOverallStats.result.summary?.total_balance || 0,
        totalCampaigns: metaOverallStats.result.summary?.total_campaigns || allCampaigns.length
      }
    };
  };

  const facebookData = processAdAccountsData();
  const overallStats = getOverallStats();

  // Helper function to get date parameters for campaign details
  const getCampaignDateParams = (campaign) => {
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);
    
    let dateFrom;
    
    // Priority: created_time > updated_time > two weeks old
    if (campaign.created_time) {
      // Handle both date strings and Date objects
      const createdDate = new Date(campaign.created_time);
      dateFrom = isNaN(createdDate.getTime()) ? twoWeeksAgo : createdDate;
    } else if (campaign.updated_time) {
      const updatedDate = new Date(campaign.updated_time);
      dateFrom = isNaN(updatedDate.getTime()) ? twoWeeksAgo : updatedDate;
    } else {
      dateFrom = twoWeeksAgo;
    }
    
    // Format dates as YYYY-MM-DD (extract only the date part, ignore time)
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      date_from: formatDate(dateFrom),
      date_to: formatDate(today)
    };
  };

  if (metaLoading.overallStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#174A6E]"></div>
      </div>
    );
  }

  // Show error message if there's an error (including timeout)
  if (metaErrors.overallStats) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between rtl:flex-row-reverse mb-4">
            <button
              onClick={() => navigate('/integrations')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 rtl:rotate-180" />
            </button>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {metaErrors.overallStats.includes('timeout') ? 'Request Timeout' : 'Error Loading Data'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {metaErrors.overallStats}
            </p>
            <button
              onClick={() => dispatch(fetchMetaOverallStats({ 
                date_from: '2023-01-01', 
                date_to: '2025-12-31' 
              }))}
              className="px-4 py-2 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg transition-colors"
            >
              {t('common.retry') || 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format metrics for display
  const formatMetric = (value, type = 'number', currency = 'USD') => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value);
    }
    
    if (type === 'number') {
      const numValue = parseFloat(value);
      if (numValue >= 1000000) {
        return `${(numValue / 1000000).toFixed(2)}M`;
      } else if (numValue >= 1000) {
        return `${(numValue / 1000).toFixed(2)}K`;
      }
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(numValue);
    }
    
    if (type === 'percentage') {
      const numValue = parseFloat(value);
      return `${numValue.toFixed(2)}%`;
    }
    
    return value.toString();
  };

  // Get status info - assume active if we have data
  const getStatusInfo = () => {
    if (metaOverallStats?.result && platformData?.status === 'active') {
      return {
        icon: CheckCircleIcon,
        text: t('common.connected'),
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        iconColor: 'text-green-500'
      };
    } else {
      return {
        icon: ExclamationTriangleIcon,
        text: t('common.notConnected'),
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
        <div className="flex items-center justify-between rtl:flex-row-reverse">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={() => navigate('/integrations')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 rtl:rotate-180" />
            </button>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-[#174A6E]">
                <img 
                  src="/assets/facebook.svg" 
                  alt="Facebook Ads" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('common.facebookAdsDashboard')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('common.manageFacebookCampaigns')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className={`inline-flex items-center gap-2 px-3 py-1 ${statusInfo.bgColor} ${statusInfo.color} text-sm font-medium rounded-full`}>
              <StatusIcon className="w-4 h-4" />
              {statusInfo.text}
            </span>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="7d">{t('common.last7Days')}</option>
                <option value="30d">{t('common.last30Days')}</option>
                <option value="90d">{t('common.last90Days')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      {platformData?.userData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('common.accountInformation')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/20">
                {platformData.userData.image ? (
                  <img 
                    src={platformData.userData.image} 
                    alt={platformData.userData.name || 'User'} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {platformData.userData.name || 'Account'}
                </h3>
                {platformData.userData.email && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {platformData.userData.email}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/20">
                <BuildingStorefrontIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              
                             <div>
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                   {facebookData.summary.totalAccounts} {t('common.adAccounts')}
                 </h3>
                 <p className="text-gray-600 dark:text-gray-400">
                   {facebookData.summary.activeAccounts} {t('common.activeAccounts')}
                 </p>
               </div>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/20">
                <CalendarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('common.connected')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {platformData.createdDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Performance Summary */}
      {metaOverallStats?.result && (
        <div className="bg-gradient-to-r from-[#174A6E] to-[#0B3049] dark:from-[#174A6E] dark:to-[#0B3049] rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-6 rtl:flex-row-reverse">
            <h2 className="text-xl font-bold text-white">Performance Summary</h2>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <ChartBarIcon className="w-6 h-6 text-white" />
              <span className="text-sm text-blue-100">Overall Metrics</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-xs text-blue-100 mb-1">Total Revenue</p>
              <p className="text-lg font-bold text-white">
                {formatMetric(overallStats.purchaseValue, 'currency', metaOverallStats.result.ad_accounts?.[0]?.currency || 'USD')}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-xs text-blue-100 mb-1">Total Spend</p>
              <p className="text-lg font-bold text-white">
                {formatMetric(overallStats.spend, 'currency', metaOverallStats.result.ad_accounts?.[0]?.currency || 'USD')}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-xs text-blue-100 mb-1">ROI</p>
              <p className="text-lg font-bold text-white">
                {formatMetric(overallStats.roi, 'percentage')}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-xs text-blue-100 mb-1">ROAS</p>
              <p className="text-lg font-bold text-white">
                {formatMetric(overallStats.roas, 'number')}x
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-xs text-blue-100 mb-1">Conversions</p>
              <p className="text-lg font-bold text-white">
                {formatMetric(overallStats.conversions)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-xs text-blue-100 mb-1">Conversion Rate</p>
              <p className="text-lg font-bold text-white">
                {formatMetric(overallStats.conversionRate, 'percentage')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overall Performance Stats Section */}
      {metaOverallStats?.result && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6 rtl:flex-row-reverse">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.overallPerformanceStats')}</h2>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('integrations.metaAds')} {t('common.platformData')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
            >
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {t('common.totalSpend')}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {formatMetric(overallStats.spend, 'currency', metaOverallStats.result.ad_accounts?.[0]?.currency || 'USD')}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {t('common.lifetimeSpend')}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-200 dark:bg-blue-800/30">
                  <CurrencyDollarIcon className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-700"
            >
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    {t('common.totalImpressions')}
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                    {formatMetric(overallStats.impressions)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Total ad impressions delivered
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-200 dark:bg-green-800/30">
                  <EyeIcon className="w-6 h-6 text-green-700 dark:text-green-300" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700"
            >
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    {t('common.totalClicks')}
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                    {formatMetric(overallStats.clicks)}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Total clicks on ads
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-200 dark:bg-purple-800/30">
                  <CursorArrowRaysIcon className="w-6 h-6 text-purple-700 dark:text-purple-300" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700"
            >
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    {t('common.averageCTR')}
                  </p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                    {formatMetric(overallStats.ctr, 'percentage')}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Click-through rate
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-200 dark:bg-orange-800/30">
                  <ChartBarIcon className="w-6 h-6 text-orange-700 dark:text-orange-300" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.averageCPC')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatMetric(overallStats.cpc, 'currency', metaOverallStats.result.ad_accounts?.[0]?.currency || 'USD')}
                  </p>
                </div>
                <ArrowTrendingDownIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.averageCPM')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatMetric(overallStats.cpm, 'currency', metaOverallStats.result.ad_accounts?.[0]?.currency || 'USD')}
                  </p>
                </div>
                <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.totalConversions')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatMetric(overallStats.conversions)}
                  </p>
                </div>
                <UsersIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROI & Revenue Metrics Section */}
      {metaOverallStats?.result && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6 rtl:flex-row-reverse">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">ROI & Revenue Metrics</h2>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Financial Performance</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700"
            >
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    ROI (Return on Investment)
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                    {formatMetric(overallStats.roi, 'percentage')}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Average ROI across accounts
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-200 dark:bg-emerald-800/30">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-700"
            >
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                    ROAS (Return on Ad Spend)
                  </p>
                  <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100 mt-1">
                    {formatMetric(overallStats.roas, 'number')}x
                  </p>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                    Revenue per dollar spent
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-cyan-200 dark:bg-cyan-800/30">
                  <CurrencyDollarIcon className="w-6 h-6 text-cyan-700 dark:text-cyan-300" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-xl p-6 border border-teal-200 dark:border-teal-700"
            >
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                    Total Purchase Value
                  </p>
                  <p className="text-2xl font-bold text-teal-900 dark:text-teal-100 mt-1">
                    {formatMetric(overallStats.purchaseValue, 'currency', metaOverallStats.result.ad_accounts?.[0]?.currency || 'USD')}
                  </p>
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                    Total revenue from purchases
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-teal-200 dark:bg-teal-800/30">
                  <ShoppingCartIcon className="w-6 h-6 text-teal-700 dark:text-teal-300" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700"
            >
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Cost per Conversion
                  </p>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mt-1">
                    {formatMetric(overallStats.costPerConversion, 'currency', metaOverallStats.result.ad_accounts?.[0]?.currency || 'USD')}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    Average cost per conversion
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-200 dark:bg-indigo-800/30">
                  <ChartBarIcon className="w-6 h-6 text-indigo-700 dark:text-indigo-300" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Conversion Value Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cart Value</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatMetric(overallStats.cartValue, 'currency', metaOverallStats.result.ad_accounts?.[0]?.currency || 'USD')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total value in carts</p>
                </div>
                <ShoppingCartIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Checkout Value</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatMetric(overallStats.checkoutValue, 'currency', metaOverallStats.result.ad_accounts?.[0]?.currency || 'USD')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total checkout value</p>
                </div>
                <LinkIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Value</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatMetric(overallStats.paymentValue, 'currency', metaOverallStats.result.ad_accounts?.[0]?.currency || 'USD')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total payment value</p>
                </div>
                <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Performance KPIs */}
      {metaOverallStats?.result && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6 rtl:flex-row-reverse">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Performance KPIs</h2>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Engagement Metrics</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-4 border border-pink-200 dark:border-pink-700">
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Reach</p>
                  <p className="text-xl font-bold text-pink-900 dark:text-pink-100">
                    {formatMetric(overallStats.reach)}
                  </p>
                  <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">Unique users reached</p>
                </div>
                <UsersIcon className="w-5 h-5 text-pink-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Frequency</p>
                  <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                    {formatMetric(overallStats.frequency, 'number')}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Average impressions per user</p>
                </div>
                <ArrowTrendingUpIcon className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 rounded-lg p-4 border border-violet-200 dark:border-violet-700">
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-violet-600 dark:text-violet-400">Conversion Rate</p>
                  <p className="text-xl font-bold text-violet-900 dark:text-violet-100">
                    {formatMetric(overallStats.conversionRate, 'percentage')}
                  </p>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">Conversions per click</p>
                </div>
                <ChartBarIcon className="w-5 h-5 text-violet-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 rounded-lg p-4 border border-rose-200 dark:border-rose-700">
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div>
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Accounts with ROI</p>
                  <p className="text-xl font-bold text-rose-900 dark:text-rose-100">
                    {formatMetric(metaOverallStats.result.summary?.accounts_with_roi || 0)}
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">Accounts generating ROI</p>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-rose-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between rtl:flex-row-reverse">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('common.totalBalance')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(overallStats.spend, 'currency', metaOverallStats?.result?.ad_accounts?.[0]?.currency || 'USD')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between rtl:flex-row-reverse">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('common.totalCampaigns')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(facebookData.summary.totalCampaigns)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between rtl:flex-row-reverse">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('common.activeAccounts')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(facebookData.summary.activeAccounts)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <CheckCircleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between rtl:flex-row-reverse">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('common.totalAccounts')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(facebookData.summary.totalAccounts)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <BuildingStorefrontIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ad Accounts List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.adAccounts')}</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.accountName')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.accountID')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.status')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.balance')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">Spend</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">ROI</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">Revenue</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.currency')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.campaigns')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {facebookData.adAccounts.map((account) => {
                const accountData = metaOverallStats.result.ad_accounts?.find(acc => (acc.account_id || acc.clean_id) === account.id);
                const accountROI = accountData?.roi;
                const accountSpend = accountData?.insights?.spend ? parseFloat(accountData.insights.spend) : 0;
                const accountPurchaseValue = accountData?.conversion_totals?.purchase_value ? parseFloat(accountData.conversion_totals.purchase_value) : 0;
                const accountROAS = accountSpend > 0 ? (accountPurchaseValue / accountSpend) : 0;
                
                return (
                  <tr key={account.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.owner')}: {account.owner}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {account.accountId}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        account.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {formatMetric(account.balance, 'currency', account.currency)}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {formatMetric(accountSpend, 'currency', account.currency)}
                    </td>
                    <td className="py-3 px-4">
                      {accountROI !== null && accountROI !== undefined ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          accountROI > 0 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {formatMetric(accountROI, 'percentage')}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {formatMetric(accountPurchaseValue, 'currency', account.currency)}
                      {accountROAS > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          ROAS: {formatMetric(accountROAS, 'number')}x
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {account.currency}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {accountData?.campaigns_count || 0}
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => navigate(`/meta/ad-account/${account.id}`)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        More Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Performance */}
      {facebookData.campaigns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.activeCampaigns')}</h2>
        </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.campaign')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.status')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.budget')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.startTime')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {facebookData.campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                         <td className="py-3 px-4">
                       <div>
                         <p className="font-medium text-gray-900 dark:text-white">{campaign.name}</p>
                         <div className="flex items-center space-x-2 mt-1 rtl:space-x-reverse">
                           <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.id')}: {campaign.id}</p>
                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                             {facebookData.adAccounts.find(acc => acc.id === campaign.accountId)?.name || t('common.unknownAccount')}
                           </span>
                         </div>
                       </div>
                     </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {formatMetric(campaign.budget, 'currency', campaign.currency)}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {campaign.startTime ? new Date(campaign.startTime).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => {
                          const dateParams = getCampaignDateParams(campaign);
                          const queryString = new URLSearchParams({
                            date_from: dateParams.date_from,
                            date_to: dateParams.date_to
                          }).toString();
                          navigate(`/meta/campaign/${campaign.id}?${queryString}`);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        {t('common.moreDetails')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error Display */}
      {metaErrors.userAdAccounts && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200">
              {t('common.errorLoadingAdAccounts')}: {metaErrors.userAdAccounts}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('common.quickActions')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg transition-colors rtl:space-x-reverse">
            <ChartBarIcon className="w-5 h-5" />
            <span>{t('common.createCampaign')}</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors rtl:space-x-reverse">
            <PhotoIcon className="w-5 h-5" />
            <span>{t('common.uploadCreative')}</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg transition-colors rtl:space-x-reverse">
            <UsersIcon className="w-5 h-5" />
            <span>{t('common.manageAudiences')}</span>
          </button>
          
          <button 
            onClick={() => {
              dispatch(fetchMetaOverallStats({ 
                date_from: '2023-01-01', 
                date_to: '2025-12-31' 
              }));
            }}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors rtl:space-x-reverse"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>{t('common.refreshData')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacebookDashboard;
