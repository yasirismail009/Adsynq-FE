import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectMetaCampaignInsightsBreakdowns,
  selectMetaCampaignInsightsHourly,
  selectMetaCampaignInsightsRegion,
  selectMetaCampaignInsightsDevice,
  selectMetaCampaignInsightsPublisherPlatform,
  selectMetaCampaignInsightsBreakdownsLoading,
  selectMetaCampaignInsightsHourlyLoading,
  selectMetaCampaignInsightsRegionLoading,
  selectMetaCampaignInsightsDeviceLoading,
  selectMetaCampaignInsightsPublisherPlatformLoading,
  selectMetaCampaignInsightsBreakdownsError,
  selectMetaCampaignInsightsHourlyError,
  selectMetaCampaignInsightsRegionError,
  selectMetaCampaignInsightsDeviceError,
  selectMetaCampaignInsightsPublisherPlatformError,
  fetchMetaCampaignInsightsBreakdowns,
  fetchMetaCampaignInsightsHourly,
  fetchMetaCampaignInsightsRegion,
  fetchMetaCampaignInsightsDevice,
  fetchMetaCampaignInsightsPublisherPlatform
} from '../store/slices/metaSlice';

export const useCampaignInsights = (campaignId, dateRange) => {
  const dispatch = useDispatch();
  const currentCampaignRef = useRef(null);
  const currentDateRangeRef = useRef(null);
  
  // Selectors for all insights data
  const insightsBreakdowns = useSelector(selectMetaCampaignInsightsBreakdowns);
  const insightsHourly = useSelector(selectMetaCampaignInsightsHourly);
  const insightsRegion = useSelector(selectMetaCampaignInsightsRegion);
  const insightsDevice = useSelector(selectMetaCampaignInsightsDevice);
  const insightsPublisherPlatform = useSelector(selectMetaCampaignInsightsPublisherPlatform);
  
  // Loading states
  const loadingBreakdowns = useSelector(selectMetaCampaignInsightsBreakdownsLoading);
  const loadingHourly = useSelector(selectMetaCampaignInsightsHourlyLoading);
  const loadingRegion = useSelector(selectMetaCampaignInsightsRegionLoading);
  const loadingDevice = useSelector(selectMetaCampaignInsightsDeviceLoading);
  const loadingPublisherPlatform = useSelector(selectMetaCampaignInsightsPublisherPlatformLoading);
  
  // Error states
  const errorBreakdowns = useSelector(selectMetaCampaignInsightsBreakdownsError);
  const errorHourly = useSelector(selectMetaCampaignInsightsHourlyError);
  const errorRegion = useSelector(selectMetaCampaignInsightsRegionError);
  const errorDevice = useSelector(selectMetaCampaignInsightsDeviceError);
  const errorPublisherPlatform = useSelector(selectMetaCampaignInsightsPublisherPlatformError);
  
  // Combined loading state
  const isLoading = loadingBreakdowns || loadingHourly || loadingRegion || loadingDevice || loadingPublisherPlatform;
  
  // Combined error state
  const hasErrors = errorBreakdowns || errorHourly || errorRegion || errorDevice || errorPublisherPlatform;
  
  // Fetch all insights data
  const fetchAllInsights = useCallback(() => {
    if (!campaignId) return;
    
    console.log(`Fetching all insights for campaign: ${campaignId}`, dateRange);
    
    // Update refs to track current campaign and date range
    currentCampaignRef.current = campaignId;
    currentDateRangeRef.current = { ...dateRange };
    
    // Fetch all insights in parallel
    const promises = [
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
        console.log(`Insights fetch completed: ${fulfilled} successful, ${rejected} failed`);
      })
      .catch((error) => {
        console.error('Error fetching campaign insights:', error);
      });
  }, [campaignId, dateRange, dispatch]);
  
  // Refresh all insights
  const refreshAllInsights = useCallback(() => {
    if (!campaignId) return;
    
    console.log(`Refreshing all insights for campaign: ${campaignId}`);
    
    // Update refs to ensure fresh fetch
    currentCampaignRef.current = campaignId;
    currentDateRangeRef.current = { ...dateRange };
    
    fetchAllInsights();
  }, [campaignId, dateRange, fetchAllInsights]);
  
  // Auto-fetch on mount or when dependencies change
  useEffect(() => {
    const isNewCampaign = currentCampaignRef.current !== campaignId;
    const isNewDateRange = !currentDateRangeRef.current || 
      currentDateRangeRef.current.date_from !== dateRange.date_from ||
      currentDateRangeRef.current.date_to !== dateRange.date_to;
    
    if (isNewCampaign || isNewDateRange) {
      fetchAllInsights();
    }
  }, [fetchAllInsights]);
  
  return {
    // Data
    insightsBreakdowns,
    insightsHourly,
    insightsRegion,
    insightsDevice,
    insightsPublisherPlatform,
    
    // Loading states
    isLoading,
    loadingBreakdowns,
    loadingHourly,
    loadingRegion,
    loadingDevice,
    loadingPublisherPlatform,
    
    // Error states
    hasErrors,
    errorBreakdowns,
    errorHourly,
    errorRegion,
    errorDevice,
    errorPublisherPlatform,
    
    // Actions
    fetchAllInsights,
    refreshAllInsights,
    
    // Current campaign tracking
    currentCampaignId: currentCampaignRef.current
  };
};
