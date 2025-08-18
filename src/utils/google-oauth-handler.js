// This file now contains utility functions that work with Redux
// All API calls have been moved to Redux Toolkit async thunks

export const getGoogleAuthUrl = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
  const scope = `https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/doubleclicksearch https://www.googleapis.com/auth/admanager`;
  
  return `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${encodeURIComponent('google')}&` +
    `access_type=offline&` +
    `prompt=consent`;
};

export const redirectToGoogleAuth = () => {
  if (typeof window !== 'undefined') {
    window.location.href = getGoogleAuthUrl();
  }
};

export const getStoredGoogleData = () => {
  if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem('googleData');
    return storedData ? JSON.parse(storedData) : null;
  }
  return null;
};

export const clearStoredGoogleData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('googleData');
  }
};

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} Token response
 */
export const exchangeCodeForToken = async (code) => {
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
        redirect_uri: `${window.location.origin}/integrations`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return await tokenResponse.json();
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

/**
 * Fetch user profile data using access token
 * @param {string} accessToken - Google access token
 * @returns {Promise<Object>} User profile data
 */
export const fetchUserProfile = async (accessToken) => {
  try {
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error(`Profile fetch failed: ${profileResponse.statusText}`);
    }

    return await profileResponse.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Fetch Google AdSense advertising data
 * @param {string} accessToken - Google access token
 * @returns {Promise<Object>} Advertising account data
 */
export const fetchAdvertisingData = async (accessToken) => {
  try {
    // Fetch Google AdSense accounts
    const advertisingResponse = await fetch('https://www.googleapis.com/adsense/v2/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (advertisingResponse.ok) {
      const advertisingResult = await advertisingResponse.json();
      if (advertisingResult.accounts && advertisingResult.accounts.length > 0) {
        const account = advertisingResult.accounts[0];
        return {
          advertising_id: account.name || '',
          network_code: account.name || '',
          display_name: account.displayName || '',
          currency_code: account.currencyCode || 'USD',
          timezone: account.timeZone || 'America/New_York'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching advertising data:', error);
    // Return null if advertising data fetch fails
    return null;
  }
};

/**
 * Process OAuth callback and prepare connection data
 * @param {string} callbackUrl - The OAuth callback URL
 * @returns {Promise<Object>} Prepared connection data
 */
export const processGoogleOAuthCallback = async (callbackUrl) => {
  try {
    // Extract OAuth parameters
    const oauthParams = extractOAuthParams(callbackUrl);
    
    if (!oauthParams || oauthParams.error) {
      throw new Error(oauthParams?.error_description || 'OAuth callback error');
    }

    if (!oauthParams.code) {
      throw new Error('No authorization code received');
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(oauthParams.code);
    
    // Fetch user profile using the access token
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch profile');
    }

    const profileData = await profileResponse.json();

    // Fetch advertising data from Google AdSense API
    let advertisingData = null;
    try {
      advertisingData = await fetchAdvertisingData(tokens.access_token);
    } catch (advertisingError) {
      // Continue without advertising data if it fails
      console.log('Advertising data fetch failed, continuing without it');
    }

    // Store the data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('googleData', JSON.stringify({
        user_data: profileData,
        token_data: tokens,
        advertising_data: advertisingData
      }));
    }

    // Prepare the connection payload
    const connectionData = {
      user_data: {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        picture: profileData.picture,
        given_name: profileData.given_name,
        family_name: profileData.family_name,
        locale: profileData.locale,
        verified_email: profileData.verified_email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      token_data: tokens,
      advertising_data: advertisingData
    };

    return {
      success: true,
      data: connectionData,
      oauthParams: oauthParams
    };

  } catch (error) {
    console.error('Error processing Google OAuth callback:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Create mock data for testing (when OAuth is not available)
 * @param {string} callbackUrl - The OAuth callback URL
 * @returns {Object} Mock connection data
 */
export const createMockGoogleConnectionData = (callbackUrl) => {
  const oauthParams = extractOAuthParams(callbackUrl);
  
  return {
    user_data: {
      id: "113057969003083685143",
      name: "Muhammad Yasir Ismail",
      email: "yasirismail321@gmail.com",
      picture: "https://lh3.googleusercontent.com/a/ACg8ocKTLSKHweADG5F8trpI1J6EtPHaxLZkOCTCtWgAaHw5jelNeuxh=s96-c",
      verified_email: true,
      locale: "en"
    },
    token_data: {
      access_token: "ya29.xxx",
      refresh_token: "1//xxx",
      expires_in: 3599,
      scope: oauthParams?.scope || "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/doubleclicksearch",
      token_type: "Bearer",
      id_token: "mock_id_token"
    },
    advertising_data: {
      googleAds: {
        customers: [
          {
            id: "1234567890",
            name: "Test Google Ads Account",
            currencyCode: "USD",
            timeZone: "America/New_York"
          }
        ]
      },
      googleAnalytics: {
        accounts: [
          {
            name: "accounts/123456789",
            displayName: "Test Analytics Account",
            regionCode: "US"
          }
        ]
      }
    }
  };
};

/**
 * Fetch Google OAuth Profile (matches your implementation)
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} OAuth profile data
 */
export const fetchGoogleOAuthProfile = async (code) => {
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
        redirect_uri: `${window.location.origin}/integrations`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Fetch user profile using the access token
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch profile');
    }

    const profileData = await profileResponse.json();

    // Skip AdSense API call - advertising data will be null
    let advertisingData = null;

    // Store the data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('googleData', JSON.stringify({
        user_data: profileData,
        token_data: tokens,
        advertising_data: advertisingData
      }));
    }

    return {
      user_data: {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        picture: profileData.picture,
        given_name: profileData.given_name,
        family_name: profileData.family_name,
        locale: profileData.locale,
        verified_email: profileData.verified_email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      token_data: tokens,
      advertising_data: advertisingData
    };
  } catch (error) {
    console.error('Error fetching OAuth profile:', error);
    throw new Error(error.message || 'Failed to fetch OAuth profile');
  }
};

