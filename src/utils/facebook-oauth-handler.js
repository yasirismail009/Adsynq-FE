/**
 * Facebook OAuth Handler Utility
 * Processes OAuth callback URLs and extracts connection data
 */

/**
 * Extract OAuth parameters from callback URL
 * @param {string} url - The OAuth callback URL
 * @returns {Object} Extracted OAuth parameters
 */
export const extractFacebookOAuthParams = (url) => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    return {
      state: params.get('state'),
      code: params.get('code'),
      error: params.get('error'),
      error_reason: params.get('error_reason'),
      error_description: params.get('error_description')
    };
  } catch (error) {
    console.error('Error parsing Facebook OAuth callback URL:', error);
    return null;
  }
};

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} Token response
 */
export const exchangeCodeForFacebookToken = async (code) => {
  try {
    const appId = import.meta.env.VITE_META_APP_ID;
    const appSecret = import.meta.env.VITE_META_APP_SECRET;
    const redirectUri = `${window.location.origin}/integrations`;
    
    if (!appId || !appSecret) {
      throw new Error('Facebook app configuration missing');
    }

    // Exchange code for short-lived token
    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code: code,
    });
    
    const tokenResponse = await fetch(`https://graph.facebook.com/v23.0/oauth/access_token?${params.toString()}`, {
      method: 'GET',
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(errorData.error?.message || 'Failed to exchange code for token');
    }

    return await tokenResponse.json();
  } catch (error) {
    console.error('Error exchanging code for Facebook token:', error);
    throw error;
  }
};

/**
 * Exchange short-lived token for long-lived token
 * @param {string} shortLivedToken - Short-lived access token
 * @returns {Promise<Object>} Long-lived token response
 */
export const exchangeForLongLivedToken = async (shortLivedToken) => {
  try {
    const appId = import.meta.env.VITE_META_APP_ID;
    const appSecret = import.meta.env.VITE_META_APP_SECRET;
    
    if (!appId || !appSecret) {
      throw new Error('Facebook app configuration missing');
    }

    // Exchange short-lived token for long-lived token (60 days)
    const tokenExchangeUrl = `https://graph.facebook.com/v23.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    
    console.log('=== FACEBOOK GRAPH API TOKEN EXCHANGE ===');
    console.log('App ID:', appId);
    console.log('Exchange URL:', tokenExchangeUrl.replace(appSecret, '[HIDDEN]'));
    console.log('Short-lived token length:', shortLivedToken.length);
    
    const tokenExchangeResponse = await fetch(tokenExchangeUrl);
    
    if (!tokenExchangeResponse.ok) {
      const errorData = await tokenExchangeResponse.json();
      console.error('Token exchange failed:', errorData);
      throw new Error(errorData.error?.message || `Failed to exchange token. Status: ${tokenExchangeResponse.status}`);
    }

    const tokenExchangeResult = await tokenExchangeResponse.json();
    
    console.log('=== TOKEN EXCHANGE RESPONSE ===');
    console.log('Response status:', tokenExchangeResponse.status);
    console.log('Has access_token:', !!tokenExchangeResult.access_token);
    console.log('Expires in:', tokenExchangeResult.expires_in);
    console.log('Token type:', tokenExchangeResult.token_type);
    
    if (!tokenExchangeResult.access_token) {
      throw new Error('Failed to get long-lived token from Facebook Graph API');
    }

    const longLivedToken = tokenExchangeResult.access_token;
    const tokenExpiresIn = tokenExchangeResult.expires_in || 5184000; // 60 days default
    
    // Validate token expiration
    const tokenDays = Math.floor(tokenExpiresIn / 86400);
    if (tokenDays < 50) {
      console.warn(`Warning: Token expires in ${tokenDays} days, expected 60 days`);
    }
    
    console.log(`✅ Long-lived token obtained successfully! Valid for ${tokenDays} days`);
    
    return {
      access_token: longLivedToken,
      expires_in: tokenExpiresIn,
      token_type: 'bearer'
    };
  } catch (error) {
    console.error('Error exchanging for long-lived token:', error);
    throw error;
  }
};

/**
 * Fetch user profile data using access token
 * @param {string} accessToken - Facebook access token
 * @returns {Promise<Object>} User profile data
 */
export const fetchFacebookUserProfile = async (accessToken) => {
  try {
    const profileResponse = await fetch(`https://graph.facebook.com/v23.0/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`);
    
    if (!profileResponse.ok) {
      throw new Error(`Profile fetch failed: ${profileResponse.statusText}`);
    }

    return await profileResponse.json();
  } catch (error) {
    console.error('Error fetching Facebook user profile:', error);
    throw error;
  }
};

