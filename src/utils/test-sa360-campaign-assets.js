// Test utility for SA360 Campaign Assets API
// This file can be imported and used to test the new endpoint

import { apiService } from '../services/api';

/**
 * Test the new SA360 Campaign Assets API endpoint
 * @param {string} googleAccountId - Google Account ID
 * @param {string} customerId - Customer ID
 * @param {Object} params - Query parameters
 */
export const testSa360CampaignAssets = async (googleAccountId, customerId, params = {}) => {
  try {
    console.log('🧪 Testing SA360 Campaign Assets API...');
    console.log('📡 Endpoint:', `/marketing/sa360/connections/${googleAccountId}/customers/${customerId}/campaign-assets/`);
    console.log('🔍 Parameters:', params);
    
    const response = await apiService.marketing.googleSa360CampaignAssets(googleAccountId, customerId, params);
    
    console.log('✅ API Response Success!');
    console.log('📊 Response Data:', response.data);
    console.log('📈 Response Status:', response.status);
    console.log('🔗 Response Headers:', response.headers);
    
    return response.data;
  } catch (error) {
    console.error('❌ API Request Failed!');
    console.error('🚨 Error Details:', error);
    
    if (error.response) {
      console.error('📡 Response Status:', error.response.status);
      console.error('📄 Response Data:', error.response.data);
      console.error('🔗 Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error('🌐 Request Error:', error.request);
    } else {
      console.error('💻 Error Message:', error.message);
    }
    
    throw error;
  }
};

/**
 * Test with the specific parameters from your request
 */
export const testSpecificEndpoint = async () => {
  const googleAccountId = '113057969003083685143';
  const customerId = '6278222097';
  const params = {
    date_from: '2024-01-01',
    date_to: '2024-12-31'
  };
  
  console.log('🎯 Testing specific endpoint with your parameters...');
  return await testSa360CampaignAssets(googleAccountId, customerId, params);
};

/**
 * Quick test function that can be called from browser console
 */
export const quickTest = () => {
  console.log('🚀 Quick test function called!');
  console.log('📝 Import and use testSpecificEndpoint() to test the API');
  console.log('🔧 Or use testSa360CampaignAssets() with custom parameters');
  
  // Example usage:
  console.log(`
Example usage:
import { testSpecificEndpoint } from './src/utils/test-sa360-campaign-assets.js';

// Test the specific endpoint
testSpecificEndpoint()
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));

// Or test with custom parameters
import { testSa360CampaignAssets } from './src/utils/test-sa360-campaign-assets.js';

testSa360CampaignAssets('your-account-id', 'your-customer-id', { date_from: '2024-01-01' })
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
  `);
};

// Export for use in other files
export default {
  testSa360CampaignAssets,
  testSpecificEndpoint,
  quickTest
};

