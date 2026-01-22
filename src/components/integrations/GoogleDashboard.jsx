import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
  BuildingOfficeIcon,
  GlobeAltIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { 
  selectGoogleOverallStats,
  selectGoogleOverallStatsLoading,
  selectGoogleOverallStatsError,
  selectGoogleConnectionData
} from '../../store/slices/googleSlice';
import { selectPlatformConnections } from '../../store/slices/dashboardSlice';

const GoogleDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux selectors
  const connectionData = useSelector(selectGoogleConnectionData);
  const platformConnections = useSelector(selectPlatformConnections);
  const overallStats = useSelector(selectGoogleOverallStats);
  const loading = useSelector(selectGoogleOverallStatsLoading);
  const error = useSelector(selectGoogleOverallStatsError);
  
  // Use platformConnections if connectionData is not available
  const googleConnectionData = connectionData || (platformConnections?.error === false ? platformConnections : null);
  console.log("connectionData", connectionData);
  console.log("platformConnections", platformConnections);
  console.log("googleConnectionData", googleConnectionData);
  
  // Check if Google account needs refresh and redirect to integrations page
  useEffect(() => {
    if (platformConnections?.error === false && platformConnections?.result?.google_accounts) {
      const firstGoogleAccount = platformConnections.result.google_accounts[0];
      if (firstGoogleAccount?.needs_refresh === true) {
        console.log('Google account needs refresh, redirecting to integrations page');
        navigate('/integrations', { replace: true });
      }
    }
  }, [platformConnections, navigate]);
  
  // Removed the useEffect that dispatches fetchGoogleOverallStats
  // Now the component only uses existing data from Redux

  // Format metrics for display
  const formatMetric = (value, type = 'number', currency = 'PKR') => {
    if (value === null || value === undefined) return '0';
    
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    if (type === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    
    if (type === 'number') {
      return new Intl.NumberFormat('en-US').format(value);
    }
    
    return value.toString();
  };

  // Get account status info
  const getAccountStatusInfo = (status) => {
    if (status === 'active') {
      return {
        icon: CheckCircleIcon,
        text: t('integrations.active'),
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        iconColor: 'text-green-500'
      };
    } else {
      return {
        icon: ExclamationTriangleIcon,
        text: t('integrations.inactive'),
        color: 'text-gray-500 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        iconColor: 'text-gray-400'
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{t('dashboard.errorLoadingGoogleStats')}: {error}</p>
        <button 
          onClick={() => navigate('/integrations')}
          className="px-4 py-2 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg transition-colors"
        >
          {t('common.backToIntegrations')}
        </button>
      </div>
    );
  }
  if (!overallStats?.result) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">{t('common.noDataAvailableForPlatform')}</p>
        <button 
          onClick={() => navigate('/integrations')}
          className="px-4 py-2 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg transition-colors"
        >
          {t('common.backToIntegrations')}
        </button>
      </div>
    );
  }

  const { accounts, summary } = overallStats.result;
  console.log("accounts",accounts)

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
                  src="/assets/google.svg" 
                  alt="Google Ads" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('common.googleAdsDashboard')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('common.manageGoogleCampaigns')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
              <CheckCircleIcon className="w-4 h-4" />
              {t('common.connected')}
            </span>
            
      
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('common.accountInformation')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/20">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {summary.total_accounts} {t('common.adAccounts')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {summary.valid_accounts} {t('common.activeAccounts')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/20">
              <GlobeAltIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('common.currency')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {summary.primary_currency || summary.currencies_used?.[0] || 'PKR'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/20">
              <CalendarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('common.dataPeriod')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {summary.date_range.start_date && summary.date_range.end_date 
                  ? `${summary.date_range.start_date} to ${summary.date_range.end_date}`
                  : t('common.allTime')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Stats Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6 rtl:flex-row-reverse">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.overallPerformanceStats')}</h2>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('integrations.googleAds')} {t('common.platformData')}</span>
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
                  {t('common.totalCost')}
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {formatMetric(summary.total_cost, 'currency', summary.total_cost_currency || summary.primary_currency || 'PKR')}
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
                  {formatMetric(summary.total_impressions)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {t('common.totalAdImpressions')}
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
                  {formatMetric(summary.total_clicks)}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {t('common.totalClicksOnAds')}
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
                  {t('common.totalConversions')}
                </p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                  {formatMetric(summary.total_conversions)}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {t('common.totalConversionsAchieved')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-200 dark:bg-orange-800/30">
                <UsersIcon className="w-6 h-6 text-orange-700 dark:text-orange-300" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between rtl:flex-row-reverse">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.averageCTR')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatMetric(summary.average_ctr || 0, 'percentage')}
                </p>
              </div>
              <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between rtl:flex-row-reverse">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.averageCPC')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatMetric(summary.average_cpc || 0, 'currency', summary.average_cpc_currency || summary.primary_currency || 'PKR')}
                </p>
              </div>
              <ArrowTrendingDownIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between rtl:flex-row-reverse">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.conversionRate')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatMetric(summary.average_conversion_rate || 0, 'percentage')}
                </p>
              </div>
              <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

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
                {t('common.totalAccounts')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(summary.total_accounts)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                Active Accounts
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(summary.valid_accounts)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                {t('common.totalCampaigns')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                N/A
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                {t('common.conversionValue')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                N/A
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <CurrencyDollarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.type')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.currency')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.campaigns')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rtl:text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const isActive = !account.account_info.is_test_account && (account.metrics?.impressions > 0 || account.metrics?.clicks > 0);
                const statusInfo = getAccountStatusInfo(isActive ? 'active' : 'inactive');
                const StatusIcon = statusInfo.icon;
                const accountType = account.account_info.is_manager ? 'manager' : 'client';
                
                return (
                  <tr key={account.customer_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{account.account_info.descriptive_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.id')}: {account.customer_id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {account.customer_id}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white capitalize">
                      {accountType}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {account.metrics?.cost_currency || account.account_info.currency_code}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      N/A
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => {
                          const googleAccountId = googleConnectionData?.result?.google_account_id;
                          if (googleAccountId) {
                            navigate(`/google/${googleAccountId}/ad-account/${account.customer_id}`);
                          } else {
                            console.error('Google account ID not available in connection data');
                          }
                        }}
                        disabled={!googleConnectionData?.result?.google_account_id}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('common.viewDetails')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>



      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('common.quickActions')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg transition-colors rtl:space-x-reverse">
            <ChartBarIcon className="w-5 h-5" />
            <span>{t('common.createCampaign')}</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors rtl:space-x-reverse">
            <EyeIcon className="w-5 h-5" />
            <span>{t('common.viewReports')}</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg transition-colors rtl:space-x-reverse">
            <UsersIcon className="w-5 h-5" />
            <span>{t('common.manageAudiences')}</span>
          </button>
          
          <button 
            onClick={() => window.location.reload()}
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

export default GoogleDashboard;
