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
  const { integrations } = useIntegrations();

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
    if (!metaOverallStats || !metaOverallStats.result || !metaOverallStats.result.ad_accounts) {
      return null;
    }

    const { result } = metaOverallStats;
    const { ad_accounts, summary, conversion_totals } = result;

    // Only return stats if we have actual data
    if (!ad_accounts || ad_accounts.length === 0) {
      return null;
    }

    // Aggregate data from all accounts and their campaigns
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalConversions = 0;
    let totalCampaigns = 0;
    let totalBalance = 0;
    let totalROI = 0;
    let accountsWithROI = 0;

    ad_accounts.forEach(account => {
      // Account-level data
      if (account.insights) {
        totalImpressions += parseInt(account.insights.impressions) || 0;
        totalClicks += parseInt(account.insights.clicks) || 0;
        totalSpend += parseFloat(account.insights.spend) || 0;
      }
      
      if (account.conversion_totals) {
        totalConversions += parseInt(account.conversion_totals.conversions) || 0;
      }
      
      totalBalance += parseFloat(account.balance) || 0;
      totalCampaigns += account.campaigns_count || account.campaigns?.length || 0;
      
      if (account.roi) {
        totalROI += parseFloat(account.roi);
        accountsWithROI++;
      }
    });

    // Use summary if available, otherwise calculate from accounts
    const summaryData = summary || {};
    const conversionTotals = conversion_totals || {};

    // Calculate averages
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
    const averageCPC = totalClicks > 0 ? (totalSpend / totalClicks) : 0;
    const averageCPM = totalImpressions > 0 ? (totalSpend / totalImpressions * 1000) : 0;

    return {
      totalAdAccounts: summaryData.total_accounts || ad_accounts.length,
      activeAdAccounts: summaryData.active_accounts || 0,
      totalImpressions,
      totalClicks,
      totalSpend,
      totalConversions: conversionTotals.total_conversions || totalConversions,
      averageCTR: summaryData.insights?.ctr ? (summaryData.insights.ctr * 100) : averageCTR,
      averageCPC: summaryData.insights?.cpc || averageCPC,
      averageCPM: summaryData.insights?.cpm || averageCPM,
      totalBalance: summaryData.total_balance || totalBalance,
      totalCampaigns: summaryData.total_campaigns || totalCampaigns,
      averageROI: summaryData.average_roi || (accountsWithROI > 0 ? totalROI / accountsWithROI : 0),
      conversionTotals: conversionTotals,
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
                       metaOverallStats.result.ad_accounts &&
                       metaOverallStats.result.ad_accounts.length > 0;
    
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
                (shouldIncludeMeta && metaOverallStats?.result?.ad_accounts?.[0]?.currency) ??
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

  // Calculate efficiency metrics from combined totals
  const calculateEfficiencyMetrics = (totals) => {
    const {
      totalSpend,
      totalImpressions,
      totalClicks,
      totalConversions
    } = totals;

    // Cost per conversion (CPA) - already calculated above
    const costPerConversion = totalConversions > 0 ? (totalSpend / totalConversions) : 0;

    // Conversion efficiency rate (conversions / clicks * 100)
    const conversionEfficiencyRate = totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0;

    // Cost efficiency metrics
    const impressionsPerDollar = totalSpend > 0 ? (totalImpressions / totalSpend) : 0;
    const clicksPerDollar = totalSpend > 0 ? (totalClicks / totalSpend) : 0;

    // Performance efficiency score (composite metric 0-100)
    const ctrScore = Math.min((totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0) * 10, 100);
    const conversionScore = Math.min(conversionEfficiencyRate * 5, 50);
    const costEfficiencyScore = Math.min((clicksPerDollar / 10) * 50, 50);
    const efficiencyScore = ctrScore + conversionScore + costEfficiencyScore;

    return {
      costPerConversion,
      conversionEfficiencyRate,
      impressionsPerDollar,
      clicksPerDollar,
      efficiencyScore,
      ctrScore,
      conversionScore,
      costEfficiencyScore
    };
  };

  // Calculate efficiency metrics for combined, Meta, and Google
  const combinedEfficiencyMetrics = calculateEfficiencyMetrics(combinedTotals);
  
  // Calculate Meta efficiency metrics
  const metaEfficiencyMetrics = metaStats ? calculateEfficiencyMetrics({
    totalSpend: metaStats.totalSpend,
    totalImpressions: metaStats.totalImpressions,
    totalClicks: metaStats.totalClicks,
    totalConversions: metaStats.totalConversions
  }) : null;

  // Calculate Google efficiency metrics
  const googleEfficiencyMetrics = googleOverallStats?.result?.summary ? calculateEfficiencyMetrics({
    totalSpend: googleOverallStats.result.summary.total_cost || 0,
    totalImpressions: googleOverallStats.result.summary.total_impressions || 0,
    totalClicks: googleOverallStats.result.summary.total_clicks || 0,
    totalConversions: googleOverallStats.result.summary.total_conversions || 0
  }) : null;

  // Calculate additional marketing KPIs
  const calculateMarketingKPIs = () => {
    // Meta-specific data
    let totalReach = 0;
    let totalFrequency = 0;
    let totalRevenue = 0;
    let totalPurchaseValue = 0;
    let totalVideoViews = 0;
    let totalEngagements = 0;
    let totalCarts = 0;
    let totalCheckouts = 0;
    let accountsWithReach = 0;
    let accountsWithFrequency = 0;

    if (metaStats?.adAccounts) {
      metaStats.adAccounts.forEach(account => {
        if (account.insights) {
          if (account.insights.reach) {
            totalReach += parseInt(account.insights.reach) || 0;
            accountsWithReach++;
          }
          if (account.insights.frequency) {
            totalFrequency += parseFloat(account.insights.frequency) || 0;
            accountsWithFrequency++;
          }
          
          // Calculate total engagements from actions
          if (account.insights.actions) {
            account.insights.actions.forEach(action => {
              const value = parseInt(action.value) || 0;
              if (action.action_type === 'page_engagement' || action.action_type === 'post_engagement') {
                totalEngagements += value;
              }
              if (action.action_type === 'video_view') {
                totalVideoViews += value;
              }
              if (action.action_type === 'add_to_cart' || action.action_type === 'omni_add_to_cart') {
                totalCarts += value;
              }
              if (action.action_type === 'initiate_checkout' || action.action_type === 'omni_initiated_checkout') {
                totalCheckouts += value;
              }
            });
          }
        }
        
        // Get revenue from conversion totals
        if (account.conversion_totals) {
          totalPurchaseValue += parseFloat(account.conversion_totals.purchase_value) || 0;
        }
      });
    }

    // Get Meta conversion totals from summary if available
    const metaConversionTotals = metaOverallStats?.result?.conversion_totals;
    if (metaConversionTotals) {
      totalPurchaseValue += parseFloat(metaConversionTotals.total_purchase_value) || 0;
    }

    totalRevenue = totalPurchaseValue;

    // Calculate combined metrics
    const avgReach = accountsWithReach > 0 ? totalReach / accountsWithReach : 0;
    const avgFrequency = accountsWithFrequency > 0 ? totalFrequency / accountsWithFrequency : 0;
    const totalReachFromMeta = totalReach;

    // Google-specific data
    const googleReach = 0; // Google doesn't provide reach directly in overall stats
    
    const combinedReach = totalReachFromMeta + googleReach;
    const combinedRevenue = totalRevenue; // Only Meta provides revenue currently

    // Calculate KPIs
    const roas = combinedTotals.totalSpend > 0 ? (combinedRevenue / combinedTotals.totalSpend) : 0;
    const roiPercentage = combinedTotals.totalSpend > 0 ? ((combinedRevenue - combinedTotals.totalSpend) / combinedTotals.totalSpend * 100) : 0;
    const averageOrderValue = combinedTotals.totalConversions > 0 ? (combinedRevenue / combinedTotals.totalConversions) : 0;
    const costPerReach = combinedReach > 0 ? (combinedTotals.totalSpend / combinedReach) : 0;
    const reachRate = combinedTotals.totalImpressions > 0 ? (combinedReach / combinedTotals.totalImpressions * 100) : 0;
    const engagementRate = combinedTotals.totalImpressions > 0 ? (totalEngagements / combinedTotals.totalImpressions * 100) : 0;
    const videoViewRate = totalVideoViews > 0 ? (totalVideoViews / combinedTotals.totalImpressions * 100) : 0;
    const cartToViewRate = combinedTotals.totalClicks > 0 ? (totalCarts / combinedTotals.totalClicks * 100) : 0;
    const checkoutToCartRate = totalCarts > 0 ? (totalCheckouts / totalCarts * 100) : 0;
    const purchaseToCheckoutRate = totalCheckouts > 0 ? (combinedTotals.totalConversions / totalCheckouts * 100) : 0;
    const engagementsPerDollar = combinedTotals.totalSpend > 0 ? (totalEngagements / combinedTotals.totalSpend) : 0;
    const videoViewsPerDollar = combinedTotals.totalSpend > 0 ? (totalVideoViews / combinedTotals.totalSpend) : 0;
    const revenuePerClick = combinedTotals.totalClicks > 0 ? (combinedRevenue / combinedTotals.totalClicks) : 0;
    const revenuePerImpression = combinedTotals.totalImpressions > 0 ? (combinedRevenue / combinedTotals.totalImpressions) : 0;

    return {
      // ROI & Revenue Metrics
      roas,
      roiPercentage,
      totalRevenue: combinedRevenue,
      averageOrderValue,
      revenuePerClick,
      revenuePerImpression,
      
      // Reach & Frequency Metrics
      totalReach: combinedReach,
      averageReach: avgReach,
      averageFrequency: avgFrequency,
      costPerReach,
      reachRate,
      
      // Engagement Metrics
      totalEngagements,
      engagementRate,
      engagementsPerDollar,
      
      // Video Metrics
      totalVideoViews,
      videoViewRate,
      videoViewsPerDollar,
      
      // Funnel Metrics
      totalCarts,
      totalCheckouts,
      cartToViewRate,
      checkoutToCartRate,
      purchaseToCheckoutRate,
      
      // Additional Efficiency Metrics
      impressionsToReach: combinedReach > 0 ? (combinedTotals.totalImpressions / combinedReach) : 0,
      uniqueClickRate: combinedReach > 0 ? (combinedTotals.totalClicks / combinedReach * 100) : 0,
    };
  };

  const marketingKPIs = calculateMarketingKPIs();

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
    const { ad_accounts } = result;

    // Aggregate data from accounts
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalConversions = 0;

    (ad_accounts ?? []).forEach(account => {
      if (account.insights) {
        totalImpressions += parseInt(account.insights.impressions) || 0;
        totalClicks += parseInt(account.insights.clicks) || 0;
        totalSpend += parseFloat(account.insights.spend) || 0;
      }
      if (account.conversion_totals) {
        totalConversions += parseInt(account.conversion_totals.conversions) || 0;
      }
    });

    // Calculate averages
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
    const cpc = totalClicks > 0 ? (totalSpend / totalClicks) : 0;
    const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions * 1000) : 0;

    // Performance metrics chart data - only include if value exists
    const performanceData = [
      { name: t('dashboard.impressions'), value: totalImpressions },
      { name: t('dashboard.clicks'), value: totalClicks },
      { name: t('dashboard.conversions'), value: totalConversions },
      { name: t('dashboard.ctr'), value: ctr },
      { name: t('dashboard.cpc'), value: cpc },
      { name: t('dashboard.cpm'), value: cpm }
    ].filter(item => item.value > 0); // Only show metrics with actual data

    // Spend by account chart data - only include accounts with data
    const spendData = (ad_accounts ?? [])
      .filter(account => account.insights?.spend > 0)
      .map(account => ({
        name: account.account_name ?? `Account ${account.account_id}`,
        value: parseFloat(account.insights.spend) || 0
      }))
      .slice(0, 10); // Limit to top 10 accounts

    // Account performance chart data - only include accounts with data
    const accountData = (ad_accounts ?? [])
      .filter(account => account.insights?.impressions > 0)
      .map(account => ({
        name: account.account_name ?? `Account ${account.account_id}`,
        value: parseInt(account.insights.impressions) || 0
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
                       metaOverallStats.result.ad_accounts &&
                       metaOverallStats.result.ad_accounts.length > 0;
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
                       metaOverallStats.result.ad_accounts &&
                       metaOverallStats.result.ad_accounts.length > 0;
    const shouldIncludeMeta = hasMetaConnections && hasMetaData;

    // Add Meta data only if Meta connections exist and has actual data
    if (shouldIncludeMeta && metaStats) {
      comparisonData.push({
        name: t('integrations.metaAds'),
        impressions: metaStats.totalImpressions ?? 0,
        clicks: metaStats.totalClicks ?? 0,
        spend: metaStats.totalSpend ?? 0,
        ctr: metaStats.averageCTR ?? 0
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

  if (dashboardLoading.platformConnections) {
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
                  data={platformComparisonData.length > 0 ? platformComparisonData.map(platform => ({
                    name: platform.name,
                    value: platform.impressions
                  })) : []}
                  type="bar"
                  height={300}
                  noDataMessage={t('dashboard.noPlatformComparisonData')}
                />

                {/* Combined Metrics Chart */}
                <ChartCard
                  title={t('dashboard.combinedPerformanceMetrics')}
                  subtitle={t('dashboard.combinedMetricsSubtitle')}
                  data={combinedPerformanceData.length > 0 ? combinedPerformanceData : []}
                  type="bar"
                  height={300}
                  noDataMessage={t('dashboard.noCombinedMetricsData')}
                />
              </div>
            </div>
          )}

          {/* Performance Metrics & Platform Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <div className="lg:col-span-2">
              <ChartCard 
                title={t('dashboard.performanceMetrics')}
                data={[{ name: 'metrics', value: 1 }]}
              >
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
            <ChartCard 
              title={t('dashboard.platformStatus')}
              data={platformBreakdown.length > 0 ? platformBreakdown.map(p => ({ name: p.name, value: p.count })) : []}
            >
              <div className="space-y-3">
                {platformBreakdown.length > 0 ? (
                  platformBreakdown.map((platform, index) => (
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
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">{t('common.noDataAvailable')}</p>
                  </div>
                )}
              </div>
            </ChartCard>
          </div>

          {/* Marketing KPIs Section */}
          {(combinedTotals.totalSpend > 0 || marketingKPIs.totalRevenue > 0) && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Marketing KPIs</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* ROAS */}
                {marketingKPIs.roas > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">ROAS</h3>
                      <ChartBarIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {marketingKPIs.roas.toFixed(2)}x
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Return on Ad Spend</p>
                  </div>
                )}

                {/* ROI Percentage */}
                {marketingKPIs.roiPercentage !== 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">ROI</h3>
                      <ChartBarIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <div className={`text-3xl font-bold ${marketingKPIs.roiPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {marketingKPIs.roiPercentage.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Return on Investment</p>
                  </div>
                )}

                {/* Average Order Value */}
                {marketingKPIs.averageOrderValue > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">AOV</h3>
                      <CurrencyDollarIcon className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: combinedTotals.currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(marketingKPIs.averageOrderValue)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Average Order Value</p>
                  </div>
                )}

                {/* Total Revenue */}
                {marketingKPIs.totalRevenue > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</h3>
                      <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: combinedTotals.currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(marketingKPIs.totalRevenue)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Revenue Generated</p>
                  </div>
                )}

                {/* Reach */}
                {marketingKPIs.totalReach > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Reach</h3>
                      <EyeIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(marketingKPIs.totalReach)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Avg Frequency: {marketingKPIs.averageFrequency.toFixed(2)}x
                    </p>
                  </div>
                )}

                {/* Engagement Rate */}
                {marketingKPIs.engagementRate > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement</h3>
                      <CursorArrowRaysIcon className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {marketingKPIs.engagementRate.toFixed(2)}%
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatNumber(marketingKPIs.totalEngagements)} total engagements
                    </p>
                  </div>
                )}

                {/* Cost Per Reach */}
                {marketingKPIs.costPerReach > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">CPR</h3>
                      <CurrencyDollarIcon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: combinedTotals.currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4
                      }).format(marketingKPIs.costPerReach)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cost Per Reach</p>
                  </div>
                )}

                {/* Revenue Per Click */}
                {marketingKPIs.revenuePerClick > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">RPC</h3>
                      <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: combinedTotals.currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(marketingKPIs.revenuePerClick)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Revenue Per Click</p>
                  </div>
                )}
              </div>

              {/* Funnel Metrics */}
              {(marketingKPIs.totalCarts > 0 || marketingKPIs.totalCheckouts > 0) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversion Funnel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatNumber(combinedTotals.totalClicks)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Clicks</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">100%</div>
                    </div>
                    {marketingKPIs.totalCarts > 0 && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {formatNumber(marketingKPIs.totalCarts)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add to Cart</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {marketingKPIs.cartToViewRate.toFixed(1)}%
                        </div>
                      </div>
                    )}
                    {marketingKPIs.totalCheckouts > 0 && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {formatNumber(marketingKPIs.totalCheckouts)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Checkouts</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {marketingKPIs.checkoutToCartRate.toFixed(1)}%
                        </div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatNumber(combinedTotals.totalConversions)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Purchases</div>
                      {marketingKPIs.totalCheckouts > 0 && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {marketingKPIs.purchaseToCheckoutRate.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Efficiency Metrics Section */}
          {combinedTotals.totalSpend > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Efficiency Metrics</h2>
              
              {/* Combined Efficiency Metrics */}
              {combinedTotals.totalSpend > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    Overall Efficiency Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: combinedTotals.currency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(combinedEfficiencyMetrics.costPerConversion)}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Cost per Conversion</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {combinedEfficiencyMetrics.conversionEfficiencyRate.toFixed(2)}%
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">Conversion Efficiency</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatNumber(combinedEfficiencyMetrics.impressionsPerDollar.toFixed(0))}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Impressions per $</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {combinedEfficiencyMetrics.clicksPerDollar.toFixed(2)}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">Clicks per $</div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {combinedEfficiencyMetrics.efficiencyScore.toFixed(0)}/100
                      </div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">Efficiency Score</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform-Specific Efficiency Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Meta Efficiency Metrics */}
                {metaEfficiencyMetrics && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <CheckCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Meta Ads Efficiency
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Cost per Conversion</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: metaOverallStats?.result?.ad_accounts?.[0]?.currency || 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(metaEfficiencyMetrics.costPerConversion)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Efficiency</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {metaEfficiencyMetrics.conversionEfficiencyRate.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Impressions per $</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatNumber(metaEfficiencyMetrics.impressionsPerDollar.toFixed(0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Clicks per $</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {metaEfficiencyMetrics.clicksPerDollar.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Efficiency Score</span>
                        <span className="font-bold text-blue-700 dark:text-blue-300">
                          {metaEfficiencyMetrics.efficiencyScore.toFixed(0)}/100
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Google Efficiency Metrics */}
                {googleEfficiencyMetrics && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <CheckCircleIcon className="w-5 h-5 mr-2 text-red-600" />
                      Google Ads Efficiency
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Cost per Conversion</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: googleOverallStats?.result?.summary?.total_cost_currency || googleOverallStats?.result?.summary?.primary_currency || 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(googleEfficiencyMetrics.costPerConversion)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Efficiency</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {googleEfficiencyMetrics.conversionEfficiencyRate.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Impressions per $</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatNumber(googleEfficiencyMetrics.impressionsPerDollar.toFixed(0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Clicks per $</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {googleEfficiencyMetrics.clicksPerDollar.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                        <span className="text-sm text-red-600 dark:text-red-400 font-medium">Efficiency Score</span>
                        <span className="font-bold text-red-700 dark:text-red-300">
                          {googleEfficiencyMetrics.efficiencyScore.toFixed(0)}/100
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Efficiency Metrics Section */}
          {(combinedTotals.totalSpend > 0 || metaEfficiencyMetrics || googleEfficiencyMetrics) && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Efficiency Metrics</h2>
              
              {/* Combined Efficiency Metrics */}
              {combinedTotals.totalSpend > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    Overall Efficiency Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: combinedTotals.currency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(combinedEfficiencyMetrics.costPerConversion)}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Cost per Conversion</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {combinedEfficiencyMetrics.conversionEfficiencyRate.toFixed(2)}%
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">Conversion Efficiency</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatNumber(combinedEfficiencyMetrics.impressionsPerDollar.toFixed(0))}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Impressions per $</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {combinedEfficiencyMetrics.clicksPerDollar.toFixed(2)}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">Clicks per $</div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {combinedEfficiencyMetrics.efficiencyScore.toFixed(0)}/100
                      </div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">Efficiency Score</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform-Specific Efficiency Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Meta Efficiency Metrics */}
                {metaEfficiencyMetrics && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <CheckCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Meta Ads Efficiency
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Cost per Conversion</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: metaOverallStats?.result?.ad_accounts?.[0]?.currency || 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(metaEfficiencyMetrics.costPerConversion)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Efficiency</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {metaEfficiencyMetrics.conversionEfficiencyRate.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Impressions per $</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatNumber(metaEfficiencyMetrics.impressionsPerDollar.toFixed(0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Clicks per $</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {metaEfficiencyMetrics.clicksPerDollar.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Efficiency Score</span>
                        <span className="font-bold text-blue-700 dark:text-blue-300">
                          {metaEfficiencyMetrics.efficiencyScore.toFixed(0)}/100
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Google Efficiency Metrics */}
                {googleEfficiencyMetrics && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <CheckCircleIcon className="w-5 h-5 mr-2 text-red-600" />
                      Google Ads Efficiency
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Cost per Conversion</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: googleOverallStats?.result?.summary?.total_cost_currency || googleOverallStats?.result?.summary?.primary_currency || 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(googleEfficiencyMetrics.costPerConversion)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Efficiency</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {googleEfficiencyMetrics.conversionEfficiencyRate.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Impressions per $</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatNumber(googleEfficiencyMetrics.impressionsPerDollar.toFixed(0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Clicks per $</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {googleEfficiencyMetrics.clicksPerDollar.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                        <span className="text-sm text-red-600 dark:text-red-400 font-medium">Efficiency Score</span>
                        <span className="font-bold text-red-700 dark:text-red-300">
                          {googleEfficiencyMetrics.efficiencyScore.toFixed(0)}/100
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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