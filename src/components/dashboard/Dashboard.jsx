import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { integrations, loading } = useIntegrations();

  // Use ref to track if API calls have been made (survives StrictMode double render)
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
  // The ref persists across React.StrictMode double renders in development
  useEffect(() => {
    if (!hasInitialized.current) {
      dispatch(fetchPlatformConnections());
      dispatch(fetchMetaOverallStats());
      dispatch(fetchGoogleOverallStats());
      hasInitialized.current = true;
    }
  }, [dispatch]);

  // Set up periodic refresh for Google data (every 30 seconds)
  useEffect(() => {
    // Don't set up interval if not initialized yet
    if (!hasInitialized.current) return;

    const refreshInterval = setInterval(() => {
      dispatch(fetchGoogleOverallStats());
    }, 30000); // Refresh every 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  // Refresh Google data when window/tab comes into focus (but not on initial mount)
  useEffect(() => {
    // Don't set up focus listener if not initialized yet
    if (!hasInitialized.current) return;

    // Track when component mounted to skip initial focus event
    const componentMountTime = Date.now();
    let hasHandledInitialFocus = false;

    const handleFocus = () => {
      const timeSinceMount = Date.now() - componentMountTime;
      
      // Skip focus events within first 2 seconds (likely from initial mount)
      if (!hasHandledInitialFocus && timeSinceMount < 2000) {
        hasHandledInitialFocus = true;
        return;
      }
      
      dispatch(fetchGoogleOverallStats());
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [dispatch]);



  // Check if there are any platform connections
  const hasConnections = platformConnections && platformConnections.result && (
    platformConnections.result.total_connections > 0 ||
    (platformConnections.result.google_accounts && platformConnections.result.google_accounts.length > 0) ||
    (platformConnections.result.meta_connections && platformConnections.result.meta_connections.length > 0)
  );


  // Handle navigation to integrations page
  const handleConnectIntegrations = () => {
    navigate('/integrations');
  };

  // Manual dispatch for testing
  const handleManualMetaDispatch = () => {
    console.log('Manually dispatching fetchMetaOverallStats...');
    dispatch(fetchMetaOverallStats());
  };

  // Manual refresh for Google data
  const handleManualGoogleRefresh = () => {
    console.log('Manually refreshing Google overall stats...');
    dispatch(fetchGoogleOverallStats());
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

  // Helper function to extract Meta stats - only returns data if it exists
  const getMetaStats = () => {
    if (!metaOverallStats || !metaOverallStats.result || !metaOverallStats.result.overall_totals) {
      return null;
    }

    const { result } = metaOverallStats;
    const { overall_totals, ad_accounts } = result;

    // Only return stats if we have actual data
    if (!overall_totals) {
      return null;
    }

    return {
      totalAdAccounts: result.total_ad_accounts ?? 0,
      activeAdAccounts: result.active_ad_accounts ?? 0,
      totalImpressions: overall_totals.impressions ?? 0,
      totalClicks: overall_totals.clicks ?? 0,
      totalSpend: overall_totals.spend ?? 0,
      totalConversions: overall_totals.conversions ?? 0,
      averageCTR: overall_totals.ctr ?? 0,
      averageCPC: overall_totals.cpc ?? 0,
      averageCPM: overall_totals.cpm ?? 0,
      adAccounts: ad_accounts ?? []
    };
  };

  const metaStats = getMetaStats();

  // Helper function to calculate combined totals from platform-specific data only
  const getCombinedTotals = () => {
    // Google data
    const googleCost = googleOverallStats?.result?.summary?.total_cost || 0;
    const googleImpressions = googleOverallStats?.result?.summary?.total_impressions || 0;
    const googleClicks = googleOverallStats?.result?.summary?.total_clicks || 0;
    const googleConversions = googleOverallStats?.result?.summary?.total_conversions || 0;

    // Only include Meta data if Meta connections exist and Meta stats are available
    const hasMetaConnections = platformConnections?.result?.meta_connections && 
                                platformConnections.result.meta_connections.length > 0;
    const hasMetaData = metaOverallStats && 
                       metaOverallStats.result && 
                       metaOverallStats.result.overall_totals;
    
    const shouldIncludeMeta = hasMetaConnections && hasMetaData;
    
    const metaSpend = shouldIncludeMeta ? (metaStats?.totalSpend ?? 0) : 0;
    const metaImpressions = shouldIncludeMeta ? (metaStats?.totalImpressions ?? 0) : 0;
    const metaClicks = shouldIncludeMeta ? (metaStats?.totalClicks ?? 0) : 0;
    const metaConversions = shouldIncludeMeta ? (metaStats?.totalConversions ?? 0) : 0;

    // Calculate totals - ONLY from platform-specific data (Google + Meta if available)
    // DO NOT include old metrics from integrations hook
    const totals = {
      totalSpend: googleCost + metaSpend,
      totalImpressions: googleImpressions + metaImpressions,
      totalClicks: googleClicks + metaClicks,
      totalConversions: googleConversions + metaConversions,
      // Determine currency - prefer Google's currency if available, otherwise Meta's
      currency: googleOverallStats?.result?.summary?.primary_currency ?? 
                googleOverallStats?.result?.summary?.total_cost_currency ?? 
                (shouldIncludeMeta && metaOverallStats?.result?.primary_currency) ??
                'USD'
    };

    return totals;
  };

  const combinedTotals = getCombinedTotals();

  // Determine which data sources are actually available
  const hasGoogleConnections = platformConnections?.result?.google_accounts && 
                               platformConnections.result.google_accounts.length > 0;
  const hasMetaConnections = platformConnections?.result?.meta_connections && 
                             platformConnections.result.meta_connections.length > 0;
  
  const activeDataSources = [];
  if (hasGoogleConnections) activeDataSources.push('google');
  if (hasMetaConnections) activeDataSources.push('meta');

  // Calculate performance metrics using combined totals from platform-specific data
  const ctr = combinedTotals.totalImpressions > 0 ? (combinedTotals.totalClicks / combinedTotals.totalImpressions * 100) : 0;
  const conversionRate = combinedTotals.totalClicks > 0 ? (combinedTotals.totalConversions / combinedTotals.totalClicks * 100) : 0;
  const cpa = combinedTotals.totalConversions > 0 ? (combinedTotals.totalSpend / combinedTotals.totalConversions) : 0;

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

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
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

    // Performance metrics chart data - only include if value exists
    const performanceData = [
      { name: t('dashboard.impressions'), value: overall_totals?.impressions ?? 0 },
      { name: t('dashboard.clicks'), value: overall_totals?.clicks ?? 0 },
      { name: t('dashboard.conversions'), value: overall_totals?.conversions ?? 0 },
      { name: t('dashboard.ctr'), value: (overall_totals?.ctr ?? 0) * 100 }, // Convert to percentage
      { name: t('dashboard.cpc'), value: overall_totals?.cpc ?? 0 },
      { name: t('dashboard.cpm'), value: overall_totals?.cpm ?? 0 }
    ].filter(item => item.value > 0); // Only show metrics with actual data

    // Spend by account chart data - only include accounts with data
    const spendData = (ad_accounts ?? [])
      .filter(account => account.totals?.spend > 0)
      .map(account => ({
        name: account.name ?? `Account ${account.id}`,
        value: account.totals.spend
      }))
      .slice(0, 10); // Limit to top 10 accounts

    // Account performance chart data - only include accounts with data
    const accountData = (ad_accounts ?? [])
      .filter(account => account.totals?.impressions > 0)
      .map(account => ({
        name: account.name ?? `Account ${account.id}`,
        value: account.totals.impressions
      }))
      .slice(0, 8); // Limit to top 8 accounts

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

    // Performance metrics chart data - only include if value exists
    const performanceData = [
      { name: t('dashboard.impressions'), value: summary?.total_impressions ?? 0 },
      { name: t('dashboard.clicks'), value: summary?.total_clicks ?? 0 },
      { name: t('dashboard.conversions'), value: summary?.total_conversions ?? 0 },
      { name: t('dashboard.ctr'), value: (summary?.average_ctr ?? 0) * 100 }, // Convert to percentage
      { name: t('dashboard.cpc'), value: summary?.average_cpc ?? 0 },
      { name: t('dashboard.totalCost'), value: summary?.total_cost ?? 0 }
    ].filter(item => item.value > 0); // Only show metrics with actual data

    // Spend by account chart data - only include accounts with data
    const spendData = (accounts ?? [])
      .filter(account => account.metrics?.cost > 0)
      .map(account => ({
        name: account.account_info?.descriptive_name ?? `Account ${account.customer_id}`,
        value: account.metrics.cost
      }))
      .slice(0, 10); // Limit to top 10 accounts

    // Account performance chart data - only include accounts with data
    const accountData = (accounts ?? [])
      .filter(account => account.metrics?.impressions > 0)
      .map(account => ({
        name: account.account_info?.descriptive_name ?? `Account ${account.customer_id}`,
        value: account.metrics.impressions
      }))
      .slice(0, 8); // Limit to top 8 accounts

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

    // Check if Meta connections exist before including Meta data
    const hasMetaConnections = platformConnections?.result?.meta_connections && 
                                platformConnections.result.meta_connections.length > 0;
    const hasMetaData = metaOverallStats && 
                       metaOverallStats.result && 
                       metaOverallStats.result.overall_totals;
    const shouldIncludeMeta = hasMetaConnections && hasMetaData;

    // Add Meta data only if Meta connections exist and has actual data
    if (shouldIncludeMeta && metaStats) {
      combinedData.push(
        { name: `${t('integrations.metaAds')} ${t('dashboard.impressions')}`, value: metaStats.totalImpressions ?? 0, platform: t('integrations.metaAds') },
        { name: `${t('integrations.metaAds')} ${t('dashboard.clicks')}`, value: metaStats.totalClicks ?? 0, platform: t('integrations.metaAds') },
        { name: `${t('integrations.metaAds')} ${t('dashboard.totalSpend')}`, value: metaStats.totalSpend ?? 0, platform: t('integrations.metaAds') }
      );
    }

    // Add Google data only if Google connections exist and has actual data
    const hasGoogleConnections = platformConnections?.result?.google_accounts && 
                                 platformConnections.result.google_accounts.length > 0;
    if (hasGoogleConnections && googleOverallStats?.result?.summary) {
      const { summary } = googleOverallStats.result;
      combinedData.push(
        { name: `${t('integrations.googleAds')} ${t('dashboard.impressions')}`, value: summary.total_impressions ?? 0, platform: t('integrations.googleAds') },
        { name: `${t('integrations.googleAds')} ${t('dashboard.clicks')}`, value: summary.total_clicks ?? 0, platform: t('integrations.googleAds') },
        { name: `${t('integrations.googleAds')} ${t('dashboard.totalCost')}`, value: summary.total_cost ?? 0, platform: t('integrations.googleAds') }
      );
    }

    return combinedData;
  };

  const combinedPerformanceData = createCombinedPerformanceData();

  // Create platform comparison data
  const createPlatformComparisonData = () => {
    const comparisonData = [];

    // Check if Meta connections exist before including Meta data
    const hasMetaConnections = platformConnections?.result?.meta_connections && 
                                platformConnections.result.meta_connections.length > 0;
    const hasMetaData = metaOverallStats && 
                       metaOverallStats.result && 
                       metaOverallStats.result.overall_totals;
    const shouldIncludeMeta = hasMetaConnections && hasMetaData;

    // Add Meta data only if Meta connections exist and has actual data
    if (shouldIncludeMeta && metaStats) {
      comparisonData.push({
        name: t('integrations.metaAds'),
        impressions: metaStats.totalImpressions ?? 0,
        clicks: metaStats.totalClicks ?? 0,
        spend: metaStats.totalSpend ?? 0,
        ctr: (metaStats.averageCTR ?? 0) * 100
      });
    }

    // Add Google data only if Google connections exist and has actual data
    const hasGoogleConnections = platformConnections?.result?.google_accounts && 
                                 platformConnections.result.google_accounts.length > 0;
    if (hasGoogleConnections && googleOverallStats?.result?.summary) {
      const { summary } = googleOverallStats.result;
      comparisonData.push({
        name: t('integrations.googleAds'),
        impressions: summary.total_impressions ?? 0,
        clicks: summary.total_clicks ?? 0,
        spend: summary.total_cost ?? 0,
        ctr: (summary.average_ctr ?? 0) * 100
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Connection Banner - Show when no connections */}
      {/* {!hasConnections && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{t('dashboard.platformConnections')}</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              {t('dashboard.noConnections')} {t('dashboard.connectPlatform')}
            </p>
            <button
              onClick={handleConnectIntegrations}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors rtl:space-x-reverse"
            >
              <PlusIcon className="w-5 h-5" />
              <span>{t('dashboard.connectNow')}</span>
            </button>
          </div>
        </motion.div>
      )} */}

      {/* Dashboard Content - Only show when there are connections */}
      {hasConnections && (
        <>
          {/* Page Header */}
          {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rtl:flex-row-reverse">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('dashboard.analyticsDashboard')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {t('dashboard.overviewDescription')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 rtl:flex-row-reverse">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                  {metrics.activeIntegrations} {t('dashboard.active')}
                </span>
                {metrics.errorIntegrations > 0 && (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                    {metrics.errorIntegrations} {t('dashboard.errors')}
                  </span>
                )}
                <button
                  onClick={handleManualMetaDispatch}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                  {t('dashboard.testMetaAPI')}
                </button>
                <button
                  onClick={handleManualGoogleRefresh}
                  disabled={googleOverallStatsLoading}
                  className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('dashboard.refreshGoogleAdsData', 'Refresh Google Ads data')}
                >
                  {googleOverallStatsLoading ? (t('dashboard.refreshing', 'Refreshing...')) : (t('dashboard.refreshGoogle', 'Refresh Google'))}
                </button>
              </div>
            </div>
          </div> */}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title={t('dashboard.totalSpend')}
              value={new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: combinedTotals.currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(combinedTotals.totalSpend)}
              icon={CurrencyDollarIcon}
              color="green"
              dataSources={activeDataSources}
            />
            <StatCard
              title={t('dashboard.impressions')}
              value={formatNumber(combinedTotals.totalImpressions)}
              icon={EyeIcon}
              color="blue"
              dataSources={activeDataSources}
            />
            <StatCard
              title={t('dashboard.clicks')}
              value={formatNumber(combinedTotals.totalClicks)}
              icon={CursorArrowRaysIcon}
              color="purple"
              dataSources={activeDataSources}
            />
            <StatCard
              title={t('dashboard.ctr')}
              value={`${combinedTotals.totalImpressions > 0 ? ((combinedTotals.totalClicks / combinedTotals.totalImpressions) * 100).toFixed(2) : '0.00'}%`}
              icon={ChartBarIcon}
              color="orange"
              dataSources={activeDataSources}
            />
          </div>

          {/* Platform Connections */}
          <PlatformConnectionsCard connectionsData={platformConnections} />

          {/* Combined Performance Overview */}
          {(metaOverallStats || googleOverallStats) && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.performanceOverview')}</h2>

              {/* Combined Performance Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Platform Comparison Chart */}
                <ChartCard
                  title={t('dashboard.platformPerformanceComparison')}
                  subtitle={t('dashboard.platformComparisonSubtitle')}
                  data={platformComparisonData.map(platform => ({
                    name: platform.name,
                    value: platform.impressions
                  }))}
                  type="bar"
                  height={300}
                  noDataMessage={t('dashboard.noPlatformComparisonData')}
                />

                {/* Combined Metrics Chart */}
                <ChartCard
                  title={t('dashboard.combinedPerformanceMetrics')}
                  subtitle={t('dashboard.combinedMetricsSubtitle')}
                  data={combinedPerformanceData}
                  type="bar"
                  height={300}
                  noDataMessage={t('dashboard.noCombinedMetricsData')}
                />
              </div>
            </div>
          )}

          {/* Meta Advertising Stats */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.metaAdvertisingStats')}</h2>

            {metaLoading.overallStats && (
              <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ltr:ml-3 rtl:mr-3 text-gray-600 dark:text-gray-400">{t('dashboard.loadingMetaStats')}</span>
              </div>
            )}

            {metaErrors.overallStats && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center rtl:flex-row-reverse">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 ltr:mr-2 rtl:ml-2" />
                  <span className="text-red-700 dark:text-red-400 font-medium">{t('dashboard.errorLoadingMetaStats')}</span>
                </div>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                  {typeof metaErrors.overallStats === 'string' ? metaErrors.overallStats : t('dashboard.failedToFetchMetaData')}
                </p>
              </div>
            )}

            {metaOverallStats && metaOverallStats.result && !metaLoading.overallStats && !metaErrors.overallStats && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {metaStats?.totalAdAccounts ?? 0}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">{t('dashboard.totalAdAccounts')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {metaStats?.activeAdAccounts ?? 0} {t('dashboard.active')}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: metaOverallStats?.result?.primary_currency || metaOverallStats?.result?.overall_totals?.currency || 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(metaStats?.totalSpend ?? 0)}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">{t('dashboard.totalSpend')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(metaStats?.totalImpressions ?? 0)} {t('dashboard.impressions')}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatNumber(metaStats?.totalClicks ?? 0)}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">{t('dashboard.totalClicks')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(metaStats?.averageCTR ?? 0).toFixed(2)}% {t('dashboard.ctr')}
                    </div>
                  </div>
                </div>

                {/* Meta Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Performance Metrics Chart */}
                  <ChartCard
                    title={t('dashboard.metaPerformanceMetrics')}
                    subtitle={t('dashboard.keyPerformanceIndicators')}
                    data={metaChartData.performanceData}
                    type="bar"
                    height={300}
                    noDataMessage={t('dashboard.noPerformanceData')}
                  />

                  {/* Spend by Account Chart */}
                  <ChartCard
                    title={t('dashboard.spendByAdAccount')}
                    subtitle={t('dashboard.topAccountsBySpend')}
                    data={metaChartData.spendData}
                    type="bar"
                    height={300}
                    noDataMessage={t('dashboard.noSpendData')}
                  />

                  {/* Account Performance Chart */}
                  <ChartCard
                    title={t('dashboard.accountPerformance')}
                    subtitle={t('dashboard.impressionsByAccount')}
                    data={metaChartData.accountData}
                    type="bar"
                    height={300}
                    noDataMessage={t('dashboard.noAccountPerformanceData')}
                  />
                </div>

                {/* Ad Accounts List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.adAccounts')}</h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {(metaStats?.adAccounts ?? []).map((account, index) => (
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
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: account.currency || 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format(account.totals.spend)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatNumber(account.totals.impressions)} {t('dashboard.impressionsLabel')}
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
                <p>{t('dashboard.noMetaDataAvailable')}</p>
              </div>
            )}
          </div>

          {/* Google Advertising Stats */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.googleAdvertisingStats')}</h2>

            {/* Google Stats Cards */}
            {googleOverallStatsLoading && (
              <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ltr:ml-3 rtl:mr-3 text-gray-600 dark:text-gray-400">{t('dashboard.loadingGoogleStats')}</span>
              </div>
            )}

            {googleOverallStatsError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center rtl:flex-row-reverse">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 ltr:mr-2 rtl:ml-2" />
                  <span className="text-red-700 dark:text-red-400 font-medium">{t('dashboard.errorLoadingGoogleStats')}</span>
                </div>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                  {typeof googleOverallStatsError === 'string' ? googleOverallStatsError : t('dashboard.failedToFetchGoogleData')}
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
                    <div className="text-sm text-red-600 dark:text-red-400 font-medium">{t('dashboard.totalAdAccounts')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {googleOverallStats.result.summary?.valid_accounts || 0} {t('dashboard.active')}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: googleOverallStats.result.summary?.total_cost_currency || googleOverallStats.result.summary?.primary_currency || 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(googleOverallStats.result.summary?.total_cost || 0)}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">{t('dashboard.totalCost')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(googleOverallStats.result.summary?.total_impressions || 0)} {t('dashboard.impressions')}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatNumber(googleOverallStats.result.summary?.total_clicks || 0)}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">{t('dashboard.totalClicks')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(googleOverallStats.result.summary?.average_ctr || 0).toFixed(2)}% {t('dashboard.ctr')}
                    </div>
                  </div>
                </div>

                {/* Google Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Performance Metrics Chart */}
                  <ChartCard
                    title={t('dashboard.googlePerformanceMetrics')}
                    subtitle={t('dashboard.keyPerformanceIndicators')}
                    data={googleChartData.performanceData}
                    type="bar"
                    height={300}
                    noDataMessage={t('dashboard.noPerformanceData')}
                  />

                  {/* Spend by Account Chart */}
                  <ChartCard
                    title={t('dashboard.spendByAdAccount')}
                    subtitle={t('dashboard.topAccountsBySpend')}
                    data={googleChartData.spendData}
                    type="bar"
                    height={300}
                    noDataMessage={t('dashboard.noSpendData')}
                  />

                  {/* Account Performance Chart */}
                  <ChartCard
                    title={t('dashboard.accountPerformance')}
                    subtitle={t('dashboard.impressionsByAccount')}
                    data={googleChartData.accountData}
                    type="bar"
                    height={300}
                    noDataMessage={t('dashboard.noAccountPerformanceData')}
                  />
                </div>

                {/* Ad Accounts List */}
                {googleOverallStats.result.accounts && googleOverallStats.result.accounts.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.adAccounts')}</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {googleOverallStats.result.accounts.map((account, index) => (
                        <div key={account.customer_id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${!account.account_info?.is_test_account && (account.metrics?.impressions > 0 || account.metrics?.clicks > 0) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 dark:text-white truncate">
                                {account.account_info?.descriptive_name || t('dashboard.unknownAccount')}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {account.customer_id} • {account.account_info?.currency_code || account.metrics?.cost_currency || 'USD'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: account.metrics?.cost_currency || account.account_info?.currency_code || 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              }).format(account.metrics?.cost || 0)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatNumber(account.metrics?.impressions || 0)} {t('dashboard.impressionsLabel')}
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
                <p>{t('dashboard.noConnections')}</p>
              </div>
            )}
          </div>

          {/* Performance Metrics & Platform Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <div className="lg:col-span-2">
              <ChartCard title={t('dashboard.performanceMetrics')}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {ctr.toFixed(2)}%
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">{t('dashboard.ctr')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.clickThroughRate')}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {conversionRate.toFixed(2)}%
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">{t('dashboard.convRate')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.conversionRate')}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: combinedTotals.currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(cpa)}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">{t('dashboard.cpa')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.costPerAcquisition')}</div>
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Platform Status */}
            <ChartCard title={t('dashboard.platformStatus')}>
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
          <ChartCard title={t('dashboard.recentActivity')}>
            <div className="space-y-4">
              {recentActivity.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg rtl:flex-row-reverse"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1 rtl:space-x-reverse">
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
                  <div className="ltr:text-right rtl:text-left flex-shrink-0 ltr:ml-4 rtl:mr-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {integration.integrations.length} {t('dashboard.platforms')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('dashboard.updated')} {integration.updatedDate}
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