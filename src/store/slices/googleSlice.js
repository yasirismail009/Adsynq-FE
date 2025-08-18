import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { getStoredGoogleData, clearStoredGoogleData } from '../../utils/google-oauth-handler';

// Types for TypeScript (if using TypeScript)
// interface GoogleConnectData {
//   user_data: {
//     id: string;
//     name: string;
//     email: string;
//     picture: string;
//     verified_email: boolean;
//     locale: string;
//   };
//   token_data: {
//     access_token: string;
//     refresh_token: string;
//     expires_in: number;
//     scope: string;
//     token_type: string;
//     id_token?: string;
//   };
//   advertising_data?: {
//     googleAds?: any;
//     googleAnalytics?: any;
//   };
// }

// Async thunk for connecting Google account
export const connectGoogleAccount = createAsyncThunk(
  'google/connectAccount',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      // Prepare the complete payload including advertising data
      const connectPayload = {
        user_data: data.user_data,
        token_data: data.token_data,
        advertising_data: data.advertising_data
      };

      console.log('Sending Google connection payload:', connectPayload);

      const response = await apiService.marketing.googleConnect(connectPayload);
      
      console.log('Google connection response:', response);
      
      // Connection successful - platform data will be fetched via platform slice
      
      return response.data;
    } catch (error) {
      console.error('Google connection error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to connect Google account');
    }
  }
);

// Async thunk for disconnecting Google account
export const disconnectGoogleAccount = createAsyncThunk(
  'google/disconnectAccount',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.googleDisconnect(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disconnect Google account');
    }
  }
);

// Async thunk for refreshing Google tokens
export const refreshGoogleTokens = createAsyncThunk(
  'google/refreshTokens',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.googleRefreshTokens(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh Google tokens');
    }
  }
);

