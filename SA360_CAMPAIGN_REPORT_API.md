# SA360 Campaign Report API Integration

## Overview
This document describes the implementation of the SA360 Campaign Report API integration using Redux.

## API Endpoint
```
GET /marketing/sa360/connections/{google_account_id}/customers/{customer_id}/campaigns/{campaign_id}/report/
```

## Redux Implementation

### 1. Redux Action
The new action `fetchGoogleSa360CampaignReport` has been added to the Google slice:

```javascript
export const fetchGoogleSa360CampaignReport = createAsyncThunk(
  'google/fetchSa360CampaignReport',
  async ({ googleAccountId, customerId, campaignId, params = {} }, { rejectWithValue }) => {
    // Implementation details...
  }
);
```

### 2. Redux State
New state properties have been added to the Google slice:

```javascript
// SA360 campaign report data
sa360CampaignReport: null,
sa360CampaignReportLoading: false,
sa360CampaignReportError: null,
```

### 3. Redux Selectors
New selectors are available:

```javascript
export const selectGoogleSa360CampaignReport = (state) => state.google.sa360CampaignReport;
export const selectGoogleSa360CampaignReportLoading = (state) => state.google.sa360CampaignReportLoading;
export const selectGoogleSa360CampaignReportError = (state) => state.google.sa360CampaignReportError;
```

## Usage

### 1. Import the Action and Selectors
```javascript
import { 
  fetchGoogleSa360CampaignReport,
  selectGoogleSa360CampaignReport,
  selectGoogleSa360CampaignReportLoading,
  selectGoogleSa360CampaignReportError
} from '../../store/slices/googleSlice';
```

### 2. Use in Component
```javascript
import { useDispatch, useSelector } from 'react-redux';

const MyComponent = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const sa360CampaignReport = useSelector(selectGoogleSa360CampaignReport);
  const sa360CampaignReportLoading = useSelector(selectGoogleSa360CampaignReportLoading);
  const sa360CampaignReportError = useSelector(selectGoogleSa360CampaignReportError);

  // Dispatch the action
  const fetchCampaignReport = () => {
    dispatch(fetchGoogleSa360CampaignReport({
      googleAccountId: 'your_google_account_id',
      customerId: 'your_customer_id',
      campaignId: 'your_campaign_id',
      params: {
        date_from: '2024-01-01',
        date_to: '2024-12-31'
      }
    }));
  };

  // Console log the data when received
  useEffect(() => {
    if (sa360CampaignReport) {
      console.log('SA360 Campaign Report Data:', sa360CampaignReport);
    }
  }, [sa360CampaignReport]);

  return (
    <div>
      <button onClick={fetchCampaignReport}>Fetch Campaign Report</button>
      {sa360CampaignReportLoading && <div>Loading...</div>}
      {sa360CampaignReportError && <div>Error: {sa360CampaignReportError}</div>}
      {sa360CampaignReport && <div>Data received!</div>}
    </div>
  );
};
```

## API Service
The API endpoint has been added to the marketing service:

```javascript
googleSa360CampaignReport: (googleAccountId, customerId, campaignId, params) => 
  axiosPrivate.get(`/marketing/sa360/connections/${googleAccountId}/customers/${customerId}/campaigns/${campaignId}/report/`, { params }),
```

## Test Component
A test component `SA360CampaignReportTest.jsx` has been created to demonstrate the functionality. This component:

1. Provides a button to trigger the API call
2. Shows the test parameters being used
3. Displays loading, error, and success states
4. Console logs all the data for debugging

## Console Logging
The implementation includes comprehensive console logging:

- **Loading State**: Logs when the API call starts
- **Success State**: Logs the received data with campaign details
- **Error State**: Logs any errors that occur during the API call

## Parameters
The API call accepts the following parameters:

- `googleAccountId` (string): The Google account ID
- `customerId` (string): The customer ID
- `campaignId` (string): The campaign ID
- `params` (object): Additional query parameters (e.g., date range)

## Error Handling
The implementation includes comprehensive error handling:

1. Network errors are caught and logged
2. API response errors are extracted and logged
3. Error messages are stored in Redux state
4. Console logging provides detailed error information

## Integration with Existing Components
The SA360CampaignDetail component has been updated to:

1. Use the new Redux action
2. Console log the campaign report data
3. Handle loading and error states
4. Maintain backward compatibility with existing functionality
