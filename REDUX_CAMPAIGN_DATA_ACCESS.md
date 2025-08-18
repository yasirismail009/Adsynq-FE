# Redux Campaign Data Access Guide

## Overview

This guide shows how to access and map campaign data from Redux based on the actual Redux DevTools structure. The campaign data is stored in `state.meta.campaignData.result` as a single object.

## Redux Data Structure

Based on the Redux DevTools screenshot, the campaign data structure is:

```javascript
// Redux State Structure
{
  meta: {
    campaignData: {
      error: false,
      result: {
        campaign_id: "120208067425630493",
        insights_data: {
          impressions: "3678...",
          clicks: "...",
          spend: "...",
          reach: "...",
          ctr: "...",
          cpc: "...",
          cpm: "...",
          frequency: "...",
          results: [
            {
              values: [
                {
                  value: "..." // conversions
                }
              ]
            }
          ],
          video_play_actions: [
            {
              value: "..." // video plays
            }
          ],
          account_currency: "USD",
          date_start: "...",
          date_stop: "...",
          campaign_name: "..."
        },
        data_count: 1,
        source: "Facebook Graph API",
        message: "Campaign insights retrieved successfully for campaign 120208067425630493"
      }
    },
    loading: {
      campaignData: false
    },
    errors: {
      campaignData: null
    }
  }
}
```

## Accessing Data from Redux

### Method 1: Using the Hook (Recommended)

```jsx
import { useCampaignData } from '../../hooks/useCampaignData';

const CampaignDetail = () => {
  const { campaignData, isLoading, error, refreshData } = useCampaignData(campaignId, dateRange);
  
  // The hook automatically handles Redux access and provides:
  // - campaignData: The processed campaign data
  // - isLoading: Loading state
  // - error: Error state
  // - refreshData: Function to refresh data
};
```

### Method 2: Direct Redux Access

```jsx
import { useSelector } from 'react-redux';

const CampaignDetail = () => {
  // Direct access to Redux state
  const directCampaignData = useSelector(state => state.meta?.campaignData?.result);
  const directLoading = useSelector(state => state.meta?.loading?.campaignData);
  const directError = useSelector(state => state.meta?.errors?.campaignData);
  
  // Access the raw data structure
  console.log('Raw Redux data:', directCampaignData);
};
```

## Data Mapping Functions

### Comprehensive Data Mapping

```jsx
const mapReduxCampaignData = useMemo(() => {
  // Get the raw data from Redux
  const rawData = directCampaignData || campaignData?.result || campaignData;
  
  if (!rawData) {
    return {
      isAvailable: false,
      data: null,
      insights: null,
      campaignInfo: null,
      metrics: null
    };
  }

  return {
    isAvailable: true,
    data: rawData,
    
    // Extract insights data
    insights: {
      campaign_id: rawData.campaign_id,
      impressions: rawData.insights_data?.impressions || 0,
      clicks: rawData.insights_data?.clicks || 0,
      spend: rawData.insights_data?.spend || 0,
      reach: rawData.insights_data?.reach || 0,
      ctr: rawData.insights_data?.ctr || 0,
      cpc: rawData.insights_data?.cpc || 0,
      cpm: rawData.insights_data?.cpm || 0,
      frequency: rawData.insights_data?.frequency || 0,
      conversions: rawData.insights_data?.results?.[0]?.values?.[0]?.value || 0,
      video_plays: rawData.insights_data?.video_play_actions?.[0]?.value || 0,
      account_currency: rawData.insights_data?.account_currency || 'USD',
      date_start: rawData.insights_data?.date_start,
      date_stop: rawData.insights_data?.date_stop,
      campaign_name: rawData.insights_data?.campaign_name
    },
    
    // Extract campaign information
    campaignInfo: {
      id: rawData.campaign_id,
      name: rawData.insights_data?.campaign_name || 'Unknown Campaign',
      source: rawData.source || 'Meta API',
      message: rawData.message,
      data_count: rawData.data_count,
      currency: rawData.insights_data?.account_currency || 'USD'
    },
    
    // Calculate derived metrics
    metrics: {
      spend: parseFloat(rawData.insights_data?.spend) || 0,
      impressions: parseInt(rawData.insights_data?.impressions) || 0,
      clicks: parseInt(rawData.insights_data?.clicks) || 0,
      reach: parseInt(rawData.insights_data?.reach) || 0,
      ctr: parseFloat(rawData.insights_data?.ctr) || 0,
      cpc: parseFloat(rawData.insights_data?.cpc) || 0,
      cpm: parseFloat(rawData.insights_data?.cpm) || 0,
      frequency: parseFloat(rawData.insights_data?.frequency) || 0,
      conversions: parseInt(rawData.insights_data?.results?.[0]?.values?.[0]?.value) || 0,
      video_plays: parseInt(rawData.insights_data?.video_play_actions?.[0]?.value) || 0,
      currency: rawData.insights_data?.account_currency || 'USD'
    }
  };
}, [directCampaignData, campaignData]);
```

### Simple Data Extraction

