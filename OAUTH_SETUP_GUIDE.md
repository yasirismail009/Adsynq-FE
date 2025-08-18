# OAuth Setup Guide - Fixing redirect_uri_mismatch Error

## Problem
You're getting a `redirect_uri_mismatch` error because your OAuth applications are configured with different redirect URIs than what your app is actually using.

## Solution

### 1. Current Configuration
Your app is now configured to run on `http://localhost:3001` and uses this redirect URI for all platforms:

- **All Platforms**: `http://localhost:3001`

### 2. Google OAuth Scopes
The Google OAuth configuration now includes these scopes:
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`
- `https://www.googleapis.com/auth/adwords`
- `https://www.googleapis.com/auth/doubleclicksearch`
- `https://www.googleapis.com/auth/admanager`

### 3. OAuth Callback Behavior
After successful Google OAuth login:
- The payload will be logged to the browser console
- User data will be updated in the integration
- **No automatic redirection to dashboard** - user stays on current page
- Console will show: "Google OAuth login successful! User is logged in but staying on current page."

### 4. Update Your OAuth Applications

You need to update the redirect URIs in each platform's developer console:

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add `http://localhost:3001` to "Authorized redirect URIs"
6. Save changes

#### Meta/Facebook OAuth
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Select your app
3. Go to "Facebook Login" > "Settings"
4. Add `http://localhost:3001` to "Valid OAuth Redirect URIs"
5. Save changes

#### TikTok OAuth
1. Go to [TikTok for Business](https://ads.tiktok.com/i18n/oauth2/)
2. Select your app
3. Go to "App Settings" > "OAuth Settings"
4. Add `http://localhost:3001` to "Redirect URIs"
5. Save changes

#### Shopify OAuth
1. Go to your Shopify Partner Dashboard
2. Select your app
3. Go to "App Setup" > "Admin API integration"
4. Add `http://localhost:3001` to "Allowed redirection URL(s)"
5. Save changes

#### LinkedIn OAuth
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Select your app
3. Go to "Auth" > "OAuth 2.0 settings"
4. Add `http://localhost:3001` to "Authorized redirect URLs"
5. Save changes

#### Apple OAuth
1. Go to [Apple Developer](https://developer.apple.com/)
2. Select your app
3. Go to "Certificates, Identifiers & Profiles" > "Identifiers"
4. Edit your App ID
5. Add `http://localhost:3001` to "Return URLs"
6. Save changes

### 5. Environment Variables

Create a `.env` file in your project root with your OAuth client IDs:

```env
# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_META_CLIENT_ID=your-meta-client-id-here
VITE_TIKTOK_CLIENT_ID=your-tiktok-client-id-here
VITE_SHOPIFY_CLIENT_ID=your-shopify-client-id-here
VITE_LINKEDIN_CLIENT_ID=your-linkedin-client-id-here
VITE_APPLE_CLIENT_ID=your-apple-client-id-here
```

### 6. Production Configuration

For production, you'll need to:

1. Update the redirect URIs in your OAuth applications to use your production domain
2. The code automatically detects production environment and uses `window.location.origin`

### 7. Testing

After updating the redirect URIs:

1. Start your development server: `npm run dev`
2. The server will run on `http://localhost:3001`
3. Try the OAuth flow again
4. Check the browser console for the redirect URI being used
5. After successful Google OAuth, check console for the logged payload

### 8. Debugging

If you still get the error:

1. Check the browser console for the logged redirect URI
2. Verify it matches exactly what's configured in your OAuth application
3. Make sure there are no trailing slashes or extra characters
4. Wait a few minutes after updating OAuth settings (some platforms have caching)

## Common Issues

- **Trailing slashes**: Make sure there are no trailing slashes in your redirect URIs
- **Protocol mismatch**: Use `http://` for development, `https://` for production
- **Port mismatch**: Ensure the port (3001) matches exactly
- **Case sensitivity**: Some platforms are case-sensitive
- **Caching**: Some OAuth platforms cache settings for a few minutes 