import React, { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';

const CampaignDetailExample = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [dateRange, setDateRange] = useState({
    date_from: '2024-01-01',
    date_to: '2024-12-31'
  });

  // Use the refined hook - ensures only one campaign is active at a time
  const {
    campaignData,
    isLoading,
    error,
    refreshData,
    clearData,
    currentCampaignId
  } = useCampaignData(selectedCampaignId, dateRange);

  const handleCampaignChange = (campaignId) => {
    setSelectedCampaignId(campaignId);
    // The hook will automatically clear previous campaign data
    // and fetch new campaign data
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    // The hook will automatically refetch data for the current campaign
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Campaign Detail Example</h2>
      
      {/* Campaign Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Campaign
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleCampaignChange('campaign-1')}
            className={`px-4 py-2 rounded ${
              selectedCampaignId === 'campaign-1'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Campaign 1
          </button>
          <button
            onClick={() => handleCampaignChange('campaign-2')}
            className={`px-4 py-2 rounded ${
              selectedCampaignId === 'campaign-2'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Campaign 2
          </button>
          <button
            onClick={() => handleCampaignChange('campaign-3')}
            className={`px-4 py-2 rounded ${
              selectedCampaignId === 'campaign-3'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Campaign 3
          </button>
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Range
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleDateRangeChange({
              date_from: '2024-01-01',
              date_to: '2024-03-31'
            })}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Q1 2024
          </button>
          <button
            onClick={() => handleDateRangeChange({
              date_from: '2024-04-01',
              date_to: '2024-06-30'
            })}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Q2 2024
          </button>
          <button
            onClick={() => handleDateRangeChange({
              date_from: '2024-07-01',
              date_to: '2024-09-30'
            })}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Q3 2024
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={refreshData}
          disabled={!selectedCampaignId || isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Refresh Data
        </button>
        <button
          onClick={clearData}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Data
        </button>
      </div>

      {/* Status Information */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Hook Status:</h3>
        <div className="text-sm space-y-1">
          <p><strong>Current Campaign ID:</strong> {currentCampaignId || 'None'}</p>
          <p><strong>Selected Campaign ID:</strong> {selectedCampaignId || 'None'}</p>
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <p><strong>Has Error:</strong> {error ? 'Yes' : 'No'}</p>
          <p><strong>Has Data:</strong> {campaignData ? 'Yes' : 'No'}</p>
          <p><strong>Redux Structure:</strong> Single object (not indexed by campaignId)</p>
        </div>
      </div>

      {/* Data Display */}
      {selectedCampaignId && (
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Campaign Data:</h3>
          
          {isLoading && (
            <div className="text-blue-600">Loading campaign data...</div>
          )}
          
          {error && (
            <div className="text-red-600 mb-2">
              Error: {error}
            </div>
          )}
          
          {campaignData && (
            <div className="bg-green-50 p-3 rounded">
              <p className="text-green-800">
                ✓ Data loaded successfully for campaign: {selectedCampaignId}
              </p>
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(campaignData, null, 2)}
              </pre>
            </div>
          )}
          
          {!isLoading && !error && !campaignData && (
            <div className="text-gray-500">
              No data available. Click "Refresh Data" to fetch.
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ul className="text-sm space-y-1">
          <li>• Only one campaign can be active at a time</li>
          <li>• Switching campaigns automatically clears previous data</li>
          <li>• Changing date range refetches data for current campaign</li>
          <li>• Manual refresh forces a fresh data fetch</li>
          <li>• Clear data removes all campaign data from memory</li>
          <li>• Redux stores single campaign object (not indexed by campaignId)</li>
        </ul>
      </div>
    </div>
  );
};

export default CampaignDetailExample;
