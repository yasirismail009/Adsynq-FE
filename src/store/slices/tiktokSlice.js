import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunk for saving TikTok OAuth code
export const saveTikTokOAuthCode = createAsyncThunk(
  'tiktok/saveOAuthCode',
  async (code, { rejectWithValue }) => {
    try {
      console.log('🔄 Saving TikTok OAuth code...');
      
      const response = await apiService.marketing.tiktokSaveOAuth(code);
      
      console.log('✅ TikTok OAuth code saved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to save TikTok OAuth code:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to save TikTok OAuth code');
    }
  }
);

// Async thunk for disconnecting TikTok account
export const disconnectTikTokAccount = createAsyncThunk(
  'tiktok/disconnectAccount',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.tiktokDisconnect(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disconnect TikTok account');
    }
  }
);

// Async thunk for refreshing TikTok tokens
export const refreshTikTokTokens = createAsyncThunk(
  'tiktok/refreshTokens',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.tiktokRefreshTokens(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh TikTok tokens');
    }
  }
);

// Async thunk for fetching TikTok OAuth profile
export const fetchTikTokOAuthProfile = createAsyncThunk(
  'tiktok/fetchOAuthProfile',
  async (code, { rejectWithValue }) => {
    try {
      // Import the function from the utility
      const { fetchTikTokOAuthProfile: fetchProfile } = await import('../../utils/tiktok-oauth-handler');
      return await fetchProfile(code);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch TikTok OAuth profile');
    }
  }
);

// Async thunk for fetching TikTok account data
export const fetchTikTokAccountData = createAsyncThunk(
  'tiktok/fetchAccountData',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.tiktokAccountData(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch TikTok account data');
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
};

// TikTok slice
const tiktokSlice = createSlice({
  name: 'tiktok',
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
    
    // Set business profile
    setBusinessProfile: (state, action) => {
      state.businessProfile = action.payload;
    },
    
    // Set analytics data
    setAnalytics: (state, action) => {
      state.analytics = {
        ...state.analytics,
        ...action.payload
      };
    },
    
    // Reset state
    resetTikTokState: () => initialState,
  },
  extraReducers: (builder) => {
    // Save TikTok OAuth code
    builder
      .addCase(saveTikTokOAuthCode.pending, (state) => {
        state.connecting = true;
        state.connectionError = null;
        state.connectionSuccess = false;
      })
      .addCase(saveTikTokOAuthCode.fulfilled, (state, action) => {
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
            advertiser_ids: action.payload.token_data.advertiser_ids || []
          };
        }
        
        // Set business profile if available
        if (action.payload.business_profile) {
          state.businessProfile = action.payload.business_profile;
        }
        
        // Set analytics data if available
        if (action.payload.user_data) {
          state.analytics = {
            metrics: action.payload.user_data.metrics || [],
            audience_ages: action.payload.user_data.audience_ages || [],
            audience_genders: action.payload.user_data.audience_genders || [],
            audience_countries: action.payload.user_data.audience_countries || [],
            audience_cities: action.payload.user_data.audience_cities || [],
            audience_activity: action.payload.user_data.audience_activity || []
          };
        }
      })
      .addCase(saveTikTokOAuthCode.rejected, (state, action) => {
        state.connecting = false;
        state.connectionError = action.payload;
        state.connectionSuccess = false;
      });

    // Disconnect TikTok account
    builder
      .addCase(disconnectTikTokAccount.pending, (state) => {
        state.disconnecting = true;
        state.disconnectError = null;
        state.disconnectSuccess = false;
      })
      .addCase(disconnectTikTokAccount.fulfilled, (state, action) => {
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
      .addCase(disconnectTikTokAccount.rejected, (state, action) => {
        state.disconnecting = false;
        state.disconnectError = action.payload;
        state.disconnectSuccess = false;
      });

    // Refresh TikTok tokens
    builder
      .addCase(refreshTikTokTokens.pending, (state) => {
        state.refreshing = true;
        state.refreshError = null;
        state.refreshSuccess = false;
      })
      .addCase(refreshTikTokTokens.fulfilled, (state, action) => {
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
            advertiser_ids: action.payload.token_data.advertiser_ids || []
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
      .addCase(refreshTikTokTokens.rejected, (state, action) => {
        state.refreshing = false;
        state.refreshError = action.payload;
        state.refreshSuccess = false;
      });

    // Fetch TikTok account data
    builder
      .addCase(fetchTikTokAccountData.pending, (state) => {
        state.fetching = true;
        state.fetchError = null;
      })
      .addCase(fetchTikTokAccountData.fulfilled, (state, action) => {
        state.fetching = false;
        state.currentAccount = action.payload;
      })
      .addCase(fetchTikTokAccountData.rejected, (state, action) => {
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
  setConnectionData,
  clearConnectionData,
  setTokens,
  setBusinessProfile,
  setAnalytics,
  resetTikTokState,
} = tiktokSlice.actions;

// Export selectors
export const selectTikTokState = (state) => state.tiktok;
export const selectTikTokConnecting = (state) => state.tiktok.connecting;
export const selectTikTokDisconnecting = (state) => state.tiktok.disconnecting;
export const selectTikTokRefreshing = (state) => state.tiktok.refreshing;
export const selectTikTokFetching = (state) => state.tiktok.fetching;
export const selectTikTokConnectionData = (state) => state.tiktok.connectionData;
export const selectTikTokConnectedAccounts = (state) => state.tiktok.connectedAccounts;
export const selectTikTokCurrentAccount = (state) => state.tiktok.currentAccount;
export const selectTikTokConnectionError = (state) => state.tiktok.connectionError;
export const selectTikTokDisconnectError = (state) => state.tiktok.disconnectError;
export const selectTikTokRefreshError = (state) => state.tiktok.refreshError;
export const selectTikTokFetchError = (state) => state.tiktok.fetchError;
export const selectTikTokConnectionSuccess = (state) => state.tiktok.connectionSuccess;
export const selectTikTokDisconnectSuccess = (state) => state.tiktok.disconnectSuccess;
export const selectTikTokRefreshSuccess = (state) => state.tiktok.refreshSuccess;
export const selectTikTokTokens = (state) => state.tiktok.tokens;
export const selectTikTokOAuthState = (state) => state.tiktok.oauthState;
export const selectTikTokOAuthCode = (state) => state.tiktok.oauthCode;
export const selectTikTokBusinessProfile = (state) => state.tiktok.businessProfile;
export const selectTikTokAnalytics = (state) => state.tiktok.analytics;

// Helper selectors
export const selectTikTokIsConnected = (state) => state.tiktok.connectedAccounts.length > 0;
export const selectTikTokHasValidToken = (state) => {
  const tokens = state.tiktok.tokens;
  if (!tokens.expires_at) return false;
  return new Date(tokens.expires_at) > new Date();
};

export default tiktokSlice.reducer; 