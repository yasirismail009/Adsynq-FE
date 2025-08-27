import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
  selectGoogleOverallStatsError
} from '../../store/slices/googleSlice';

const GoogleDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux selectors
  const overallStats = useSelector(selectGoogleOverallStats);
  const loading = useSelector(selectGoogleOverallStatsLoading);
  const error = useSelector(selectGoogleOverallStatsError);
  
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
        text: 'Active',
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        iconColor: 'text-green-500'
      };
    } else {
      return {
        icon: ExclamationTriangleIcon,
        text: 'Inactive',
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
        <p className="text-red-600 dark:text-red-400 mb-4">Error loading Google Ads data: {error}</p>
        <button 
          onClick={() => navigate('/integrations')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Back to Integrations
        </button>
      </div>
    );
  }

  if (!overallStats?.result) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No Google Ads data available</p>
        <button 
          onClick={() => navigate('/integrations')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Back to Integrations
        </button>
      </div>
    );
  }

  const { accounts, summary } = overallStats.result;

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
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-blue-600">
                <img 
                  src="/assets/google.svg" 
                  alt="Google Ads" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Google Ads Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage Google Ads campaigns, track performance, and optimize ad spend
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
              <CheckCircleIcon className="w-4 h-4" />
              Connected
            </span>
            
            <div className="flex items-center space-x-2">
              <select 
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                defaultValue="7d"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/20">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {summary.total_accounts} Ad Accounts
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {summary.active_accounts} active accounts
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/20">
              <GlobeAltIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Currency
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {summary.currency_code || 'PKR'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/20">
              <CalendarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Data Period
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {summary.date_range.query_period}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Stats Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Performance Stats</h2>
          <div className="flex items-center space-x-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Google Ads Platform Data</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Total Cost
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {formatMetric(summary.total_cost, 'currency', summary.currency_code || 'PKR')}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Lifetime spend across all accounts
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Total Impressions
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {formatMetric(summary.total_impressions)}
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Total Clicks
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {formatMetric(summary.total_clicks)}
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Total Conversions
                </p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                  {formatMetric(summary.total_conversions)}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Total conversions achieved
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average CTR</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatMetric(summary.average_ctr || 0, 'percentage')}
                </p>
              </div>
              <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average CPC</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatMetric(summary.average_cpc || 0, 'currency', summary.currency_code || 'PKR')}
                </p>
              </div>
              <ArrowTrendingDownIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Accounts
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Accounts
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(summary.active_accounts)}
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Campaigns
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(accounts.reduce((total, account) => total + account.account_info.total_campaigns, 0))}
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Conversion Value
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(summary.total_conversions_value || 0, 'currency', summary.currency_code || 'PKR')}
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ad Accounts</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Account Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Account ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Currency</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Campaigns</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const statusInfo = getAccountStatusInfo(account.account_info.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={account.customer_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{account.account_info.descriptive_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {account.customer_id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {account.customer_id}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white capitalize">
                      {account.account_info.account_type}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {account.account_info.currency_code}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {account.account_info.total_campaigns}
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => navigate(`/google/ad-account/${account.customer_id}`)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        View Details
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <ChartBarIcon className="w-5 h-5" />
            <span>Create Campaign</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <EyeIcon className="w-5 h-5" />
            <span>View Reports</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            <UsersIcon className="w-5 h-5" />
            <span>Manage Audiences</span>
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleDashboard;
