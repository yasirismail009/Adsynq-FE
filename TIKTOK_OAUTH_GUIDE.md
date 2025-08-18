# TikTok OAuth Integration Guide

This guide explains how to implement and use the TikTok OAuth integration with comprehensive business profile data fetching.

## Overview

The TikTok OAuth integration provides:
- OAuth 2.0 authentication flow
- Comprehensive user and business profile data
- Analytics and audience demographics
- Advertiser account management
- Long-term access tokens

## Setup

### 1. Environment Variables

Add these to your `.env` file:

```env
# TikTok OAuth Configuration
VITE_TIKTOK_CLIENT_ID=your_tiktok_client_id
VITE_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
NEXT_PUBLIC_TIKTOK_CLIENT_ID=your_tiktok_client_id
NEXT_PUBLIC_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

### 2. API Route

The Next.js API route is located at `src/pages/api/tiktok/oauth/token.js` and handles:
- Token exchange with TikTok Business API
- User information fetching
- Business profile data retrieval
- Comprehensive analytics data

## Usage

### 1. Basic OAuth Flow

```jsx
import { redirectToTikTokAuth } from '../utils/tiktok-oauth-handler';

const handleConnect = () => {
  redirectToTikTokAuth();
};
```

### 2. OAuth Callback Handling

```jsx
import { useDispatch } from 'react-redux';
import { connectTikTokAccount } from '../store/slices/tiktokSlice';
import { exchangeCodeForTokenAndProfile } from '../utils/tiktok-api';

const handleOAuthCallback = async (code) => {
  const dispatch = useDispatch();
  
  try {
    // Exchange code for token and get profile data directly from TikTok API
    const profileData = await exchangeCodeForTokenAndProfile(code);
    const { user_data, token_data, advertiser_data } = profileData;
    
    // Connect the account using Redux
    const connectResult = await dispatch(connectTikTokAccount({
      user_data,
      token_data,
      advertiser_data
    }));
    
    if (connectTikTokAccount.fulfilled.match(connectResult)) {
      console.log('TikTok account connected successfully');
    }
  } catch (error) {
    console.error('OAuth error:', error);
  }
};
```

### 3. Complete Example Component

Use the `TikTokOAuthExample` component for a complete implementation:

```jsx
import TikTokOAuthExample from '../components/integrations/TikTokOAuthExample';

const MyPage = () => {
  const handleRefresh = async () => {
    // Refresh your data
  };

  return (
    <TikTokOAuthExample 
      onRefresh={handleRefresh}
      router={router}
    />
  );
};
```

### 4. Direct API Usage

You can also use the TikTok API utilities directly:

```jsx
import { 
  exchangeCodeForTokenAndProfile,
  getTikTokUserProfile,
  getTikTokBusinessProfile,
  refreshTikTokToken
} from '../utils/tiktok-api';

// Exchange code for token and profile
const profileData = await exchangeCodeForTokenAndProfile(code);

// Get user profile with access token
const userProfile = await getTikTokUserProfile(accessToken);

// Get business profile with access token and business ID
const businessProfile = await getTikTokBusinessProfile(accessToken, businessId);

