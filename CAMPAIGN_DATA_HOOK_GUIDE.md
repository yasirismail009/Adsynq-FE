# Campaign Data Hook Guide

## Overview

The `useCampaignData` hook has been refined to ensure **only one campaign's details are managed at a time**. This approach provides better memory management, cleaner state handling, and prevents data conflicts between multiple campaigns.

## Key Features

### 🎯 Single Campaign Management
- **One campaign active at a time**: The hook automatically clears previous campaign data when switching to a new campaign
- **Automatic cleanup**: Previous campaign data is removed from Redux store when switching campaigns
- **Memory efficient**: Only stores data for the currently active campaign

### 🔄 Smart Data Fetching
- **Automatic fetching**: Data is fetched when campaign ID or date range changes
- **Duplicate prevention**: Prevents unnecessary API calls for the same campaign and date range
- **Refresh capability**: Manual refresh function to force fresh data fetch

### 🛡️ Error Handling
- **Comprehensive error states**: Tracks loading, error, and data states
- **Graceful error recovery**: Errors are properly handled and displayed
- **Manual data clearing**: Ability to clear all campaign data when needed

## Usage

### Basic Usage

```jsx
import { useCampaignData } from '../hooks/useCampaignData';

const CampaignComponent = () => {
  const [campaignId, setCampaignId] = useState('');
  const [dateRange, setDateRange] = useState({
    date_from: '2024-01-01',
    date_to: '2024-12-31'
  });

  const {
    campaignData,
    isLoading,
    error,
    refreshData,
    clearData,
    currentCampaignId
  } = useCampaignData(campaignId, dateRange);

  // Your component logic here
};
```

### Hook Return Values

| Property | Type | Description |
|----------|------|-------------|
| `campaignData` | `Object \| null` | The fetched campaign data |
| `isLoading` | `boolean` | Whether data is currently being fetched |
| `error` | `string \| null` | Error message if fetch failed |
| `refreshData` | `function` | Function to manually refresh data |
| `clearData` | `function` | Function to clear all campaign data |
| `currentCampaignId` | `string \| null` | ID of the currently active campaign |

## How It Works

### 1. Campaign Switching
When you change the `campaignId` prop:

```jsx
// Previous campaign data is automatically cleared
setCampaignId('new-campaign-id');
```

**What happens:**
1. Hook detects campaign ID change
2. Automatically clears previous campaign data from Redux store
3. Fetches new campaign data
4. Updates internal refs to track current campaign

### 2. Date Range Changes
When you change the `dateRange` prop:

```jsx
setDateRange({
  date_from: '2024-04-01',
  date_to: '2024-06-30'
});
```

**What happens:**
1. Hook detects date range change
2. Refetches data for the current campaign with new date range
3. Updates internal refs to track current date range

### 3. Manual Refresh
When you call `refreshData()`:

```jsx
const handleRefresh = () => {
  refreshData(); // Forces fresh data fetch
};
```

**What happens:**
1. Forces a new API call regardless of cached data
2. Updates loading state during fetch
3. Replaces existing data with fresh data

## Redux Store Integration

### State Structure
The hook integrates with the Redux store using the following simplified structure:

```javascript
// Redux state structure
{
  meta: {
    campaignData: campaignDataObject, // Single object, not indexed by campaignId
    loading: {
      campaignData: boolean // Single boolean, not indexed by campaignId
    },
    errors: {
      campaignData: string | null // Single error, not indexed by campaignId
    }
  }
}
```

### Actions Used
- `fetchMetaCampaignData`: Fetches campaign data
- `clearCampaignData`: Clears all campaign data (preserves other meta data)

## Best Practices

### 1. Component Lifecycle
```jsx
const CampaignDetail = ({ campaignId }) => {
  const { campaignData, isLoading, error } = useCampaignData(campaignId, dateRange);

  // Component automatically handles data fetching and cleanup
  // No need for manual useEffect cleanup
};
```

### 2. Error Handling
```jsx
const CampaignDetail = ({ campaignId }) => {
  const { campaignData, isLoading, error } = useCampaignData(campaignId, dateRange);

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return <div>{/* Render campaign data */}</div>;
};
```

### 3. Manual Data Management
```jsx
const CampaignManager = () => {
  const { refreshData, clearData } = useCampaignData(campaignId, dateRange);

  const handleRefresh = () => {
    refreshData(); // Force fresh data
  };

  const handleClear = () => {
    clearData(); // Clear all campaign data
  };

  return (
    <div>
      <button onClick={handleRefresh}>Refresh</button>
      <button onClick={handleClear}>Clear Data</button>
    </div>
  );
};
```

## Performance Benefits

### Memory Efficiency
- **Reduced memory usage**: Only one campaign's data in memory at a time
- **Automatic cleanup**: Previous data is cleared when switching campaigns
- **No memory leaks**: Proper cleanup prevents accumulation of unused data

### Network Efficiency
- **Smart caching**: Prevents duplicate API calls for same campaign/date range
- **Conditional fetching**: Only fetches when necessary
- **Batch operations**: Single API call per campaign switch

### State Management
- **Simplified Redux state**: Single object instead of indexed by campaignId
- **Faster selectors**: No need to look up by campaignId
- **Reduced re-renders**: Optimized state updates
- **Memory efficient**: Only one campaign object in memory

## Migration from Multi-Campaign Approach

If you were previously managing multiple campaigns simultaneously:

### Before (Multi-Campaign)
```jsx
// ❌ Old approach - multiple campaigns in memory
const campaigns = ['campaign-1', 'campaign-2', 'campaign-3'];
campaigns.forEach(id => {
  // Each campaign data stored separately
  // Memory usage grows with number of campaigns
});
```

### After (Single Campaign)
```jsx
// ✅ New approach - one campaign at a time
const [currentCampaign, setCurrentCampaign] = useState('campaign-1');
const { campaignData } = useCampaignData(currentCampaign, dateRange);

// Switch campaigns as needed
const switchCampaign = (newId) => {
  setCurrentCampaign(newId); // Previous data automatically cleared
};
```

## Example Implementation

See `src/components/dashboard/CampaignDetailExample.jsx` for a complete working example that demonstrates:

- Campaign switching
- Date range changes
- Manual refresh
- Data clearing
- Status monitoring

## Troubleshooting

### Common Issues

1. **Data not clearing when switching campaigns**
   - Ensure you're using the latest version of the hook
   - Check that `campaignId` prop is actually changing
   - Verify Redux store is properly connected

2. **Multiple API calls for same campaign**
   - Check that `dateRange` object is stable (use `useMemo` if needed)
   - Ensure `campaignId` is not changing unnecessarily

3. **Memory leaks**
   - The hook automatically handles cleanup
   - If issues persist, check for component unmounting properly

### Debug Information
The hook provides debug information through console logs:
- Campaign switching events
- Data fetching events
- Data clearing events

Enable debug mode by checking browser console for detailed logs.

## Conclusion

The refined `useCampaignData` hook provides a clean, efficient, and maintainable approach to managing campaign data. By ensuring only one campaign is active at a time, it eliminates data conflicts, reduces memory usage, and provides a better user experience.

The single campaign approach is particularly beneficial for:
- Dashboard applications with campaign switching
- Detail views that focus on one campaign at a time
- Mobile applications with limited memory
- Applications requiring clean state management
