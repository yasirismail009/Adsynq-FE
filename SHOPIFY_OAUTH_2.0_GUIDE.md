# Shopify OAuth 2.0 Token Exchange Implementation Guide

## Overview

This guide covers the implementation of Shopify's new OAuth 2.0 Token Exchange flow, which replaces the traditional authorization code flow. This new approach provides better security and follows OAuth 2.0 standards.

## Key Changes from Traditional OAuth

### Traditional OAuth Flow (Deprecated)
1. Redirect to Shopify with authorization code
2. Exchange authorization code for access token
3. Use access token for API calls

### New OAuth 2.0 Token Exchange Flow
1. Redirect to Shopify with session token
2. Exchange session token for access token using token exchange
3. Use access token for API calls

## Environment Variables Required

```bash
# Shopify App Configuration
VITE_SHOPIFY_CLIENT_ID=your_shopify_client_id
VITE_SHOPIFY_CLIENT_SECRET=your_shopify_client_secret
VITE_SHOPIFY_REDIRECT_URI=http://localhost:3001/integrations

# API Configuration
VITE_API_URL=http://localhost:8000/api
```

## Implementation Details

### 1. OAuth Authorization URL

The authorization URL now includes updated scopes for marketing and analytics:

```javascript
const scope = 'read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_marketing_events,write_marketing_events,read_analytics,read_reports,read_marketing,write_marketing,read_analytics,write_analytics';
```

### 2. Token Exchange Request

After receiving the session token from Shopify, we exchange it for an access token:

```bash
curl -X POST \
  https://{shop}.myshopify.com/admin/oauth/access_token \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
      "client_id": "{client_id}",
      "client_secret": "{client_secret}",
      "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
      "subject_token": "{session_token}",
      "subject_token_type": "urn:ietf:params:oauth:token-type:id_token",
      "requested_token_type": "urn:shopify:params:oauth:token-type:online-access-token"
  }'
```

### 3. Frontend Implementation

#### OAuth Handler (`shopify-oauth-handler.js`)

```javascript
// Token exchange function
export const exchangeShopifyToken = async (shop, sessionToken) => {
  const clientId = import.meta.env.VITE_SHOPIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SHOPIFY_CLIENT_SECRET;
  
  const tokenExchangeUrl = `https://${shop}/admin/oauth/access_token`;
  
  const requestBody = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
    subject_token: sessionToken,
    subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
    requested_token_type: 'urn:shopify:params:oauth:token-type:online-access-token'
  };
  
  const response = await fetch(tokenExchangeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  return await response.json();
};
```

#### API Service (`shopify-api.js`)

```javascript
export const saveShopifyOAuthCode = async (sessionToken, shop) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const saveUrl = `${baseURL}/shopify/oauth/save/`;

  const response = await fetch(saveUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      session_token: sessionToken, 
      shop,
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
      requested_token_type: 'urn:shopify:params:oauth:token-type:online-access-token'
    }),
  });

  return await response.json();
};
```

#### Redux Slice (`shopifySlice.js`)

```javascript
export const saveShopifyOAuthCode = createAsyncThunk(
  'shopify/saveOAuthCode',
  async ({ sessionToken, shop }, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.shopifySaveOAuth(sessionToken, shop);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save Shopify OAuth code');
    }
  }
);
```

### 4. Backend Implementation

The backend should handle the token exchange and store the access token:

```python
# Example backend endpoint (Python/Django)
@api_view(['POST'])
def shopify_oauth_save(request):
    session_token = request.data.get('session_token')
    shop = request.data.get('shop')
    
    # Token exchange request
    token_url = f"https://{shop}/admin/oauth/access_token"
    token_data = {
        "client_id": settings.SHOPIFY_CLIENT_ID,
        "client_secret": settings.SHOPIFY_CLIENT_SECRET,
        "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
        "subject_token": session_token,
        "subject_token_type": "urn:ietf:params:oauth:token-type:id_token",
        "requested_token_type": "urn:shopify:params:oauth:token-type:online-access-token"
    }
    
    response = requests.post(token_url, json=token_data)
    access_token_data = response.json()
    
    # Store the access token and shop data
    # ... implementation details
    
    return Response({
        "success": True,
        "access_token": access_token_data.get('access_token'),
        "shop": shop
    })
