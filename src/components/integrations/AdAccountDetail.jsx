import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
  BuildingStorefrontIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  GlobeAltIcon,
  CreditCardIcon,
  CogIcon,
  PlayIcon,
  UsersIcon,
  FireIcon,
  ShieldCheckIcon,
  ChartPieIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { 
  selectMetaUserAdAccounts,
  selectMetaAccountOverviewGraph,
  selectMetaAccountOverviewGraphLoading,
  selectMetaAccountOverviewGraphError,
  fetchMetaAccountOverviewGraph,
  fetchMetaUserAdAccounts
} from '../../store/slices/metaSlice';
import { selectPlatformConnections } from '../../store/slices/dashboardSlice';


/**
 * AdAccountDetail Component
 * 
 * Expected API Response Structure from /api/meta/account-overview-graph/{accountId}/
 * 
 * {
 *   "result": {
 *     "insights": {
 *       "data": [{
 *         "spend": "1234.56",
 *         "impressions": "10000",
 *         "clicks": "500",
 *         "ctr": "5.0",
 *         "reach": "8000",
 *         "cpc": "2.47",
 *         "cpm": "123.46",
 *         "conversions": "25",
 *         "frequency": "1.25",
 *         "account_currency": "USD",
 *         "video_play_actions": {
 *           "video_view": "100"
 *         }
 *       }]
 *     },
 *     "summary": {
 *       "total_spend": "1234.56",
 *       "total_impressions": "10000",
 *       "total_clicks": "500",
 *       "average_ctr": "5.0",
 *       "total_reach": "8000",
 *       "average_cpc": "2.47",
 *       "average_cpm": "123.46",
 *       "total_conversions": "25"
 *     },
 *     "statistics": {
 *       "performance_metrics": {
 *         "ctr": 5.0,
 *         "cpc": 2.47,
 *         "cpm": 123.46,
 *         "frequency": 1.25
 *       },
 *       "account_health": {
 *         "campaign_activity_rate": 85.5,
 *         "adset_activity_rate": 75.2,
 *         "ad_activity_rate": 90.1,
 *         "overall_activity_rate": 83.6
 *       },
 *       "roi_metrics": {
 *         "spend_efficiency": 92.3,
 *         "reach_efficiency": 88.7,
 *         "social_spend_ratio": 15.2,
 *         "outbound_engagement_rate": 4.8
 *       }
 *     },
 *     "campaigns": {
 *       "data": [{
 *         "id": "123456789",
 *         "name": "Campaign Name",
 *         "status": "ACTIVE",
 *         "effective_status": "ACTIVE",
 *         "created_time": "2023-01-01T00:00:00Z"
 *       }]
 *     },
 *     "account_info": {
 *       "name": "Account Name",
 *       "id": "act_123456789",
 *       "currency": "USD",
 *       "status": "ACTIVE"
 *     },
 *     "date_range": {
 *       "date_from": "2023-01-01",
 *       "date_to": "2023-12-31"
 *     },
 *     "source": "Meta API"
 *   }
 * }
 */

