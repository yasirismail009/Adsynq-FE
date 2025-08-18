import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunk for connecting Shopify account (Simplified - passes everything to backend)
export const connectShopifyAccount = createAsyncThunk(
  'shopify/connectAccount',
  async (oauthParams, { rejectWithValue }) => {
    try {
      console.log('🛍️ === CONNECT SHOPIFY ACCOUNT ===');
      console.log('🛍️ OAuth Parameters:', oauthParams);
      
      const response = await apiService.marketing.shopifyConnect(oauthParams);
      
      console.log('🛍️ ✅ Shopify account connected successfully');
      console.log('🛍️ Response data:', response.data);
      console.log('🛍️ Response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('🛍️ ❌ Failed to connect Shopify account:', error);
      console.error('🛍️ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to connect Shopify account');
    }
  }
);

// Async thunk for disconnecting Shopify account
export const disconnectShopifyAccount = createAsyncThunk(
  'shopify/disconnectAccount',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.shopifyDisconnect(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disconnect Shopify account');
    }
  }
);

// Async thunk for refreshing Shopify tokens
export const refreshShopifyTokens = createAsyncThunk(
  'shopify/refreshTokens',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.shopifyRefreshTokens(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh Shopify tokens');
    }
  }
);

// Async thunk for fetching Shopify account data
export const fetchShopifyAccountData = createAsyncThunk(
  'shopify/fetchAccountData',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.shopifyAccountData(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch Shopify account data');
    }
  }
);

// Initial state
const initialState = {
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
  oauthShop: null,
  
  // Token information
  tokens: {
    access_token: null,
    refresh_token: null,
    expires_in: null,
    expires_at: null,
    scope: '',
  },
  
  // Shop data
  shopData: null,
  
  // Analytics data
  analytics: {
    products_count: 0,
    orders_count: 0,
    customers_count: 0,
    revenue: 0,
    currency: 'USD'
  }
};

// Shopify slice
const shopifySlice = createSlice({
  name: 'shopify',
  initialState,
  reducers: {
    // Clear errors
    clearConnectionError: (state) => {
      state.connectionError = null;
    },
    clearDisconnectError: (state) => {
      state.disconnectError = null;
    },
    clearRefreshError: (state) => {
      state.refreshError = null;
    },
    clearFetchError: (state) => {
      state.fetchError = null;
    },
    
    // Clear success states
    clearConnectionSuccess: (state) => {
      state.connectionSuccess = false;
    },
    clearDisconnectSuccess: (state) => {
      state.disconnectSuccess = false;
    },
    clearRefreshSuccess: (state) => {
      state.refreshSuccess = false;
    },
    
    // Set OAuth state
    setOAuthState: (state, action) => {
      state.oauthState = action.payload;
    },
    setOAuthCode: (state, action) => {
      state.oauthCode = action.payload;
    },
    setOAuthShop: (state, action) => {
      state.oauthShop = action.payload;
    },
    
    // Set connection data
    setConnectionData: (state, action) => {
      state.connectionData = action.payload;
    },
    
    // Clear connection data
    clearConnectionData: (state) => {
      state.connectionData = null;
    },
    
    // Set tokens
    setTokens: (state, action) => {
      state.tokens = {
        ...state.tokens,
        ...action.payload,
        expires_at: action.payload.expires_in 
          ? new Date(Date.now() + action.payload.expires_in * 1000).toISOString()
          : null
      };
    },
    
    // Set shop data
    setShopData: (state, action) => {
      state.shopData = action.payload;
    },
    
    // Set analytics data
    setAnalytics: (state, action) => {
      state.analytics = {
        ...state.analytics,
        ...action.payload
      };
    },
    
    // Reset state
    resetShopifyState: () => initialState,
  },
  extraReducers: (builder) => {
    // Connect Shopify account
    builder
      .addCase(connectShopifyAccount.pending, (state) => {
        state.connecting = true;
        state.connectionError = null;
        state.connectionSuccess = false;
      })
      .addCase(connectShopifyAccount.fulfilled, (state, action) => {
        state.connecting = false;
        state.connectionSuccess = true;
        state.connectionData = action.payload;
        
        // If the backend returns account data, add it to connected accounts
        if (action.payload.account) {
          state.connectedAccounts.push(action.payload.account);
          state.currentAccount = action.payload.account;
        }
        
        // Set tokens if available
        if (action.payload.token_data) {
          state.tokens = {
            access_token: action.payload.token_data.access_token,
            refresh_token: action.payload.token_data.refresh_token,
            expires_in: action.payload.token_data.expires_in,
            expires_at: new Date(Date.now() + action.payload.token_data.expires_in * 1000).toISOString(),
            scope: action.payload.token_data.scope || '',
          };
        }
        
        // Set shop data if available
        if (action.payload.shop_data) {
          state.shopData = action.payload.shop_data;
        }
        
        // Set analytics data if available
        if (action.payload.analytics) {
          state.analytics = {
            ...state.analytics,
            ...action.payload.analytics
          };
        }
      })
      .addCase(connectShopifyAccount.rejected, (state, action) => {
        state.connecting = false;
        state.connectionError = action.payload;
        state.connectionSuccess = false;
      });

    // Disconnect Shopify account
    builder
      .addCase(disconnectShopifyAccount.pending, (state) => {
        state.disconnecting = true;
        state.disconnectError = null;
        state.disconnectSuccess = false;
      })
      .addCase(disconnectShopifyAccount.fulfilled, (state, action) => {
        state.disconnecting = false;
        state.disconnectSuccess = true;
        // Remove the disconnected account
        state.connectedAccounts = state.connectedAccounts.filter(
          account => account.id !== action.payload.account_id
        );
        if (state.currentAccount?.id === action.payload.account_id) {
          state.currentAccount = null;
        }
      })
      .addCase(disconnectShopifyAccount.rejected, (state, action) => {
        state.disconnecting = false;
        state.disconnectError = action.payload;
        state.disconnectSuccess = false;
      });

    // Refresh Shopify tokens
    builder
      .addCase(refreshShopifyTokens.pending, (state) => {
        state.refreshing = true;
        state.refreshError = null;
        state.refreshSuccess = false;
      })
      .addCase(refreshShopifyTokens.fulfilled, (state, action) => {
        state.refreshing = false;
        state.refreshSuccess = true;
        
        // Update tokens
        if (action.payload.token_data) {
          state.tokens = {
            access_token: action.payload.token_data.access_token,
            refresh_token: action.payload.token_data.refresh_token,
            expires_in: action.payload.token_data.expires_in,
            expires_at: new Date(Date.now() + action.payload.token_data.expires_in * 1000).toISOString(),
            scope: action.payload.token_data.scope || '',
          };
        }
        
        // Update current account if it matches
        if (state.currentAccount?.id === action.payload.account_id) {
          state.currentAccount = {
            ...state.currentAccount,
            token_data: action.payload.token_data
          };
        }
      })
      .addCase(refreshShopifyTokens.rejected, (state, action) => {
        state.refreshing = false;
        state.refreshError = action.payload;
        state.refreshSuccess = false;
      });

    // Fetch Shopify account data
    builder
      .addCase(fetchShopifyAccountData.pending, (state) => {
        state.fetching = true;
        state.fetchError = null;
      })
      .addCase(fetchShopifyAccountData.fulfilled, (state, action) => {
        state.fetching = false;
        state.currentAccount = action.payload;
      })
      .addCase(fetchShopifyAccountData.rejected, (state, action) => {
        state.fetching = false;
        state.fetchError = action.payload;
      });
  },
});