/**
 * Fetch user's Facebook pages
 * @param {string} accessToken - Facebook access token
 * @returns {Promise<Array>} Pages data
 */
export const fetchFacebookPages = async (accessToken) => {
  try {
    const pagesResponse = await fetch(`https://graph.facebook.com/v23.0/me/accounts?access_token=${accessToken}`);
    
    if (!pagesResponse.ok) {
      throw new Error(`Pages fetch failed: ${pagesResponse.statusText}`);
    }

    const pagesData = await pagesResponse.json();
    return pagesData.data || [];
  } catch (error) {
    console.error('Error fetching Facebook pages:', error);
    throw error;
  }
};

/**
 * Fetch complete Facebook user data
 * @param {string} accessToken - Facebook access token
 * @param {string} userId - Facebook user ID
 * @returns {Promise<Object>} Complete user data
 */
export const fetchCompleteFacebookData = async (accessToken, userId) => {
  try {
    // Fetch user profile
    const userProfile = await fetchFacebookUserProfile(accessToken);
    
    // Fetch user's pages
    const pagesData = await fetchFacebookPages(accessToken);
    
    // Get user picture URL
    const userPicture = userProfile.picture?.data?.url || null;
    
    return {
      user_profile: userProfile,
      user_picture: userPicture,
      pages_data: pagesData
    };
  } catch (error) {
    console.error('Error fetching complete Facebook data:', error);
    throw error;
  }
};

/**
 * Fetch Facebook OAuth Profile (main function)
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} OAuth profile data
 */
export const fetchFacebookOAuthProfile = async (code) => {
  try {
    console.log('=== FACEBOOK OAUTH PROCESSING ===');
    console.log('Processing code:', code.substring(0, 20) + '...');
    
    // Exchange code for short-lived token
    const shortLivedTokenData = await exchangeCodeForFacebookToken(code);
    console.log('Short-lived token obtained');
    
    // Exchange for long-lived token
    const longLivedTokenData = await exchangeForLongLivedToken(shortLivedTokenData.access_token);
    console.log('Long-lived token obtained');
    
    // Fetch complete user data
    const completeData = await fetchCompleteFacebookData(longLivedTokenData.access_token, shortLivedTokenData.user_id);
    console.log('Complete data fetched');
    
         // Structure data in the required format
     const connectionData = {
       user_data: {
         id: shortLivedTokenData.user_id,
         user_id: completeData.user_profile.id, // Add the user_id from profile
         name: completeData.user_profile.name,
         email: completeData.user_profile.email,
         picture: completeData.user_picture,
       },
       token_data: {
         access_token: longLivedTokenData.access_token,
         expires_in: longLivedTokenData.expires_in,
         token_type: longLivedTokenData.token_type,
       },
       pages_data: completeData.pages_data,
     };

    console.log('=== FACEBOOK CONNECTION DATA ===');
    console.log('User ID:', connectionData.user_data.id);
    console.log('User Name:', connectionData.user_data.name);
    console.log('Pages Found:', connectionData.pages_data.length);
    console.log('Token Expires In:', connectionData.token_data.expires_in);
    
    // Store the data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('facebookData', JSON.stringify(connectionData));
    }

    return connectionData;
  } catch (error) {
    console.error('Error fetching Facebook OAuth profile:', error);
    throw new Error(error.message || 'Failed to fetch Facebook OAuth profile');
  }
};

/**
 * Validate Facebook OAuth callback parameters
 * @param {Object} oauthParams - OAuth parameters
 * @returns {Object} Validation result
 */
export const validateFacebookOAuthParams = (oauthParams) => {
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
 * Create mock Facebook connection data for testing
 * @param {string} callbackUrl - The OAuth callback URL
 * @returns {Object} Mock connection data
 */
export const createMockFacebookConnectionData = (callbackUrl) => {
  const oauthParams = extractFacebookOAuthParams(callbackUrl);
  
  return {
    user_data: {
      id: "123456789",
      name: "John Doe",
      email: "john@example.com",
      picture: "https://graph.facebook.com/123456789/picture?type=large"
    },
    token_data: {
      access_token: "EAABwzLixnjYBO...",
      expires_in: 5184000,
      token_type: "bearer"
    },
    pages_data: [
      {
        id: "987654321",
        name: "My Business Page",
        username: "mybusiness",
        access_token: "EAABwzLixnjYBO...",
        category: "Business",
        tasks: ["MANAGE", "CREATE_CONTENT"]
      }
    ]
  };
}; 