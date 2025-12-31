import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ChartCard from '../dashboard/ChartCard';
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
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  GlobeAltIcon,
  CreditCardIcon,
  CogIcon,
  UsersIcon,
  FireIcon,
  ShieldCheckIcon,
  ChartPieIcon,
  BoltIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { 
  selectGoogleOverallStats,
  selectGoogleOverallStatsLoading,
  selectGoogleOverallStatsError,
  fetchGoogleSa360Reports,
  selectGoogleSa360Reports,
  selectGoogleSa360ReportsLoading,
  selectGoogleSa360ReportsError,
  setSelectedSa360Campaign
} from '../../store/slices/googleSlice';

// Helper functions for chart colors
const getStatusColor = (status) => {
  switch (status) {
    case 'ENABLED': return '#10B981';
    case 'PAUSED': return '#F59E0B';
    case 'REMOVED': return '#EF4444';
    default: return '#6B7280';
  }
};

const getChannelTypeColor = (type) => {
  switch (type) {
    case 'SEARCH': return '#3B82F6';
    case 'DISPLAY': return '#8B5CF6';
    case 'VIDEO': return '#EC4899';
    case 'PERFORMANCE_MAX': return '#F59E0B';
    case 'DEMAND_GEN': return '#10B981';
    default: return '#6B7280';
  }
};

