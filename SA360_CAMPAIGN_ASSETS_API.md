# SA360 Campaign Assets API Integration

## Overview
This document describes the integration of the new SA360 Campaign Assets API endpoint into the Google slice and API service.

## API Endpoint
```
GET /marketing/sa360/connections/{googleAccountId}/customers/{customerId}/campaign-assets/
```

## Implementation Details

### 1. API Service (`src/services/api.js`)
Added new endpoint function:
```javascript
googleSa360CampaignAssets: (googleAccountId, customerId, params) => 
  axiosPrivate.get(`/marketing/sa360/connections/${googleAccountId}/customers/${customerId}/campaign-assets/`, { params })
```

### 2. Google Slice (`src/store/slices/googleSlice.js`)
Added new async thunk:
```javascript
export const fetchGoogleSa360CampaignAssets = createAsyncThunk(
  'google/fetchSa360CampaignAssets',
  async ({ googleAccountId, customerId, params = {} }, { rejectWithValue }) => {
    // Implementation details...
  }
);
```

Added new state properties:
- `sa360CampaignAssets`: Stores the API response data
- `sa360CampaignAssetsLoading`: Loading state indicator
- `sa360CampaignAssetsError`: Error state for error handling

Added new selectors:
- `selectGoogleSa360CampaignAssets`
- `selectGoogleSa360CampaignAssetsLoading`
- `selectGoogleSa360CampaignAssetsError`

### 3. Test Component (`src/components/integrations/SA360CampaignAssetsTest.jsx`)
A React component that demonstrates how to use the new API endpoint with console logging.

### 4. Test Utility (`src/utils/test-sa360-campaign-assets.js`)
Utility functions for testing the API endpoint directly.

## Usage Examples

### Using Redux Thunk
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchGoogleSa360CampaignAssets,
  selectGoogleSa360CampaignAssets,
  selectGoogleSa360CampaignAssetsLoading,
  selectGoogleSa360CampaignAssetsError
} from '../store/slices/googleSlice';

const MyComponent = () => {
  const dispatch = useDispatch();
  const campaignAssets = useSelector(selectGoogleSa360CampaignAssets);
  const loading = useSelector(selectGoogleSa360CampaignAssetsLoading);
  const error = useSelector(selectGoogleSa360CampaignAssetsError);

  const fetchAssets = () => {
    dispatch(fetchGoogleSa360CampaignAssets({
      googleAccountId: '113057969003083685143',
      customerId: '6278222097',
      params: {
        date_from: '2024-01-01',
        date_to: '2024-12-31'
      }
    }));
  };

  // Component logic...
};
```

### Direct API Call
```javascript
import { apiService } from '../services/api';

const fetchAssets = async () => {
  try {
    const response = await apiService.marketing.googleSa360CampaignAssets(
      '113057969003083685143',
      '6278222097',
      { date_from: '2024-01-01', date_to: '2024-12-31' }
    );
    console.log('Assets:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Using Test Utility
```javascript
import { testSpecificEndpoint } from '../utils/test-sa360-campaign-assets';

// Test with predefined parameters
testSpecificEndpoint()
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
```

## Testing

### 1. UI Testing
Navigate to the Integrations page to see the test component that allows you to test the API endpoint with a button click.

### 2. Console Testing
Use the test utility functions in the browser console:
```javascript
// Import the test utility
import { testSpecificEndpoint } from './src/utils/test-sa360-campaign-assets.js';

// Run the test
testSpecificEndpoint();
```

### 3. Redux DevTools
Monitor the Redux state changes when calling the API endpoint to see the loading, success, and error states.

## Parameters

### Required Parameters
- `googleAccountId`: The Google account ID (e.g., '113057969003083685143')
- `customerId`: The customer ID (e.g., '6278222097')

### Optional Query Parameters
- `date_from`: Start date for filtering (format: YYYY-MM-DD)
- `date_to`: End date for filtering (format: YYYY-MM-DD)
- Any other parameters supported by the backend API

## Error Handling
The implementation includes comprehensive error handling:
- Network errors
- API response errors
- Validation errors
- Error messages are logged to console and stored in Redux state

## Console Logging
All API calls and responses are logged to the console for debugging purposes:
- Request parameters
- Response data
- Error details
- Loading states

## Notes
- This endpoint is different from the campaign-specific assets endpoint (`/campaigns/{campaignId}/assets/`)
- The new endpoint provides campaign assets across all campaigns for a customer
- Console logging is implemented for debugging without UI creation
- The implementation follows the existing patterns in the Google slice