const AdAccountDetail = () => {
  const { t } = useTranslation();
  const { accountId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const metaUserAdAccounts = useSelector(selectMetaUserAdAccounts);
  const graphData = useSelector(state => accountId ? selectMetaAccountOverviewGraph(state, accountId) : null);
  const loading = useSelector(state => accountId ? selectMetaAccountOverviewGraphLoading(state, accountId) : false);
  const error = useSelector(state => accountId ? selectMetaAccountOverviewGraphError(state, accountId) : null);
  const accountsLoading = useSelector(state => state.meta?.loading?.userAdAccounts || false);
  const platformConnections = useSelector(selectPlatformConnections);
  
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
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
    const [dateRange, setDateRange] = useState(() => ({
    date_from: '2023-01-01',
    date_to: new Date().toISOString().split('T')[0]
  }));
  
  // Track if we've already fetched data for this account and date range
  const fetchedRef = useRef(new Set());
  
  // Only fetch user ad accounts if not already loaded
  useEffect(() => {
    if (!metaUserAdAccounts && accountId) {
      dispatch(fetchMetaUserAdAccounts());
    }
  }, [metaUserAdAccounts, accountId, dispatch]);
  
  // Fetch data when component mounts or date range changes
  useEffect(() => {
    if (accountId) {
      const fetchKey = `${accountId}-${dateRange.date_from}-${dateRange.date_to}`;
      if (!fetchedRef.current.has(fetchKey)) {
        fetchedRef.current.add(fetchKey);
        dispatch(fetchMetaAccountOverviewGraph({ accountId, dateRange }));
      }
    }
  }, [accountId, dateRange, dispatch]);

  // Find the specific ad account
  const account = metaUserAdAccounts?.result?.accounts?.find(acc => acc.id === accountId);

  // Simple refresh function
  const handleRefresh = () => {
    if (!accountId) return;
    const fetchKey = `${accountId}-${dateRange.date_from}-${dateRange.date_to}`;
    fetchedRef.current.delete(fetchKey);
    dispatch(fetchMetaAccountOverviewGraph({ accountId, dateRange }));
  };

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

  // Handle date range changes
  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
      default:
        startDate.setDate(today.getDate() - 7);
    }
    
    setDateRange({
      date_from: startDate.toISOString().split('T')[0],
      date_to: today.toISOString().split('T')[0]
    });
  };

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

  // Get status info
  const getStatusInfo = (status) => {
    if (status === 1 || status === 'ACTIVE') {
      return {
        text: t('integrations.active'),
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        iconColor: 'text-green-500'
      };
    } else if (status === 3) {
      return {
        text: t('integrations.active'),
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        iconColor: 'text-green-500'
      };
    } else {
      return {
        text: t('integrations.inactive'),
        color: 'text-gray-500 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        iconColor: 'text-gray-400'
      };
    }
  };

  // Data structure validation function
  const validateApiResponse = (data) => {
    const validation = {
      hasResult: !!data?.result,
      hasInsights: !!data?.result?.insights?.data,
      hasSummary: !!data?.result?.summary,
      hasStatistics: !!data?.result?.statistics,
      hasCampaigns: !!data?.result?.campaigns?.data,
      hasAccountInfo: !!data?.result?.account_info,
      insightsDataLength: data?.result?.insights?.data?.length || 0,
      campaignsDataLength: data?.result?.campaigns?.data?.length || 0,
      hasValidInsights: data?.result?.insights?.data?.[0]?.spend !== undefined,
      hasValidSummary: data?.result?.summary?.total_spend !== undefined
    };
    
    return validation;
  };

  // Enhanced data extraction
  const enhancedDataExtraction = useMemo(() => {
    // Extract data from API response with enhanced mapping
    const extractedApiData = graphData?.result || graphData; // Handle both full response and result-only storage
    
    // Enhanced data extraction with fallbacks
    const extractedInsights = extractedApiData?.insights?.data?.[0] || extractedApiData?.insights?.[0] || null;
    const extractedSummary = extractedApiData?.summary || {};
    const extractedStatistics = extractedApiData?.statistics || {};
    const extractedCampaigns = extractedApiData?.campaigns?.data || extractedApiData?.campaigns || [];
    const extractedAdsets = extractedApiData?.adsets?.data || extractedApiData?.adsets || [];
    const extractedAds = extractedApiData?.ads?.data || extractedApiData?.ads || [];
    const extractedAccountInfo = extractedApiData?.account_info || extractedApiData?.account || {};
    
    // Enhanced metrics extraction with proper fallbacks and validation
    const extractedMetrics = {
      // Basic metrics
      spend: parseFloat(extractedInsights?.spend) || parseFloat(extractedSummary?.total_spend) || 0,
      impressions: parseInt(extractedInsights?.impressions) || parseInt(extractedSummary?.total_impressions) || 0,
      clicks: parseInt(extractedInsights?.clicks) || parseInt(extractedSummary?.total_clicks) || 0,
      ctr: parseFloat(extractedInsights?.ctr) || parseFloat(extractedSummary?.average_ctr) || 0,
      reach: parseInt(extractedInsights?.reach) || parseInt(extractedSummary?.total_reach) || 0,
      cpc: parseFloat(extractedInsights?.cpc) || parseFloat(extractedSummary?.average_cpc) || 0,
      cpm: parseFloat(extractedInsights?.cpm) || parseFloat(extractedSummary?.average_cpm) || 0,
      conversions: parseInt(extractedInsights?.conversions) || parseInt(extractedSummary?.total_conversions) || 0,
      frequency: parseFloat(extractedInsights?.frequency) || 0,
      currency: extractedInsights?.account_currency || extractedAccountInfo?.currency || account?.currency || 'USD',
      
      // Video metrics
      video_plays: parseInt(extractedInsights?.video_play_actions?.video_view) || 0,
      video_30_sec_watched: parseInt(extractedInsights?.video_30_sec_watched_actions?.video_view) || 0,
      video_p25_watched: parseInt(extractedInsights?.video_p25_watched_actions?.video_view) || 0,
      video_p50_watched: parseInt(extractedInsights?.video_p50_watched_actions?.video_view) || 0,
      video_p75_watched: parseInt(extractedInsights?.video_p75_watched_actions?.video_view) || 0,
      video_p95_watched: parseInt(extractedInsights?.video_p95_watched_actions?.video_view) || 0,
      video_p100_watched: parseInt(extractedInsights?.video_p100_watched_actions?.video_view) || 0,
      video_avg_time_watched: parseInt(extractedInsights?.video_avg_time_watched_actions?.video_view) || 0,
      
      // Outbound clicks
      outbound_clicks: parseInt(extractedInsights?.outbound_clicks?.outbound_click) || 0,
      outbound_clicks_ctr: parseFloat(extractedInsights?.outbound_clicks_ctr?.outbound_click) || 0,
      
      // Social spend
      social_spend: parseFloat(extractedInsights?.social_spend) || 0,
      
      // Actions and conversions
      actions: extractedInsights?.actions || {},
      action_values: extractedInsights?.action_values || {},
      
      // Website metrics
      website_ctr: parseFloat(extractedInsights?.website_ctr?.link_click) || 0,
      website_purchase_roas: parseFloat(extractedInsights?.website_purchase_roas?.['offsite_conversion.fb_pixel_purchase']) || 0,
      
      // Attribution
      attribution_setting: extractedInsights?.attribution_setting || '',
      cost_per_unique_click: parseFloat(extractedInsights?.cost_per_unique_click) || 0,
      cpp: parseFloat(extractedInsights?.cpp) || 0,
      
      // Marketing messages
      marketing_messages_click_rate_benchmark: parseFloat(extractedInsights?.marketing_messages_click_rate_benchmark) || 0
    };
    
    // Enhanced statistics mapping with validation
    const extractedEnhancedStatistics = {
      performance_metrics: {
        ctr: extractedStatistics?.performance_metrics?.ctr || extractedMetrics.ctr,
        cpc: extractedStatistics?.performance_metrics?.cpc || extractedMetrics.cpc,
        cpm: extractedStatistics?.performance_metrics?.cpm || extractedMetrics.cpm,
        frequency: extractedStatistics?.performance_metrics?.frequency || extractedMetrics.frequency,
        outbound_clicks_ctr: extractedStatistics?.performance_metrics?.outbound_clicks_ctr || extractedMetrics.outbound_clicks_ctr,
        video_engagement_rate: extractedStatistics?.performance_metrics?.video_engagement_rate || 0
      },
      account_health: {
        campaign_activity_rate: extractedStatistics?.account_health?.campaign_activity_rate || 0,
        adset_activity_rate: extractedStatistics?.account_health?.adset_activity_rate || 0,
        ad_activity_rate: extractedStatistics?.account_health?.ad_activity_rate || 0,
        overall_activity_rate: extractedStatistics?.account_health?.overall_activity_rate || 0
      },
      budget_analysis: {
        total_budget_allocated: extractedStatistics?.budget_analysis?.total_budget_allocated || 0,
        budget_utilization: extractedStatistics?.budget_analysis?.budget_utilization || 0,
        average_spend_per_campaign: extractedStatistics?.budget_analysis?.average_spend_per_campaign || 0,
        average_spend_per_adset: extractedStatistics?.budget_analysis?.average_spend_per_adset || 0,
        average_spend_per_ad: extractedStatistics?.budget_analysis?.average_spend_per_ad || 0
      },
      roi_metrics: {
        spend_efficiency: extractedStatistics?.roi_metrics?.spend_efficiency || 0,
        reach_efficiency: extractedStatistics?.roi_metrics?.reach_efficiency || 0,
        social_spend_ratio: extractedStatistics?.roi_metrics?.social_spend_ratio || 0,
        outbound_engagement_rate: extractedStatistics?.roi_metrics?.outbound_engagement_rate || 0
      },
      account_overview: {
        total_entities: extractedStatistics?.account_overview?.total_entities || 0,
        active_entities: extractedStatistics?.account_overview?.active_entities || 0,
        spend_efficiency: extractedStatistics?.account_overview?.spend_efficiency || 0,
        impression_efficiency: extractedStatistics?.account_overview?.impression_efficiency || 0
      }
    };
    
    // Enhanced account information with validation
    const extractedEnhancedAccountInfo = {
      name: extractedAccountInfo?.name || account?.name || 'Unknown Account',
      id: extractedAccountInfo?.id || account?.account_id || accountId,
      currency: extractedAccountInfo?.currency || account?.currency || 'USD',
      status: extractedAccountInfo?.status || account?.account_status,
      balance: parseFloat(account?.balance) || 0,
      age: account?.age || 0,
      date_range: extractedApiData?.date_range || {
        date_from: dateRange.date_from,
        date_to: dateRange.date_to
      },
      source: extractedApiData?.source || 'Meta API'
    };
    
    // Validate the current API response
    const extractedApiValidation = validateApiResponse(graphData);
    
    // Data validation and error handling with enhanced checks
    const extractedHasValidData = extractedApiData && (extractedInsights || extractedSummary || extractedCampaigns.length > 0);
    const extractedHasMetrics = extractedMetrics.spend > 0 || extractedMetrics.impressions > 0 || extractedMetrics.clicks > 0;
    
    return {
      apiData: extractedApiData,
      insights: extractedInsights,
      summary: extractedSummary,
      statistics: extractedStatistics,
      campaigns: extractedCampaigns,
      adsets: extractedAdsets,
      ads: extractedAds,
      accountInfo: extractedAccountInfo,
      metrics: extractedMetrics,
      enhancedStatistics: extractedEnhancedStatistics,
      enhancedAccountInfo: extractedEnhancedAccountInfo,
      hasValidData: extractedHasValidData,
      hasMetrics: extractedHasMetrics,
      apiValidation: extractedApiValidation
    };
  }, [graphData, account, accountId, dateRange]);

  // Extract variables from enhanced data extraction
  const {
    campaigns,
    metrics,
    enhancedStatistics,
    enhancedAccountInfo,
    hasValidData
  } = enhancedDataExtraction;

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!hasValidData) return {};

    // Performance metrics chart data
    const performanceData = [
      { name: t('common.ctr'), value: metrics.ctr, target: 2.0 },
      { name: t('common.cpc'), value: metrics.cpc, target: 3.0 },
      { name: t('common.cpm'), value: metrics.cpm, target: 50.0 },
      { name: t('integrations.frequency'), value: metrics.frequency, target: 1.5 }
    ];

    // Video engagement chart data
    const videoData = [
      { name: t('integrations.videoPlays'), value: metrics.video_plays },
      { name: t('integrations.video30SecWatched'), value: metrics.video_30_sec_watched },
      { name: t('integrations.videoP25Watched'), value: metrics.video_p25_watched },
      { name: '50% Watched', value: metrics.video_p50_watched },
      { name: '75% Watched', value: metrics.video_p75_watched },
      { name: '95% Watched', value: metrics.video_p95_watched },
      { name: '100% Watched', value: metrics.video_p100_watched }
    ];

    // Actions breakdown chart data
    const actionsData = Object.entries(metrics.actions || {}).map(([key, value]) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: parseInt(value) || 0
    })).filter(item => item.value > 0).slice(0, 10);

    // Action values chart data
    const actionValuesData = Object.entries(metrics.action_values || {}).map(([key, value]) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: parseFloat(value) || 0
    })).filter(item => item.value > 0).slice(0, 10);

    // Campaign status distribution
    const campaignStatusData = [
      { name: t('integrations.active'), value: campaigns.filter(c => c.status === 'ACTIVE').length, color: '#10B981' },
      { name: t('integrations.paused'), value: campaigns.filter(c => c.status === 'PAUSED').length, color: '#F59E0B' },
      { name: t('integrations.inactive'), value: campaigns.filter(c => !['ACTIVE', 'PAUSED'].includes(c.status)).length, color: '#EF4444' }
    ];

    // Account health pie chart
    const accountHealthData = [
      { name: t('integrations.campaignActivity'), value: enhancedStatistics.account_health.campaign_activity_rate, color: '#3B82F6' },
      { name: t('integrations.adsetActivity'), value: enhancedStatistics.account_health.adset_activity_rate, color: '#10B981' },
      { name: t('integrations.adActivity'), value: enhancedStatistics.account_health.ad_activity_rate, color: '#F59E0B' },
      { name: t('integrations.overallActivity'), value: enhancedStatistics.account_health.overall_activity_rate, color: '#8B5CF6' }
    ];

    // ROI metrics chart
    const roiData = [
      { name: t('integrations.spendEfficiency'), value: enhancedStatistics.roi_metrics.spend_efficiency },
      { name: t('integrations.reachEfficiency'), value: enhancedStatistics.roi_metrics.reach_efficiency },
      { name: t('integrations.socialSpendRatio'), value: enhancedStatistics.roi_metrics.social_spend_ratio },
      { name: t('integrations.outboundEngagement'), value: enhancedStatistics.roi_metrics.outbound_engagement_rate }
    ];

    return {
      performanceData,
      videoData,
      actionsData,
      actionValuesData,
      campaignStatusData,
      accountHealthData,
      roiData
    };
  }, [hasValidData, metrics, campaigns, enhancedStatistics, t]);

  if (accountsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">{t('integrations.loadingAccountDetails')}</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{t('integrations.adAccountNotFound')}</p>
        <button 
          onClick={() => navigate('/integrations')}
          className="px-4 py-2 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg transition-colors"
        >
          {t('common.backToIntegrations')}
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(account.account_status);

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
                <BuildingStorefrontIcon className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {enhancedAccountInfo.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('integrations.adAccountDetails')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className={`inline-flex items-center gap-2 px-3 py-1 ${statusInfo.bgColor} ${statusInfo.color} text-sm font-medium rounded-full`}>
              <CheckCircleIcon className="w-4 h-4" />
              {statusInfo.text}
            </span>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <select 
                value={selectedTimeframe}
                onChange={(e) => handleTimeframeChange(e.target.value)}
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

      {/* Performance Overview Cards */}
      {hasValidData && (
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
                  {t('common.totalSpend')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatMetric(metrics.spend, 'currency', metrics.currency)}
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
                  {t('common.totalImpressions')}
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
                  {t('common.totalClicks')}
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
                  {t('common.ctr')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatMetric(metrics.ctr, 'percentage')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <ArrowTrendingUpIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Additional Performance Metrics */}
      {hasValidData && (
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
                  {t('integrations.outboundClicks')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatMetric(metrics.outbound_clicks)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                <CursorArrowRaysIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
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
                  {t('integrations.videoPlays')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatMetric(metrics.video_plays)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-pink-100 dark:bg-pink-900/20">
                <PlayIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
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
                  {t('integrations.socialSpendRatio')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatMetric(metrics.social_spend, 'currency', metrics.currency)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/20">
                <GlobeAltIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
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
                  {t('integrations.websiteCTR')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatMetric(metrics.website_ctr, 'percentage')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-900/20">
                <GlobeAltIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Performance Graph Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.overallPerformanceStats')}</h2>
          
          <div className="flex items-center space-x-4">
            {/* Custom Date Range */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">{t('common.from')}:</label>
              <input
                type="date"
                value={dateRange.date_from}
                onChange={(e) => handleDateRangeChange('date_from', e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">{t('common.to')}:</label>
              <input
                type="date"
                value={dateRange.date_to}
                onChange={(e) => handleDateRangeChange('date_to', e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              />
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-3 py-1 bg-[#174A6E] hover:bg-[#0B3049] disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? t('common.loading') : t('integrations.refresh')}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-400 text-sm">
                {typeof error === 'string' ? error : error?.message || error?.error || t('integrations.anErrorOccurred')}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">{t('integrations.loadingGraphData')}</span>
          </div>
        ) : hasValidData ? (
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('integrations.reach')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.reach)}
                    </p>
                  </div>
                  <UsersIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.cpc')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.cpc, 'currency', metrics.currency)}
                    </p>
                  </div>
                  <CursorArrowRaysIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.cpm')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.cpm, 'currency', metrics.currency)}
                    </p>
                  </div>
                  <ArrowTrendingUpIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('integrations.videoPlays')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.video_plays)}
                    </p>
                  </div>
                  <PlayIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
              </motion.div>
            </div>

            {/* Performance Statistics */}
            {enhancedStatistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Performance Metrics */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    {t('integrations.performanceMetrics')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">CTR</span>
                      <span className="font-medium">{formatMetric(enhancedStatistics.performance_metrics?.ctr || 0, 'percentage')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">CPC</span>
                      <span className="font-medium">{formatMetric(enhancedStatistics.performance_metrics?.cpc || 0, 'currency', enhancedAccountInfo.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">CPM</span>
                      <span className="font-medium">{formatMetric(enhancedStatistics.performance_metrics?.cpm || 0, 'currency', enhancedAccountInfo.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('integrations.frequency')}</span>
                      <span className="font-medium">{enhancedStatistics.performance_metrics?.frequency || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Account Health */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                    {t('integrations.accountHealth')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('integrations.campaignActivity')}</span>
                      <span className="font-medium">{formatMetric(enhancedStatistics.account_health?.campaign_activity_rate || 0, 'percentage')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Adset Activity</span>
                      <span className="font-medium">{formatMetric(enhancedStatistics.account_health?.adset_activity_rate || 0, 'percentage')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Ad Activity</span>
                      <span className="font-medium">{formatMetric(enhancedStatistics.account_health?.ad_activity_rate || 0, 'percentage')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Overall Activity</span>
                      <span className="font-medium">{formatMetric(enhancedStatistics.account_health?.overall_activity_rate || 0, 'percentage')}</span>
                    </div>
                  </div>
                </div>

                {/* ROI Metrics */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <BoltIcon className="w-5 h-5 mr-2" />
                    {t('integrations.roiMetrics')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Spend Efficiency</span>
                      <span className="font-medium">{formatMetric(enhancedStatistics.roi_metrics?.spend_efficiency || 0, 'percentage')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Reach Efficiency</span>
                      <span className="font-medium">{formatMetric(enhancedStatistics.roi_metrics?.reach_efficiency || 0, 'percentage')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Social Spend Ratio</span>
                      <span className="font-medium">{formatMetric(enhancedStatistics.roi_metrics?.social_spend_ratio || 0, 'percentage')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Outbound Engagement</span>
                      <span className="font-medium">{formatMetric(enhancedStatistics.roi_metrics?.outbound_engagement_rate || 0, 'percentage')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No graph data available</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Try adjusting the date range or check your account permissions
            </p>
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    Error: {typeof error === 'string' ? error : error?.message || error?.error || 'Unknown error'}
                  </p>
                </div>
              </div>
            )}
            {!error && !hasValidData && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                    No valid data structure found in API response. Please check the API response format.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comprehensive Charts Section */}
      {hasValidData && (
        <div className="space-y-6">
          {/* Performance Metrics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Performance Metrics"
              subtitle="Key performance indicators"
              data={chartData.performanceData}
              type="bar"
              height={300}
            />
            
            <ChartCard
              title="Video Engagement"
              subtitle="Video performance metrics"
              data={chartData.videoData}
              type="bar"
              height={300}
            />
          </div>

          {/* Actions and Conversions Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Top Actions"
              subtitle="Most performed actions"
              data={chartData.actionsData}
              type="bar"
              height={300}
            />
            
            <ChartCard
              title="Action Values"
              subtitle="Revenue from actions"
              data={chartData.actionValuesData}
              type="bar"
              height={300}
            />
          </div>

          {/* Campaign and Account Health Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title={t('integrations.campaignStatusDistribution')}
              subtitle={t('integrations.activeVsPausedCampaigns')}
              data={chartData.campaignStatusData}
              type="pie"
              height={300}
            />
            
            <ChartCard
              title={t('integrations.accountHealthOverview')}
              subtitle={t('integrations.activityRatesAcrossAccount')}
              data={chartData.accountHealthData}
              type="pie"
              height={300}
            />
          </div>

          {/* ROI Metrics Chart */}
          <ChartCard
            title={t('integrations.roiMetrics')}
            subtitle={t('integrations.returnOnInvestmentIndicators')}
            data={chartData.roiData}
            type="bar"
            height={300}
          />
        </div>
      )}

      {/* Detailed Insights Section */}
      {hasValidData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Detailed Insights</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Performance */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                <PlayIcon className="w-5 h-5 mr-2" />
                Video Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Video Plays</span>
                  <span className="font-medium">{formatMetric(metrics.video_plays)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">30s Watched</span>
                  <span className="font-medium">{formatMetric(metrics.video_30_sec_watched)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">50% Watched</span>
                  <span className="font-medium">{formatMetric(metrics.video_p50_watched)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">100% Watched</span>
                  <span className="font-medium">{formatMetric(metrics.video_p100_watched)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Time Watched</span>
                  <span className="font-medium">{metrics.video_avg_time_watched}s</span>
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
                  <span className="text-gray-600 dark:text-gray-400">Website CTR</span>
                  <span className="font-medium">{formatMetric(metrics.website_ctr, 'percentage')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Purchase ROAS</span>
                  <span className="font-medium">{metrics.website_purchase_roas.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Outbound Clicks CTR</span>
                  <span className="font-medium">{formatMetric(metrics.outbound_clicks_ctr, 'percentage')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cost per Unique Click</span>
                  <span className="font-medium">{formatMetric(metrics.cost_per_unique_click, 'currency', metrics.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">CPP</span>
                  <span className="font-medium">{formatMetric(metrics.cpp, 'currency', metrics.currency)}</span>
                </div>
              </div>
            </div>

            {/* Budget Analysis */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Budget Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Budget</span>
                  <span className="font-medium">{formatMetric(enhancedStatistics.budget_analysis.total_budget_allocated, 'currency', metrics.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Budget Utilization</span>
                  <span className="font-medium">{formatMetric(enhancedStatistics.budget_analysis.budget_utilization, 'percentage')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Spend/Campaign</span>
                  <span className="font-medium">{formatMetric(enhancedStatistics.budget_analysis.average_spend_per_campaign, 'currency', metrics.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Spend/Adset</span>
                  <span className="font-medium">{formatMetric(enhancedStatistics.budget_analysis.average_spend_per_adset, 'currency', metrics.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Social Spend</span>
                  <span className="font-medium">{formatMetric(metrics.social_spend, 'currency', metrics.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Name</label>
              <p className="text-gray-900 dark:text-white font-medium">{enhancedAccountInfo.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account ID</label>
              <p className="text-gray-900 dark:text-white font-mono">{enhancedAccountInfo.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Currency</label>
              <p className="text-gray-900 dark:text-white">{enhancedAccountInfo.currency}</p>
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
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date Range</label>
              <p className="text-gray-900 dark:text-white">
                {enhancedAccountInfo.date_range.date_from} to {enhancedAccountInfo.date_range.date_to}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Source</label>
              <p className="text-gray-900 dark:text-white">{enhancedAccountInfo.source}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {formatMetric(enhancedAccountInfo.balance, 'currency', enhancedAccountInfo.currency)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('integrations.accountAge')}</label>
              <p className="text-gray-900 dark:text-white">{formatMetric(enhancedAccountInfo.age || 0)} {t('integrations.days')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Breakdown Section */}
      {hasValidData && Object.keys(metrics.actions || {}).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('integrations.actionsBreakdown')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Actions */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                <CursorArrowRaysIcon className="w-5 h-5 mr-2" />
                {t('integrations.actionsCount')}
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(metrics.actions || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatMetric(parseInt(value) || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Values */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                {t('integrations.actionValues')}
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(metrics.action_values || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatMetric(parseFloat(value) || 0, 'currency', metrics.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics Summary */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                {t('integrations.keyMetrics')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm text-blue-600 dark:text-blue-400">{t('integrations.totalActions')}</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {Object.values(metrics.actions || {}).reduce((sum, val) => sum + (parseInt(val) || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm text-green-600 dark:text-green-400">{t('integrations.totalValue')}</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {formatMetric(
                      Object.values(metrics.action_values || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0),
                      'currency',
                      metrics.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm text-purple-600 dark:text-purple-400">{t('integrations.avgValuePerAction')}</span>
                  <span className="font-medium text-purple-900 dark:text-purple-100">
                    {formatMetric(
                      Object.values(metrics.action_values || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) / 
                      Math.max(Object.values(metrics.actions || {}).reduce((sum, val) => sum + (parseInt(val) || 0), 0), 1),
                      'currency',
                      metrics.currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('integrations.campaignsList')} ({campaigns.length})</h2>
          <button className="px-4 py-2 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg text-sm font-medium transition-colors">
            {t('integrations.createCampaign')}
          </button>
        </div>
        
        {campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">{t('integrations.campaignName')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">{t('common.status')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">{t('integrations.effectiveStatus')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">{t('integrations.created')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{campaign.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {campaign.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.effective_status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {campaign.effective_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {campaign.created_time ? new Date(campaign.created_time).toLocaleDateString() : 'N/A'}
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
                        {t('common.viewDetails')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('integrations.noCampaignsFound')}</p>
            <button className="mt-4 px-4 py-2 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg text-sm font-medium transition-colors">
              {t('integrations.createYourFirstCampaign')}
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('common.quickActions')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg transition-colors">
            <ChartBarIcon className="w-5 h-5" />
            <span>{t('integrations.createCampaign')}</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <CreditCardIcon className="w-5 h-5" />
            <span>{t('integrations.addPaymentMethod')}</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg transition-colors">
            <CogIcon className="w-5 h-5" />
            <span>{t('integrations.accountSettings')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdAccountDetail;
