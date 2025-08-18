import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { selectMetaUserAdAccounts } from '../../store/slices/metaSlice';

const CampaignDebug = () => {
  const { campaignId } = useParams();
  const metaUserAdAccounts = useSelector(selectMetaUserAdAccounts);
  
  const directCampaignData = useSelector(state => state.meta?.campaignData?.result);
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Campaign Debug Information</h2>
      
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Basic Information</h3>
          <div className="text-sm space-y-1">
            <p><strong>Campaign ID from URL:</strong> {campaignId}</p>
            <p><strong>Campaign ID Type:</strong> {typeof campaignId}</p>
            <p><strong>Direct Redux Data Available:</strong> {directCampaignData ? 'Yes' : 'No'}</p>
            <p><strong>User Accounts Loaded:</strong> {metaUserAdAccounts ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        {/* Redux Campaign Data */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Redux Campaign Data</h3>
          {directCampaignData ? (
            <div className="text-sm space-y-1">
              <p><strong>Campaign ID:</strong> {directCampaignData.campaign_id}</p>
              <p><strong>Source:</strong> {directCampaignData.source}</p>
              <p><strong>Message:</strong> {directCampaignData.message}</p>
              <p><strong>Data Count:</strong> {directCampaignData.data_count}</p>
              <p><strong>Campaign Name:</strong> {directCampaignData.insights_data?.campaign_name || 'N/A'}</p>
            </div>
          ) : (
            <p className="text-gray-500">No campaign data in Redux</p>
          )}
        </div>
        
        {/* User Ad Accounts */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">User Ad Accounts</h3>
          {metaUserAdAccounts?.result?.accounts ? (
            <div className="space-y-4">
              <p><strong>Total Accounts:</strong> {metaUserAdAccounts.result.accounts.length}</p>
              {metaUserAdAccounts.result.accounts.map((account, index) => (
                <div key={account.id || index} className="border-l-4 border-blue-500 pl-4">
                  <p><strong>Account {index + 1}:</strong></p>
                  <p className="text-sm">ID: {account.id}</p>
                  <p className="text-sm">Name: {account.name}</p>
                  <p className="text-sm">Campaigns Structure: {JSON.stringify(account.campaigns ? 'Has campaigns' : 'No campaigns')}</p>
                  
                  {account.campaigns?.data && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Campaigns ({account.campaigns.data.length}):</p>
                      {account.campaigns.data.slice(0, 3).map((campaign, cIndex) => (
                        <div key={campaign.id || cIndex} className="ml-4 text-xs">
                          <p>ID: {campaign.id} (Type: {typeof campaign.id})</p>
                          <p>Name: {campaign.name}</p>
                          <p>Matches URL ID: {campaign.id === campaignId ? 'YES' : 'NO'}</p>
                        </div>
                      ))}
                      {account.campaigns.data.length > 3 && (
                        <p className="ml-4 text-xs text-gray-500">... and {account.campaigns.data.length - 3} more</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No user ad accounts data</p>
          )}
        </div>
        
        {/* Raw Data */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Raw Data (Development Only)</h3>
          {process.env.NODE_ENV === 'development' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Redux Campaign Data:</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(directCampaignData, null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium">User Ad Accounts:</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(metaUserAdAccounts, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDebug;
