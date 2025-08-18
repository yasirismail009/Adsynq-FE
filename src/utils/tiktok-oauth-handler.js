/**
 * TikTok OAuth Handler Utility
 * Processes OAuth callback URLs and extracts connection data
 */

import { apiService } from '../services/api.js';

/**
 * Extract OAuth parameters from callback URL
 * @param {string} url - The OAuth callback URL
 * @returns {Object} Extracted OAuth parameters
 */
export const extractTikTokOAuthParams = (url) => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    return {
      state: params.get('state'),
      code: params.get('code'),
      error: params.get('error'),
      error_description: params.get('error_description')
    };
  } catch (error) {
    console.error('Error parsing TikTok OAuth callback URL:', error);
    return null;
  }
};

/**
 * Generate random state for OAuth
 * @returns {string} Random state string
 */
const generateState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Redirect to TikTok OAuth
 */
export const redirectToTikTokAuth = () => {
  console.log('=== redirectToTikTokAuth called ===');
  
  const clientId = import.meta.env.VITE_TIKTOK_CLIENT_ID;
  const redirectUri = `${window.location.origin}/integrations`;
  
  console.log('TIKTOK_CLIENT_ID:', clientId ? 'Configured' : 'Not configured');
  console.log('TIKTOK_REDIRECT_URI:', redirectUri);
  
  if (!clientId) {
    console.error('TikTok Client ID is not configured');
    return;
  }

  const scope = [
    'user.info.basic',
    'user.info.stats',
    'user.info.email',
    'ad.read',
    'ad.write',
    'ad.promote',
    'ad.report'
  ].join(',');

  const state = 'tiktok';
  console.log('Generated state:', state);
  console.log('Scope:', scope);

  const authUrl = `https://ads.tiktok.com/marketing_api/auth?app_id=${clientId}&state=${state}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  
  console.log('=== Generated Auth URL ===');
  console.log('Full auth URL:', authUrl);
  console.log('URL length:', authUrl.length);
  console.log('==========================');

  console.log('Redirecting to TikTok auth...');
  window.location.href = authUrl;
};

/**
 * Get TikTok OAuth URL
 * @returns {string} OAuth URL
 */
export const getTikTokAuthUrl = () => {
  const clientId = import.meta.env.VITE_TIKTOK_CLIENT_ID;
  const redirectUri = `${window.location.origin}/integrations`;
  
  if (!clientId) {
    throw new Error('TikTok Client ID is not configured');
  }

  const scope = [
    'user.info.basic',
    'user.info.stats',
    'user.info.email',
    'ad.read',
    'ad.write',
    'ad.promote',
    'ad.report'
  ].join(',');

  return `https://ads.tiktok.com/marketing_api/auth?app_id=${clientId}&state=${'tiktok'}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
};

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} Token response
 */
