import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunk for connecting Facebook/Meta account
export const connectMetaAccount = createAsyncThunk(
  'facebook/connectAccount',
  async (data, { rejectWithValue }) => {
    try {
      // Prepare the complete payload including pages data
      const connectPayload = {
        user_data: data.user_data,
        token_data: data.token_data,
        pages_data: data.pages_data
      };

      console.log('Sending Facebook connection payload:', connectPayload);

      const response = await apiService.marketing.metaConnect(connectPayload);
      
      console.log('Facebook connection response:', response);
      
      return response.data;
    } catch (error) {
      console.error('Facebook connection error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to connect Facebook account');
    }
  }
);

// Async thunk for disconnecting Facebook/Meta account
export const disconnectMetaAccount = createAsyncThunk(
  'facebook/disconnectAccount',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaDisconnect(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disconnect Facebook account');
    }
  }
);

// Async thunk for disconnecting and deleting Meta account
export const disconnectAndDeleteMetaAccount = createAsyncThunk(
  'facebook/disconnectAndDeleteAccount',
  async (connectionId, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaDisconnectAndDelete(connectionId);
      return response.data;
    } catch (error) {
      console.error('Disconnect and delete Meta account error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to disconnect and delete Meta account');
    }
  }
);

// Async thunk for refreshing Facebook/Meta tokens
export const refreshMetaTokens = createAsyncThunk(
  'facebook/refreshTokens',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaRefreshTokens(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh Facebook tokens');
    }
  }
);

// Async thunk for fetching Facebook OAuth profile
export const fetchFacebookOAuthProfile = createAsyncThunk(
  'facebook/fetchOAuthProfile',
  async (code, { rejectWithValue }) => {
    try {
      // Import the function from the utility
      const { fetchFacebookOAuthProfile: fetchProfile } = await import('../../utils/facebook-oauth-handler');
      return await fetchProfile(code);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch Facebook OAuth profile');
    }
  }
);

// Async thunk for fetching Facebook account data
export const fetchMetaAccountData = createAsyncThunk(
  'facebook/fetchAccountData',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaAccountData(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch Facebook account data');
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
    expires_in: null,
    expires_at: null
  }
};

// Facebook slice
const facebookSlice = createSlice({
  name: 'facebook',
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
    
    // Reset state
    resetFacebookState: () => initialState,
  },
  extraReducers: (builder) => {
    // Connect Facebook account
    builder
      .addCase(connectMetaAccount.pending, (state) => {
        state.connecting = true;
        state.connectionError = null;
        state.connectionSuccess = false;
      })
      .addCase(connectMetaAccount.fulfilled, (state, action) => {
        state.connecting = false;
        state.connectionSuccess = true;
        state.connectionData = action.payload;
        state.connectedAccounts.push(action.payload);
        state.currentAccount = action.payload;
        
        // Set tokens if available
        if (action.payload.token_data) {
          state.tokens = {
            access_token: action.payload.token_data.access_token,
            expires_in: action.payload.token_data.expires_in,
            expires_at: new Date(Date.now() + action.payload.token_data.expires_in * 1000).toISOString()
          };
        }
      })
      .addCase(connectMetaAccount.rejected, (state, action) => {
        state.connecting = false;
        state.connectionError = action.payload;
        state.connectionSuccess = false;
      });

    // Disconnect Facebook account
    builder
      .addCase(disconnectMetaAccount.pending, (state) => {
        state.disconnecting = true;
        state.disconnectError = null;
        state.disconnectSuccess = false;
      })
      .addCase(disconnectMetaAccount.fulfilled, (state, action) => {
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
      .addCase(disconnectMetaAccount.rejected, (state, action) => {
        state.disconnecting = false;
        state.disconnectError = action.payload;
        state.disconnectSuccess = false;
      });

    // Disconnect and delete Facebook account
    builder
      .addCase(disconnectAndDeleteMetaAccount.pending, (state) => {
        state.disconnecting = true;
        state.disconnectError = null;
        state.disconnectSuccess = false;
      })
      .addCase(disconnectAndDeleteMetaAccount.fulfilled, (state, action) => {
        state.disconnecting = false;
        state.disconnectSuccess = true;
        // Remove the disconnected and deleted account
        state.connectedAccounts = state.connectedAccounts.filter(
          account => account.id !== action.payload.account_id
        );
        if (state.currentAccount?.id === action.payload.account_id) {
          state.currentAccount = null;
        }
      })
      .addCase(disconnectAndDeleteMetaAccount.rejected, (state, action) => {
        state.disconnecting = false;
        state.disconnectError = action.payload;
        state.disconnectSuccess = false;
      });

    // Refresh Facebook tokens
    builder
      .addCase(refreshMetaTokens.pending, (state) => {
        state.refreshing = true;
        state.refreshError = null;
        state.refreshSuccess = false;
      })
      .addCase(refreshMetaTokens.fulfilled, (state, action) => {
        state.refreshing = false;
        state.refreshSuccess = true;
        
        // Update tokens
        if (action.payload.token_data) {
          state.tokens = {
            access_token: action.payload.token_data.access_token,
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
      .addCase(refreshMetaTokens.rejected, (state, action) => {
        state.refreshing = false;
        state.refreshError = action.payload;
        state.refreshSuccess = false;
      });

    // Fetch Facebook account data
    builder
      .addCase(fetchMetaAccountData.pending, (state) => {
        state.fetching = true;
        state.fetchError = null;
      })
      .addCase(fetchMetaAccountData.fulfilled, (state, action) => {
        state.fetching = false;
        state.currentAccount = action.payload;
      })
      .addCase(fetchMetaAccountData.rejected, (state, action) => {
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
  resetFacebookState,
} = facebookSlice.actions;

// Export selectors
export const selectFacebookState = (state) => state.facebook;
export const selectFacebookConnecting = (state) => state.facebook.connecting;
export const selectFacebookDisconnecting = (state) => state.facebook.disconnecting;
export const selectFacebookRefreshing = (state) => state.facebook.refreshing;
export const selectFacebookFetching = (state) => state.facebook.fetching;
export const selectFacebookConnectionData = (state) => state.facebook.connectionData;
export const selectFacebookConnectedAccounts = (state) => state.facebook.connectedAccounts;
export const selectFacebookCurrentAccount = (state) => state.facebook.currentAccount;
export const selectFacebookConnectionError = (state) => state.facebook.connectionError;
export const selectFacebookDisconnectError = (state) => state.facebook.disconnectError;
export const selectFacebookRefreshError = (state) => state.facebook.refreshError;
export const selectFacebookFetchError = (state) => state.facebook.fetchError;
export const selectFacebookConnectionSuccess = (state) => state.facebook.connectionSuccess;
export const selectFacebookDisconnectSuccess = (state) => state.facebook.disconnectSuccess;
export const selectFacebookRefreshSuccess = (state) => state.facebook.refreshSuccess;
export const selectFacebookTokens = (state) => state.facebook.tokens;
export const selectFacebookOAuthState = (state) => state.facebook.oauthState;
export const selectFacebookOAuthCode = (state) => state.facebook.oauthCode;

// Helper selectors
export const selectFacebookIsConnected = (state) => state.facebook.connectedAccounts.length > 0;
export const selectFacebookHasValidToken = (state) => {
  const tokens = state.facebook.tokens;
  if (!tokens.expires_at) return false;
  return new Date(tokens.expires_at) > new Date();
};

export default facebookSlice.reducer; 