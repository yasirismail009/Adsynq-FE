# Shopify OAuth Integration Guide

This guide covers the complete Shopify OAuth integration implementation for the KAMPALO frontend application.

## Table of Contents

1. [Overview](#overview)
2. [Setup Requirements](#setup-requirements)
3. [Environment Variables](#environment-variables)
4. [File Structure](#file-structure)
5. [Implementation Details](#implementation-details)
6. [Usage Examples](#usage-examples)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Overview

The Shopify OAuth integration allows users to connect their Shopify stores to the KAMPALO platform. The implementation follows a simplified flow where the frontend sends the OAuth code to the backend, which handles all subsequent API calls and data processing.

### OAuth Flow

1. **User initiates connection** → Enters Shopify store domain
2. **Redirect to Shopify** → User authorizes the app
3. **OAuth callback** → Shopify redirects back with authorization code
4. **Code processing** → Frontend sends code to backend endpoint
5. **Data retrieval** → Backend exchanges code for tokens and fetches store data
6. **Connection complete** → Store data is stored and user can access Shopify features

## Setup Requirements

### Prerequisites

- Shopify Partner account
- Shopify app with OAuth permissions
- Backend API endpoint for processing OAuth codes
- Environment variables configured

### Required Permissions

The Shopify app needs the following scopes:
- `read_products` - Read product information
- `write_products` - Create/update products
- `read_orders` - Read order information
- `write_orders` - Create/update orders
- `read_customers` - Read customer information
- `write_customers` - Create/update customers
- `read_marketing_events` - Read marketing events
- `write_marketing_events` - Create/update marketing events
- `read_analytics` - Read analytics data
- `read_reports` - Read reports

## Environment Variables

Add these variables to your `.env` file:

```env
# Shopify OAuth Configuration
VITE_SHOPIFY_CLIENT_ID=your_shopify_app_client_id
VITE_SHOPIFY_REDIRECT_URI=http://localhost:3001/integrations
VITE_API_URL=http://localhost:8000/api
```

### Environment Variable Details

- `VITE_SHOPIFY_CLIENT_ID`: Your Shopify app's client ID from the Shopify Partner dashboard
- `VITE_SHOPIFY_REDIRECT_URI`: The URL where Shopify will redirect after OAuth authorization
- `VITE_API_URL`: Your backend API base URL

## File Structure

```
src/
├── utils/
│   ├── shopify-oauth-handler.js    # OAuth utility functions
│   └── shopify-api.js              # API call utilities
├── store/
│   └── slices/
│       └── shopifySlice.js         # Redux state management
├── services/
│   └── api.js                      # API service (updated)
└── components/
    └── integrations/
        ├── IntegrationsPage.jsx    # Main integrations page (updated)
        └── ShopifyOAuthExample.jsx # Shopify OAuth test component
```

## Implementation Details

### 1. OAuth Handler (`src/utils/shopify-oauth-handler.js`)

Core utility functions for Shopify OAuth:

```javascript
// Generate OAuth URL
export const getShopifyAuthUrl = (shop) => {
  const clientId = import.meta.env.VITE_SHOPIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SHOPIFY_REDIRECT_URI;
  const scope = 'read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_marketing_events,write_marketing_events,read_analytics,read_reports';
  
  return `https://${shop}/admin/oauth/authorize?` +
    `client_id=${clientId}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${encodeURIComponent(shop)}`;
};

// Redirect to Shopify OAuth
export const redirectToShopifyAuth = (shop) => {
  if (typeof window !== 'undefined') {
    window.location.href = getShopifyAuthUrl(shop);
  }
};

// Validate Shopify domain
export const validateShopifyDomain = (shop) => {
  const shopifyDomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  return shopifyDomainRegex.test(shop);
};

// Format domain to proper format
export const formatShopifyDomain = (shop) => {
  let formattedShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  if (formattedShop.includes('.myshopify.com')) {
    return formattedShop;
  }
  
  if (!formattedShop.includes('.')) {
    return `${formattedShop}.myshopify.com`;
  }
  
  return formattedShop;
};
```

### 2. API Utilities (`src/utils/shopify-api.js`)

Functions for making API calls:

```javascript
// Save OAuth code to backend
export const saveShopifyOAuthCode = async (code, shop) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const saveUrl = `${baseURL}/shopify/oauth/save/`;

  const response = await fetch(saveUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, shop }),
  });

  if (!response.ok) {
    throw new Error(`Save OAuth code failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

// Get shop data using access token
export const getShopifyShopData = async (accessToken, shop) => {
  const response = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch shop data: ${response.status} ${response.statusText}`);
  }

  const shopData = await response.json();
  return shopData.shop;
};
```

### 3. Redux Slice (`src/store/slices/shopifySlice.js`)

State management for Shopify integration:

```javascript
// Async thunk for saving OAuth code
export const saveShopifyOAuthCode = createAsyncThunk(
  'shopify/saveOAuthCode',
  async ({ code, shop }, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.shopifySaveOAuth(code, shop);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save Shopify OAuth code');
    }
  }
);