const GoogleAccountDetail = () => {
  const { googleAccountId,accountId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux selectors
  const overallStats = useSelector(selectGoogleOverallStats);
  const loading = useSelector(selectGoogleOverallStatsLoading);
  const error = useSelector(selectGoogleOverallStatsError);
  
  // SA360 reports selectors
  const sa360Reports = useSelector(selectGoogleSa360Reports);
  const sa360ReportsLoading = useSelector(selectGoogleSa360ReportsLoading);
  const sa360ReportsError = useSelector(selectGoogleSa360ReportsError);
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [dateRange, setDateRange] = useState(() => {
    // Default to all time - use a very early date to today
    const today = new Date();
    const allTimeStart = new Date('2020-01-01'); // Start from 2020 to cover all historical data
    
    return {
      date_from: allTimeStart.toISOString().split('T')[0],
      date_to: today.toISOString().split('T')[0]
    };
  });

  // Find the specific Google Ads account
  const account = overallStats?.result?.accounts?.find(acc => acc.customer_id === accountId);

  // Call SA360 reports API when account is found
  useEffect(() => {
    if (account) {
      dispatch(fetchGoogleSa360Reports({
        googleAccountId: googleAccountId,
        customerId: account.customer_id,
        params: {
          date_from: dateRange.date_from,
          date_to: dateRange.date_to
        }
      }));
    }
  }, [account, dispatch, dateRange, googleAccountId, dateRange.date_from, dateRange.date_to]);

  // Handle timeframe selection
  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    
    const today = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(today.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(today.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(today.getDate() - 90);
        break;
      case 'all':
        // All time - use a very early date
        startDate = new Date('2020-01-01');
        break;
      default:
        // Default to all time
        startDate = new Date('2020-01-01');
    }
    
    setDateRange({
      date_from: startDate.toISOString().split('T')[0],
      date_to: today.toISOString().split('T')[0]
    });
  };

  // Format metrics for display
  const formatMetric = (value, type = 'number', currency = null) => {
    if (value === null || value === undefined) return '0';
    
    // Get currency from account if not provided
    const displayCurrency = currency || account?.account_info?.currency_code || account?.metrics?.cost_currency || 'USD';
    
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: displayCurrency,
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

  // Get status info
  const getStatusInfo = (status) => {
    if (status === 'active') {
      return {
        text: 'Active',
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        iconColor: 'text-green-500'
      };
    } else {
      return {
        text: 'Inactive',
        color: 'text-gray-500 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        iconColor: 'text-gray-400'
      };
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!account) return {};

    const { metrics } = account;

    // Performance metrics chart data - only show actual metrics, no hardcoded targets
    const performanceData = [
      { name: 'CTR', value: metrics.ctr ?? 0 },
      { name: 'CPC', value: metrics.cpc ?? 0 },
      { name: 'Conversion Rate', value: metrics.conversion_rate ?? 0 },
      { name: 'Cost per Conversion', value: metrics.cost_per_conversion ?? 0 }
    ].filter(item => item.value > 0); // Only show metrics with actual data

    // Revenue metrics chart data - only show actual data
    const revenueData = [
      { name: 'Conversions', value: metrics.conversions ?? 0 },
      { name: 'Cost', value: metrics.cost ?? 0 },
      { name: 'Cost per Conversion', value: metrics.cost_per_conversion ?? 0 }
    ].filter(item => item.value > 0); // Only show metrics with actual data

    // Campaign performance distribution - only show actual data
    const campaignPerformanceData = [
      { name: 'Impressions', value: metrics.impressions ?? 0, color: '#3B82F6' },
      { name: 'Clicks', value: metrics.clicks ?? 0, color: '#10B981' },
      { name: 'Conversions', value: metrics.conversions ?? 0, color: '#F59E0B' },
      { name: 'Cost', value: metrics.cost ?? 0, color: '#EF4444' }
    ].filter(item => item.value > 0); // Only show metrics with actual data

    // Account health metrics - removed hardcoded values, only show if available from API
    const accountHealthData = [];

    // ROI metrics chart - only show actual data
    const roiData = [
      { name: 'Conversion Rate', value: metrics.conversion_rate ?? 0 },
      { name: 'CTR', value: metrics.ctr ?? 0 },
      { name: 'CPC', value: metrics.cpc ?? 0 },
      { name: 'Cost per Conversion', value: metrics.cost_per_conversion ?? 0 }
    ].filter(item => item.value > 0); // Only show metrics with actual data

    return {
      performanceData,
      revenueData,
      campaignPerformanceData,
      accountHealthData,
      roiData
    };
  }, [account]);

  // Extract SA360 campaigns and customers from the flexible response shape
  const sa360Campaigns = useMemo(() => {
    const reportData = sa360Reports?.result?.report_data ?? sa360Reports?.result ?? null;
    if (!reportData) return [];
    if (Array.isArray(reportData)) return reportData;
    return reportData.campaign || [];
  }, [sa360Reports]);

  const sa360Customers = useMemo(() => {
    const reportData = sa360Reports?.result?.report_data ?? sa360Reports?.result ?? null;
    if (!reportData || Array.isArray(reportData)) return [];
    return reportData.customer || [];
  }, [sa360Reports]);

  // Prepare SA360 Campaign Reports Chart Data
  const sa360ChartData = useMemo(() => {
    if (!sa360Reports?.result) return {};
    const reportData = sa360Reports.result.report_data ?? sa360Reports.result ?? null;
    if (!reportData) return {};

    // Support both old array structure and new object structure
    const campaigns = sa360Campaigns;
    const overallPerformance = Array.isArray(reportData)
      ? {}
      : reportData.performance?.overview || {};

    // Campaign Performance Line Chart Data
    const campaignPerformanceLineData = campaigns.map(campaign => {
      const campaignPerformance = campaign.performance?.overview || campaign.performance || overallPerformance;
      const costMicros = campaignPerformance.cost_micros ?? 0;
      const cost = campaignPerformance.cost ?? (costMicros / 1_000_000);
      
      return {
        name: campaign.campaign_name || campaign.name || 'Unknown Campaign',
        impressions: campaignPerformance.impressions ?? 0,
        clicks: campaignPerformance.clicks ?? 0,
        cost,
        conversions: campaignPerformance.conversions ?? campaignPerformance.all_conversions ?? 0,
        conversions_value: campaignPerformance.conversions_value ?? 0,
        ctr: (campaignPerformance.ctr ?? 0) * 100,
        cpc: campaignPerformance.average_cpc ? (campaignPerformance.average_cpc / 1_000_000) : 0,
        roas: cost > 0 ? ((campaignPerformance.conversions_value ?? 0) / cost) : 0
      };
    });

    // Campaign Status Distribution
    const campaignStatusData = campaigns.reduce((acc, campaign) => {
      const status = campaign.campaign_status || campaign.status || 'UNKNOWN';
      if (!acc[status]) {
        acc[status] = { name: status, value: 0, color: getStatusColor(status) };
      }
      acc[status].value += 1;
      return acc;
    }, {});

    // Campaign Type Distribution
    const campaignTypeData = campaigns.reduce((acc, campaign) => {
      const type = campaign.advertising_channel_type || campaign.channel_type || 'UNKNOWN';
      if (!acc[type]) {
        acc[type] = { name: type, value: 0, color: getChannelTypeColor(type) };
      }
      acc[type].value += 1;
      return acc;
    }, {});

    // Performance Metrics by Campaign
    const performanceByCampaign = campaigns.map(campaign => {
      const campaignPerformance = campaign.performance?.overview || campaign.performance || overallPerformance;
      const costMicros = campaignPerformance.cost_micros ?? 0;
      const cost = campaignPerformance.cost ?? (costMicros / 1_000_000);
      
      return {
        name: campaign.campaign_name || campaign.name || 'Unknown Campaign',
        impressions: campaignPerformance.impressions ?? 0,
        clicks: campaignPerformance.clicks ?? 0,
        conversions: campaignPerformance.conversions ?? campaignPerformance.all_conversions ?? 0,
        cost
      };
    });

    // ROI Analysis by Campaign
    const roiByCampaign = campaigns.map(campaign => {
      const perf = campaign.performance?.overview || campaign.performance || overallPerformance;
      const costMicros = perf.cost_micros ?? 0;
      const cost = perf.cost ?? (costMicros / 1_000_000);
      
      return {
        name: campaign.campaign_name || campaign.name || 'Unknown Campaign',
        roas: cost > 0 ? ((perf.conversions_value ?? 0) / cost) : 0,
        ctr: (perf.ctr ?? 0) * 100,
        cpc: perf.average_cpc ? (perf.average_cpc / 1_000_000) : 0,
        conversion_rate: (perf.clicks ?? 0) > 0
          ? (((perf.conversions ?? perf.all_conversions ?? 0) / perf.clicks) * 100)
          : 0
      };
    });

    return {
      campaignPerformanceLineData,
      campaignStatusData: Object.values(campaignStatusData),
      campaignTypeData: Object.values(campaignTypeData),
      performanceByCampaign,
      roiByCampaign
    };
  }, [sa360Reports]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading account details...</p>
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

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">Google Ads account not found</p>
        <button 
          onClick={() => navigate('/integrations')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Back to Integrations
        </button>
      </div>
    );
  }

  const isActive = !account.account_info.is_test_account && (account.metrics?.impressions > 0 || account.metrics?.clicks > 0);
  const statusInfo = getStatusInfo(isActive ? 'active' : 'inactive');
  const { metrics } = account;

  // Get customer details from SA360 reports (first customer or matching customer)
  const customerDetails = sa360Customers.length > 0 
    ? sa360Customers.find(cust => cust.customer_id === accountId) || sa360Customers[0]
    : null;
  const customerPerformance = customerDetails?.performance?.overview || {};

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
                  {account.account_info.descriptive_name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Google Ads Account Details
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center gap-2 px-3 py-1 ${statusInfo.bgColor} ${statusInfo.color} text-sm font-medium rounded-full`}>
              <CheckCircleIcon className="w-4 h-4" />
              {statusInfo.text}
            </span>
            
            <div className="flex items-center space-x-2">
              <select 
                value={selectedTimeframe}
                onChange={(e) => handleTimeframeChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details Section */}
      {customerDetails && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <UserIcon className="w-6 h-6 mr-2" />
            Customer Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Customer Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Customer Name:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{customerDetails.customer_descriptive_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Customer ID:</span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white">{customerDetails.customer_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`text-sm font-medium ${
                    customerDetails.customer_status === 'ENABLED' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {customerDetails.customer_status || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Currency:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{customerDetails.customer_currency_code || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Time Zone:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{customerDetails.customer_time_zone || 'N/A'}</span>
                </div>
                {customerDetails.customer_manager !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Manager Account:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {customerDetails.customer_manager ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Optimization Score:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {customerDetails.customer_optimization_score ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Performance Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Impressions:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatMetric(customerPerformance.impressions ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Clicks:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatMetric(customerPerformance.clicks ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cost:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatMetric(
                      customerPerformance.cost ?? (customerPerformance.cost_micros ?? 0) / 1_000_000,
                      'currency',
                      customerDetails.customer_currency_code
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Conversions:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatMetric(customerPerformance.conversions ?? customerPerformance.all_conversions ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">CTR:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatMetric((customerPerformance.ctr ?? 0) * 100, 'percentage')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">CPC:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatMetric(
                      customerPerformance.average_cpc ? (customerPerformance.average_cpc / 1_000_000) : 0,
                      'currency',
                      customerDetails.customer_currency_code
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Additional Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Interactions:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatMetric(customerPerformance.interactions ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Invalid Clicks:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatMetric(customerPerformance.invalid_clicks ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Invalid Click Rate:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatMetric((customerPerformance.invalid_click_rate ?? 0) * 100, 'percentage')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Interaction Rate:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatMetric((customerPerformance.interaction_rate ?? 0) * 100, 'percentage')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">All Conversions:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatMetric(customerDetails.performance?.all_conversions?.all_conversions ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Engagements:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatMetric(customerDetails.performance?.other_metrics?.engagements ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Overview Cards */}
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
                Total Cost
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(metrics.cost, 'currency', account.account_info.currency_code)}
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Impressions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(metrics.impressions)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <EyeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                Total Clicks
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(metrics.clicks)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <CursorArrowRaysIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                Conversions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(metrics.conversions)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <UsersIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                CTR
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(metrics.ctr, 'percentage')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
              <ArrowTrendingUpIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                CPC
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(metrics.cpc, 'currency', account.account_info.currency_code)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
              <CurrencyDollarIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(metrics.conversion_rate, 'percentage')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/20">
              <ArrowTrendingUpIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Conversion Value
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatMetric(metrics.conversions_value ?? 0, 'currency', account.account_info.currency_code)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Graph Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Overview</h2>
          
          <div className="flex items-center space-x-4">
            {/* Custom Date Range */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">From:</label>
              <input
                type="date"
                value={dateRange.date_from}
                onChange={(e) => setDateRange(prev => ({ ...prev, date_from: e.target.value }))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">To:</label>
              <input
                type="date"
                value={dateRange.date_to}
                onChange={(e) => setDateRange(prev => ({ ...prev, date_to: e.target.value }))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              />
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Additional Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cost per Conversion</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatMetric(metrics.cost_per_conversion, 'currency', account.account_info.currency_code)}
                  </p>
                </div>
                <CurrencyDollarIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ROAS</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    N/A
                  </p>
                </div>
                <ArrowTrendingUpIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sa360Reports?.result?.record_count ?? 0}
                  </p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account Type</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                    {account.account_info.is_manager ? 'manager' : 'client'}
                  </p>
                </div>
                <BuildingOfficeIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
            </motion.div>
          </div>

          {/* Performance Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Performance Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">CTR</span>
                  <span className="font-medium">{formatMetric(metrics.ctr, 'percentage')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">CPC</span>
                  <span className="font-medium">{formatMetric(metrics.cpc, 'currency', account.account_info.currency_code)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                  <span className="font-medium">{formatMetric(metrics.conversion_rate, 'percentage')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cost per Conversion</span>
                  <span className="font-medium">{formatMetric(metrics.cost_per_conversion, 'currency', account.account_info.currency_code)}</span>
                </div>
              </div>
            </div>

            {/* Account Health - Only show if data is available from API */}
            {chartData.accountHealthData && chartData.accountHealthData.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  Account Health
                </h3>
                <div className="space-y-3">
                  {chartData.accountHealthData.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ROI Metrics - Only show calculated metrics from actual data */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BoltIcon className="w-5 h-5 mr-2" />
                ROI Metrics
              </h3>
              <div className="space-y-3">
                {metrics.cost > 0 && metrics.conversions_value > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ROAS</span>
                    <span className="font-medium">{(metrics.conversions_value / metrics.cost).toFixed(2)}x</span>
                  </div>
                )}
                {metrics.cost > 0 && metrics.conversions > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cost per Conversion</span>
                    <span className="font-medium">{formatMetric(metrics.cost / metrics.conversions, 'currency', account.account_info.currency_code)}</span>
                  </div>
                )}
                {metrics.clicks > 0 && metrics.conversions > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                    <span className="font-medium">{((metrics.conversions / metrics.clicks) * 100).toFixed(2)}%</span>
                  </div>
                )}
                {metrics.impressions > 0 && metrics.clicks > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">CTR</span>
                    <span className="font-medium">{((metrics.clicks / metrics.impressions) * 100).toFixed(2)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

               {/* Comprehensive Charts Section */}
         <div className="space-y-6">
           {/* Additional Line Charts with Gradients */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <ChartCard
               title="Performance Trends"
               subtitle="Key metrics over time with gradient lines"
               data={chartData.performanceData}
               type="line"
               height={300}
               gradient={true}
             />
             
             <ChartCard
               title="Revenue Trends"
               subtitle="Revenue metrics over time with gradient lines"
               data={chartData.revenueData}
               type="line"
               height={300}
               gradient={true}
             />
           </div>
                 {/* Performance Metrics Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <ChartCard
             title="Performance Metrics"
             subtitle="Key performance indicators with gradient bars"
             data={chartData.performanceData}
             type="bar"
             height={300}
             gradient={true}
           />
           
           <ChartCard
             title="Revenue Metrics"
             subtitle="Revenue and conversion data with gradient bars"
             data={chartData.revenueData}
             type="bar"
             height={300}
             gradient={true}
           />
         </div>

                 {/* Campaign and Account Health Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <ChartCard
             title="Campaign Performance Distribution"
             subtitle="Performance across different metrics with gradient colors"
             data={chartData.campaignPerformanceData}
             type="pie"
             height={300}
             gradient={true}
           />
           
           {chartData.accountHealthData && chartData.accountHealthData.length > 0 && (
             <ChartCard
               title="Account Health Overview"
               subtitle="Activity rates across account with gradient colors"
               data={chartData.accountHealthData}
               type="pie"
               height={300}
               gradient={true}
             />
           )}
         </div>

                                                                       {/* ROI Metrics Chart */}
           <ChartCard
             title="ROI Metrics"
             subtitle="Return on investment indicators with gradient bars"
             data={chartData.roiData}
             type="bar"
             height={300}
             gradient={true}
           />
           
           {/* Area Charts with Gradients */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <ChartCard
               title="Performance Area Chart"
               subtitle="Performance metrics with gradient area fills"
               data={chartData.performanceData}
               type="area"
               height={300}
               gradient={true}
             />
             
             <ChartCard
               title="Revenue Area Chart"
               subtitle="Revenue metrics with gradient area fills"
               data={chartData.revenueData}
               type="area"
               height={300}
               gradient={true}
             />
           </div>
         </div>

       {/* SA360 Campaign Reports Charts */}
       {sa360Reports && sa360Reports.result && sa360ChartData.campaignPerformanceLineData && (
         <div className="space-y-6">
           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">SA360 Campaign Analytics</h2>
           
           {/* Campaign Performance Line Charts */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <ChartCard
               title="Campaign Impressions & Clicks"
               subtitle="Performance metrics by campaign"
               data={sa360ChartData.campaignPerformanceLineData.map(campaign => ({
                 name: campaign.name,
                 impressions: campaign.impressions,
                 clicks: campaign.clicks
               }))}
               type="line"
               height={300}
               gradient={true}
               multiLine={true}
             />
             
             <ChartCard
               title="Campaign Cost & Conversions"
               subtitle="Financial metrics by campaign"
               data={sa360ChartData.campaignPerformanceLineData.map(campaign => ({
                 name: campaign.name,
                 cost: campaign.cost,
                 conversions: campaign.conversions
               }))}
               type="line"
               height={300}
               gradient={true}
               multiLine={true}
             />
           </div>

           {/* Campaign Status & Type Distribution */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <ChartCard
               title="Campaign Status Distribution"
               subtitle="Status breakdown of campaigns with gradient colors"
               data={sa360ChartData.campaignStatusData}
               type="pie"
               height={300}
               gradient={true}
             />
             
             <ChartCard
               title="Campaign Type Distribution"
               subtitle="Advertising channel types with gradient colors"
               data={sa360ChartData.campaignTypeData}
               type="pie"
               height={300}
               gradient={true}
             />
           </div>

           {/* Performance Metrics Bar Charts */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <ChartCard
               title="Performance Metrics by Campaign"
               subtitle="Key performance indicators with gradient bars"
               data={sa360ChartData.performanceByCampaign.map(campaign => ({
                 name: campaign.name,
                 impressions: campaign.impressions,
                 clicks: campaign.clicks,
                 conversions: campaign.conversions
               }))}
               type="bar"
               height={300}
               gradient={true}
               multiLine={true}
             />
             
             <ChartCard
               title="ROI Analysis by Campaign"
               subtitle="Return on investment metrics with gradient bars"
               data={sa360ChartData.roiByCampaign.map(campaign => ({
                 name: campaign.name,
                 roas: campaign.roas,
                 ctr: campaign.ctr,
                 cpc: campaign.cpc,
                 conversion_rate: campaign.conversion_rate
               }))}
               type="bar"
               height={300}
               gradient={true}
               multiLine={true}
             />
           </div>

           {/* Advanced Analytics */}
           <div className="grid grid-cols-1 gap-6">
             <ChartCard
               title="Campaign Performance Overview"
               subtitle="Comprehensive performance analysis"
               data={sa360ChartData.campaignPerformanceLineData.map(campaign => ({
                 name: campaign.name,
                 impressions: campaign.impressions,
                 clicks: campaign.clicks,
                 cost: campaign.cost,
                 conversions: campaign.conversions,
                 conversions_value: campaign.conversions_value,
                 ctr: campaign.ctr,
                 cpc: campaign.cpc,
                 roas: campaign.roas
               }))}
               type="line"
               height={400}
               gradient={true}
               multiLine={true}
             />
           </div>

           {/* Area Chart Examples with Faded Gradients */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <ChartCard
               title="Campaign Performance Area Chart"
               subtitle="Faded gradient area visualization"
               data={sa360ChartData.campaignPerformanceLineData.map(campaign => ({
                 name: campaign.name,
                 impressions: campaign.impressions,
                 clicks: campaign.clicks
               }))}
               type="area"
               height={300}
               gradient={true}
               multiLine={true}
             />
             
             <ChartCard
               title="Financial Metrics Area Chart"
               subtitle="Cost and conversion value trends"
               data={sa360ChartData.campaignPerformanceLineData.map(campaign => ({
                 name: campaign.name,
                 cost: campaign.cost,
                 conversions_value: campaign.conversions_value
               }))}
               type="area"
               height={300}
               gradient={true}
               multiLine={true}
             />
           </div>

           {/* Trend Analysis Charts */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <ChartCard
               title="CTR & CPC Trends"
               subtitle="Click-through rate and cost per click analysis"
               data={sa360ChartData.campaignPerformanceLineData.map(campaign => ({
                 name: campaign.name,
                 ctr: campaign.ctr,
                 cpc: campaign.cpc
               }))}
               type="line"
               height={300}
               gradient={true}
               multiLine={true}
             />
             
             <ChartCard
               title="ROAS & Conversion Rate Trends"
               subtitle="Return on ad spend and conversion rate analysis"
               data={sa360ChartData.campaignPerformanceLineData.map(campaign => ({
                 name: campaign.name,
                 roas: campaign.roas,
                 conversion_rate: campaign.conversions > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0
               }))}
               type="line"
               height={300}
               gradient={true}
               multiLine={true}
             />
           </div>
         </div>
       )}

      {/* Detailed Insights Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Detailed Insights</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Metrics */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Performance Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Impressions</span>
                <span className="font-medium">{formatMetric(metrics.impressions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Clicks</span>
                <span className="font-medium">{formatMetric(metrics.clicks)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">CTR</span>
                <span className="font-medium">{formatMetric(metrics.ctr, 'percentage')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">CPC</span>
                <span className="font-medium">{formatMetric(metrics.cpc, 'currency', account.account_info.currency_code)}</span>
              </div>
            </div>
          </div>

          {/* Conversion Metrics */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
              <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
              Conversion Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Conversions</span>
                <span className="font-medium">{formatMetric(metrics.conversions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                <span className="font-medium">{formatMetric(metrics.conversion_rate, 'percentage')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Conversion Value</span>
                <span className="font-medium">
                  {formatMetric(metrics.conversions_value ?? 0, 'currency', account.account_info.currency_code)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cost per Conversion</span>
                <span className="font-medium">{formatMetric(metrics.cost_per_conversion, 'currency', account.account_info.currency_code)}</span>
              </div>
            </div>
          </div>

          {/* Financial Analysis */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2" />
              Financial Analysis
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Cost</span>
                <span className="font-medium">{formatMetric(metrics.cost, 'currency', account.account_info.currency_code)}</span>
              </div>
              {metrics.cost > 0 && metrics.conversions_value > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ROAS</span>
                  <span className="font-medium">{(metrics.conversions_value / metrics.cost).toFixed(2)}x</span>
                </div>
              )}
              {metrics.cost > 0 && metrics.conversions_value > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Net Revenue</span>
                  <span className="font-medium">
                    {formatMetric(metrics.conversions_value - metrics.cost, 'currency', account.account_info.currency_code)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Name</label>
              <p className="text-gray-900 dark:text-white font-medium">{account.account_info.descriptive_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer ID</label>
              <p className="text-gray-900 dark:text-white font-mono">{account.customer_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Currency</label>
              <p className="text-gray-900 dark:text-white">{account.account_info.currency_code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Type</label>
              <p className="text-gray-900 dark:text-white capitalize">{account.account_info.is_manager ? 'manager' : 'client'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Zone</label>
              <p className="text-gray-900 dark:text-white">{account.account_info.time_zone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campaigns</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {sa360Reports?.result?.record_count ?? sa360Campaigns.length ?? 0}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Data Period</label>
              <p className="text-gray-900 dark:text-white">
                {account.date_range.start_date && account.date_range.end_date
                  ? `${account.date_range.start_date} to ${account.date_range.end_date}`
                  : 'All Time'}
              </p>
            </div>
          </div>
        </div>
      </div>

             {/* SA360 Campaign Reports Section */}
       {sa360ReportsLoading && (
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
           <div className="text-center py-8">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
             <p className="text-gray-600 dark:text-gray-400">Loading SA360 campaign reports...</p>
           </div>
         </div>
       )}
       
       {sa360Reports && sa360Reports.result && (
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
           <div className="flex items-center justify-between mb-6">
             <div>
               <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SA360 Campaign Reports</h2>
               <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                 Report Type: {sa360Reports.result.report_type} | 
                 Total Campaigns: {sa360Reports.result.record_count} |
                 Date Range: {sa360Reports.result.date_range.from} to {sa360Reports.result.date_range.to}
               </p>
             </div>
             
             <div className="flex items-center space-x-2">
               <button
                 onClick={() => {
                   dispatch(fetchGoogleSa360Reports({
                     googleAccountId: account.customer_id,
                     customerId: account.customer_id,
                     params: {
                       date_from: dateRange.date_from,
                       date_to: dateRange.date_to
                     }
                   }));
                 }}
                 disabled={sa360ReportsLoading}
                 className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
               >
                 {sa360ReportsLoading ? 'Refreshing...' : 'Refresh Reports'}
               </button>
             </div>
           </div>

           {/* Campaign Reports Table */}
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
               <thead className="bg-gray-50 dark:bg-gray-700">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Campaign
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Status
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Type
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Impressions
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Clicks
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     CTR
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Cost
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     CPC
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Conversions
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Conv. Value
                   </th>
                 </tr>
               </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sa360Campaigns.map((campaign, index) => {
                  const performance = campaign.performance?.overview || campaign.performance || {};
                  const costMicros = performance.cost_micros ?? 0;
                   const getStatusColor = (status) => {
                     switch (status) {
                       case 'ENABLED': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
                       case 'PAUSED': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
                       case 'REMOVED': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
                       default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
                     }
                   };
                   
                   return (
                     <tr key={campaign.campaign_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <button
                            onClick={() => {
                              // Store the clicked campaign in Redux so the detail view can use it
                              dispatch(setSelectedSa360Campaign({
                                googleAccountId,
                                customerId: account.customer_id,
                                campaignId: campaign.campaign_id,
                                date: campaign.date,
                                campaign,
                                account
                              }));
                              
                              navigate(`/google/sa360/campaign/${googleAccountId}/${account.customer_id}/${campaign.campaign_id}?date=${campaign.date}`);
                            }}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer text-left"
                          >
                            {campaign.campaign_name}
                          </button>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {campaign.campaign_id}
                          </div>
                        </div>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.campaign_status)}`}>
                           {campaign.campaign_status}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                         {campaign.advertising_channel_type}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                         {formatMetric(performance.impressions ?? 0)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                         {formatMetric(performance.clicks ?? 0)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                         {formatMetric((performance.ctr ?? 0) * 100, 'percentage')}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                         {formatMetric(performance.cost ?? (costMicros / 1_000_000), 'currency', account.account_info.currency_code)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                         {(performance.average_cpc ?? 0) > 0
                           ? formatMetric((performance.average_cpc ?? 0) / 1_000_000, 'currency', account.account_info.currency_code)
                           : 'N/A'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                         {formatMetric(performance.conversions ?? performance.all_conversions ?? 0)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                         {formatMetric(performance.conversions_value ?? 0, 'currency', account.account_info.currency_code)}
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>

           {/* SA360 Customers (if provided) */}
           {sa360Customers.length > 0 && (
             <div className="mt-6">
               <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Customers</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {sa360Customers.map((cust, idx) => (
                   <div key={cust.customer_id || idx} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                     <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Customer ID</div>
                     <div className="font-semibold text-gray-900 dark:text-white">{cust.customer_id}</div>
                     <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                       {cust.customer_descriptive_name || '—'}
                     </div>
                     <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                       {cust.customer_currency_code || cust.customer_currency || '—'} • {cust.customer_time_zone || '—'}
                     </div>
                     <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                       Status: {cust.customer_status || '—'}{cust.customer_manager ? ' • Manager' : ''}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Campaign Performance Summary */}
           {sa360Campaigns.length > 0 && (
             <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
               <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {(() => {
                   const totalData = sa360Campaigns.reduce((acc, campaign) => {
                     const perf = campaign.performance?.overview || campaign.performance || {};
                     const costMicros = perf.cost_micros ?? 0;
                     return {
                       impressions: acc.impressions + (perf.impressions ?? 0),
                       clicks: acc.clicks + (perf.clicks ?? 0),
                       cost: acc.cost + (perf.cost ?? (costMicros / 1_000_000)),
                       conversions: acc.conversions + (perf.conversions ?? perf.all_conversions ?? 0),
                       conversions_value: acc.conversions_value + (perf.conversions_value ?? 0)
                     };
                   }, { impressions: 0, clicks: 0, cost: 0, conversions: 0, conversions_value: 0 });

                   const avgCTR = totalData.impressions > 0 ? (totalData.clicks / totalData.impressions) * 100 : 0;
                   const avgCPC = totalData.clicks > 0 ? totalData.cost / totalData.clicks : 0;
                   const roas = totalData.cost > 0 ? totalData.conversions_value / totalData.cost : 0;

                   return (
                     <>
                       <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                         <div className="text-sm text-gray-600 dark:text-gray-400">Total Impressions</div>
                         <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatMetric(totalData.impressions)}</div>
                       </div>
                       <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                         <div className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</div>
                         <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatMetric(totalData.clicks)}</div>
                       </div>
                       <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                         <div className="text-sm text-gray-600 dark:text-gray-400">Total Cost</div>
                         <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatMetric(totalData.cost, 'currency', account.account_info.currency_code)}</div>
                       </div>
                       <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                         <div className="text-sm text-gray-600 dark:text-gray-400">Total Conversions</div>
                         <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatMetric(totalData.conversions)}</div>
                       </div>
                       <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                         <div className="text-sm text-gray-600 dark:text-gray-400">Avg CTR</div>
                         <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatMetric(avgCTR, 'percentage')}</div>
                       </div>
                       <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                         <div className="text-sm text-gray-600 dark:text-gray-400">Avg CPC</div>
                         <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatMetric(avgCPC, 'currency', account.account_info.currency_code)}</div>
                       </div>
                       <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                         <div className="text-sm text-gray-600 dark:text-gray-400">ROAS</div>
                         <div className="text-lg font-semibold text-gray-900 dark:text-white">{roas.toFixed(2)}x</div>
                       </div>
                       <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                         <div className="text-sm text-gray-600 dark:text-gray-400">Conv. Value</div>
                         <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatMetric(totalData.conversions_value, 'currency', account.account_info.currency_code)}</div>
                       </div>
                     </>
                   );
                 })()}
               </div>
             </div>
           )}
         </div>
       )}

       {/* Quick Actions */}
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
         <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
             <ChartBarIcon className="w-5 h-5" />
             <span>Create Campaign</span>
           </button>
           
           <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
             <CreditCardIcon className="w-5 h-5" />
             <span>Add Payment Method</span>
           </button>
           
           <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
             <CogIcon className="w-5 h-5" />
             <span>Account Settings</span>
           </button>
         </div>
         
         {/* SA360 Reports API Testing */}
         {account && (
           <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
             <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">API Testing</h3>
             <div className="flex justify-center">
               {/* SA360 Reports Test Button */}
               <button 
                 onClick={() => {
                   dispatch(fetchGoogleSa360Reports({
                     googleAccountId: googleAccountId,
                     customerId: account.customer_id,
                     params: {
                       date_from: dateRange.date_from,
                       date_to: dateRange.date_to
                     }
                   }));
                 }}
                 disabled={sa360ReportsLoading}
                 className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
               >
                 {sa360ReportsLoading ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                     <span>Loading...</span>
                   </>
                 ) : (
                   <>
                     <PlayIcon className="w-5 h-5" />
                     <span>Test SA360 Reports API</span>
                   </>
                 )}
               </button>
             </div>
             
             {/* Error Messages */}
             {sa360ReportsError && (
               <p className="text-red-600 dark:text-red-400 text-sm mt-2 text-center">
                 Reports Error: {sa360ReportsError}
               </p>
             )}
           </div>
         )}
       </div>
    </div>
  );
};

export default GoogleAccountDetail;
