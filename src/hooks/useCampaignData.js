import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectMetaCampaignData,
  selectMetaCampaignDataLoading,
  selectMetaCampaignDataError,
  fetchMetaCampaignData,
  clearCampaignData
} from '../store/slices/metaSlice';

export const useCampaignData = (campaignId, dateRange) => {
  const dispatch = useDispatch();
  const currentCampaignRef = useRef(null);
  const currentDateRangeRef = useRef(null);
  
  // Selectors - get data for the current campaign (single object in Redux)
  const campaignData = useSelector(state => 
    campaignId ? selectMetaCampaignData(state) : null
  );
  const isLoading = useSelector(state => 
    campaignId ? selectMetaCampaignDataLoading(state) : false
  );
  const error = useSelector(state => 
    campaignId ? selectMetaCampaignDataError(state) : null
  );
  
  // Clear previous campaign data when switching campaigns
  const clearPreviousCampaignData = useCallback(() => {
    if (currentCampaignRef.current && currentCampaignRef.current !== campaignId) {
      // Clear only campaign data when switching to a new campaign
      dispatch(clearCampaignData());
      console.log(`Cleared data for previous campaign: ${currentCampaignRef.current}`);
    }
  }, [campaignId, dispatch]);
  
  // Fetch function - ensures only one campaign is active
  const fetchData = useCallback(() => {
    if (!campaignId) return;
    
    // Clear previous campaign data if switching campaigns
    clearPreviousCampaignData();
    
    // Check if we need to fetch (new campaign or new date range)
    const isNewCampaign = currentCampaignRef.current !== campaignId;
    const isNewDateRange = !currentDateRangeRef.current || 
      currentDateRangeRef.current.date_from !== dateRange.date_from ||
      currentDateRangeRef.current.date_to !== dateRange.date_to;
    
    if (isNewCampaign || isNewDateRange) {
      // Update refs to track current campaign and date range
      currentCampaignRef.current = campaignId;
      currentDateRangeRef.current = { ...dateRange };
      
      console.log(`Fetching data for campaign: ${campaignId}`, dateRange);
      
      dispatch(fetchMetaCampaignData({ campaignId, dateRange }))
        .catch(error => {
          console.error('Error fetching campaign data:', error);
        });
    }
  }, [campaignId, dateRange, dispatch, clearPreviousCampaignData]);
  
  // Refresh function - forces refetch of current campaign
  const refreshData = useCallback(() => {
    if (!campaignId) return;
    
    console.log(`Refreshing data for campaign: ${campaignId}`);
    
    // Update refs to ensure fresh fetch
    currentCampaignRef.current = campaignId;
    currentDateRangeRef.current = { ...dateRange };
    
    dispatch(fetchMetaCampaignData({ campaignId, dateRange }))
      .catch(error => {
        console.error('Error refreshing campaign data:', error);
      });
  }, [campaignId, dateRange, dispatch]);
  
  // Clear data function - manually clear current campaign data
  const clearData = useCallback(() => {
    dispatch(clearCampaignData());
    currentCampaignRef.current = null;
    currentDateRangeRef.current = null;
    console.log('Campaign data cleared');
  }, [dispatch]);
  
  // Auto-fetch on mount or when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Optional: Clear data when component unmounts
      // Uncomment the line below if you want to clear data on unmount
      // clearData();
    };
  }, [clearData]);
  
  return {
    campaignData,
    isLoading,
    error,
    refreshData,
    clearData,
    currentCampaignId: currentCampaignRef.current
  };
};
