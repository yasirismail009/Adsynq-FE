import { motion } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  PlayIcon,
  PauseIcon,
  PhotoIcon,
  AdjustmentsHorizontalIcon,
  ShoppingCartIcon,
  LinkIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  ChartBarSquareIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { 
  fetchGoogleSa360CampaignReport,
  fetchGoogleSa360DemographicData,
  fetchGoogleSa360DeviceTargeting,
  fetchGoogleSa360AudienceTargeting,
  fetchGoogleSa360Assets,
  selectGoogleSa360CampaignReport,
  selectGoogleSa360CampaignReportLoading,
  selectGoogleSa360CampaignReportError,
  selectGoogleSa360DemographicData,
  selectGoogleSa360DemographicDataLoading,
  selectGoogleSa360DemographicDataError,
  selectGoogleSa360DeviceTargeting,
  selectGoogleSa360DeviceTargetingLoading,
  selectGoogleSa360DeviceTargetingError,
  selectGoogleSa360AudienceTargeting,
  selectGoogleSa360AudienceTargetingLoading,
  selectGoogleSa360AudienceTargetingError,
  selectGoogleSa360Assets,
  selectGoogleSa360AssetsLoading,
  selectGoogleSa360AssetsError,
  selectGoogleSelectedSa360Campaign
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
    case 'DEMAND_GEN': return '#8B5CF6';
    default: return '#6B7280';
  }
};

// Global request cache to prevent duplicate requests
const requestCache = new Map();

// Validation function for API response structure
const validateCampaignReportResponse = (response) => {
  if (!response || typeof response !== 'object') {
    console.warn('Invalid API response: response is not an object');
    return false;
  }

  if (response.error) {
    console.warn('API response indicates error:', response.message);
    return false;
  }

  if (!response.result) {
    console.warn('API response missing result object');
    return false;
  }

  if (!response.result.campaign) {
    console.warn('API response missing campaign data');
    return false;
  }

  if (!response.result.metrics) {
    console.warn('API response missing metrics data');
    return false;
  }

  return true;
};

// Clean up old cache entries every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requestCache.entries()) {
    if (now - entry.timestamp > 30000) { // 30 seconds
      requestCache.delete(key);
    }
  }
}, 30000);

// Tab configuration
const tabs = [
  {
    id: 'overview',
    name: 'Overview',
    icon: ChartBarSquareIcon,
    description: 'Campaign performance and metrics'
  },
  {
    id: 'demographics',
    name: 'Gender and Ages',
    icon: UserGroupIcon,
    description: 'Gender and demographic breakdown'
  },
  {
    id: 'locations',
    name: 'Locations',
    icon: GlobeAltIcon,
    description: 'Geographic performance by city'
  },
  {
    id: 'devices',
    name: 'Devices',
    icon: ComputerDesktopIcon,
    description: 'Device targeting and performance'
  },
  {
    id: 'assets',
    name: 'Assets',
    icon: PhotoIcon,
    description: 'Campaign assets and performance'
  }
];

/**
 * SA360 Campaign Detail Component
 * 
 * Optimized to prevent double API calls:
 * - Uses useRef to track initial fetch state
 * - Separates initial fetch from date range change fetches
 * - Memoizes functions and objects to prevent unnecessary re-renders
 * - Handles React StrictMode double-invocation in development
 */