// State structure
const initialState = {
  connecting: false,
  connectionData: null,
  connectedAccounts: [],
  currentAccount: null,
  connectionError: null,
  connectionSuccess: false,
  tokens: {
    access_token: null,
    refresh_token: null,
    expires_in: null,
    expires_at: null,
    scope: '',
  },
  shopData: null,
  analytics: {
    products_count: 0,
    orders_count: 0,
    customers_count: 0,
    revenue: 0,
    currency: 'USD'
  }
};
```

### 4. API Service (`src/services/api.js`)

Updated to include Shopify endpoints:

```javascript
// Marketing endpoints
marketing: {
  // ... existing endpoints ...
  shopifyConnect: (data) => axiosPrivate.post('/marketing/shopify/connect/', data),
  shopifyDisconnect: (accountId) => axiosPrivate.post(`/marketing/shopify/disconnect/${accountId}/`),
  shopifyRefreshTokens: (accountId) => axiosPrivate.post(`/marketing/shopify/refresh-tokens/${accountId}/`),
  shopifyAccountData: (accountId) => axiosPrivate.get(`/marketing/shopify/account/${accountId}/`),
  shopifySaveOAuth: (code, shop) => axiosPrivate.post(`/shopify/oauth/save/`, { code, shop }),
},
```

## Usage Examples

### 1. Basic OAuth Connection

```javascript
import { redirectToShopifyAuth, validateShopifyDomain, formatShopifyDomain } from '../utils/shopify-oauth-handler';

const handleConnect = (shopDomain) => {
  // Format and validate domain
  const formattedShop = formatShopifyDomain(shopDomain);
  
  if (!validateShopifyDomain(formattedShop)) {
    throw new Error('Invalid Shopify domain format');
  }
  
  // Redirect to Shopify OAuth
  redirectToShopifyAuth(formattedShop);
};
```

### 2. OAuth Callback Handling

```javascript
import { saveShopifyOAuthCode } from '../store/slices/shopifySlice';
import { useDispatch } from 'react-redux';

const handleOAuthCallback = async (code, shop) => {
  const dispatch = useDispatch();
  
  try {
    const result = await dispatch(saveShopifyOAuthCode({ code, shop })).unwrap();
    console.log('Shopify connected successfully:', result);
  } catch (error) {
    console.error('Failed to connect Shopify:', error);
  }
};
```

### 3. Using Redux State

```javascript
import { useSelector } from 'react-redux';
import { 
  selectShopifyConnectedAccounts, 
  selectShopifyIsConnected,
  selectShopifyShopData 
} from '../store/slices/shopifySlice';

const MyComponent = () => {
  const connectedAccounts = useSelector(selectShopifyConnectedAccounts);
  const isConnected = useSelector(selectShopifyIsConnected);
  const shopData = useSelector(selectShopifyShopData);
  
  return (
    <div>
      {isConnected ? (
        <div>
          <h3>Connected Stores: {connectedAccounts.length}</h3>
          {shopData && <p>Store: {shopData.name}</p>}
        </div>
      ) : (
        <p>No Shopify stores connected</p>
      )}
    </div>
  );
};
```

## Testing

### 1. Configuration Test

```javascript
import { testShopifyOAuthConfig } from '../utils/shopify-oauth-handler';

const testConfig = () => {
  const config = testShopifyOAuthConfig();
  console.log('Configuration status:', config);
  
  if (!config.isConfigured) {
    alert('❌ Shopify OAuth not configured properly');
  } else {
    alert('✅ Shopify OAuth configured correctly');
  }
};
```

### 2. Mock Data Test

```javascript
import { createMockShopifyConnectionData } from '../utils/shopify-oauth-handler';