export const exchangeCodeForTikTokToken = async (code) => {
  try {
    console.log('=== TIKTOK TOKEN EXCHANGE ===');
    console.log('Auth Code:', code.substring(0, 20) + '...');
    
    // Exchange code for access token through backend API
    const tokenResponse = await apiService.marketing.tiktokExchangeToken({
      code: code
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response data:', tokenResponse.data);

    if (tokenResponse.status !== 200) {
      console.error('TikTok token exchange error:', tokenResponse.data);
      throw new Error(tokenResponse.data?.error || `Failed to exchange code for token. Status: ${tokenResponse.status}`);
    }

    const tokenData = tokenResponse.data;
    console.log('Token exchange successful:', {
      hasAccessToken: !!tokenData.token_data?.access_token,
      hasUserData: !!tokenData.user_data,
      hasAdvertiserData: !!tokenData.advertiser_data,
      hasBusinessProfile: !!tokenData.business_profile
    });

    return tokenData;
  } catch (error) {
    console.error('Error exchanging code for TikTok token:', error);
    throw error;
  }
};

/**
 * Fetch TikTok OAuth Profile (main function)
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} OAuth profile data
 */
export const fetchTikTokOAuthProfile = async (code) => {
  try {
    console.log('=== TIKTOK OAUTH PROCESSING ===');
    console.log('Processing code:', code.substring(0, 20) + '...');
    
    // Exchange code for access token and get complete data from backend
    const responseData = await exchangeCodeForTikTokToken(code);
    console.log('Complete data received from backend');
    
    // Structure data in the required format for Redux
    const connectionData = {
      user_data: {
        id: responseData.user_data?.id || 'unknown',
        user_id: responseData.user_data?.id || 'unknown',
        name: responseData.user_data?.display_name || 'TikTok User',
        display_name: responseData.user_data?.display_name || 'TikTok User',
        email: responseData.user_data?.email || '',
        picture: responseData.user_data?.avatar_url || null,
        avatar_url: responseData.user_data?.avatar_url || null,
        profile_deep_link: responseData.user_data?.profile_deep_link || '',
        is_verified: responseData.user_data?.is_verified || false,
        follower_count: responseData.user_data?.follower_count || 0,
        following_count: responseData.user_data?.following_count || 0,
        likes_count: responseData.user_data?.likes_count || 0,
        username: responseData.user_data?.username || '',
        bio_description: responseData.user_data?.bio_description || '',
        videos_count: responseData.user_data?.videos_count || 0,
        is_business_account: responseData.user_data?.is_business_account || false,
        created_at: responseData.user_data?.created_at || new Date().toISOString(),
        updated_at: responseData.user_data?.updated_at || new Date().toISOString(),
        // Analytics data
        metrics: responseData.user_data?.metrics || [],
        audience_ages: responseData.user_data?.audience_ages || [],
        audience_genders: responseData.user_data?.audience_genders || [],
        audience_countries: responseData.user_data?.audience_countries || [],
        audience_cities: responseData.user_data?.audience_cities || [],
        audience_activity: responseData.user_data?.audience_activity || [],
      },
      token_data: {
        access_token: responseData.token_data?.access_token,
        refresh_token: responseData.token_data?.refresh_token || '',
        expires_in: responseData.token_data?.expires_in || 0,
        token_type: responseData.token_data?.token_type || 'Bearer',
        scope: responseData.token_data?.scope || '',
        advertiser_ids: responseData.token_data?.advertiser_ids || [],
      },
      advertiser_accounts: responseData.advertiser_data || [],
      // Store the complete business profile data for analytics
      business_profile: responseData.business_profile || null,
    };

    console.log('=== TIKTOK CONNECTION DATA ===');
    console.log('User ID:', connectionData.user_data.id);
    console.log('User Name:', connectionData.user_data.display_name);
    console.log('Advertiser Accounts Found:', connectionData.advertiser_accounts.length);
    console.log('Token Type:', connectionData.token_data.token_type);
    console.log('Business Profile Available:', !!connectionData.business_profile);
    
    // Store the data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('tiktokData', JSON.stringify(connectionData));
    }

    return connectionData;
  } catch (error) {
    console.error('Error fetching TikTok OAuth profile:', error);
    throw new Error(error.message || 'Failed to fetch TikTok OAuth profile');
  }
};

/**
 * Validate TikTok OAuth callback parameters
 * @param {Object} oauthParams - OAuth parameters
 * @returns {Object} Validation result
 */
export const validateTikTokOAuthParams = (oauthParams) => {
  const errors = [];

  if (!oauthParams.state) {
    errors.push('Missing state parameter');
  }

  if (!oauthParams.code) {
    errors.push('Missing authorization code');
  }

  if (oauthParams.error) {
    errors.push(`OAuth error: ${oauthParams.error_description || oauthParams.error}`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Create mock TikTok connection data for testing
 * @param {string} callbackUrl - The OAuth callback URL
 * @returns {Object} Mock connection data
 */
export const createMockTikTokConnectionData = (callbackUrl) => {
  const oauthParams = extractTikTokOAuthParams(callbackUrl);
  
  return {
    user_data: {
      id: "123456789",
      user_id: "123456789",
      name: "TikTok User",
      display_name: "TikTok User",
      email: "user@tiktok.com",
      picture: "https://example.com/avatar.jpg",
      avatar_url: "https://example.com/avatar.jpg",
      profile_deep_link: "https://www.tiktok.com/@username",
      is_verified: false,
      follower_count: 1000,
      following_count: 500,
      likes_count: 5000,
      username: "username",
      bio_description: "TikTok bio",
      videos_count: 50,
      is_business_account: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metrics: [],
      audience_ages: [],
      audience_genders: [],
      audience_countries: [],
      audience_cities: [],
      audience_activity: [],
    },
    token_data: {
      access_token: "tiktok_access_token_xxx",
      refresh_token: "tiktok_refresh_token_xxx",
      expires_in: 7200,
      token_type: "bearer",
      scope: "user.info.basic,user.info.stats,user.info.email,ad.read,ad.write,ad.promote,ad.report",
      advertiser_ids: ["987654321"],
    },
    advertiser_accounts: [
      {
        advertiser_id: "987654321",
        advertiser_name: "My TikTok Business",
        currency: "USD",
        timezone: "America/New_York",
        status: "ACTIVE",
        industry_id: 0,
        industry_name: "General"
      }
    ],
    business_profile: null,
  };
};

/**
 * Test TikTok OAuth configuration
 * @returns {Object} Configuration status
 */
export const testTikTokOAuthConfig = () => {
  const clientId = import.meta.env.VITE_TIKTOK_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_TIKTOK_CLIENT_SECRET;
  const redirectUri = `${window.location.origin}/integrations`;
  
  console.log('=== TIKTOK OAUTH CONFIGURATION TEST ===');
  console.log('Client ID:', clientId ? '✅ Configured' : '❌ Missing');
  console.log('Client Secret:', clientSecret ? '✅ Configured' : '❌ Missing');
  console.log('Redirect URI:', redirectUri);
  console.log('Current Origin:', window.location.origin);
  console.log('=====================================');
  
  return {
    clientIdConfigured: !!clientId,
    clientSecretConfigured: !!clientSecret,
    redirectUri,
    origin: window.location.origin,
    isConfigured: !!(clientId && clientSecret)
  };
}; 