/**
 * Extract OAuth parameters from callback URL
 * @param {string} url - The OAuth callback URL
 * @returns {Object} Extracted OAuth parameters
 */
export const extractOAuthParams = (url) => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    return {
      state: params.get('state'),
      code: params.get('code'),
      scope: params.get('scope'),
      authuser: params.get('authuser'),
      prompt: params.get('prompt'),
      error: params.get('error'),
      error_description: params.get('error_description')
    };
  } catch (error) {
    console.error('Error parsing OAuth callback URL:', error);
    return null;
  }
};

/**
 * Validate OAuth callback parameters
 * @param {Object} oauthParams - OAuth parameters
 * @returns {Object} Validation result
 */
export const validateOAuthParams = (oauthParams) => {
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
 * Format scope string for display
 * @param {string} scope - Raw scope string
 * @returns {Array} Formatted scope array
 */
export const formatScope = (scope) => {
  if (!scope) return [];
  
  return scope.split(' ').map(scopeItem => {
    const scopeMap = {
      'https://www.googleapis.com/auth/userinfo.email': 'Email Access',
      'https://www.googleapis.com/auth/userinfo.profile': 'Profile Access',
      'https://www.googleapis.com/auth/adwords': 'Google Ads Access',
      'https://www.googleapis.com/auth/doubleclicksearch': 'Search Ads 360 Access',
      'https://www.googleapis.com/auth/admanager': 'Ad Manager Access',
      'https://www.googleapis.com/auth/analytics': 'Analytics Access',
      'https://www.googleapis.com/auth/analytics.readonly': 'Analytics Read Access',
      'https://www.googleapis.com/auth/adsense': 'AdSense Access',
      'openid': 'OpenID Connect',
      'email': 'Email',
      'profile': 'Profile'
    };
    
    return {
      scope: scopeItem,
      description: scopeMap[scopeItem] || scopeItem
    };
  });
}; 