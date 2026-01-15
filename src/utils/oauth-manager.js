// OAuth Request Manager for localStorage
export class OAuthRequest {
  constructor(platform, timestamp, state, isActive = true) {
    this.platform = platform;
    this.timestamp = timestamp;
    this.state = state;
    this.isActive = isActive;
  }
}

const OAUTH_REQUESTS_KEY = 'oauth_active_requests';

export class OAuthManager {
  // Get all active OAuth requests
  static getActiveRequests() {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(OAUTH_REQUESTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading OAuth requests from localStorage:', error);
      return [];
    }
  }

  // Set an OAuth request as active
  static setActiveRequest(platform, state) {
    if (typeof window === 'undefined') return;
    
    try {
      const requests = this.getActiveRequests();
      
      // Remove any existing active requests for this platform
      const filteredRequests = requests.filter(req => req.platform !== platform);
      
      // Add new active request
      const newRequest = {
        platform,
        timestamp: Date.now(),
        state,
        isActive: true
      };
      
      filteredRequests.push(newRequest);
      
      localStorage.setItem(OAUTH_REQUESTS_KEY, JSON.stringify(filteredRequests));
      
      console.log(`✅ Set ${platform} OAuth request as active:`, newRequest);
    } catch (error) {
      console.error('Error setting OAuth request in localStorage:', error);
    }
  }

  // Check if a specific platform has an active request
  static hasActiveRequest(platform) {
    const requests = this.getActiveRequests();
    return requests.some(req => req.platform === platform && req.isActive);
  }

  // Get active request for a specific platform
  static getActiveRequest(platform) {
    const requests = this.getActiveRequests();
    return requests.find(req => req.platform === platform && req.isActive) || null;
  }

  // Consume (complete) an OAuth request for a specific platform
  static consumeRequest(platform) {
    if (typeof window === 'undefined') return null;
    
    try {
      const requests = this.getActiveRequests();
      const activeRequest = requests.find(req => req.platform === platform && req.isActive);
      
      if (activeRequest) {
        // Mark as consumed (inactive)
        activeRequest.isActive = false;
        localStorage.setItem(OAUTH_REQUESTS_KEY, JSON.stringify(requests));
        
        console.log(`✅ Consumed ${platform} OAuth request:`, activeRequest);
        return activeRequest;
      }
      
      return null;
    } catch (error) {
      console.error('Error consuming OAuth request:', error);
      return null;
    }
  }

  // Clear all OAuth requests (useful for cleanup)
  static clearAllRequests() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(OAUTH_REQUESTS_KEY);
      console.log('✅ Cleared all OAuth requests from localStorage');
    } catch (error) {
      console.error('Error clearing OAuth requests:', error);
    }
  }

  // Clear expired requests (older than 1 hour)
  static clearExpiredRequests() {
    if (typeof window === 'undefined') return;
    
    try {
      const requests = this.getActiveRequests();
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const validRequests = requests.filter(req => req.timestamp > oneHourAgo);
      
      if (validRequests.length !== requests.length) {
        localStorage.setItem(OAUTH_REQUESTS_KEY, JSON.stringify(validRequests));
        console.log(`✅ Cleared ${requests.length - validRequests.length} expired OAuth requests`);
      }
    } catch (error) {
      console.error('Error clearing expired OAuth requests:', error);
    }
  }

  // Get request age in minutes
  static getRequestAge(platform) {
    const request = this.getActiveRequest(platform);
    if (!request) return null;
    
    return Math.floor((Date.now() - request.timestamp) / (60 * 1000));
  }
}

// Helper function to get the correct redirect URI based on environment
const getRedirectUri = (platform) => {
  const isDevelopment =import.meta.env.VITE_ENVIRONMENT === 'development';
  const isProduction = import.meta.env.VITE_ENVIRONMENT === 'production';
  
  // In development, use localhost:3001
  if (isDevelopment) {
    return `http://localhost:3001/integrations`;
  }
  
  // In production, use the actual domain
  if (isProduction) {
    return `https://app.kampalo.com/integrations`;
  }
  
  // Fallback to window.location.origin
  return `http://localhost:3001/integrations`;
};

// Platform-specific OAuth configurations
export const platformConfigs = {
  google: {
    name: 'Google',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-google-client-id',
    scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/doubleclicksearch https://www.googleapis.com/auth/admanager',
    accessType: 'offline',
    prompt: 'consent',
    get redirectUri() { return getRedirectUri('google'); }
  },
  meta: {
    name: 'Meta',
    authUrl: 'https://www.facebook.com/v23.0/dialog/oauth',
    clientId: import.meta.env.VITE_META_APP_ID ,
    scope: 'ads_management ads_read business_management read_insights',
    get redirectUri() { return getRedirectUri('meta'); }
  },
  tiktok: {
    name: 'TikTok',
    authUrl: 'https://ads.tiktok.com/marketing_api/auth',
    clientId: import.meta.env.VITE_TIKTOK_CLIENT_ID || 'mock-tiktok-client-id',
    scope: 'user.info.basic user.info.stats',
    get redirectUri() { return getRedirectUri('tiktok'); }
  },
  shopify: {
    name: 'Shopify',
    authUrl: 'https://your-store.myshopify.com/admin/oauth/authorize',
    clientId: import.meta.env.VITE_SHOPIFY_CLIENT_ID || 'mock-shopify-client-id',
    scope: 'read_products read_orders read_customers',
    get redirectUri() { return getRedirectUri('shopify'); }
  },
  linkedin: {
    name: 'LinkedIn',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID || 'mock-linkedin-client-id',
    scope: 'r_ads r_ads_reporting',
    get redirectUri() { return getRedirectUri('linkedin'); }
  },
  apple: {
    name: 'Apple',
    authUrl: 'https://appleid.apple.com/auth/authorize',
    clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'mock-apple-client-id',
    scope: 'email name',
    get redirectUri() { return getRedirectUri('apple'); }
  }
};

// Redirect to platform OAuth
export const redirectToPlatformAuth = (platform) => {
  const config = platformConfigs[platform];
  if (!config) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  // Log the redirect URI for debugging
  console.log(`Redirecting to ${platform} OAuth with redirect URI:`, config.redirectUri);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: 'code',
    state: platform // Use platform as state for identification
  });

  // Add platform-specific parameters
  if (platform === 'google') {
    if (config.accessType) params.append('access_type', config.accessType);
    if (config.prompt) params.append('prompt', config.prompt);
  }

  const authUrl = `${config.authUrl}?${params.toString()}`;
  window.location.href = authUrl;
};

// Handle OAuth callback
export const handleOAuthCallback = (platform, code, state) => {
  // Here you would typically:
  // 1. Exchange the authorization code for access tokens
  // 2. Fetch user profile and account information
  // 3. Store the tokens securely
  // 4. Update the integration status in your backend
  
  console.log(`Handling OAuth callback for ${platform}`, { code, state });
  
  // For now, return a mock response
  return {
    success: true,
    platform: platform,
    userData: {
      id: 'mock_user_id',
      name: `${platform} User`,
      email: `user@${platform}.com`,
      platform: platform
    },
    tokens: {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_at: Date.now() + (60 * 60 * 1000) // 1 hour from now
    }
  };
};

// Export OAuthManager class for static method usage 