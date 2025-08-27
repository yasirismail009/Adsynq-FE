import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchGoogleSa360CampaignReport,
  selectGoogleSa360CampaignReport,
  selectGoogleSa360CampaignReportLoading,
  selectGoogleSa360CampaignReportError
} from '../../store/slices/googleSlice';

const SA360CampaignReportTest = () => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const sa360CampaignReport = useSelector(selectGoogleSa360CampaignReport);
  const sa360CampaignReportLoading = useSelector(selectGoogleSa360CampaignReportLoading);
  const sa360CampaignReportError = useSelector(selectGoogleSa360CampaignReportError);

  // Test parameters - you can modify these as needed
  const testParams = {
    googleAccountId: '113057969003083685143',
    customerId: '6278222097',
    campaignId: '123456789',
    params: {
      date_from: '2024-01-01',
      date_to: '2024-12-31'
    }
  };

  // Function to trigger the API call
  const handleFetchCampaignReport = () => {
    console.log('Triggering SA360 Campaign Report API call with params:', testParams);
    dispatch(fetchGoogleSa360CampaignReport(testParams));
  };

  // Console log data when received
  useEffect(() => {
    if (sa360CampaignReport) {
      console.log('✅ SA360 Campaign Report Data Received:', sa360CampaignReport);
      console.log('📊 Campaign ID:', testParams.campaignId);
      console.log('🔗 Google Account ID:', testParams.googleAccountId);
      console.log('👤 Customer ID:', testParams.customerId);
    }
  }, [sa360CampaignReport]);

  // Console log errors when they occur
  useEffect(() => {
    if (sa360CampaignReportError) {
      console.error('❌ SA360 Campaign Report Error:', sa360CampaignReportError);
      console.log('🔍 Campaign ID:', testParams.campaignId);
      console.log('🔍 Google Account ID:', testParams.googleAccountId);
      console.log('🔍 Customer ID:', testParams.customerId);
    }
  }, [sa360CampaignReportError]);

  // Console log loading state
  useEffect(() => {
    if (sa360CampaignReportLoading) {
      console.log('⏳ SA360 Campaign Report Loading...');
      console.log('🎯 Campaign ID:', testParams.campaignId);
      console.log('🎯 Google Account ID:', testParams.googleAccountId);
      console.log('🎯 Customer ID:', testParams.customerId);
    }
  }, [sa360CampaignReportLoading]);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        SA360 Campaign Report Test
      </h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Parameters:</h3>
          <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
            {JSON.stringify(testParams, null, 2)}
          </pre>
        </div>

        <button
          onClick={handleFetchCampaignReport}
          disabled={sa360CampaignReportLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sa360CampaignReportLoading ? 'Loading...' : 'Fetch Campaign Report'}
        </button>

        {sa360CampaignReportLoading && (
          <div className="text-sm text-blue-600 dark:text-blue-400">
            ⏳ Loading campaign report data...
          </div>
        )}

        {sa360CampaignReportError && (
          <div className="text-sm text-red-600 dark:text-red-400">
            ❌ Error: {sa360CampaignReportError}
          </div>
        )}

        {sa360CampaignReport && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
              ✅ Campaign Report Data Received:
            </h3>
            <pre className="text-xs text-green-700 dark:text-green-300 overflow-x-auto max-h-96">
              {JSON.stringify(sa360CampaignReport, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          💡 Check the browser console for detailed logs of the API call and response data.
        </div>
      </div>
    </div>
  );
};

export default SA360CampaignReportTest;