// Refresh access token
const newTokenData = await refreshTikTokToken(refreshToken);
```

## Data Structure

### User Data
```javascript
{
  id: "user_id",
  display_name: "User Display Name",
  email: "user@example.com",
  avatar_url: "https://example.com/avatar.jpg",
  profile_deep_link: "https://www.tiktok.com/@username",
  is_verified: false,
  follower_count: 1000,
  following_count: 500,
  likes_count: 5000,
  username: "username",
  bio_description: "User bio",
  videos_count: 50,
  is_business_account: true,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  // Analytics data
  metrics: [],
  audience_ages: [],
  audience_genders: [],
  audience_countries: [],
  audience_cities: [],
  audience_activity: []
}
```

### Token Data
```javascript
{
  access_token: "long_term_access_token",
  refresh_token: "", // Not provided for long-term tokens
  token_type: "Bearer",
  expires_in: 0, // Long-term tokens don't expire
  scope: "user.info.basic,user.info.stats,user.info.email,ad.read,ad.write,ad.promote,ad.report",
  advertiser_ids: ["advertiser_id_1", "advertiser_id_2"]
}
```

### Advertiser Data
```javascript
[
  {
    advertiser_id: "advertiser_id",
    advertiser_name: "Business Name",
    currency: "USD",
    timezone: "UTC",
    status: "ACTIVE",
    industry_id: 0,
    industry_name: "General"
  }
]
```

### Business Profile Data
```javascript
{
  // Complete business profile with analytics
  display_name: "Business Name",
  username: "business_username",
  profile_image: "https://example.com/profile.jpg",
  followers_count: 10000,
  is_business_account: true,
  // ... comprehensive analytics data
}
```

## Redux State Management

The TikTok integration uses Redux for state management:

### State Structure
```javascript
{
  // Connection state
  connecting: false,
  disconnecting: false,
  refreshing: false,
  fetching: false,
  
  // Connection data
  connectionData: null,
  connectedAccounts: [],
  currentAccount: null,
  
  // Error states
  connectionError: null,
  disconnectError: null,
  refreshError: null,
  fetchError: null,
  
  // Success states
  connectionSuccess: false,
  disconnectSuccess: false,
  refreshSuccess: false,
  
  // OAuth state
  oauthState: null,
  oauthCode: null,
  
  // Token information
  tokens: {
    access_token: null,
    refresh_token: null,
    expires_in: null,
    expires_at: null,
    scope: '',
    advertiser_ids: []
  },
  
  // Business profile data
  businessProfile: null,
  
  // Analytics data
  analytics: {
    metrics: [],
    audience_ages: [],
    audience_genders: [],
    audience_countries: [],
    audience_cities: [],
    audience_activity: []
  }
}
```

### Selectors
```javascript
import { 
  selectTikTokState,
  selectTikTokIsConnected,
  selectTikTokHasValidToken,
  selectTikTokBusinessProfile,
  selectTikTokAnalytics
} from '../store/slices/tiktokSlice';

// Usage
const isConnected = useSelector(selectTikTokIsConnected);
const hasValidToken = useSelector(selectTikTokHasValidToken);
const businessProfile = useSelector(selectTikTokBusinessProfile);
const analytics = useSelector(selectTikTokAnalytics);
```

## API Endpoints

### Token Exchange
- **URL**: `/api/tiktok/oauth/token`
- **Method**: `POST`
- **Body**: `{ code: "authorization_code" }`

### Connect Account
- **URL**: `/marketing/tiktok/connect/`
- **Method**: `POST`
- **Body**: Complete connection data

### Disconnect Account
- **URL**: `/marketing/tiktok/disconnect/{accountId}/`
- **Method**: `POST`

### Refresh Tokens
- **URL**: `/marketing/tiktok/refresh-tokens/{accountId}/`
- **Method**: `POST`

### Get Account Data
- **URL**: `/marketing/tiktok/account/{accountId}/`
- **Method**: `GET`

## Error Handling

The integration includes comprehensive error handling:

```javascript
// OAuth errors
if (oauthParams.error) {
  console.error('OAuth error:', oauthParams.error_description);
}

// API errors
if (tokenData.code !== 0) {
  console.error('TikTok API error:', tokenData.message);
}

// Network errors
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## Security Considerations

1. **Environment Variables**: Never expose client secrets in client-side code
2. **Token Storage**: Store tokens securely on the server side
3. **HTTPS**: Always use HTTPS for OAuth flows
4. **State Validation**: Validate OAuth state parameters
5. **Error Logging**: Log errors without exposing sensitive data

## Testing

### Configuration Test
```javascript
import { testTikTokOAuthConfig } from '../utils/tiktok-oauth-handler';

const config = testTikTokOAuthConfig();
console.log('Configuration status:', config);
```

### Mock Data
```javascript
import { createMockTikTokConnectionData } from '../utils/tiktok-oauth-handler';

const mockData = createMockTikTokConnectionData(callbackUrl);
```

## Troubleshooting

### Common Issues

1. **"TikTok credentials not configured"**
   - Check environment variables
   - Ensure client ID and secret are set

2. **"Failed to exchange authorization code"**
   - Verify redirect URI matches TikTok app settings
   - Check if authorization code is valid and not expired

3. **"No access token received"**
   - Verify client credentials
   - Check TikTok app permissions

4. **"Business profile API returned error"**
   - Ensure user has business account
   - Check API permissions and scopes

### Debug Mode

Enable debug logging by checking the browser console for detailed information about the OAuth flow.

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify TikTok app configuration
3. Test with the debug configuration button
4. Review the API response logs 