const testMockData = () => {
  const mockData = createMockShopifyConnectionData('test-store.myshopify.com');
  console.log('Mock Shopify data:', mockData);
};
```

### 3. Integration Test

Use the `ShopifyOAuthExample` component to test the complete OAuth flow:

```javascript
import ShopifyOAuthExample from '../components/integrations/ShopifyOAuthExample';

// In your component
<ShopifyOAuthExample />
```

## Troubleshooting

### Common Issues

1. **"Shopify OAuth not configured"**
   - Check that `VITE_SHOPIFY_CLIENT_ID` and `VITE_SHOPIFY_REDIRECT_URI` are set in your `.env` file
   - Verify the values match your Shopify app settings

2. **"Invalid Shopify domain format"**
   - Ensure the domain follows the format: `mystore.myshopify.com`
   - Use the `formatShopifyDomain` function to automatically format domains

3. **"Save OAuth code failed"**
   - Check that your backend endpoint `/shopify/oauth/save/` is working
   - Verify the API URL in `VITE_API_URL`
   - Check network tab for detailed error messages

4. **"OAuth callback not working"**
   - Ensure the redirect URI in your Shopify app matches `VITE_SHOPIFY_REDIRECT_URI`
   - Check that the callback handling is properly set up in `IntegrationsPage.jsx`

### Debug Steps

1. **Check Environment Variables**
   ```javascript
   console.log('Client ID:', import.meta.env.VITE_SHOPIFY_CLIENT_ID);
   console.log('Redirect URI:', import.meta.env.VITE_SHOPIFY_REDIRECT_URI);
   ```

2. **Test OAuth URL Generation**
   ```javascript
   const authUrl = getShopifyAuthUrl('mystore.myshopify.com');
   console.log('OAuth URL:', authUrl);
   ```

3. **Monitor Network Requests**
   - Open browser dev tools
   - Go to Network tab
   - Monitor requests to your backend API
   - Check for CORS errors or 404 responses

4. **Check Redux State**
   ```javascript
   import { useSelector } from 'react-redux';
   const shopifyState = useSelector(state => state.shopify);
   console.log('Shopify state:', shopifyState);
   ```

### Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Shopify client ID or redirect URI not configured" | Missing environment variables | Set `VITE_SHOPIFY_CLIENT_ID` and `VITE_SHOPIFY_REDIRECT_URI` |
| "Invalid Shopify domain format" | Incorrect domain format | Use `formatShopifyDomain()` function |
| "Save OAuth code failed" | Backend API issue | Check backend endpoint and API URL |
| "OAuth already in progress" | Duplicate OAuth requests | Wait for current request to complete |

## Backend Requirements

Your backend needs to implement the following endpoint:

### POST `/shopify/oauth/save/`

**Request Body:**
```json
{
  "code": "authorization_code_from_shopify",
  "shop": "mystore.myshopify.com"
}
```

**Expected Response:**
```json
{
  "success": true,
  "account": {
    "id": "account_id",
    "shop": "mystore.myshopify.com",
    "name": "My Store",
    "email": "store@example.com"
  },
  "token_data": {
    "access_token": "shpat_xxx",
    "scope": "read_products,write_products,read_orders,write_orders",
    "expires_in": null
  },
  "shop_data": {
    "id": 123456789,
    "name": "My Store",
    "domain": "mystore.myshopify.com",
    "email": "store@example.com",
    "currency": "USD"
  },
  "analytics": {
    "products_count": 150,
    "orders_count": 1250,
    "customers_count": 500,
    "revenue": 25000.00,
    "currency": "USD"
  }
}
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to version control
2. **HTTPS**: Use HTTPS in production for all OAuth redirects
3. **State Validation**: Validate the `state` parameter in OAuth callbacks
4. **Token Storage**: Store tokens securely on the backend, not in localStorage
5. **Scope Limitation**: Request only the minimum required scopes

## Next Steps

1. **Backend Implementation**: Implement the `/shopify/oauth/save/` endpoint
2. **Error Handling**: Add comprehensive error handling for edge cases
3. **Token Refresh**: Implement token refresh logic for expired tokens
4. **Data Sync**: Set up periodic data synchronization with Shopify
5. **Analytics**: Add analytics tracking for OAuth success/failure rates

---

For additional support or questions, refer to the [Shopify API documentation](https://shopify.dev/docs/apps/auth/oauth) or contact the development team. 