```

## OAuth Flow Steps

### 1. Initiate OAuth
```javascript
// Redirect user to Shopify OAuth
const authUrl = getShopifyAuthUrl('mystore.myshopify.com');
window.location.href = authUrl;
```

### 2. Handle Callback
```javascript
// Shopify redirects back with session token
// URL: /integrations?code=session_token&state=shop_domain
const sessionToken = urlParams.get('code');
const shop = urlParams.get('state');
```

### 3. Token Exchange
```javascript
// Exchange session token for access token
const tokenData = await exchangeShopifyToken(shop, sessionToken);
// Returns: { access_token, token_type, scope, expires_in }
```

### 4. API Calls
```javascript
// Use access token for API calls
const shopData = await getShopifyShopData(accessToken, shop);
const products = await getShopifyProducts(accessToken, shop);
const orders = await getShopifyOrders(accessToken, shop);
const customers = await getShopifyCustomers(accessToken, shop);
```

## Scopes and Permissions

The new implementation requests comprehensive scopes for marketing and analytics:

- `read_products,write_products` - Product management
- `read_orders,write_orders` - Order management
- `read_customers,write_customers` - Customer management
- `read_marketing_events,write_marketing_events` - Marketing events
- `read_analytics,read_reports` - Analytics and reporting
- `read_marketing,write_marketing` - Marketing permissions
- `read_analytics,write_analytics` - Analytics permissions

## Error Handling

### Common Errors

1. **Invalid Session Token**
   ```json
   {
     "error": "invalid_grant",
     "error_description": "Invalid session token"
   }
   ```

2. **Missing Client Secret**
   ```json
   {
     "error": "invalid_client",
     "error_description": "Client authentication failed"
   }
   ```

3. **Invalid Shop Domain**
   ```json
   {
     "error": "invalid_request",
     "error_description": "Invalid shop domain"
   }
   ```

### Error Handling Implementation

```javascript
try {
  const tokenData = await exchangeShopifyToken(shop, sessionToken);
  // Handle success
} catch (error) {
  console.error('Token exchange failed:', error);
  
  if (error.message.includes('invalid_grant')) {
    // Handle invalid session token
  } else if (error.message.includes('invalid_client')) {
    // Handle authentication issues
  } else {
    // Handle other errors
  }
}
```

## Testing

### 1. Test Configuration
```javascript
const config = testShopifyOAuthConfig();
console.log('Configuration:', config);
```

### 2. Test OAuth Flow
1. Enter a Shopify domain (e.g., `mystore.myshopify.com`)
2. Click "Connect"
3. Complete OAuth on Shopify
4. Check console logs for token exchange details

### 3. Test API Calls
```javascript
// Test shop data retrieval
const shopData = await getShopifyShopData(accessToken, shop);

// Test products retrieval
const products = await getShopifyProducts(accessToken, shop, 10);

// Test orders retrieval
const orders = await getShopifyOrders(accessToken, shop, 10);

// Test customers retrieval
const customers = await getShopifyCustomers(accessToken, shop, 10);
```

## Security Considerations

1. **Client Secret**: Never expose the client secret in frontend code
2. **Token Storage**: Store access tokens securely on the backend
3. **HTTPS**: Always use HTTPS for OAuth flows
4. **Token Refresh**: Implement token refresh logic for expired tokens
5. **Scope Validation**: Validate requested scopes match granted scopes

## Migration from Traditional OAuth

If migrating from the traditional OAuth flow:

1. Update environment variables to include `VITE_SHOPIFY_CLIENT_SECRET`
2. Update OAuth callback handling to use session tokens
3. Implement token exchange logic
4. Update API calls to use new access tokens
5. Test thoroughly with a development store

## Troubleshooting

### Common Issues

1. **"Invalid session token" error**
   - Check that the session token is being passed correctly
   - Verify the token hasn't expired
   - Ensure the shop domain is correct

2. **"Client authentication failed" error**
   - Verify `VITE_SHOPIFY_CLIENT_ID` and `VITE_SHOPIFY_CLIENT_SECRET` are set
   - Check that the client credentials are correct

3. **"Invalid shop domain" error**
   - Ensure the shop domain follows the format `store.myshopify.com`
   - Verify the shop exists and is accessible

4. **CORS errors**
   - Ensure the redirect URI is properly configured in Shopify app settings
   - Check that the domain is whitelisted

### Debug Logging

The implementation includes comprehensive logging:

```javascript
console.log('🛍️ === SHOPIFY TOKEN EXCHANGE ===');
console.log('🛍️ Shop:', shop);
console.log('🛍️ Session Token:', sessionToken?.substring(0, 20) + '...');
console.log('🛍️ Token Exchange URL:', tokenExchangeUrl);
console.log('🛍️ Response Status:', response.status);
console.log('🛍️ Access Token:', tokenData.access_token?.substring(0, 20) + '...');
```

## Conclusion

This implementation provides a secure, modern approach to Shopify OAuth using the OAuth 2.0 Token Exchange flow. It includes comprehensive error handling, logging, and follows Shopify's latest best practices for app authentication.

The new flow provides better security through token exchange and supports the latest Shopify API features for marketing and analytics. 