const SA360CampaignDetail = () => {
  const { googleAccountId,campaignId, customerId } = useParams();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  console.log("date",date)
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // SA360 Campaign Report selectors
  const sa360CampaignReport = useSelector(selectGoogleSa360CampaignReport);
  const sa360CampaignReportLoading = useSelector(selectGoogleSa360CampaignReportLoading);
  const sa360CampaignReportError = useSelector(selectGoogleSa360CampaignReportError);
  

  
  // SA360 Demographic Data selectors
  const sa360DemographicData = useSelector(selectGoogleSa360DemographicData);
  const sa360DemographicDataLoading = useSelector(selectGoogleSa360DemographicDataLoading);
  const sa360DemographicDataError = useSelector(selectGoogleSa360DemographicDataError);
  
  // SA360 Device Targeting selectors
  const sa360DeviceTargeting = useSelector(selectGoogleSa360DeviceTargeting);
  const sa360DeviceTargetingLoading = useSelector(selectGoogleSa360DeviceTargetingLoading);
  const sa360DeviceTargetingError = useSelector(selectGoogleSa360DeviceTargetingError);
  
  // SA360 Audience Targeting selectors
  const sa360AudienceTargeting = useSelector(selectGoogleSa360AudienceTargeting);
  const sa360AudienceTargetingLoading = useSelector(selectGoogleSa360AudienceTargetingLoading);
  const sa360AudienceTargetingError = useSelector(selectGoogleSa360AudienceTargetingError);
  
  // SA360 Assets selectors
  const sa360Assets = useSelector(selectGoogleSa360Assets);
  const sa360AssetsLoading = useSelector(selectGoogleSa360AssetsLoading);
  const sa360AssetsError = useSelector(selectGoogleSa360AssetsError);
  const selectedCampaign = useSelector(selectGoogleSelectedSa360Campaign);
  
  // Local state for dynamic date range - use useMemo to prevent recreation on every render
  const initialDateRange = useMemo(() => {
    const today = new Date();

    const dateObject = new Date(date);
    return {
      date_from: dateObject.toISOString().split('T')[0],
      date_to: today.toISOString().split('T')[0]
    };
  }, []);

  const [dateRange, setDateRange] = useState(initialDateRange);

  // Ref to track if initial fetch has been made
  // This prevents double API calls in React StrictMode (development only)
  const hasInitialFetch = useRef(false);

  // Date range options for quick selection
  const dateRangeOptions = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
    { label: 'Last 6 months', value: 180 },
    { label: 'Last year', value: 365 }
  ];

  // Function to update date range - memoized to prevent recreation
  const updateDateRange = useCallback((days) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);
    
    const newDateRange = {
      date_from: startDate.toISOString().split('T')[0],
      date_to: today.toISOString().split('T')[0]
    };
    
    setDateRange(newDateRange);
    console.log('Updated date range:', newDateRange);
  }, []);

  // Function to set custom date range - memoized to prevent recreation
  const setCustomDateRange = useCallback((fromDate, toDate) => {
    const newDateRange = {
      date_from: fromDate,
      date_to: toDate
    };
    
    setDateRange(newDateRange);
    console.log('Set custom date range:', newDateRange);
  }, []);

  // State for custom date picker
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customFromDate, setCustomFromDate] = useState(initialDateRange.date_from);
  const [customToDate, setCustomToDate] = useState(initialDateRange.date_to);

  // Memoized fetch function to prevent recreation on every render
  const fetchCampaignData = useCallback(() => {
    if (!googleAccountId || !customerId || !campaignId) {
      console.log('Missing required parameters for fetch');
      return;
    }

    // Create a unique request key
    const requestKey = `${googleAccountId}-${customerId}-${campaignId}-${dateRange.date_from}-${dateRange.date_to}`;
    
    // Check global cache for duplicate requests
    if (requestCache.has(requestKey)) {
      const cacheEntry = requestCache.get(requestKey);
      const now = Date.now();
      
      // If the same request was made within the last 5 seconds, skip it
      if (now - cacheEntry.timestamp < 5000) {
        console.log('Skipping duplicate request (cached):', requestKey);
        return;
      }
    }

    console.log('Fetching all SA360 campaign data:', { 
      googleAccountId, 
      customerId, 
      campaignId, 
      dateRange,
      requestKey 
    });

    // Cache the request
    requestCache.set(requestKey, { timestamp: Date.now() });
    
    // Fetch campaign report
    dispatch(fetchGoogleSa360CampaignReport({ 
      googleAccountId, 
      customerId, 
      campaignId,
      params: dateRange 
    }));
    

    
    // Fetch demographic data
    dispatch(fetchGoogleSa360DemographicData({ 
      googleAccountId, 
      customerId, 
      campaignId,
      params: dateRange 
    }));
    
    // Fetch device targeting
    dispatch(fetchGoogleSa360DeviceTargeting({ 
      googleAccountId, 
      customerId, 
      campaignId,
      params: dateRange 
    }));
    
    // Fetch audience targeting
    dispatch(fetchGoogleSa360AudienceTargeting({ 
      googleAccountId, 
      customerId, 
      campaignId,
      params: dateRange 
    }));
    
    // Fetch assets
    dispatch(fetchGoogleSa360Assets({ 
      googleAccountId, 
      customerId, 
      campaignId,
      params: dateRange 
    }));
  }, [googleAccountId, customerId, campaignId, dateRange, dispatch]);

  // Debounced fetch function to prevent rapid successive calls
  const debouncedFetch = useRef(null);

  // Memoized initial fetch function that only runs once
  const fetchInitialData = useCallback(() => {
    if (googleAccountId && customerId && campaignId && !hasInitialFetch.current) {
      console.log('Initial fetch triggered - setting hasInitialFetch to true');
      hasInitialFetch.current = true;
      fetchCampaignData();
    } else {
      console.log('Initial fetch skipped - already fetched or missing params:', {
        hasInitialFetch: hasInitialFetch.current,
        googleAccountId,
        customerId,
        campaignId
      });
    }
  }, [googleAccountId, customerId, campaignId, fetchCampaignData]);

  // Initial fetch - only run once when component mounts
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Fetch data when dateRange changes (but not on initial mount) - with debouncing
  useEffect(() => {
    if (hasInitialFetch.current && googleAccountId && customerId && campaignId) {
      console.log('Date range changed - debouncing fetch request');
      
      // Clear any existing timeout
      if (debouncedFetch.current) {
        clearTimeout(debouncedFetch.current);
      }
      
      // Set a new timeout for debounced fetch
      debouncedFetch.current = setTimeout(() => {
        console.log('Executing debounced fetch');
        fetchCampaignData();
      }, 300); // 300ms debounce delay
    }
  }, [dateRange, fetchCampaignData, googleAccountId, customerId, campaignId]);

  // Update custom date picker values when dateRange changes
  useEffect(() => {
    setCustomFromDate(dateRange.date_from);
    setCustomToDate(dateRange.date_to);
  }, [dateRange]);

  // Cleanup effect to clear timeout when component unmounts
  useEffect(() => {
    return () => {
      if (debouncedFetch.current) {
        clearTimeout(debouncedFetch.current);
      }
    };
  }, []);

  // Console log campaign report data when received
  useEffect(() => {
    if (sa360CampaignReport) {
      console.log('SA360 Campaign Report Data:', sa360CampaignReport);
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360CampaignReport, campaignId, googleAccountId, customerId]);



  // Console log demographic data when received
  useEffect(() => {
    if (sa360DemographicData) {
      console.log('SA360 Demographic Data:', sa360DemographicData);
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360DemographicData, campaignId, googleAccountId, customerId]);

  // Console log device targeting data when received
  useEffect(() => {
    if (sa360DeviceTargeting) {
      console.log('SA360 Device Targeting Data:', sa360DeviceTargeting);
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360DeviceTargeting, campaignId, googleAccountId, customerId]);

  // Console log audience targeting data when received
  useEffect(() => {
    if (sa360AudienceTargeting) {
      console.log('SA360 Audience Targeting Data:', sa360AudienceTargeting);
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360AudienceTargeting, campaignId, googleAccountId, customerId]);

  // Console log assets data when received
  useEffect(() => {
    if (sa360Assets) {
      console.log('SA360 Assets Data:', sa360Assets);
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360Assets, campaignId, googleAccountId, customerId]);

  // Console log campaign report errors when they occur
  useEffect(() => {
    if (sa360CampaignReportError) {
      console.error('SA360 Campaign Report Error:', sa360CampaignReportError);
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360CampaignReportError, campaignId, googleAccountId, customerId]);



  // Console log demographic data errors when they occur
  useEffect(() => {
    if (sa360DemographicDataError) {
      console.error('SA360 Demographic Data Error:', sa360DemographicDataError);
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360DemographicDataError, campaignId, googleAccountId, customerId]);

  // Console log device targeting errors when they occur
  useEffect(() => {
    if (sa360DeviceTargetingError) {
      console.error('SA360 Device Targeting Error:', sa360DeviceTargetingError);
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360DeviceTargetingError, campaignId, googleAccountId, customerId]);

  // Console log audience targeting errors when they occur
  useEffect(() => {
    if (sa360AudienceTargetingError) {
      console.error('SA360 Audience Targeting Error:', sa360AudienceTargetingError);
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360AudienceTargetingError, campaignId, googleAccountId, customerId]);

  // Console log assets errors when they occur
  useEffect(() => {
    if (sa360AssetsError) {
      console.error('SA360 Assets Error:', sa360AssetsError);
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360AssetsError, campaignId, googleAccountId, customerId]);

  // Console log campaign report loading state
  useEffect(() => {
    if (sa360CampaignReportLoading) {
      console.log('SA360 Campaign Report Loading...');
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360CampaignReportLoading, campaignId, googleAccountId, customerId]);



  // Console log demographic data loading state
  useEffect(() => {
    if (sa360DemographicDataLoading) {
      console.log('SA360 Demographic Data Loading...');
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360DemographicDataLoading, campaignId, googleAccountId, customerId]);

  // Console log device targeting loading state
  useEffect(() => {
    if (sa360DeviceTargetingLoading) {
      console.log('SA360 Device Targeting Loading...');
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360DeviceTargetingLoading, campaignId, googleAccountId, customerId]);

  // Console log audience targeting loading state
  useEffect(() => {
    if (sa360AudienceTargetingLoading) {
      console.log('SA360 Audience Targeting Loading...');
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360AudienceTargetingLoading, campaignId, googleAccountId, customerId]);

  // Console log assets loading state
  useEffect(() => {
    if (sa360AssetsLoading) {
      console.log('SA360 Assets Loading...');
      console.log('Campaign ID:', campaignId);
      console.log('Google Account ID:', googleAccountId);
      console.log('Customer ID:', customerId);
    }
  }, [sa360AssetsLoading, campaignId, googleAccountId, customerId]);

  // Use campaign report data directly, falling back to the campaign saved in Redux
  const campaignData = useMemo(() => {
    // First validate the response structure
    if (!validateCampaignReportResponse(sa360CampaignReport)) {
      console.log('Campaign report response validation failed, falling back to Redux store');
    } else if (sa360CampaignReport?.result?.campaign) {
      const campaign = sa360CampaignReport.result.campaign;

      // Validate required campaign fields
      const requiredFields = ['id', 'name', 'status'];
      const missingFields = requiredFields.filter(field => !campaign[field]);

      if (missingFields.length > 0) {
        console.warn('Campaign data missing required fields:', missingFields);
      }

      return campaign;
    }

    // Fallback: use the campaign saved from GoogleAccountDetail (if it matches this campaign)
    if (selectedCampaign?.campaign && String(selectedCampaign.campaignId) === String(campaignId)) {
      console.log('Using fallback campaign data from Redux store');
      return selectedCampaign.campaign;
    }

    return null;
  }, [sa360CampaignReport, selectedCampaign, campaignId]);

  // Prepare chart data for the specific campaign
  const chartData = useMemo(() => {
    if (!campaignData || !sa360CampaignReport?.result?.metrics) return {};

    // Use actual performance data from the API response
    const performance = sa360CampaignReport.result.metrics || {};
    
    // Safe access helper function
    const safeNumber = (value, defaultValue = 0) => {
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    };

    // Performance metrics data
    const performanceData = [
      { name: 'Impressions', value: safeNumber(performance.impressions) },
      { name: 'Clicks', value: safeNumber(performance.clicks) },
      { name: 'Conversions', value: safeNumber(performance.conversions) },
      { name: 'Cost', value: safeNumber(performance.cost) }
    ];

    // Financial metrics data
    const financialData = [
      { name: 'Cost', value: safeNumber(performance.cost) },
      { name: 'Conversions Value', value: safeNumber(performance.conversions_value) },
      { name: 'Average CPC', value: safeNumber(performance.average_cpc) },
      { name: 'Average CPM', value: safeNumber(performance.average_cpm) }
    ];

    // Engagement metrics data
    const clicks = safeNumber(performance.clicks);
    const conversions = safeNumber(performance.conversions);
    const cost = safeNumber(performance.cost);
    const conversionsValue = safeNumber(performance.conversions_value);

    const engagementData = [
      { name: 'CTR', value: safeNumber(performance.ctr) * 100 },
      { name: 'Conversion Rate', value: clicks > 0 ? (conversions / clicks) * 100 : 0 },
      { name: 'ROAS', value: cost > 0 ? (conversionsValue / cost) : 0 }
    ];

    // Time series data (simulated for demo)
    const timeSeriesData = [
      { name: 'Day 1', impressions: Math.floor((performance.impressions || 0) * 0.1), clicks: Math.floor((performance.clicks || 0) * 0.1), cost: (performance.cost || 0) * 0.1 },
      { name: 'Day 2', impressions: Math.floor((performance.impressions || 0) * 0.15), clicks: Math.floor((performance.clicks || 0) * 0.15), cost: (performance.cost || 0) * 0.15 },
      { name: 'Day 3', impressions: Math.floor((performance.impressions || 0) * 0.12), clicks: Math.floor((performance.clicks || 0) * 0.12), cost: (performance.cost || 0) * 0.12 },
      { name: 'Day 4', impressions: Math.floor((performance.impressions || 0) * 0.18), clicks: Math.floor((performance.clicks || 0) * 0.18), cost: (performance.cost || 0) * 0.18 },
      { name: 'Day 5', impressions: Math.floor((performance.impressions || 0) * 0.14), clicks: Math.floor((performance.clicks || 0) * 0.14), cost: (performance.cost || 0) * 0.14 },
      { name: 'Day 6', impressions: Math.floor((performance.impressions || 0) * 0.16), clicks: Math.floor((performance.clicks || 0) * 0.16), cost: (performance.cost || 0) * 0.16 },
      { name: 'Day 7', impressions: Math.floor((performance.impressions || 0) * 0.15), clicks: Math.floor((performance.clicks || 0) * 0.15), cost: (performance.cost || 0) * 0.15 }
    ];

    return {
      performanceData,
      financialData,
      engagementData,
      timeSeriesData
    };
  }, [campaignData, sa360CampaignReport]);

  // Calculate performance summary
  const performanceSummary = useMemo(() => {
    if (!campaignData || !sa360CampaignReport?.result?.metrics) return null;

    // Use actual performance data from the API response
    const perf = sa360CampaignReport.result.metrics || {};

    // Safe access helper function
    const safeNumber = (value, defaultValue = 0) => {
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    };

    const totalClicks = safeNumber(perf.clicks);
    const totalConversions = safeNumber(perf.conversions);
    const totalCost = safeNumber(perf.cost);
    const totalConversionValue = safeNumber(perf.conversions_value);

    return {
      totalImpressions: safeNumber(perf.impressions),
      totalClicks,
      totalCost,
      totalConversions,
      totalConversionValue,
      averageCPC: safeNumber(perf.average_cpc),
      averageCPM: safeNumber(perf.average_cpm),
      ctr: safeNumber(perf.ctr),
      roas: totalCost > 0 ? (totalConversionValue / totalCost) : 0,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) : 0
    };
  }, [campaignData, sa360CampaignReport]);

  // Demographic data processing
  const demographicData = useMemo(() => {
    if (!sa360DemographicData?.result?.demographic_data?.[0]) return null;
    return sa360DemographicData.result.demographic_data[0];
  }, [sa360DemographicData]);

  // Location data processing
  const locationData = useMemo(() => {
    if (!sa360DemographicData?.result?.location_data) return null;
    return sa360DemographicData.result.location_data;
  }, [sa360DemographicData]);

  // Demographic chart data
  const demographicChartData = useMemo(() => {
    if (!demographicData?.gender_breakdown) return [];
    
    return demographicData.gender_breakdown.map(item => ({
      name: item.gender,
      impressions: item.impressions,
      clicks: item.clicks,
      cost: item.cost,
      conversions: item.conversions,
      conversions_value: item.conversions_value,
      ctr: item.ctr,
      cpc: item.cpc
    }));
  }, [demographicData]);

  // Daily demographic data
  const dailyDemographicData = useMemo(() => {
    if (!demographicData?.daily_data) return [];
    
    return demographicData.daily_data.map(item => ({
      name: item.date,
      impressions: item.impressions,
      clicks: item.clicks,
      cost: item.cost,
      conversions: item.conversions,
      conversions_value: item.conversions_value,
      ctr: item.ctr,
      average_cpc: item.average_cpc
    }));
  }, [demographicData]);

  // Device targeting data processing
  const deviceTargetingData = useMemo(() => {
    if (!sa360DeviceTargeting?.result?.device_targeting_data) return null;
    return sa360DeviceTargeting.result.device_targeting_data;
  }, [sa360DeviceTargeting]);

  // Device targeting chart data
  const deviceChartData = useMemo(() => {
    if (!deviceTargetingData) return [];
    
    return deviceTargetingData.map(item => ({
      name: item.device,
      impressions: item.impressions,
      clicks: item.clicks,
      cost: item.cost,
      conversions: item.conversions,
      conversions_value: item.conversions_value,
      ctr: item.ctr,
      average_cpc: item.average_cpc,
      all_conversions: item.all_conversions,
      all_conversions_value: item.all_conversions_value
    }));
  }, [deviceTargetingData]);

  // Audience targeting data processing
  const audienceTargetingData = useMemo(() => {
    if (!sa360AudienceTargeting?.result?.targeting_data) return null;
    return sa360AudienceTargeting.result.targeting_data;
  }, [sa360AudienceTargeting]);

  // Audience targeting chart data for monthly trends - show whole year with 0 for missing months
  const audienceChartData = useMemo(() => {
    const months = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    
    // Create a map of existing data
    const dataMap = new Map();
    if (audienceTargetingData) {
      audienceTargetingData.forEach(item => {
        dataMap.set(item.month, item.performance);
      });
    }
    
    // Generate data for all 12 months
    return months.map(month => {
      const monthData = dataMap.get(month);
      return {
        name: month,
        impressions: monthData?.impressions || 0,
        clicks: monthData?.clicks || 0,
        cost: monthData?.cost || 0,
        conversions: monthData?.conversions || 0,
        conversions_value: monthData?.conversions_value || 0,
        ctr: monthData?.ctr || 0,
        average_cpc: monthData?.average_cpc || 0,
        all_conversions: monthData?.all_conversions || 0,
        all_conversions_value: monthData?.all_conversions_value || 0
      };
    });
  }, [audienceTargetingData]);

  // Assets data processing
  const assetsData = useMemo(() => {
    if (!sa360Assets?.result?.campaigns?.[campaignId]?.assets) return null;
    return sa360Assets.result.campaigns[campaignId];
  }, [sa360Assets, campaignId]);



  // Assets summary data
  const assetsSummary = useMemo(() => {
    if (!assetsData?.summary) return null;
    return assetsData.summary;
  }, [assetsData]);

  // Tab Components
  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Performance Summary Cards */}
      {performanceSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Impressions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceSummary.totalImpressions.toLocaleString()}
                </p>
              </div>
              <EyeIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceSummary.totalClicks.toLocaleString()}
                </p>
              </div>
              <CursorArrowRaysIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sa360CampaignReport?.result?.currency?.code || '$'}{performanceSummary.totalCost.toFixed(2)}
                </p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Conversions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceSummary.totalConversions.toLocaleString()}
                </p>
              </div>
              <ShoppingCartIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Additional Performance Metrics */}
      {performanceSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CTR</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(performanceSummary.ctr * 100).toFixed(2)}%
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg CPC</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sa360CampaignReport?.result?.currency?.code || '$'}{performanceSummary.averageCPC.toFixed(2)}
                </p>
              </div>
              <CreditCardIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ROAS</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceSummary.roas.toFixed(2)}x
                </p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conv. Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(performanceSummary.conversionRate * 100).toFixed(2)}%
                </p>
              </div>
              <UserIcon className="h-8 w-8 text-pink-500" />
            </div>
          </div>
        </motion.div>
      )}

              {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Performance Metrics"
              subtitle="Key performance indicators"
              data={chartData.performanceData}
              type="bar"
              height={300}
              gradient={true}
            />
            
            <ChartCard
              title="Financial Metrics"
              subtitle="Cost and revenue analysis"
              data={chartData.financialData}
              type="bar"
              height={300}
              gradient={true}
            />
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Engagement Metrics"
              subtitle="CTR, conversion rate, and ROAS"
              data={chartData.engagementData}
              type="bar"
              height={300}
              gradient={true}
            />
            
            <ChartCard
              title="Performance Trends"
              subtitle="Impressions, clicks, and cost over time"
              data={chartData.timeSeriesData}
              type="line"
              height={300}
              gradient={true}
              multiLine={true}
            />
          </div>

          {/* Audience Targeting Monthly Trends */}
          {audienceChartData.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              <ChartCard
                title="Audience Targeting Monthly Performance"
                subtitle="Monthly trends for audience targeting performance"
                data={audienceChartData.map(item => ({
                  name: item.name,
                  impressions: item.impressions,
                  clicks: item.clicks,
                  cost: item.cost,
                  conversions: item.conversions
                }))}
                type="line"
                height={400}
                gradient={true}
                multiLine={true}
              />
            </div>
          )}

          {/* Area Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Performance Area Chart"
              subtitle="Performance metrics with gradient area fills"
              data={chartData.timeSeriesData}
              type="area"
              height={300}
              gradient={true}
              multiLine={true}
            />
            
            <ChartCard
              title="Financial Area Chart"
              subtitle="Cost trends with gradient area fills"
              data={chartData?.timeSeriesData?.length > 0 ? chartData.timeSeriesData.map(item => ({
                name: item.name,
                cost: item.cost
              })): []}
              type="area"
              height={300}
              gradient={true}
            />
          </div>
        </motion.div>

        {/* Assets Summary Section */}
        {sa360Assets?.result?.overall_summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Assets Overview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Overall performance summary of campaign assets
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sa360Assets.result.overall_summary.total_campaigns?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Campaigns</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sa360Assets.result.overall_summary.total_assets_processed?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assets Processed</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sa360Assets.result.overall_summary.total_impressions?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Impressions</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sa360Assets.result.overall_summary.total_clicks?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sa360Assets.result.overall_summary.total_conversions?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Conversions</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(sa360Assets.result.currency?.code || sa360CampaignReport?.result?.currency?.code || '$')}{(sa360Assets.result.overall_summary.total_cost || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sa360Assets.result.overall_summary.total_clicks > 0 
                      ? ((sa360Assets.result.overall_summary.total_conversions / sa360Assets.result.overall_summary.total_clicks) * 100).toFixed(2)
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sa360Assets.result.overall_summary.total_cost > 0 
                      ? (sa360Assets.result.overall_summary.total_conversions / sa360Assets.result.overall_summary.total_cost).toFixed(2)
                      : 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ROAS</p>
                </div>
              </div>
            </div>
                    </motion.div>
        )}

        {/* Google Account Information */}
        {sa360Assets?.result?.google_account && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Google Account Information</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Account details from assets API
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Account ID</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {sa360Assets.result.google_account.id}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {sa360Assets.result.google_account.name}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {sa360Assets.result.google_account.email}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}


               {/* Performance Metrics Table */}
        {sa360CampaignReport?.result?.metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Core Metrics */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Impressions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(sa360CampaignReport.result.metrics.impressions || 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Clicks
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(sa360CampaignReport.result.metrics.clicks || 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Cost
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ${(sa360CampaignReport.result.metrics.cost || 0).toFixed(2)} {sa360CampaignReport.result.currency?.code}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Conversions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(sa360CampaignReport.result.metrics.conversions || 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      All Conversions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(sa360CampaignReport.result.metrics.all_conversions || 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      CTR
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {((sa360CampaignReport.result.metrics.ctr || 0) * 100).toFixed(2)}%
                    </td>
                  </tr>

                  {/* Additional Metrics */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Interactions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(sa360CampaignReport.result.metrics.interactions || 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Engagements
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(sa360CampaignReport.result.metrics.engagements || 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Orders
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(sa360CampaignReport.result.metrics.orders || 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Phone Calls
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(sa360CampaignReport.result.metrics.phone_calls || 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Units Sold
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(sa360CampaignReport.result.metrics.units_sold || 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Bounce Rate
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {((sa360CampaignReport.result.metrics.bounce_rate || 0) * 100).toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

                 {/* Audience Targeting Data Table */}
         {audienceChartData.length > 0 && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
           >
             <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audience Targeting Performance (Full Year)</h3>
             </div>
             
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                 <thead className="bg-gray-50 dark:bg-gray-700">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Month</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Impressions</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clicks</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cost</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Conversions</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CTR</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CPC</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Conv. Value</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                   {audienceChartData.map((item, index) => (
                     <tr key={index} className={item.impressions === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : ''}>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.impressions.toLocaleString()}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.clicks.toLocaleString()}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sa360CampaignReport?.result?.currency?.code || '$'}{item.cost.toFixed(2)}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.conversions.toLocaleString()}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.ctr.toFixed(2)}%</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sa360CampaignReport?.result?.currency?.code || '$'}{item.average_cpc.toFixed(2)}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sa360CampaignReport?.result?.currency?.code || '$'}{item.conversions_value.toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </motion.div>
         )}
     </div>
   );

  const DemographicsTab = () => (
    <div className="space-y-8">
      {demographicData ? (
        <>
          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Impressions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {demographicData.total_impressions?.toLocaleString() || 0}
                  </p>
                </div>
                <EyeIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {demographicData.total_clicks?.toLocaleString() || 0}
                  </p>
                </div>
                <CursorArrowRaysIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sa360CampaignReport?.result?.currency?.code || '$'}{(demographicData.total_cost || 0).toFixed(2)}
                  </p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Conversions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {demographicData.total_conversions?.toLocaleString() || 0}
                  </p>
                </div>
                <ShoppingCartIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </motion.div>

          {/* Gender Breakdown Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <ChartCard
              title="Gender Performance"
              subtitle="Performance by gender"
              data={demographicChartData.map(item => ({
                name: item.name,
                value: item.impressions
              }))}
              type="bar"
              height={300}
              gradient={true}
            />
            
            <ChartCard
              title="Gender Cost Analysis"
              subtitle="Cost and conversions by gender"
              data={demographicChartData.map(item => ({
                name: item.name,
                cost: item.cost,
                conversions: item.conversions
              }))}
              type="line"
              height={300}
              gradient={true}
              multiLine={true}
            />
          </motion.div>

          {/* Daily Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ChartCard
              title="Daily Demographic Trends"
              subtitle="Performance trends over time"
              data={dailyDemographicData.map(item => ({
                name: item.name,
                impressions: item.impressions,
                clicks: item.clicks,
                cost: item.cost
              }))}
              type="area"
              height={400}
              gradient={true}
              multiLine={true}
            />
          </motion.div>

          {/* Gender Breakdown Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gender Breakdown</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Impressions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clicks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Conversions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CTR</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CPC</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {demographicChartData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.impressions.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.clicks.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sa360CampaignReport?.result?.currency?.code || '$'}{item.cost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.conversions.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.ctr.toFixed(2)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sa360CampaignReport?.result?.currency?.code || '$'}{item.cpc.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Demographic data not available
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                No demographic data available for this campaign.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const LocationsTab = () => (
    <div className="space-y-8">
      {locationData && locationData.length > 0 ? (
        <>
          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Cities</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {locationData.length}
                  </p>
                </div>
                <GlobeAltIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Impressions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {locationData.reduce((sum, location) => sum + (location.impressions || 0), 0).toLocaleString()}
                  </p>
                </div>
                <EyeIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {locationData.reduce((sum, location) => sum + (location.clicks || 0), 0).toLocaleString()}
                  </p>
                </div>
                <CursorArrowRaysIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sa360CampaignReport?.result?.currency?.code || '$'}{locationData.reduce((sum, location) => sum + (location.cost || 0), 0).toFixed(2)}
                  </p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </motion.div>

          {/* Location Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <ChartCard
              title="Location Impressions"
              subtitle="Impressions by city"
              data={locationData.map(location => ({
                name: location.location_name,
                value: location.impressions || 0
              }))}
              type="bar"
              height={300}
              gradient={true}
            />

            <ChartCard
              title="Location Clicks"
              subtitle="Clicks by city"
              data={locationData.map(location => ({
                name: location.location_name,
                value: location.clicks || 0
              }))}
              type="bar"
              height={300}
              gradient={true}
            />
          </motion.div>

          {/* Location Performance Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location Performance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Performance breakdown by city and region
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Impressions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Conversions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      CPC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Conv. Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {locationData.map((location, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {location.location_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {location.location_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {location.canonical_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(location.impressions || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(location.clicks || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {sa360CampaignReport?.result?.currency?.code || '$'}{(location.cost || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(location.all_conversions || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(location.ctr || 0).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {sa360CampaignReport?.result?.currency?.code || '$'}{(location.cpc || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(location.conversion_rate || 0).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Location Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <ChartCard
              title="Location CTR Comparison"
              subtitle="Click-through rates by location"
              data={locationData.map(location => ({
                name: location.location_name,
                value: location.ctr || 0
              }))}
              type="bar"
              height={300}
              gradient={true}
            />

            <ChartCard
              title="Location Cost Distribution"
              subtitle="Cost breakdown by city"
              data={locationData.map(location => ({
                name: location.location_name,
                value: location.cost || 0
              }))}
              type="pie"
              height={300}
              gradient={true}
            />
          </motion.div>
        </>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Location data not available
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                No location performance data available for this campaign.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const DevicesTab = () => (
    <div className="space-y-8">
      {deviceTargetingData ? (
        <>
          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Impressions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {deviceTargetingData.reduce((sum, device) => sum + (device.impressions || 0), 0).toLocaleString()}
                  </p>
                </div>
                <EyeIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {deviceTargetingData.reduce((sum, device) => sum + (device.clicks || 0), 0).toLocaleString()}
                  </p>
                </div>
                <CursorArrowRaysIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sa360CampaignReport?.result?.currency?.code || '$'}{deviceTargetingData.reduce((sum, device) => sum + (device.cost || 0), 0).toFixed(2)}
                  </p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Conversions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {deviceTargetingData.reduce((sum, device) => sum + (device.conversions || 0), 0).toLocaleString()}
                  </p>
                </div>
                <ShoppingCartIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </motion.div>

          {/* Device Performance Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <ChartCard
              title="Device Performance"
              subtitle="Performance by device type"
              data={deviceChartData.map(item => ({
                name: item.name,
                value: item.impressions
              }))}
              type="bar"
              height={300}
              gradient={true}
            />
            
            <ChartCard
              title="Device Cost Analysis"
              subtitle="Cost and conversions by device"
              data={deviceChartData.map(item => ({
                name: item.name,
                cost: item.cost,
                conversions: item.conversions
              }))}
              type="line"
              height={300}
              gradient={true}
              multiLine={true}
            />
          </motion.div>

          {/* Device Performance Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Device Performance Breakdown</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Impressions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clicks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Conversions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CTR</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CPC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Conv. Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {deviceChartData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.impressions.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.clicks.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sa360CampaignReport?.result?.currency?.code || '$'}{item.cost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.conversions.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.ctr.toFixed(2)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sa360CampaignReport?.result?.currency?.code || '$'}{item.average_cpc.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sa360CampaignReport?.result?.currency?.code || '$'}{item.conversions_value.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Device Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <ChartCard
              title="Device CTR Comparison"
              subtitle="Click-through rates by device"
              data={deviceChartData.map(item => ({
                name: item.name,
                value: item.ctr
              }))}
              type="bar"
              height={300}
              gradient={true}
            />
            
            <ChartCard
              title="Device Conversion Analysis"
              subtitle="Conversion rates and values by device"
              data={deviceChartData.map(item => ({
                name: item.name,
                conversions: item.conversions,
                conversions_value: item.conversions_value
              }))}
              type="line"
              height={300}
              gradient={true}
              multiLine={true}
            />
          </motion.div>
        </>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Device targeting data not available
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                No device targeting data available for this campaign.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const AssetsTab = () => (
    <div className="space-y-8">
      {assetsData ? (
        <>
          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {assetsSummary?.total_assets || 0}
                  </p>
                </div>
                <PhotoIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Asset Types</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(assetsSummary?.by_asset_type || {}).length}
                  </p>
                </div>
                <TagIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </motion.div>

          {/* Assets Performance Charts */}
          {/* Assets List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Assets</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {assetsData?.assets?.length || 0} assets found for this campaign
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {assetsData?.assets?.map((asset, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {asset.asset_name || `Asset ${asset.asset_id}`}
                        <div className="text-xs text-gray-500 dark:text-gray-400">ID: {asset.asset_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          asset.asset_type === 'SITELINK' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : asset.asset_type === 'IMAGE'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : asset.asset_type === 'VIDEO'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {asset.asset_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          asset.campaign_asset_status === 'ENABLED' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : asset.campaign_asset_status === 'PAUSED'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {asset.campaign_asset_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {asset.asset_type === 'SITELINK' && asset.sitelink_details ? (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                              <span className="font-medium">Link:</span> {asset.sitelink_details.link_text}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {asset.sitelink_details.description1}
                            </div>
                            {asset.sitelink_details.description2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {asset.sitelink_details.description2}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No additional details</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Assets Insights */}


          {/* Asset Type Breakdown */}
          {assetsSummary?.by_asset_type && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Asset Type Breakdown</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asset Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(assetsSummary.by_asset_type).map(([assetType, data]) => (
                      <tr key={assetType}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            assetType === 'SITELINK' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : assetType === 'IMAGE'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : assetType === 'VIDEO'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {assetType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{data.count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Assets data not available
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                No assets data available for this campaign.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );



  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'demographics':
        return <DemographicsTab />;
      case 'locations':
        return <LocationsTab />;
      case 'devices':
        return <DevicesTab />;
      case 'assets':
        return <AssetsTab />;
      default:
        return <OverviewTab />;
    }
  };

  if (sa360CampaignReportLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (sa360CampaignReportError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading campaign report data
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {sa360CampaignReportError}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaignData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Campaign report data not available
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  No campaign report data available for campaign ID {campaignId}.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {campaignData.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Campaign ID: {campaignData.id}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                campaignData.status === 'ENABLED' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : campaignData.status === 'PAUSED'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {campaignData.status === 'ENABLED' && <PlayIcon className="h-3 w-3 mr-1" />}
                {campaignData.status === 'PAUSED' && <PauseIcon className="h-3 w-3 mr-1" />}
                {campaignData.status === 'REMOVED' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                {campaignData.status}
              </span>
              
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                campaignData.advertising_channel_type === 'SEARCH' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  : campaignData.advertising_channel_type === 'DISPLAY'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                  : campaignData.advertising_channel_type === 'VIDEO'
                  ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
              }`}>
                {campaignData.advertising_channel_type}
              </span>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range:</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateDateRange(option.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    (new Date().getTime() - new Date(dateRange.date_from).getTime()) / (1000 * 60 * 60 * 24) === option.value
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {dateRange.date_from} to {dateRange.date_to}
              </span>
              
              <button
                onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Custom
              </button>
            </div>
          </div>

          {/* Custom Date Picker */}
          {showCustomDatePicker && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From:</label>
                  <input
                    type="date"
                    value={customFromDate}
                    onChange={(e) => setCustomFromDate(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To:</label>
                  <input
                    type="date"
                    value={customToDate}
                    onChange={(e) => setCustomToDate(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <button
                  onClick={() => {
                    setCustomDateRange(customFromDate, customToDate);
                    setShowCustomDatePicker(false);
                  }}
                  className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
                
                <button
                  onClick={() => setShowCustomDatePicker(false)}
                  className="px-3 py-1 text-xs font-medium bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Campaign Details Section */}
        {campaignData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-blue-200 dark:border-gray-600 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Campaign Overview
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Detailed information about your SA360 campaign
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    campaignData.status === 'ENABLED'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : campaignData.status === 'PAUSED'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      campaignData.status === 'ENABLED'
                        ? 'bg-green-500'
                        : campaignData.status === 'PAUSED'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}></div>
                    {campaignData.status}
                  </span>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    campaignData.advertising_channel_type === 'SEARCH'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : campaignData.advertising_channel_type === 'DISPLAY'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                      : campaignData.advertising_channel_type === 'VIDEO'
                      ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                  }`}>
                    {campaignData.advertising_channel_type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Campaign ID */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Campaign ID</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{campaignData.id}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <TagIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Campaign Name */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Campaign Name</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{campaignData.name}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <BuildingOfficeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>

                {/* Start Date */}
                {campaignData.start_date && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{campaignData.start_date}</p>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* End Date */}
                {campaignData.end_date && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{campaignData.end_date}</p>
                      </div>
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <ClockIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Budget */}
                {campaignData.budget && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Budget</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {campaignData.budget.amount} {sa360CampaignReport?.result?.currency?.code}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {campaignData.budget.delivery_method}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                        <CreditCardIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Currency */}
                {sa360CampaignReport?.result?.currency && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Currency</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {sa360CampaignReport.result.currency.code}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {sa360CampaignReport.result.currency.name}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                        <CurrencyDollarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Date Range */}
                {sa360CampaignReport?.result?.date_range && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date Range</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {sa360CampaignReport.result.date_range.from}
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          to {sa360CampaignReport.result.date_range.to}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/20 rounded-full flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Google Account */}
                {sa360CampaignReport?.result?.google_account && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Google Account</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {sa360CampaignReport.result.google_account.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {sa360CampaignReport.result.google_account.email}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bidding Strategy */}
                {campaignData.bidding_strategy_type && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Bidding Strategy</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {campaignData.bidding_strategy_type}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                        <CogIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer ID */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Customer ID</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {sa360CampaignReport?.result?.customer_id || 'N/A'}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comprehensive Metrics Dashboard */}
        {sa360CampaignReport?.result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-8"
          >

            {/* Performance Metrics Section */}
            {sa360CampaignReport.result.metrics && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <ChartBarIcon className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
                    Performance Metrics
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Core campaign performance indicators</p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(sa360CampaignReport.result.metrics.impressions || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Impressions</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(sa360CampaignReport.result.metrics.clicks || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Clicks</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {((sa360CampaignReport.result.metrics.ctr || 0) * 100).toFixed(2)}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">CTR</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(sa360CampaignReport.result.metrics.conversions || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Conversions</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(sa360CampaignReport.result.metrics.all_conversions || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">All Conversions</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(sa360CampaignReport.result.metrics.interactions || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Interactions</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Metrics Section */}
            {sa360CampaignReport.result.financial_metrics && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <CurrencyDollarIcon className="w-6 h-6 mr-3 text-green-600 dark:text-green-400" />
                    Financial Metrics
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Cost and revenue performance</p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {sa360CampaignReport.result.currency?.code || '$'}{(sa360CampaignReport.result.financial_metrics.cost || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {sa360CampaignReport.result.currency?.code || '$'}{(sa360CampaignReport.result.financial_metrics.cpc || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cost per Click</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {sa360CampaignReport.result.currency?.code || '$'}{(sa360CampaignReport.result.financial_metrics.cpm || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cost per Mille</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {sa360CampaignReport.result.currency?.code || '$'}{(sa360CampaignReport.result.financial_metrics.cost_per_conversion || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cost per Conversion</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Engagement & Active View Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Engagement Metrics */}
              {sa360CampaignReport.result.engagement_metrics && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <UserIcon className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400" />
                      Engagement Metrics
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">User interaction and engagement</p>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Engagements</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {(sa360CampaignReport.result.engagement_metrics.engagements || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interactions</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {(sa360CampaignReport.result.engagement_metrics.interactions || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Calls</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {(sa360CampaignReport.result.engagement_metrics.phone_calls || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Impressions</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {(sa360CampaignReport.result.engagement_metrics.phone_impressions || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Engagement Rate</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {((sa360CampaignReport.result.engagement_metrics.engagement_rate || 0) * 100).toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interaction Rate</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {((sa360CampaignReport.result.engagement_metrics.interaction_rate || 0) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Active View Metrics */}
              {sa360CampaignReport.result.active_view_metrics && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <EyeIcon className="w-6 h-6 mr-3 text-orange-600 dark:text-orange-400" />
                      Active View Metrics
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Viewability and measurability</p>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active View Impressions</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {(sa360CampaignReport.result.active_view_metrics.active_view_impressions || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Measurable Impressions</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {(sa360CampaignReport.result.active_view_metrics.active_view_measurable_impressions || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active View CTR</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {((sa360CampaignReport.result.active_view_metrics.active_view_ctr || 0) / 100).toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Measurability</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {((sa360CampaignReport.result.active_view_metrics.active_view_measurability || 0) / 100).toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Viewability</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {((sa360CampaignReport.result.active_view_metrics.active_view_viewability || 0) / 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Impression Share & Location Conversion Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Impression Share Metrics */}
              {sa360CampaignReport.result.impression_share_metrics && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <ChartPieIcon className="w-6 h-6 mr-3 text-cyan-600 dark:text-cyan-400" />
                      Impression Share
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Market share and availability</p>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Absolute Top Impression %</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {((sa360CampaignReport.result.impression_share_metrics.absolute_top_impression_percentage || 0) / 100).toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Impression Share</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {((sa360CampaignReport.result.impression_share_metrics.content_impression_share || 0) * 100).toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Budget Lost Share</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {((sa360CampaignReport.result.impression_share_metrics.content_budget_lost_impression_share || 0) * 100).toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Rank Lost Share</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {((sa360CampaignReport.result.impression_share_metrics.content_rank_lost_impression_share || 0) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Conversion Metrics */}
              {sa360CampaignReport.result.location_conversion_metrics && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <GlobeAltIcon className="w-6 h-6 mr-3 text-pink-600 dark:text-pink-400" />
                      Location Conversions
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Location-based conversion actions</p>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to Call</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {(sa360CampaignReport.result.location_conversion_metrics.click_to_call || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Directions</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {(sa360CampaignReport.result.location_conversion_metrics.directions || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Menu</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {(sa360CampaignReport.result.location_conversion_metrics.menu || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Order</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {(sa360CampaignReport.result.location_conversion_metrics.order || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Visit</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {(sa360CampaignReport.result.location_conversion_metrics.store_visit || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Website</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {(sa360CampaignReport.result.location_conversion_metrics.store_website || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Performance Trends */}
            {sa360CampaignReport.result.performance_trends && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <ArrowTrendingUpIcon className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
                    Performance Trends
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Campaign performance changes over time</p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`text-2xl font-bold ${sa360CampaignReport.result.performance_trends.impressions_trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {sa360CampaignReport.result.performance_trends.impressions_trend >= 0 ? '+' : ''}
                        {sa360CampaignReport.result.performance_trends.impressions_trend?.toFixed(2)}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Impressions Trend</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`text-2xl font-bold ${sa360CampaignReport.result.performance_trends.clicks_trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {sa360CampaignReport.result.performance_trends.clicks_trend >= 0 ? '+' : ''}
                        {sa360CampaignReport.result.performance_trends.clicks_trend?.toFixed(2)}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Clicks Trend</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`text-2xl font-bold ${sa360CampaignReport.result.performance_trends.cost_trend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {sa360CampaignReport.result.performance_trends.cost_trend >= 0 ? '+' : ''}
                        {sa360CampaignReport.result.performance_trends.cost_trend?.toFixed(2)}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cost Trend</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`text-2xl font-bold ${sa360CampaignReport.result.performance_trends.conversions_trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {sa360CampaignReport.result.performance_trends.conversions_trend >= 0 ? '+' : ''}
                        {sa360CampaignReport.result.performance_trends.conversions_trend?.toFixed(2)}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Conversions Trend</p>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Data period: {sa360CampaignReport.result.performance_trends.period_days} days
                    </p>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default SA360CampaignDetail;