// Async thunk for fetching Google OAuth profile
export const fetchGoogleOAuthProfileFromStore = createAsyncThunk(
  'google/fetchOAuthProfile',
  async (code, { rejectWithValue }) => {
    try {
      // Get stored Google data from localStorage
      const storedData = getStoredGoogleData();
      
      if (!storedData) {
        throw new Error('No Google OAuth data found. Please complete the OAuth flow first.');
      }

      return {
        user_data: {
          id: storedData.user_data.id,
          name: storedData.user_data.name,
          email: storedData.user_data.email,
          picture: storedData.user_data.picture,
          given_name: storedData.user_data.given_name,
          family_name: storedData.user_data.family_name,
          locale: storedData.user_data.locale,
          verified_email: storedData.user_data.verified_email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        token_data: storedData.token_data,
        advertising_data: storedData.advertising_data
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch OAuth profile');
    }
  }
);

// Async thunk for fetching Google account data
export const fetchGoogleAccountData = createAsyncThunk(
  'google/fetchAccountData',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.googleAccountData(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch Google account data');
    }
  }
);

// Async thunk for fetching Google overall stats
export const fetchGoogleOverallStats = createAsyncThunk(
  'google/fetchOverallStats',
  async (params = { date_from: '2023-01-01', date_to: '2025-12-31' }, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.googleOverallStats(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching Google overall stats:', error);
      
      // Extract error message from response data
      let errorMessage = 'Failed to fetch Google stats';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      return rejectWithValue(errorMessage);
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
  
  // Overall stats data
  overallStats: null,
  overallStatsLoading: false,
  overallStatsError: null,
  
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
    expires_at: null
  }
};

// Google slice
const googleSlice = createSlice({
  name: 'google',
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
      // Also clear stored Google data from localStorage
      clearStoredGoogleData();
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
    
    // Reset state
    resetGoogleState: () => initialState,
  },
  extraReducers: (builder) => {
    // Connect Google account
    builder
      .addCase(connectGoogleAccount.pending, (state) => {
        state.connecting = true;
        state.connectionError = null;
        state.connectionSuccess = false;
      })
      .addCase(connectGoogleAccount.fulfilled, (state, action) => {
        state.connecting = false;
        state.connectionSuccess = true;
        state.connectionData = action.payload;
        state.connectedAccounts.push(action.payload);
        state.currentAccount = action.payload;
        
        // Set tokens if available
        if (action.payload.token_data) {
          state.tokens = {
            access_token: action.payload.token_data.access_token,
            refresh_token: action.payload.token_data.refresh_token,
            expires_in: action.payload.token_data.expires_in,
            expires_at: new Date(Date.now() + action.payload.token_data.expires_in * 1000).toISOString()
          };
        }
      })
      .addCase(connectGoogleAccount.rejected, (state, action) => {
        state.connecting = false;
        state.connectionError = action.payload;
        state.connectionSuccess = false;
      });

    // Disconnect Google account
    builder
      .addCase(disconnectGoogleAccount.pending, (state) => {
        state.disconnecting = true;
        state.disconnectError = null;
        state.disconnectSuccess = false;
      })
      .addCase(disconnectGoogleAccount.fulfilled, (state, action) => {
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
      .addCase(disconnectGoogleAccount.rejected, (state, action) => {
        state.disconnecting = false;
        state.disconnectError = action.payload;
        state.disconnectSuccess = false;
      });

    // Refresh Google tokens
    builder
      .addCase(refreshGoogleTokens.pending, (state) => {
        state.refreshing = true;
        state.refreshError = null;
        state.refreshSuccess = false;
      })
      .addCase(refreshGoogleTokens.fulfilled, (state, action) => {
        state.refreshing = false;
        state.refreshSuccess = true;
        
        // Update tokens
        if (action.payload.token_data) {
          state.tokens = {
            access_token: action.payload.token_data.access_token,
            refresh_token: action.payload.token_data.refresh_token,
            expires_in: action.payload.token_data.expires_in,
            expires_at: new Date(Date.now() + action.payload.token_data.expires_in * 1000).toISOString()
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
      .addCase(refreshGoogleTokens.rejected, (state, action) => {
        state.refreshing = false;
        state.refreshError = action.payload;
        state.refreshSuccess = false;
      });

    // Fetch Google account data
    builder
      .addCase(fetchGoogleAccountData.pending, (state) => {
        state.fetching = true;
        state.fetchError = null;
      })
      .addCase(fetchGoogleAccountData.fulfilled, (state, action) => {
        state.fetching = false;
        state.currentAccount = action.payload;
      })
      .addCase(fetchGoogleAccountData.rejected, (state, action) => {
        state.fetching = false;
        state.fetchError = action.payload;
      });

    // Fetch Google OAuth profile from store
    builder
      .addCase(fetchGoogleOAuthProfileFromStore.pending, (state) => {
        state.fetching = true;
        state.fetchError = null;
      })
      .addCase(fetchGoogleOAuthProfileFromStore.fulfilled, (state, action) => {
        state.fetching = false;
        state.connectionData = action.payload;
      })
      .addCase(fetchGoogleOAuthProfileFromStore.rejected, (state, action) => {
        state.fetching = false;
        state.fetchError = action.payload;
      });

    // Fetch Google overall stats
    builder
      .addCase(fetchGoogleOverallStats.pending, (state) => {
        state.overallStatsLoading = true;
        state.overallStatsError = null;
      })
      .addCase(fetchGoogleOverallStats.fulfilled, (state, action) => {
        state.overallStatsLoading = false;
        state.overallStats = action.payload;
      })
      .addCase(fetchGoogleOverallStats.rejected, (state, action) => {
        state.overallStatsLoading = false;
        state.overallStatsError = action.payload;
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
  resetGoogleState,
} = googleSlice.actions;

// Export selectors
export const selectGoogleState = (state) => state.google;
export const selectGoogleConnecting = (state) => state.google.connecting;
export const selectGoogleDisconnecting = (state) => state.google.disconnecting;
export const selectGoogleRefreshing = (state) => state.google.refreshing;
export const selectGoogleFetching = (state) => state.google.fetching;
export const selectGoogleConnectionData = (state) => state.google.connectionData;
export const selectGoogleConnectedAccounts = (state) => state.google.connectedAccounts;
export const selectGoogleCurrentAccount = (state) => state.google.currentAccount;
export const selectGoogleConnectionError = (state) => state.google.connectionError;
export const selectGoogleDisconnectError = (state) => state.google.disconnectError;
export const selectGoogleRefreshError = (state) => state.google.refreshError;
export const selectGoogleFetchError = (state) => state.google.fetchError;
export const selectGoogleConnectionSuccess = (state) => state.google.connectionSuccess;
export const selectGoogleDisconnectSuccess = (state) => state.google.disconnectSuccess;
export const selectGoogleRefreshSuccess = (state) => state.google.refreshSuccess;
export const selectGoogleTokens = (state) => state.google.tokens;
export const selectGoogleOAuthState = (state) => state.google.oauthState;
export const selectGoogleOAuthCode = (state) => state.google.oauthCode;

// Overall stats selectors
export const selectGoogleOverallStats = (state) => state.google.overallStats;
export const selectGoogleOverallStatsLoading = (state) => state.google.overallStatsLoading;
export const selectGoogleOverallStatsError = (state) => state.google.overallStatsError;

// Helper selectors
export const selectGoogleIsConnected = (state) => state.google.connectedAccounts.length > 0;
export const selectGoogleHasValidToken = (state) => {
  const tokens = state.google.tokens;
  if (!tokens.expires_at) return false;
  return new Date(tokens.expires_at) > new Date();
};

export default googleSlice.reducer; 