```jsx
// Extract specific metrics
const extractMetrics = (rawData) => {
  if (!rawData?.insights_data) return null;
  
  return {
    spend: parseFloat(rawData.insights_data.spend) || 0,
    impressions: parseInt(rawData.insights_data.impressions) || 0,
    clicks: parseInt(rawData.insights_data.clicks) || 0,
    reach: parseInt(rawData.insights_data.reach) || 0,
    ctr: parseFloat(rawData.insights_data.ctr) || 0,
    cpc: parseFloat(rawData.insights_data.cpc) || 0,
    cpm: parseFloat(rawData.insights_data.cpm) || 0,
    frequency: parseFloat(rawData.insights_data.frequency) || 0,
    conversions: parseInt(rawData.insights_data.results?.[0]?.values?.[0]?.value) || 0,
    video_plays: parseInt(rawData.insights_data.video_play_actions?.[0]?.value) || 0
  };
};

// Extract campaign info
const extractCampaignInfo = (rawData) => {
  if (!rawData) return null;
  
  return {
    id: rawData.campaign_id,
    name: rawData.insights_data?.campaign_name,
    source: rawData.source,
    message: rawData.message,
    data_count: rawData.data_count,
    currency: rawData.insights_data?.account_currency
  };
};
```

## Usage Examples

### Example 1: Display Campaign Metrics

```jsx
const CampaignMetrics = () => {
  const campaignData = useSelector(state => state.meta?.campaignData?.result);
  
  if (!campaignData) return <div>No data available</div>;
  
  const metrics = extractMetrics(campaignData);
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <div>
        <h3>Spend</h3>
        <p>{formatCurrency(metrics.spend, metrics.currency)}</p>
      </div>
      <div>
        <h3>Impressions</h3>
        <p>{formatNumber(metrics.impressions)}</p>
      </div>
      <div>
        <h3>Clicks</h3>
        <p>{formatNumber(metrics.clicks)}</p>
      </div>
      <div>
        <h3>CTR</h3>
        <p>{formatPercentage(metrics.ctr)}</p>
      </div>
    </div>
  );
};
```

### Example 2: Campaign Information Display

```jsx
const CampaignInfo = () => {
  const campaignData = useSelector(state => state.meta?.campaignData?.result);
  
  if (!campaignData) return <div>No campaign data</div>;
  
  const info = extractCampaignInfo(campaignData);
  
  return (
    <div className="space-y-2">
      <h2>{info.name}</h2>
      <p>ID: {info.id}</p>
      <p>Source: {info.source}</p>
      <p>Currency: {info.currency}</p>
      <p>Data Count: {info.data_count}</p>
      <p className="text-sm text-gray-600">{info.message}</p>
    </div>
  );
};
```

### Example 3: Using the Hook with Direct Redux Access

```jsx
const CampaignDetail = () => {
  const { campaignData, isLoading, error, refreshData } = useCampaignData(campaignId, dateRange);
  
  // Direct Redux access for additional data
  const directCampaignData = useSelector(state => state.meta?.campaignData?.result);
  
  // Use hook data as primary, direct Redux as fallback
  const finalData = campaignData?.result || directCampaignData;
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!finalData) return <div>No data available</div>;
  
  const metrics = extractMetrics(finalData);
  const info = extractCampaignInfo(finalData);
  
  return (
    <div>
      <CampaignInfo info={info} />
      <CampaignMetrics metrics={metrics} />
      <button onClick={refreshData}>Refresh Data</button>
    </div>
  );
};
```

## Best Practices

### 1. Use the Hook for Primary Access
```jsx
// ✅ Recommended
const { campaignData, isLoading, error } = useCampaignData(campaignId, dateRange);

// ❌ Avoid direct Redux access unless necessary
const directData = useSelector(state => state.meta?.campaignData?.result);
```

### 2. Handle Data Safely
```jsx
// ✅ Safe data access
const spend = parseFloat(rawData?.insights_data?.spend) || 0;

// ❌ Unsafe access
const spend = parseFloat(rawData.insights_data.spend);
```

### 3. Use Memoization for Expensive Operations
```jsx
// ✅ Memoized data mapping
const mappedData = useMemo(() => {
  return mapReduxCampaignData(rawData);
}, [rawData]);

// ❌ Recalculating on every render
const mappedData = mapReduxCampaignData(rawData);
```

### 4. Provide Fallbacks
```jsx
// ✅ With fallbacks
const campaignName = rawData?.insights_data?.campaign_name || 'Unknown Campaign';
const currency = rawData?.insights_data?.account_currency || 'USD';

// ❌ Without fallbacks
const campaignName = rawData.insights_data.campaign_name;
```

## Debug Information

### Development Debug Panel
```jsx
{process.env.NODE_ENV === 'development' && (
  <div className="debug-panel">
    <h4>Redux Data Debug:</h4>
    <p>Direct Redux Data: {directCampaignData ? 'Available' : 'Not Available'}</p>
    <p>Hook Data: {campaignData ? 'Available' : 'Not Available'}</p>
    <p>Campaign ID: {mapReduxCampaignData.campaignInfo?.id || 'N/A'}</p>
    <p>Source: {mapReduxCampaignData.campaignInfo?.source || 'N/A'}</p>
  </div>
)}
```

### Console Logging
```jsx
// Log Redux data structure
console.log('Raw Redux Data:', directCampaignData);
console.log('Mapped Data:', mapReduxCampaignData);
console.log('Metrics:', mapReduxCampaignData.metrics);
```

## Conclusion

The campaign data in Redux follows a specific structure with the main data in `state.meta.campaignData.result`. The `useCampaignData` hook provides the recommended way to access this data, but direct Redux access is also available when needed.

Key points:
- Use the hook for primary data access
- Access `state.meta.campaignData.result` for direct Redux access
- Always handle data safely with fallbacks
- Use memoization for expensive data mapping operations
- Provide debug information in development mode
