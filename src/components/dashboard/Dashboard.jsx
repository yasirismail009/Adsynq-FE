import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import PlatformConnectionsCard from '../integrations/PlatformConnectionsCard';
import { useIntegrations } from '../../hooks/useIntegrations';
import { fetchPlatformConnections, selectPlatformConnections, selectDashboardLoading, selectDashboardErrors } from '../../store/slices/dashboardSlice';
import { fetchMetaOverallStats, selectMetaOverallStats, selectMetaLoading, selectMetaErrors } from '../../store/slices/metaSlice';
import { fetchGoogleOverallStats, selectGoogleOverallStats, selectGoogleOverallStatsLoading, selectGoogleOverallStatsError } from '../../store/slices/googleSlice';
import { axiosPrivate } from '../../services/api';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { integrations, loading } = useIntegrations();

  // Use ref to track if API calls have been made
  const hasInitialized = useRef(false);

  // Redux state for platform connections
  const platformConnections = useSelector(selectPlatformConnections);
  const dashboardLoading = useSelector(selectDashboardLoading);
  const dashboardErrors = useSelector(selectDashboardErrors);

  // Redux state for Meta stats
  const metaOverallStats = useSelector(selectMetaOverallStats);
  const metaLoading = useSelector(selectMetaLoading);
  const metaErrors = useSelector(selectMetaErrors);

  // Redux state for Google stats
  const googleOverallStats = useSelector(selectGoogleOverallStats);
  const googleOverallStatsLoading = useSelector(selectGoogleOverallStatsLoading);
  const googleOverallStatsError = useSelector(selectGoogleOverallStatsError);

  // Fetch platform connections and Meta stats on component mount (only once)
  useEffect(() => {
    if (!hasInitialized.current) {
      console.log('Dispatching fetchPlatformConnections, fetchMetaOverallStats, and fetchGoogleOverallStats...');
      dispatch(fetchPlatformConnections());
      dispatch(fetchMetaOverallStats());
      dispatch(fetchGoogleOverallStats());
      hasInitialized.current = true;
    }
  }, []);

  // Log platform connections data
  useEffect(() => {
    if (platformConnections && platformConnections.length > 0) {
      console.log('Platform Connections Data:', platformConnections);
    }
  }, [platformConnections]);

  // Log loading and error states
  useEffect(() => {
    console.log('Dashboard Loading States:', dashboardLoading);
    if (dashboardLoading.platformConnections) {
      console.log('Fetching platform connections...');
    }
  }, [dashboardLoading]);

  // Log errors
  useEffect(() => {
    if (dashboardErrors.platformConnections) {
      console.error('Platform Connections Error:', dashboardErrors.platformConnections);
    }
  }, [dashboardErrors]);

  // Fetch SA360 overall stats
  useEffect(() => {
    const fetchSA360Stats = async () => {
      try {
        console.log('Fetching SA360 overall stats...');
        const response = await axiosPrivate.get('/marketing/sa360/overall-stats/');
        console.log('SA360 Overall Stats Response:', response.data);
      } catch (error) {
        console.error('Error fetching SA360 overall stats:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
      }
    };

    // fetchSA360Stats();
  }, []);

  // Log Meta stats data
  useEffect(() => {
    if (metaOverallStats) {
      console.log('Meta Overall Stats Data:', metaOverallStats);
    }
  }, [metaOverallStats]);

  // Log Meta loading and error states
  useEffect(() => {
    console.log('Meta Loading States:', metaLoading);
    console.log('Meta Overall Stats:', metaOverallStats);
    console.log('Meta Errors:', metaErrors);
    if (metaLoading.overallStats) {
      console.log('Fetching Meta overall stats...');
    }
  }, [metaLoading, metaOverallStats, metaErrors]);

  // Log Google stats data
  useEffect(() => {
    if (googleOverallStats) {
      console.log('Google Overall Stats Data:', googleOverallStats);
    }
  }, [googleOverallStats]);

  // Log Google loading and error states
  useEffect(() => {
    console.log('Google Loading States:', googleOverallStatsLoading);
    console.log('Google Overall Stats:', googleOverallStats);
    console.log('Google Errors:', googleOverallStatsError);
    if (googleOverallStatsLoading) {
      console.log('Fetching Google overall stats...');
    }
  }, [googleOverallStatsLoading, googleOverallStats, googleOverallStatsError]);

  // Log Meta errors
  useEffect(() => {
    if (metaErrors.overallStats) {
      console.error('Meta Overall Stats Error:', metaErrors.overallStats);
    }
  }, [metaErrors]);

  // Check if there are any platform connections
  const hasConnections = platformConnections && platformConnections.result && (
    platformConnections.result.total_connections > 0 ||
    (platformConnections.result.google_accounts && platformConnections.result.google_accounts.length > 0) ||
    (platformConnections.result.tiktok_connections && platformConnections.result.tiktok_connections.length > 0) ||
    (platformConnections.result.meta_connections && platformConnections.result.meta_connections.length > 0)
  );

  // Log connection status for debugging
  useEffect(() => {
    console.log('Platform Connections Status:', {
      hasConnections,
      totalConnections: platformConnections?.result?.total_connections,
      googleAccounts: platformConnections?.result?.google_accounts?.length,
      tiktokConnections: platformConnections?.result?.tiktok_connections?.length,
      metaConnections: platformConnections?.result?.meta_connections?.length
    });
  }, [hasConnections, platformConnections]);

  // Handle navigation to integrations page
  const handleConnectIntegrations = () => {
    navigate('/integrations');
  };

  // Manual dispatch for testing
  const handleManualMetaDispatch = () => {
    console.log('Manually dispatching fetchMetaOverallStats...');
    dispatch(fetchMetaOverallStats());
  };

  // Calculate aggregated metrics
  const calculateMetrics = () => {
    if (!integrations || integrations.length === 0) {
      return {
        totalSpend: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalCampaigns: 0,
        totalAds: 0,
        activeIntegrations: 0,
        errorIntegrations: 0
      };
    }

    return integrations.reduce((acc, integration) => {
      const metrics = integration.metrics || {};

      acc.totalSpend += metrics.spend || 0;
      acc.totalImpressions += metrics.impressions || 0;
      acc.totalClicks += metrics.clicks || 0;
      acc.totalConversions += metrics.conversions || 0;
      acc.totalCampaigns += metrics.campaigns || 0;
      acc.totalAds += metrics.ads || 0;

      if (integration.status === 'active') acc.activeIntegrations++;
      if (integration.status === 'error') acc.errorIntegrations++;

      return acc;
    }, {
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalCampaigns: 0,
      totalAds: 0,
      activeIntegrations: 0,
      errorIntegrations: 0
    });
  };

  const metrics = calculateMetrics();

  // Calculate performance metrics
  const ctr = metrics.totalImpressions > 0 ? (metrics.totalClicks / metrics.totalImpressions * 100) : 0;
  const conversionRate = metrics.totalClicks > 0 ? (metrics.totalConversions / metrics.totalClicks * 100) : 0;
  const cpa = metrics.totalConversions > 0 ? (metrics.totalSpend / metrics.totalConversions) : 0;

  // Platform breakdown
  const getPlatformBreakdown = () => {
    const platformData = {};

    integrations.forEach(integration => {
      integration.integrations.forEach(platform => {
        if (!platformData[platform.type]) {
          platformData[platform.type] = {
            name: platform.name,
            count: 0,
            active: 0,
            error: 0
          };
        }
        platformData[platform.type].count++;
        if (platform.status === 'active') platformData[platform.type].active++;
        if (platform.status === 'error') platformData[platform.type].error++;
      });
    });

    return Object.values(platformData);
  };

  const platformBreakdown = getPlatformBreakdown();

  // Recent activity
  const getRecentActivity = () => {
    return integrations
      .sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate))
      .slice(0, 5);
  };

  const recentActivity = getRecentActivity();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Helper function to extract Meta stats
  const getMetaStats = () => {
    console.log('getMetaStats called with:', metaOverallStats);

    if (!metaOverallStats || !metaOverallStats.result) {
      console.log('No Meta stats available, returning defaults');
      return {
        totalAdAccounts: 0,
        activeAdAccounts: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalSpend: 0,
        totalConversions: 0,
        averageCTR: 0,
        averageCPC: 0,
        averageCPM: 0,
        adAccounts: []
      };
    }

    const { result } = metaOverallStats;
    const { overall_totals, ad_accounts } = result;

    const stats = {
      totalAdAccounts: result.total_ad_accounts || 0,
      activeAdAccounts: result.active_ad_accounts || 0,
      totalImpressions: overall_totals?.impressions || 0,
      totalClicks: overall_totals?.clicks || 0,
      totalSpend: overall_totals?.spend || 0,
      totalConversions: overall_totals?.conversions || 0,
      averageCTR: overall_totals?.ctr || 0,
      averageCPC: overall_totals?.cpc || 0,
      averageCPM: overall_totals?.cpm || 0,
      adAccounts: ad_accounts || []
    };

    console.log('Extracted Meta stats:', stats);
    return stats;
  };

  const metaStats = getMetaStats();

  // Helper function to create chart data for Meta stats
  const createMetaChartData = () => {
    if (!metaOverallStats || !metaOverallStats.result) {
      return {
        performanceData: [],
        spendData: [],
        accountData: []
      };
    }

    const { result } = metaOverallStats;
    const { overall_totals, ad_accounts } = result;

    // Performance metrics chart data
    const performanceData = [
      { name: 'Impressions', value: overall_totals?.impressions || 0 },
      { name: 'Clicks', value: overall_totals?.clicks || 0 },
      { name: 'Conversions', value: overall_totals?.conversions || 0 },
      { name: 'CTR', value: (overall_totals?.ctr || 0) * 100 }, // Convert to percentage
      { name: 'CPC', value: overall_totals?.cpc || 0 },
      { name: 'CPM', value: overall_totals?.cpm || 0 }
    ];

    // Spend by account chart data
    const spendData = (ad_accounts || []).map(account => ({
      name: account.name || `Account ${account.id}`,
      value: account.totals?.spend || 0
    })).slice(0, 10); // Limit to top 10 accounts

    // Account performance chart data
    const accountData = (ad_accounts || []).map(account => ({
      name: account.name || `Account ${account.id}`,
      value: account.totals?.impressions || 0
    })).slice(0, 8); // Limit to top 8 accounts

    return {
      performanceData,
      spendData,
      accountData
    };
  };

  // Helper function to create chart data for Google stats
  const createGoogleChartData = () => {
    if (!googleOverallStats || !googleOverallStats.result) {
      return {
        performanceData: [],
        spendData: [],
        accountData: []
      };
    }

    const { result } = googleOverallStats;
    const { accounts, summary } = result;

    // Performance metrics chart data
    const performanceData = [
      { name: 'Impressions', value: summary?.total_impressions || 0 },
      { name: 'Clicks', value: summary?.total_clicks || 0 },
      { name: 'Conversions', value: summary?.total_conversions || 0 },
      { name: 'CTR', value: (summary?.average_ctr || 0) * 100 }, // Convert to percentage
      { name: 'CPC', value: summary?.average_cpc || 0 },
      { name: 'Cost', value: summary?.total_cost || 0 }
    ];

    // Spend by account chart data
    const spendData = (accounts || []).map(account => ({
      name: account.account_info?.descriptive_name || `Account ${account.customer_id}`,
      value: account.metrics?.cost || 0
    })).slice(0, 10); // Limit to top 10 accounts

    // Account performance chart data
    const accountData = (accounts || []).map(account => ({
      name: account.account_info?.descriptive_name || `Account ${account.customer_id}`,
      value: account.metrics?.impressions || 0
    })).slice(0, 8); // Limit to top 8 accounts

    return {
      performanceData,
      spendData,
      accountData
    };
  };

  const metaChartData = createMetaChartData();
  const googleChartData = createGoogleChartData();

  // Create combined performance data for comparison
  const createCombinedPerformanceData = () => {
    const combinedData = [];

    // Add Meta data
    if (metaOverallStats && metaOverallStats.result) {
      const { overall_totals } = metaOverallStats.result;
      combinedData.push(
        { name: 'Meta Impressions', value: overall_totals?.impressions || 0, platform: 'Meta' },
        { name: 'Meta Clicks', value: overall_totals?.clicks || 0, platform: 'Meta' },
        { name: 'Meta Spend', value: overall_totals?.spend || 0, platform: 'Meta' }
      );
    }

    // Add Google data
    if (googleOverallStats && googleOverallStats.result) {
      const { summary } = googleOverallStats.result;
      combinedData.push(
        { name: 'Google Impressions', value: summary?.total_impressions || 0, platform: 'Google' },
        { name: 'Google Clicks', value: summary?.total_clicks || 0, platform: 'Google' },
        { name: 'Google Cost', value: summary?.total_cost || 0, platform: 'Google' }
      );
    }

    return combinedData;
  };

  const combinedPerformanceData = createCombinedPerformanceData();

  // Create platform comparison data
  const createPlatformComparisonData = () => {
    const comparisonData = [];

    if (metaOverallStats && metaOverallStats.result) {
      const { overall_totals } = metaOverallStats.result;
      comparisonData.push({
        name: 'Meta',
        impressions: overall_totals?.impressions || 0,
        clicks: overall_totals?.clicks || 0,
        spend: overall_totals?.spend || 0,
        ctr: (overall_totals?.ctr || 0) * 100
      });
    }

    if (googleOverallStats && googleOverallStats.result) {
      const { summary } = googleOverallStats.result;
      comparisonData.push({
        name: 'Google',
        impressions: summary?.total_impressions || 0,
        clicks: summary?.total_clicks || 0,
        spend: summary?.total_cost || 0,
        ctr: (summary?.average_ctr || 0) * 100
      });
    }

    return comparisonData;
  };

  const platformComparisonData = createPlatformComparisonData();

  if (loading || dashboardLoading.platformConnections) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Connection Banner - Show when no connections */}
      {!hasConnections && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Connect Your Advertising Platforms</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              To view your analytics dashboard, you need to connect at least one advertising platform.
              Connect your Google Ads, Meta Ads, TikTok Ads, or other platforms to get started.
            </p>
            <button
              onClick={handleConnectIntegrations}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Connect Integrations</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Dashboard Content - Only show when there are connections */}
      {hasConnections && (
        <>
          {/* Page Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Overview of your advertising performance across all integrations
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                  {metrics.activeIntegrations} Active
                </span>
                {metrics.errorIntegrations > 0 && (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                    {metrics.errorIntegrations} Errors
                  </span>
                )}
                <button
                  onClick={handleManualMetaDispatch}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                  Test Meta API
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Spend"
              value={formatCurrency(metrics.totalSpend + metaStats.totalSpend + (googleOverallStats?.result?.summary?.total_cost || 0))}
              icon={CurrencyDollarIcon}
              color="green"
              trend="+12.5%"
              trendDirection="up"
              dataSources={['meta', 'google']}
            />
            <StatCard
              title="Impressions"
              value={formatNumber(metrics.totalImpressions + metaStats.totalImpressions + (googleOverallStats?.result?.summary?.total_impressions || 0))}
              icon={EyeIcon}
              color="blue"
              trend="+8.2%"
              trendDirection="up"
              dataSources={['meta', 'google']}
            />
            <StatCard
              title="Clicks"
              value={formatNumber(metrics.totalClicks + metaStats.totalClicks + (googleOverallStats?.result?.summary?.total_clicks || 0))}
              icon={CursorArrowRaysIcon}
              color="purple"
              trend="+15.3%"
              trendDirection="up"
              dataSources={['meta', 'google']}
            />
            <StatCard
              title="CTR"
              value={`${((metrics.totalClicks + metaStats.totalClicks + (googleOverallStats?.result?.summary?.total_clicks || 0)) / (metrics.totalImpressions + metaStats.totalImpressions + (googleOverallStats?.result?.summary?.total_impressions || 0)) * 100).toFixed(2)}%`}
              icon={ChartBarIcon}
              color="orange"
              trend="+22.1%"
              trendDirection="up"
              dataSources={['meta', 'google']}
            />
          </div>

          {/* Platform Connections */}
          <PlatformConnectionsCard connectionsData={platformConnections} />

          {/* Combined Performance Overview */}
          {(metaOverallStats || googleOverallStats) && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Overview</h2>

              {/* Combined Performance Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Platform Comparison Chart */}
                <ChartCard
                  title="Platform Performance Comparison"
                  subtitle="Impressions, clicks, and spend by platform"
                  data={platformComparisonData.map(platform => ({
                    name: platform.name,
                    value: platform.impressions
                  }))}
                  type="bar"
                  height={300}
                  noDataMessage="No platform comparison data available"
                />

                {/* Combined Metrics Chart */}
                <ChartCard
                  title="Combined Performance Metrics"
                  subtitle="Key metrics across all platforms"
                  data={combinedPerformanceData}
                  type="bar"
                  height={300}
                  noDataMessage="No combined metrics data available"
                />
              </div>
            </div>
          )}

          {/* Meta Advertising Stats */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Meta Advertising Stats</h2>

            {metaLoading.overallStats && (
              <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading Meta stats...</span>
              </div>
            )}

            {metaErrors.overallStats && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700 dark:text-red-400 font-medium">Error loading Meta stats</span>
                </div>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                  {typeof metaErrors.overallStats === 'string' ? metaErrors.overallStats : 'Failed to fetch Meta data'}
                </p>
              </div>
            )}

            {metaOverallStats && metaOverallStats.result && !metaLoading.overallStats && !metaErrors.overallStats && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {metaStats.totalAdAccounts}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Ad Accounts</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {metaStats.activeAdAccounts} Active
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(metaStats.totalSpend)}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">Total Spend</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(metaStats.totalImpressions)} Impressions
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatNumber(metaStats.totalClicks)}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Clicks</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {metaStats.averageCTR.toFixed(2)}% CTR
                    </div>
                  </div>
                </div>

                {/* Meta Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Performance Metrics Chart */}
                  <ChartCard
                    title="Meta Performance Metrics"
                    subtitle="Key performance indicators"
                    data={metaChartData.performanceData}
                    type="bar"
                    height={300}
                    noDataMessage="No performance data available"
                  />

                  {/* Spend by Account Chart */}
                  <ChartCard
                    title="Spend by Ad Account"
                    subtitle="Top 10 accounts by spend"
                    data={metaChartData.spendData}
                    type="bar"
                    height={300}
                    noDataMessage="No spend data available"
                  />

                  {/* Account Performance Chart */}
                  <ChartCard
                    title="Account Performance"
                    subtitle="Impressions by account"
                    data={metaChartData.accountData}
                    type="bar"
                    height={300}
                    noDataMessage="No account performance data available"
                  />
                </div>

                {/* Ad Accounts List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ad Accounts</h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {metaStats.adAccounts.map((account, index) => (
                      <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${account.account_status === 1 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {account.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {account.id} • {account.currency}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(account.totals.spend)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatNumber(account.totals.impressions)} impressions
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!metaOverallStats && !metaLoading.overallStats && !metaErrors.overallStats && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p>No Meta data available. Click "Test Meta API" to fetch data.</p>
              </div>
            )}
          </div>

          {/* Google Advertising Stats */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Google Advertising Stats</h2>

            {/* Google Stats Cards */}
            {googleOverallStatsLoading && (
              <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading Google stats...</span>
              </div>
            )}

            {googleOverallStatsError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700 dark:text-red-400 font-medium">Error loading Google stats</span>
                </div>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                  {typeof googleOverallStatsError === 'string' ? googleOverallStatsError : 'Failed to fetch Google data'}
                </p>
              </div>
            )}

            {googleOverallStats && googleOverallStats.result && !googleOverallStatsLoading && !googleOverallStatsError && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {googleOverallStats.result.summary?.total_accounts || 0}
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400 font-medium">Total Ad Accounts</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {googleOverallStats.result.summary?.active_accounts || 0} Active
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(googleOverallStats.result.summary?.total_cost || 0)}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">Total Cost</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(googleOverallStats.result.summary?.total_impressions || 0)} Impressions
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatNumber(googleOverallStats.result.summary?.total_clicks || 0)}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Clicks</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(googleOverallStats.result.summary?.average_ctr || 0).toFixed(2)}% CTR
                    </div>
                  </div>
                </div>

                {/* Google Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Performance Metrics Chart */}
                  <ChartCard
                    title="Google Performance Metrics"
                    subtitle="Key performance indicators"
                    data={googleChartData.performanceData}
                    type="bar"
                    height={300}
                    noDataMessage="No performance data available"
                  />

                  {/* Spend by Account Chart */}
                  <ChartCard
                    title="Spend by Ad Account"
                    subtitle="Top 10 accounts by spend"
                    data={googleChartData.spendData}
                    type="bar"
                    height={300}
                    noDataMessage="No spend data available"
                  />

                  {/* Account Performance Chart */}
                  <ChartCard
                    title="Account Performance"
                    subtitle="Impressions by account"
                    data={googleChartData.accountData}
                    type="bar"
                    height={300}
                    noDataMessage="No account performance data available"
                  />
                </div>

                {/* Ad Accounts List */}
                {googleOverallStats.result.accounts && googleOverallStats.result.accounts.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ad Accounts</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {googleOverallStats.result.accounts.map((account, index) => (
                        <div key={account.customer_id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${account.account_info?.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 dark:text-white truncate">
                                {account.account_info?.descriptive_name || 'Unknown Account'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {account.customer_id} • {account.account_info?.currency_code || 'USD'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(account.metrics?.cost || 0)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatNumber(account.metrics?.impressions || 0)} impressions
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!googleOverallStats && !googleOverallStatsLoading && !googleOverallStatsError && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p>No Google data available. Connect your Google Ads account to view stats.</p>
              </div>
            )}
          </div>

          {/* Performance Metrics & Platform Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <div className="lg:col-span-2">
              <ChartCard title="Performance Metrics">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {ctr.toFixed(2)}%
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">CTR</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Click-through Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {conversionRate.toFixed(2)}%
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Conv. Rate</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Conversion Rate</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(cpa)}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">CPA</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Cost per Acquisition</div>
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Platform Status */}
            <ChartCard title="Platform Status">
              <div className="space-y-3">
                {platformBreakdown.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {platform.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {platform.active}/{platform.count}
                      </span>
                      {platform.error > 0 && (
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Recent Activity */}
          <ChartCard title="Recent Activity">
            <div className="space-y-4">
              {recentActivity.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${integration.status === 'active' ? 'bg-green-500' :
                        integration.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                      }`}></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {integration.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {integration.domain}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {integration.integrations.length} platforms
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Updated {integration.updatedDate}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ChartCard>
        </>
      )}
    </div>
  );
};

export default Dashboard; 