// Export actions
export const {
  clearConnectionError,
  clearDisconnectError,
  clearRefreshError,
  clearFetchError,
  clearConnectionSuccess,
  clearDisconnectSuccess,
  clearRefreshSuccess,
  setOAuthState,
  setOAuthCode,
  setOAuthShop,
  setConnectionData,
  clearConnectionData,
  setTokens,
  setShopData,
  setAnalytics,
  resetShopifyState,
} = shopifySlice.actions;

// Export selectors
export const selectShopifyState = (state) => state.shopify;
export const selectShopifyConnecting = (state) => state.shopify.connecting;
export const selectShopifyDisconnecting = (state) => state.shopify.disconnecting;
export const selectShopifyRefreshing = (state) => state.shopify.refreshing;
export const selectShopifyFetching = (state) => state.shopify.fetching;
export const selectShopifyConnectionData = (state) => state.shopify.connectionData;
export const selectShopifyConnectedAccounts = (state) => state.shopify.connectedAccounts;
export const selectShopifyCurrentAccount = (state) => state.shopify.currentAccount;
export const selectShopifyConnectionError = (state) => state.shopify.connectionError;
export const selectShopifyDisconnectError = (state) => state.shopify.disconnectError;
export const selectShopifyRefreshError = (state) => state.shopify.refreshError;
export const selectShopifyFetchError = (state) => state.shopify.fetchError;
export const selectShopifyConnectionSuccess = (state) => state.shopify.connectionSuccess;
export const selectShopifyDisconnectSuccess = (state) => state.shopify.disconnectSuccess;
export const selectShopifyRefreshSuccess = (state) => state.shopify.refreshSuccess;
export const selectShopifyTokens = (state) => state.shopify.tokens;
export const selectShopifyOAuthState = (state) => state.shopify.oauthState;
export const selectShopifyOAuthCode = (state) => state.shopify.oauthCode;
export const selectShopifyOAuthShop = (state) => state.shopify.oauthShop;
export const selectShopifyShopData = (state) => state.shopify.shopData;
export const selectShopifyAnalytics = (state) => state.shopify.analytics;

// Helper selectors
export const selectShopifyIsConnected = (state) => state.shopify.connectedAccounts.length > 0;
export const selectShopifyHasValidToken = (state) => {
  const tokens = state.shopify.tokens;
  if (!tokens.expires_at) return false;
  return new Date(tokens.expires_at) > new Date();
};

export default shopifySlice.reducer; 