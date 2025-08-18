/**
 * TikTok API Utility Functions
 * Simplified API calls for TikTok OAuth
 */

/**
 * Save TikTok OAuth code to backend
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} Response from backend
 */
export const saveTikTokOAuthCode = async (code) => {
  try {
    console.log('🔄 Saving TikTok OAuth code...');
    console.log('Code:', code.substring(0, 20) + '...');

    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const saveUrl = `${baseURL}/tiktok/oauth/save/`;

    console.log('🔗 Save API URL:', saveUrl);

    const response = await fetch(saveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Save OAuth code failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Save OAuth code failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ OAuth code saved successfully:', result);

    return result;
  } catch (error) {
    console.error('❌ Error in saveTikTokOAuthCode:', error);
    throw error;
  }
};

 