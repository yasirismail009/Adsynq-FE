import { motion } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useCampaignData } from '../../hooks/useCampaignData';
import ChartCard from '../dashboard/ChartCard';
import PublisherPlatformInsights from './PublisherPlatformInsights';
import HourlyInsights from './HourlyInsights';
import BreakdownInsights from './BreakdownInsights';
import RegionInsights from './RegionInsights';
import DeviceInsights from './DeviceInsights';
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  PhotoIcon,
  AdjustmentsHorizontalIcon,
  CogIcon,
  ShoppingCartIcon,
  LinkIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { 
  selectMetaUserAdAccounts,
  fetchMetaUserAdAccounts,
  fetchMetaCampaignData,
  fetchMetaCampaignInsightsBreakdowns,
  fetchMetaCampaignInsightsHourly,
  fetchMetaCampaignInsightsRegion,
  fetchMetaCampaignInsightsDevice,
  fetchMetaCampaignInsightsPublisherPlatform,
  clearInsightsData
} from '../../store/slices/metaSlice';

const CampaignDetail = () => {
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  
  // Extract and normalize date parameters (handle both date and datetime formats)
  const getDateParam = (paramName) => {
    const param = searchParams.get(paramName);
    if (!param) return null;
    
    // If it's a datetime string, extract just the date part (YYYY-MM-DD)
    if (param.includes('T')) {
      return param.split('T')[0];
    }
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(param)) {
      return param;
    }
    
    // Try to parse and format
    try {
      const date = new Date(param);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.warn(`Failed to parse date parameter ${paramName}:`, param);
    }
    
    return null;
  };
  
  const date_from = getDateParam('date_from');
  const date_to = getDateParam('date_to');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Debug logging
  console.log('CampaignDetail component rendered with campaignId:', campaignId);
  
  // Redux selectors with safe access
  const metaUserAdAccounts = useSelector(selectMetaUserAdAccounts) || null;
  const accountsLoading = useSelector(state => state.meta?.loading?.userAdAccounts || false);
  const directCampaignData = useSelector(state => state.meta?.campaignData || null);
  
  // Debug Redux state
  console.log('accountsLoading:', accountsLoading);
  
  // Local state
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Use date params from URL if available, otherwise use defaults
    return {
      date_from: date_from || thirtyDaysAgo.toISOString().split('T')[0],
      date_to: date_to || today.toISOString().split('T')[0]
    };
  });
  
  // Custom hooks
  const { campaignData, isLoading, error, refreshData } = useCampaignData(campaignId, dateRange);
  
  // Direct Redux selectors for insights data
  const insightsBreakdowns = useSelector(state => state.meta?.campaignInsightsBreakdowns);
  const insightsHourly = useSelector(state => state.meta?.campaignInsightsHourly);
  const insightsRegion = useSelector(state => state.meta?.campaignInsightsRegion);
  const insightsDevice = useSelector(state => state.meta?.campaignInsightsDevice);
  const insightsPublisherPlatform = useSelector(state => state.meta?.campaignInsightsPublisherPlatform);
  
  // Loading states
  const insightsLoading = useSelector(state => 
    state.meta?.loading?.campaignInsightsBreakdowns ||
    state.meta?.loading?.campaignInsightsHourly ||
    state.meta?.loading?.campaignInsightsRegion ||
    state.meta?.loading?.campaignInsightsDevice ||
    state.meta?.loading?.campaignInsightsPublisherPlatform
  );
  
  // Error states
  const insightsHasErrors = useSelector(state => 
    state.meta?.errors?.campaignInsightsBreakdowns ||
    state.meta?.errors?.campaignInsightsHourly ||
    state.meta?.errors?.campaignInsightsRegion ||
    state.meta?.errors?.campaignInsightsDevice ||
    state.meta?.errors?.campaignInsightsPublisherPlatform
  );
  
  // Refresh insights function
  const refreshAllInsights = useCallback(() => {
    if (!campaignId) return;
    
    console.log(`🔄 Refreshing all data for campaign: ${campaignId}`);
    console.log('📅 Date range being sent:', dateRange);
    
    // Clear existing insights data first
    console.log('🧹 Clearing existing insights data...');
    dispatch(clearInsightsData());
    
    // Small delay to ensure clearing is processed
    setTimeout(() => {
      console.log('🚀 Starting to fetch new data...');
      // Fetch main campaign data and all insights in parallel
      const promises = [
        dispatch(fetchMetaCampaignData({ campaignId, dateRange })),
        dispatch(fetchMetaCampaignInsightsBreakdowns({ campaignId, dateRange })),
        dispatch(fetchMetaCampaignInsightsHourly({ campaignId, dateRange })),
        dispatch(fetchMetaCampaignInsightsRegion({ campaignId, dateRange })),
        dispatch(fetchMetaCampaignInsightsDevice({ campaignId, dateRange })),
        dispatch(fetchMetaCampaignInsightsPublisherPlatform({ campaignId, dateRange }))
      ];
      
      Promise.allSettled(promises)
        .then((results) => {
          const fulfilled = results.filter(result => result.status === 'fulfilled').length;
          const rejected = results.filter(result => result.status === 'rejected').length;
          console.log(`✅ Data fetch completed: ${fulfilled} successful, ${rejected} failed`);
          
          // Log individual results
          results.forEach((result, index) => {
            const apiNames = ['Campaign Data', 'Breakdowns', 'Hourly', 'Region', 'Device', 'PublisherPlatform'];
            if (result.status === 'fulfilled') {
              console.log(`✅ ${apiNames[index]} API: Success`);
            } else {
              console.log(`❌ ${apiNames[index]} API: Failed -`, result.reason);
            }
          });
        })
        .catch((error) => {
          console.error('❌ Error fetching campaign data:', error);
        });
    }, 100); // 100ms delay
  }, [campaignId, dateRange, dispatch]);
  
  // Fetch data on component mount and when date range changes
  useEffect(() => {
    if (campaignId && dateRange) {
      console.log(`🎯 Fetching all data for campaign: ${campaignId}`);
      console.log('📅 Date range:', dateRange);
      refreshAllInsights();
    }
  }, [campaignId, dateRange.date_from, dateRange.date_to, refreshAllInsights]);
  
  // Debug hook data
  console.log('useCampaignData hook data:', { 
    isLoading, 
    error: error ? 'Error occurred' : 'No error',
    campaignData: campaignData ? 'Data exists' : 'No data',
    directCampaignData: directCampaignData ? 'Direct data exists' : 'No direct data'
  });
  
  console.log('Direct Redux insights data:', {
    insightsLoading,
    insightsHasErrors,
    hasBreakdowns: !!insightsBreakdowns,
    hasHourly: !!insightsHourly,
    hasRegion: !!insightsRegion,
    hasDevice: !!insightsDevice,
    hasPublisherPlatform: !!insightsPublisherPlatform
  });

  // Debug publisher platform data structure
  console.log('Publisher Platform Data Structure:', {
    insightsPublisherPlatform,
    hasData: !!insightsPublisherPlatform,
    dataType: typeof insightsPublisherPlatform,
    dataKeys: insightsPublisherPlatform ? Object.keys(insightsPublisherPlatform) : 'no data',
    result: insightsPublisherPlatform?.result,
    insightsData: insightsPublisherPlatform?.result?.insights_data,
    insightsDataLength: insightsPublisherPlatform?.result?.insights_data?.length
  });

  // Debug all Redux state for insights
  console.log('Full Redux insights state:', {
    breakdowns: insightsBreakdowns,
    hourly: insightsHourly,
    region: insightsRegion,
    device: insightsDevice,
    publisherPlatform: insightsPublisherPlatform
  });

  // Debug raw publisher platform data
  console.log('Raw Publisher Platform Data:', {
    fullData: insightsPublisherPlatform,
    result: insightsPublisherPlatform?.result,
    insightsData: insightsPublisherPlatform?.result?.insights_data,
    firstItem: insightsPublisherPlatform?.result?.insights_data?.[0],
    secondItem: insightsPublisherPlatform?.result?.insights_data?.[1]
  });
  
    // Utility functions
  const formatMetric = (value, type = 'number', currency = 'USD') => {
    // Check if value is an object and return default if so
    if (value === null || value === undefined) return '0';
    if (typeof value === 'object') {
      console.warn('formatMetric received object instead of primitive:', value);
      return '0';
    }
    
    // Ensure value is a number
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0';
    
    try {
      if (type === 'currency') {
        const safeCurrency = typeof currency === 'string' ? currency : 'USD';
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: safeCurrency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(numValue);
      }
      
      if (type === 'number') {
        return new Intl.NumberFormat('en-US').format(numValue);
      }
      
      if (type === 'percentage') {
        return `${numValue.toFixed(1)}%`;
      }
      
      return String(numValue);
    } catch (error) {
      console.error('Error formatting metric:', error);
      return '0';
    }
  };

  const getStatusInfo = (status) => {
    if (status === 1 || status === 3 || status === 'ACTIVE') {
      return {
        text: 'Active',
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        iconColor: 'text-green-500'
      };
    } else if (status === 2 || status === 'PAUSED') {
      return {
        text: 'Paused',
        color: 'text-yellow-700 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        iconColor: 'text-yellow-500'
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

  // Safe rendering function to prevent objects from being rendered
  const safeRender = (value, context = 'unknown') => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      console.error(`Attempting to render object in context "${context}":`, value);
      return '';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'string') {
      return value;
    }
    return '';
  };

    // Data processing
  const campaignInfo = useMemo(() => {
    const data = directCampaignData.result || campaignData.result;
    const insights = data?.insights_data || {};
    
    // Debug data structure
    console.log('Campaign data structure:', {
      directCampaignData: directCampaignData ? 'exists' : 'null',
      campaignData: campaignData.result ? 'exists' : 'null',
      data: data ? 'exists' : 'null',
      insights: insights ? 'exists' : 'null',
      insightsKeys: insights ? Object.keys(insights) : 'no insights',
      sampleActionValues: insights?.action_values ? insights.action_values.slice(0, 3) : 'none'
    });
    
    // Ensure all values are strings, not objects
    const safeString = (value, fallback = '') => {
      if (value === null || value === undefined) return fallback;
      if (typeof value === 'object') return fallback;
      return String(value);
    };
    
    return {
      name: safeString(insights.campaign_name, 'Unknown Campaign'),
      id: safeString(data?.campaign_id, campaignId),
      status: 'ACTIVE',
      currency: safeString(insights.account_currency, 'USD'),
      accountName: safeString(insights.account_name, 'Unknown Account'),
      accountId: safeString(insights.account_id, 'unknown')
    };
  }, [directCampaignData, campaignData, campaignId]);

  const metrics = useMemo(() => {
    const data = directCampaignData.result || campaignData.result;
    const insights = data?.insights_data || {};
    
    // Debug metrics data
    console.log('Metrics processing:', {
      hasData: !!data,
      hasInsights: !!insights,
      actionValues: insights.action_values ? insights.action_values.length : 0,
      costPerActionTypes: insights.cost_per_action_type ? insights.cost_per_action_type.length : 0,
      videoMetrics: insights.video_play_actions ? 'exists' : 'missing'
    });
    
    const safeParseFloat = (value) => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'object') {
        console.warn('safeParseFloat received object:', value);
        return 0;
      }
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };
    
    const safeParseInt = (value) => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'object') {
        console.warn('safeParseInt received object:', value);
        return 0;
      }
      const parsed = parseInt(value);
      return isNaN(parsed) ? 0 : parsed;
    };
    
    const safeString = (value, fallback = 'USD') => {
      if (value === null || value === undefined) return fallback;
      if (typeof value === 'object') return fallback;
      return String(value);
    };

    // Helper function to extract action values
    const getActionValue = (actionType) => {
      if (!insights.action_values || !Array.isArray(insights.action_values)) return 0;
      const action = insights.action_values.find(a => a.action_type === actionType);
      return action ? safeParseFloat(action.value) : 0;
    };

    // Helper function to extract cost per action
    const getCostPerAction = (actionType) => {
      if (!insights.cost_per_action_type || !Array.isArray(insights.cost_per_action_type)) return 0;
      const action = insights.cost_per_action_type.find(a => a.action_type === actionType);
      return action ? safeParseFloat(action.value) : 0;
    };

    // Helper function to extract video metrics
    const getVideoMetric = (metricType) => {
      if (!insights[metricType] || !Array.isArray(insights[metricType])) return 0;
      const metric = insights[metricType][0];
      return metric ? safeParseInt(metric.value) : 0;
    };
    
    const extractedMetrics = {
      // Basic metrics
      spend: safeParseFloat(insights.spend),
      impressions: safeParseInt(insights.impressions),
      clicks: safeParseInt(insights.clicks),
      reach: safeParseInt(insights.reach),
      ctr: safeParseFloat(insights.ctr),
      cpc: safeParseFloat(insights.cpc),
      cpm: safeParseFloat(insights.cpm),
      frequency: safeParseFloat(insights.frequency),
      
      // Conversion metrics
      conversions: safeParseInt(insights.results?.[0]?.values?.[0]?.value),
      purchases: getActionValue('purchase'),
      checkouts: getActionValue('initiate_checkout'),
      viewContent: getActionValue('view_content'),
      
      // Cost metrics
      costPerPurchase: getCostPerAction('purchase'),
      costPerCheckout: getCostPerAction('initiate_checkout'),
      costPerViewContent: getCostPerAction('view_content'),
      costPerLinkClick: safeParseFloat(insights.cost_per_inline_link_click),
      costPerUniqueClick: safeParseFloat(insights.cost_per_unique_click),
      
      // Video metrics
      video_plays: getVideoMetric('video_play_actions'),
      video_30_sec_watched: getVideoMetric('video_30_sec_watched_actions'),
      video_p100_watched: getVideoMetric('video_p100_watched_actions'),
      video_p75_watched: getVideoMetric('video_p75_watched_actions'),
      video_p50_watched: getVideoMetric('video_p50_watched_actions'),
      video_p25_watched: getVideoMetric('video_p25_watched_actions'),
      video_avg_time_watched: getVideoMetric('video_avg_time_watched_actions'),
      
      // Engagement metrics
      inlineLinkClicks: safeParseInt(insights.inline_link_clicks),
      inlinePostEngagement: safeParseInt(insights.inline_post_engagement),
      outboundClicks: getVideoMetric('outbound_clicks'),
      
      // Quality metrics
      qualityRanking: safeString(insights.quality_ranking, 'Unknown'),
      engagementRateRanking: safeString(insights.engagement_rate_ranking, 'Unknown'),
      
      // Additional metrics
      socialSpend: safeParseFloat(insights.social_spend),
      cpp: safeParseFloat(insights.cpp),
      costPerThruplay: getCostPerAction('video_view'),
      
      currency: safeString(insights.account_currency, 'USD')
    };

    // Debug extracted metrics
    console.log('Extracted metrics sample:', {
      spend: extractedMetrics.spend,
      impressions: extractedMetrics.impressions,
      purchases: extractedMetrics.purchases,
      checkouts: extractedMetrics.checkouts,
      viewContent: extractedMetrics.viewContent,
      videoPlays: extractedMetrics.video_plays
    });

    return extractedMetrics;
  }, [directCampaignData, campaignData]);

  // Process insights data
  const insightsData = useMemo(() => {
    const processInsightsData = (data, type) => {
      if (!data || !Array.isArray(data)) return [];
      
      return data.map(item => ({
        name: item.name || item.dimension || 'Unknown',
        value: parseFloat(item.value) || 0,
        type: type
      }));
    };

    return {
      breakdowns: processInsightsData(insightsBreakdowns?.result?.insights_data, 'breakdown'),
      hourly: processInsightsData(insightsHourly?.result?.insights_data, 'hourly'),
      region: processInsightsData(insightsRegion?.result?.insights_data, 'region'),
      device: processInsightsData(insightsDevice?.result?.insights_data, 'device'),
      publisherPlatform: processInsightsData(insightsPublisherPlatform?.result?.insights_data, 'publisher')
    };
  }, [insightsBreakdowns, insightsHourly, insightsRegion, insightsDevice, insightsPublisherPlatform]);

  const chartData = useMemo(() => {
    // Ensure all values are numbers, not objects
    const safeValue = (value) => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'object') {
        console.warn('safeValue received object:', value);
        return 0;
      }
      const numValue = parseFloat(value);
      return isNaN(numValue) ? 0 : numValue;
    };
    
    // Ensure metrics is an object
    if (!metrics || typeof metrics !== 'object') {
      console.warn('metrics is not a valid object:', metrics);
      return {
        performanceData: [],
        videoData: []
      };
    }
    
    const performanceData = [
      { name: 'CTR', value: safeValue(metrics.ctr), target: 2.0 },
      { name: 'CPC', value: safeValue(metrics.cpc), target: 3.0 },
      { name: 'CPM', value: safeValue(metrics.cpm), target: 50.0 },
      { name: 'Frequency', value: safeValue(metrics.frequency), target: 1.5 }
    ];

    const conversionData = [
      { name: 'Purchases', value: safeValue(metrics.purchases) },
      { name: 'Checkouts', value: safeValue(metrics.checkouts) },
      { name: 'View Content', value: safeValue(metrics.viewContent) },
      { name: 'Conversions', value: safeValue(metrics.conversions) }
    ];

    const costData = [
      { name: 'Cost/Purchase', value: safeValue(metrics.costPerPurchase) },
      { name: 'Cost/Checkout', value: safeValue(metrics.costPerCheckout) },
      { name: 'Cost/View', value: safeValue(metrics.costPerViewContent) },
      { name: 'Cost/Link Click', value: safeValue(metrics.costPerLinkClick) }
    ];

    const videoData = [
      { name: 'Video Plays', value: safeValue(metrics.video_plays) },
      { name: '30s Watched', value: safeValue(metrics.video_30_sec_watched) },
      { name: '100% Watched', value: safeValue(metrics.video_p100_watched) },
      { name: '75% Watched', value: safeValue(metrics.video_p75_watched) },
      { name: '50% Watched', value: safeValue(metrics.video_p50_watched) },
      { name: '25% Watched', value: safeValue(metrics.video_p25_watched) }
    ];

    const engagementData = [
      { name: 'Inline Link Clicks', value: safeValue(metrics.inlineLinkClicks) },
      { name: 'Post Engagement', value: safeValue(metrics.inlinePostEngagement) },
      { name: 'Outbound Clicks', value: safeValue(metrics.outboundClicks) }
    ];

    return {
      performanceData,
      conversionData,
      costData,
      videoData,
      engagementData
    };
  }, [metrics]);

  // Effects
  useEffect(() => {
    if (!metaUserAdAccounts && campaignId) {
      try {
        dispatch(fetchMetaUserAdAccounts());
      } catch (error) {
        console.error('Error dispatching fetchMetaUserAdAccounts:', error);
      }
    }
  }, [metaUserAdAccounts, campaignId, dispatch]);

  // Event handlers
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
        startDate.setDate(today.getDate() - 30);
    }
    
    setDateRange({
      date_from: startDate.toISOString().split('T')[0],
      date_to: today.toISOString().split('T')[0]
    });
  };

  const handleDateRangeChange = (field, value) => {
    setSelectedTimeframe('custom'); // Mark as custom when user manually changes dates
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Loading states
  if (accountsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading campaign details...</p>
      </div>
    );
  }

  // Safety check for Redux state
  if (!campaignId) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">Invalid campaign ID</p>
        <button 
          onClick={() => navigate('/integrations')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Back to Integrations
        </button>
      </div>
    );
  }

  const hasValidData = directCampaignData || campaignData;
  
  console.log('CampaignDetail: hasValidData check:', { hasValidData: !!hasValidData });
  
  // Return early if no data is available
  if (!hasValidData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">No campaign data available</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Campaign ID: {String(campaignId || 'unknown')}
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
          This might be because the backend API is not running or the campaign doesn't exist.
        </p>
        <button 
          onClick={() => navigate('/integrations')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Back to Integrations
        </button>
      </div>
    );
  }

  // Ensure metrics is properly initialized
  if (!metrics || typeof metrics !== 'object') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">Invalid metrics data</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Campaign ID: {String(campaignId || 'unknown')}
        </p>
        <button 
          onClick={() => navigate('/integrations')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Back to Integrations
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(campaignInfo.status);
  
  // Additional safety check - if campaignInfo is not properly formed, return early
  if (!campaignInfo || typeof campaignInfo.name !== 'string' || typeof campaignInfo.id !== 'string') {
    console.warn('campaignInfo is missing required fields or contains invalid types:', campaignInfo);
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">Invalid campaign data</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Campaign ID: {String(campaignId || 'unknown')}
        </p>
        <button 
          onClick={() => navigate('/integrations')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Back to Integrations
        </button>
      </div>
    );
  }
      
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
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-purple-600">
                    <ChartBarIcon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {String(campaignInfo.name || 'Unknown Campaign')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Campaign Details
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
              </select>
            </div>
          </div>
        </div>

      {/* Campaign Overview */}
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
                  Total Spend
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
                  CTR
                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatMetric(metrics.ctr, 'percentage')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <ChartBarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Overview</h2>
          
          <div className="flex items-center space-x-4">
            {/* Quick Timeframe Buttons */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Quick:</span>
              <button
                onClick={() => handleTimeframeChange('7d')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  selectedTimeframe === '7d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => handleTimeframeChange('30d')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  selectedTimeframe === '30d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                30D
              </button>
              <button
                onClick={() => handleTimeframeChange('90d')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  selectedTimeframe === '90d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                90D
              </button>
            </div>
            
            {/* Custom Date Range */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">From:</label>
              <input
                type="date"
                value={dateRange.date_from}
                onChange={(e) => handleDateRangeChange('date_from', e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">To:</label>
              <input
                type="date"
                value={dateRange.date_to}
                onChange={(e) => handleDateRangeChange('date_to', e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Refresh All Data Button */}
            <button
              onClick={() => {
                console.log('Refreshing all data with date range:', dateRange);
                refreshAllInsights();
              }}
              disabled={isLoading || insightsLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isLoading || insightsLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading || insightsLoading ? 'Loading...' : 'Refresh All'}</span>
            </button>
          </div>
        </div>

        {/* Date Range Info */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                All data using date range: <strong>{dateRange.date_from}</strong> to <strong>{dateRange.date_to}</strong>
                {insightsLoading && (
                  <span className="ml-2 inline-flex items-center">
                    <ArrowPathIcon className="w-3 h-3 animate-spin mr-1" />
                    <span className="text-xs">Refreshing...</span>
                  </span>
                )}
              </span>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
              {selectedTimeframe === 'custom' ? 'Custom Range' : `${selectedTimeframe.toUpperCase()} Selected`}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-400 text-sm">
                {typeof error === 'string' ? error : 'An error occurred while loading campaign data'}
              </p>
            </div>
          </div>
        )}

        {insightsHasErrors && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                Some insights data failed to load. This won't affect the main campaign data.
              </p>
            </div>
          </div>
        )}
  
        {isLoading || insightsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              {isLoading ? 'Loading performance data...' : 'Loading insights data...'}
            </span>
          </div>
        ) : hasValidData ? (
          <div className="space-y-6">
            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Reach</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.reach)}
                     </p>
                   </div>
                  <UserIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">CPC</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.cpc, 'currency', metrics.currency)}
                     </p>
                   </div>
                   <CursorArrowRaysIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">CPM</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.cpm, 'currency', metrics.currency)}
                     </p>
                   </div>
                  <ChartBarIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Conversions</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.conversions)}
                     </p>
                   </div>
                   <UserIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                 </div>
              </div>
            </div>

            {/* Conversion Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Purchases</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.purchases)}
                     </p>
                   </div>
                   <ShoppingCartIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Checkouts</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.checkouts)}
                     </p>
                   </div>
                   <LinkIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">View Content</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.viewContent)}
                     </p>
                   </div>
                  <EyeIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Frequency</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.frequency)}
                     </p>
                   </div>
                   <ArrowPathIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                 </div>
              </div>
            </div>

            {/* Cost Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Cost/Purchase</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.costPerPurchase, 'currency', metrics.currency)}
                     </p>
                   </div>
                   <CurrencyDollarIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Cost/Checkout</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.costPerCheckout, 'currency', metrics.currency)}
                     </p>
                   </div>
                   <CurrencyDollarIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Cost/View</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.costPerViewContent, 'currency', metrics.currency)}
                     </p>
                   </div>
                  <CurrencyDollarIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Cost/Link Click</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatMetric(metrics.costPerLinkClick, 'currency', metrics.currency)}
                     </p>
                   </div>
                   <CurrencyDollarIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                 </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="space-y-6">
              {/* Performance and Conversion Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {chartData.performanceData && chartData.performanceData.length > 0 && (
                  <ChartCard
                    title="Performance Metrics"
                    subtitle="Key performance indicators"
                    data={chartData.performanceData}
                    type="bar"
                    height={300}
                  />
                )}
                
                {chartData.conversionData && chartData.conversionData.length > 0 && (
                  <ChartCard
                    title="Conversion Metrics"
                    subtitle="Conversion and engagement data"
                    data={chartData.conversionData}
                    type="bar"
                    height={300}
                  />
                )}
              </div>

              {/* Cost and Video Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {chartData.costData && chartData.costData.length > 0 && (
                  <ChartCard
                    title="Cost Analysis"
                    subtitle="Cost per action breakdown"
                    data={chartData.costData}
                    type="bar"
                    height={300}
                  />
                )}
                
                {chartData.videoData && chartData.videoData.length > 0 && (
                  <ChartCard
                    title="Video Engagement"
                    subtitle="Video performance metrics"
                    data={chartData.videoData}
                    type="bar"
                    height={300}
                  />
                )}
              </div>

              {/* Engagement Chart */}
              <div className="grid grid-cols-1 gap-6">
                {chartData.engagementData && chartData.engagementData.length > 0 && (
                  <ChartCard
                    title="Engagement Metrics"
                    subtitle="User engagement breakdown"
                    data={chartData.engagementData}
                    type="bar"
                    height={300}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No performance data available</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Try adjusting the date range or check your campaign permissions
            </p>
          </div>
        )}
      </div>

      {/* Campaign Insights Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Insights</h2>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              insightsLoading 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                : insightsHasErrors
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            }`}>
              {insightsLoading ? 'Loading...' : insightsHasErrors ? 'Partial Data' : 'Complete'}
            </span>
          </div>
        </div>

       
      </div>

            {/* Publisher Platform Insights Section */}
      <PublisherPlatformInsights 
        insightsPublisherPlatform={insightsPublisherPlatform}
        metrics={metrics}
        formatMetric={formatMetric}
      />

      {/* Hourly Insights Section */}
      <HourlyInsights 
        insightsHourly={insightsHourly}
        metrics={metrics}
        formatMetric={formatMetric}
      />

      {/* Breakdown Insights Section */}
      <BreakdownInsights 
        insightsBreakdowns={insightsBreakdowns}
        metrics={metrics}
        formatMetric={formatMetric}
      />

      {/* Region Insights Section */}
      <RegionInsights 
        insightsRegion={insightsRegion}
        metrics={metrics}
        formatMetric={formatMetric}
      />

      {/* Device Insights Section */}
      <DeviceInsights 
        insightsDevice={insightsDevice}
        metrics={metrics}
        formatMetric={formatMetric}
      />

       {/* Campaign Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campaign Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-4">
             <div>
               <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Campaign Name</label>
              <p className="text-gray-900 dark:text-white font-medium">{String(campaignInfo.name || 'Unknown Campaign')}</p>
             </div>
             <div>
               <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Campaign ID</label>
              <p className="text-gray-900 dark:text-white font-mono">{String(campaignInfo.id || 'Unknown ID')}</p>
             </div>
             <div>
               <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
               <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                 {statusInfo.text}
               </span>
             </div>
             <div>
               <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ad Account</label>
              <p className="text-gray-900 dark:text-white">{String(campaignInfo.accountName || 'Unknown Account')}</p>
             </div>
             <div>
               <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account ID</label>
              <p className="text-gray-900 dark:text-white font-mono">{String(campaignInfo.accountId || 'Unknown Account ID')}</p>
             </div>
           </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Currency</label>
              <p className="text-gray-900 dark:text-white">{String(campaignInfo.currency || 'USD')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campaign Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
              campaignInfo.status === 'ACTIVE' 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {campaignInfo.status === 'ACTIVE' ? (
              <>
                <PauseIcon className="w-5 h-5" />
                <span>Pause Campaign</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                <span>Activate Campaign</span>
              </>
            )}
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <PhotoIcon className="w-5 h-5" />
            <span>Manage Ads</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span>Edit Targeting</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
            <CogIcon className="w-5 h-5" />
            <span>Campaign Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
