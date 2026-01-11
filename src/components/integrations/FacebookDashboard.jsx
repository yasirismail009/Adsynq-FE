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

  // Create platformData from overall stats
  const platformData = metaOverallStats?.result ? {
    status: 'active',
    userData: {
      name: metaOverallStats.result.ad_accounts?.[0]?.name || 'Meta Business Account',
      email: '',
      image: null
    },
    createdDate: new Date().toLocaleDateString('en-GB')
  } : null;

  // Fetch Meta overall stats on mount
  useEffect(() => {
    dispatch(fetchMetaOverallStats({ 
      date_from: '2023-01-01', 
      date_to: '2025-12-31' 
    }));
  }, [dispatch]);

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
    const overallTotals = metaOverallStats.result.overall_totals || {};

    // Process ad accounts from overall stats
    const processedAccounts = accounts.map(account => {
      const totals = account.totals || {};
      return {
        id: account.id,
        name: account.name,
        status: account.account_status === 3 ? 'active' : 'inactive',
        balance: 0, // Not provided in overall stats
        currency: account.currency || 'USD',
        age: 0, // Not provided in overall stats
        owner: account.name,
        accountId: account.id,
        totals: totals,
        insights: account.insights || []
      };
    });

    return {
      adAccounts: processedAccounts,
      campaigns: [], // Campaigns not in overall stats response
      performance: {
        totalSpend: overallTotals.spend || 0,
        totalImpressions: overallTotals.impressions || 0,
        totalClicks: overallTotals.clicks || 0,
        totalConversions: overallTotals.conversions || 0,
        averageCTR: overallTotals.ctr || 0,
        averageCPC: overallTotals.cpc || 0,
        averageCPM: overallTotals.cpm || 0,
        averageCAC: 0
      },
      summary: {
        totalAccounts: metaOverallStats.result.total_ad_accounts || 0,
        activeAccounts: metaOverallStats.result.active_ad_accounts || 0,
        totalBalance: 0,
        totalCampaigns: 0
      }
    };
  };

  const facebookData = processAdAccountsData();

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Format metrics for display
  const formatMetric = (value, type = 'number', currency = 'USD') => {
    if (value === null || value === undefined) return '0';
    
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    if (type === 'number') {
      return new Intl.NumberFormat('en-US').format(value);
    }
    
    if (type === 'percentage') {
      return `${value.toFixed(1)}%`;
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
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-blue-600">
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
      {platformData.userData && (
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
                   {metaOverallStats?.result?.total_ad_accounts || 0} {t('common.adAccounts')}
                 </h3>
                 <p className="text-gray-600 dark:text-gray-400">
                   {metaOverallStats?.result?.active_ad_accounts || 0} {t('common.activeAccounts')}
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
                    {formatMetric(metaOverallStats.result.overall_totals?.spend || 0)}
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
                    {formatMetric(metaOverallStats.result.overall_totals?.impressions || 0)}
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
                    {formatMetric(metaOverallStats.result.overall_totals?.clicks || 0)}
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
                    {formatMetric(metaOverallStats.result.overall_totals?.ctr || 0, 'percentage')}
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
                    {formatMetric(metaOverallStats.result.overall_totals?.cpc || 0)}
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
                    {formatMetric(metaOverallStats.result.overall_totals?.cpm || 0)}
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
                    {formatMetric(metaOverallStats.result.overall_totals?.conversions || 0)}
                  </p>
                </div>
                <UsersIcon className="w-5 h-5 text-gray-400" />
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
                {formatMetric(metaOverallStats?.result?.overall_totals?.spend || 0)}
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
                {formatMetric(0)}
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
                {formatMetric(metaOverallStats?.result?.active_ad_accounts || 0)}
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
                {formatMetric(metaOverallStats?.result?.total_ad_accounts || 0)}
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
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.currency')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.ageDays')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.campaigns')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {facebookData.adAccounts.map((account) => (
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
                    {formatMetric(account.totals?.spend || 0, 'currency', account.currency)}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {account.currency}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {formatMetric(account.age)}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    0
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
              ))}
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
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors rtl:space-x-reverse">
            <ChartBarIcon className="w-5 h-5" />
            <span>{t('common.createCampaign')}</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors rtl:space-x-reverse">
            <PhotoIcon className="w-5 h-5" />
            <span>{t('common.uploadCreative')}</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors rtl:space-x-reverse">
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
