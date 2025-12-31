import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchGoogleSa360CampaignAssets,
  selectGoogleSa360CampaignAssets,
  selectGoogleSa360CampaignAssetsLoading,
  selectGoogleSa360CampaignAssetsError
} from '../../store/slices/googleSlice';

const SA360CampaignAssetsTest = () => {
  const dispatch = useDispatch();
  
  // Selectors for the new endpoint
  const campaignAssets = useSelector(selectGoogleSa360CampaignAssets);
  const loading = useSelector(selectGoogleSa360CampaignAssetsLoading);
  const error = useSelector(selectGoogleSa360CampaignAssetsError);

  // Test the new API endpoint
  const testCampaignAssets = () => {
    const params = {
      googleAccountId: '113057969003083685143',
      customerId: '6278222097',
      // Add any additional query parameters here
      date_from: '2024-01-01',
      date_to: '2024-12-31'
    };

    console.log('Testing SA360 Campaign Assets API with params:', params);
    
    dispatch(fetchGoogleSa360CampaignAssets({
      googleAccountId: params.googleAccountId,
      customerId: params.customerId,
      params: {
        date_from: params.date_from,
        date_to: params.date_to
      }
    }));
  };

  // Log results to console when data changes
  useEffect(() => {
    if (campaignAssets) {
      console.log('SA360 Campaign Assets API Response:', campaignAssets);
    }
  }, [campaignAssets]);

  // Log errors to console
  useEffect(() => {
    if (error) {
      console.error('SA360 Campaign Assets API Error:', error);
    }
  }, [error]);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">SA360 Campaign Assets API Test</h3>
      
      <div className="space-y-4">
        <button
          onClick={testCampaignAssets}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Test Campaign Assets API'}
        </button>

        <div className="text-sm text-gray-600">
          <p>Endpoint: /marketing/sa360/connections/113057969003083685143/customers/6278222097/campaign-assets/</p>
          <p>Status: {loading ? 'Loading...' : error ? 'Error' : campaignAssets ? 'Success' : 'Not tested'}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
            Error: {error}
          </div>
        )}

        {campaignAssets && (
          <div className="p-3 bg-green-100 border border-green-300 rounded text-green-700">
            <p className="font-semibold">API Response Received!</p>
            <p>Check console for full response data.</p>
            <p className="text-sm mt-2">
              Response structure: {JSON.stringify(Object.keys(campaignAssets))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SA360CampaignAssetsTest;

