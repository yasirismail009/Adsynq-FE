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

// Async thunk for fetching Google customers
export const fetchGoogleCustomers = createAsyncThunk(
  'google/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.googleCustomers();
      return response.data;
    } catch (error) {
      console.error('Error fetching Google customers:', error);

      // Extract error message from response data
      let errorMessage = 'Failed to fetch Google customers';
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

// Async thunk for fetching Google overall stats
export const fetchGoogleOverallStats = createAsyncThunk(
  'google/fetchOverallStats',
  async (params = { date_from: '2023-01-01', date_to: '2025-12-31' }, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.googleOverallStats(params);
      // Return the real API response data
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

// Async thunk for fetching SA360 reports
export const fetchGoogleSa360Reports = createAsyncThunk(
  'google/fetchSa360Reports',
  async ({ googleAccountId, customerId, params = {} }, { rejectWithValue }) => {
    try {
      console.log('Fetching SA360 reports with params:', { googleAccountId, customerId, params });
      const response = await apiService.marketing.googleSa360Reports(googleAccountId, customerId, params);
      console.log('SA360 reports response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching SA360 reports:', error);
      
      // Extract error message from response data
      let errorMessage = 'Failed to fetch SA360 reports';
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

// Async thunk for fetching SA360 campaign report
export const fetchGoogleSa360CampaignReport = createAsyncThunk(
  'google/fetchSa360CampaignReport',
  async ({ googleAccountId, customerId, campaignId, params = {} }, { rejectWithValue }) => {
    try {
      console.log('Fetching SA360 campaign report with params:', { googleAccountId, customerId, campaignId, params });
      const response = await apiService.marketing.googleSa360CampaignReport(googleAccountId, customerId, campaignId, params);
      console.log('SA360 campaign report response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching SA360 campaign report:', error);
      
      // Extract error message from response data
      let errorMessage = 'Failed to fetch SA360 campaign report';
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

// Async thunk for fetching SA360 keyword view
export const fetchGoogleSa360KeywordView = createAsyncThunk(
  'google/fetchSa360KeywordView',
  async ({ googleAccountId, customerId, campaignId, params = {} }, { rejectWithValue }) => {
    try {
      console.log('Fetching SA360 keyword view with params:', { googleAccountId, customerId, campaignId, params });
      const response = await apiService.marketing.googleSa360KeywordView(googleAccountId, customerId, campaignId, params);
      console.log('SA360 keyword view response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching SA360 keyword view:', error);
      
      let errorMessage = 'Failed to fetch SA360 keyword view';
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

// Async thunk for fetching SA360 demographic data
export const fetchGoogleSa360DemographicData = createAsyncThunk(
  'google/fetchSa360DemographicData',
  async ({ googleAccountId, customerId, campaignId, params = {} }, { rejectWithValue }) => {
    try {
      console.log('Fetching SA360 demographic data with params:', { googleAccountId, customerId, campaignId, params });
      const response = await apiService.marketing.googleSa360DemographicData(googleAccountId, customerId, campaignId, params);
      console.log('SA360 demographic data response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching SA360 demographic data:', error);
      
      let errorMessage = 'Failed to fetch SA360 demographic data';
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

// Async thunk for fetching SA360 device targeting
export const fetchGoogleSa360DeviceTargeting = createAsyncThunk(
  'google/fetchSa360DeviceTargeting',
  async ({ googleAccountId, customerId, campaignId, params = {} }, { rejectWithValue }) => {
    try {
      console.log('Fetching SA360 device targeting with params:', { googleAccountId, customerId, campaignId, params });
      const response = await apiService.marketing.googleSa360DeviceTargeting(googleAccountId, customerId, campaignId, params);
      console.log('SA360 device targeting response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching SA360 device targeting:', error);
      
      let errorMessage = 'Failed to fetch SA360 device targeting';
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

// Async thunk for fetching SA360 audience targeting
export const fetchGoogleSa360AudienceTargeting = createAsyncThunk(
  'google/fetchSa360AudienceTargeting',
  async ({ googleAccountId, customerId, campaignId, params = {} }, { rejectWithValue }) => {
    try {
      console.log('Fetching SA360 audience targeting with params:', { googleAccountId, customerId, campaignId, params });
      const response = await apiService.marketing.googleSa360AudienceTargeting(googleAccountId, customerId, campaignId, params);
      console.log('SA360 audience targeting response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching SA360 audience targeting:', error);
      
      let errorMessage = 'Failed to fetch SA360 audience targeting';
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

// Async thunk for fetching SA360 assets
export const fetchGoogleSa360Assets = createAsyncThunk(
  'google/fetchSa360Assets',
  async ({ googleAccountId, customerId, campaignId, params = {} }, { rejectWithValue }) => {
    try {
      console.log('Fetching SA360 assets with params:', { googleAccountId, customerId, campaignId, params });
      const response = await apiService.marketing.googleSa360Assets(googleAccountId, customerId, campaignId, params);
      console.log('SA360 assets response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching SA360 assets:', error);
      
      let errorMessage = 'Failed to fetch SA360 assets';
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

// Async thunk for fetching SA360 campaign assets (without specific campaign)
export const fetchGoogleSa360CampaignAssets = createAsyncThunk(
  'google/fetchSa360CampaignAssets',
  async ({ googleAccountId, customerId, params = {} }, { rejectWithValue }) => {
    try {
      console.log('Fetching SA360 campaign assets with params:', { googleAccountId, customerId, params });
      const response = await apiService.marketing.googleSa360CampaignAssets(googleAccountId, customerId, params);
      console.log('SA360 campaign assets response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching SA360 campaign assets:', error);
      
      let errorMessage = 'Failed to fetch SA360 campaign assets';
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
  customers: null,
  
  // Overall stats data
  overallStats: null,
  overallStatsLoading: false,
  overallStatsError: null,
  
  // SA360 reports data
  sa360Reports: null,
  sa360ReportsLoading: false,
  sa360ReportsError: null,
  
  // Currently selected SA360 campaign (from GoogleAccountDetail table)
  selectedSa360Campaign: null,
  
  // SA360 campaign report data
  sa360CampaignReport: null,
  sa360CampaignReportLoading: false,
  sa360CampaignReportError: null,
  
  // SA360 keyword view data
  sa360KeywordView: null,
  sa360KeywordViewLoading: false,
  sa360KeywordViewError: null,
  
  // SA360 demographic data
  sa360DemographicData: null,
  sa360DemographicDataLoading: false,
  sa360DemographicDataError: null,
  
  // SA360 device targeting data
  sa360DeviceTargeting: null,
  sa360DeviceTargetingLoading: false,
  sa360DeviceTargetingError: null,
  
  // SA360 audience targeting data
  sa360AudienceTargeting: null,
  sa360AudienceTargetingLoading: false,
  sa360AudienceTargetingError: null,
  
  // SA360 assets data
  sa360Assets: null,
  sa360AssetsLoading: false,
  sa360AssetsError: null,
  
  // SA360 campaign assets data (without specific campaign)
  sa360CampaignAssets: null,
  sa360CampaignAssetsLoading: false,
  sa360CampaignAssetsError: null,
  
  // Error states
  connectionError: null,
  disconnectError: null,
  refreshError: null,
  fetchError: null,
  customersError: null,
  
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
    
    // Store the last clicked SA360 campaign so detail view can use it
    setSelectedSa360Campaign: (state, action) => {
      state.selectedSa360Campaign = action.payload;
    },
    
    // Clear selected SA360 campaign
    clearSelectedSa360Campaign: (state) => {
      state.selectedSa360Campaign = null;
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

    // Fetch Google customers
    builder
      .addCase(fetchGoogleCustomers.pending, (state) => {
        state.fetching = true;
        state.customersError = null;
      })
      .addCase(fetchGoogleCustomers.fulfilled, (state, action) => {
        state.fetching = false;
        state.customers = action.payload;
      })
      .addCase(fetchGoogleCustomers.rejected, (state, action) => {
        state.fetching = false;
        state.customersError = action.payload;
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

    // Fetch SA360 reports
    builder
      .addCase(fetchGoogleSa360Reports.pending, (state) => {
        state.sa360ReportsLoading = true;
        state.sa360ReportsError = null;
      })
      .addCase(fetchGoogleSa360Reports.fulfilled, (state, action) => {
        state.sa360ReportsLoading = false;
        state.sa360Reports = action.payload;
      })
      .addCase(fetchGoogleSa360Reports.rejected, (state, action) => {
        state.sa360ReportsLoading = false;
        state.sa360ReportsError = action.payload;
      });

    // Fetch SA360 campaign report
    builder
      .addCase(fetchGoogleSa360CampaignReport.pending, (state) => {
        state.sa360CampaignReportLoading = true;
        state.sa360CampaignReportError = null;
      })
      .addCase(fetchGoogleSa360CampaignReport.fulfilled, (state, action) => {
        state.sa360CampaignReportLoading = false;
        state.sa360CampaignReport = action.payload;
      })
      .addCase(fetchGoogleSa360CampaignReport.rejected, (state, action) => {
        state.sa360CampaignReportLoading = false;
        state.sa360CampaignReportError = action.payload;
      });

    // Fetch SA360 keyword view
    builder
      .addCase(fetchGoogleSa360KeywordView.pending, (state) => {
        state.sa360KeywordViewLoading = true;
        state.sa360KeywordViewError = null;
      })
      .addCase(fetchGoogleSa360KeywordView.fulfilled, (state, action) => {
        state.sa360KeywordViewLoading = false;
        state.sa360KeywordView = action.payload;
      })
      .addCase(fetchGoogleSa360KeywordView.rejected, (state, action) => {
        state.sa360KeywordViewLoading = false;
        state.sa360KeywordViewError = action.payload;
      });

    // Fetch SA360 demographic data
    builder
      .addCase(fetchGoogleSa360DemographicData.pending, (state) => {
        state.sa360DemographicDataLoading = true;
        state.sa360DemographicDataError = null;
      })
      .addCase(fetchGoogleSa360DemographicData.fulfilled, (state, action) => {
        state.sa360DemographicDataLoading = false;
        state.sa360DemographicData = action.payload;
      })
      .addCase(fetchGoogleSa360DemographicData.rejected, (state, action) => {
        state.sa360DemographicDataLoading = false;
        state.sa360DemographicDataError = action.payload;
      });

    // Fetch SA360 device targeting
    builder
      .addCase(fetchGoogleSa360DeviceTargeting.pending, (state) => {
        state.sa360DeviceTargetingLoading = true;
        state.sa360DeviceTargetingError = null;
      })
      .addCase(fetchGoogleSa360DeviceTargeting.fulfilled, (state, action) => {
        state.sa360DeviceTargetingLoading = false;
        state.sa360DeviceTargeting = action.payload;
      })
      .addCase(fetchGoogleSa360DeviceTargeting.rejected, (state, action) => {
        state.sa360DeviceTargetingLoading = false;
        state.sa360DeviceTargetingError = action.payload;
      });

    // Fetch SA360 audience targeting
    builder
      .addCase(fetchGoogleSa360AudienceTargeting.pending, (state) => {
        state.sa360AudienceTargetingLoading = true;
        state.sa360AudienceTargetingError = null;
      })
      .addCase(fetchGoogleSa360AudienceTargeting.fulfilled, (state, action) => {
        state.sa360AudienceTargetingLoading = false;
        state.sa360AudienceTargeting = action.payload;
      })
      .addCase(fetchGoogleSa360AudienceTargeting.rejected, (state, action) => {
        state.sa360AudienceTargetingLoading = false;
        state.sa360AudienceTargetingError = action.payload;
      });

    // Fetch SA360 assets
    builder
      .addCase(fetchGoogleSa360Assets.pending, (state) => {
        state.sa360AssetsLoading = true;
        state.sa360AssetsError = null;
      })
      .addCase(fetchGoogleSa360Assets.fulfilled, (state, action) => {
        state.sa360AssetsLoading = false;
        state.sa360Assets = action.payload;
      })
      .addCase(fetchGoogleSa360Assets.rejected, (state, action) => {
        state.sa360AssetsLoading = false;
        state.sa360AssetsError = action.payload;
      });

    // Fetch SA360 campaign assets (without specific campaign)
    builder
      .addCase(fetchGoogleSa360CampaignAssets.pending, (state) => {
        state.sa360CampaignAssetsLoading = true;
        state.sa360CampaignAssetsError = null;
      })
      .addCase(fetchGoogleSa360CampaignAssets.fulfilled, (state, action) => {
        state.sa360CampaignAssetsLoading = false;
        state.sa360CampaignAssets = action.payload;
      })
      .addCase(fetchGoogleSa360CampaignAssets.rejected, (state, action) => {
        state.sa360CampaignAssetsLoading = false;
        state.sa360CampaignAssetsError = action.payload;
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
  setSelectedSa360Campaign,
  clearSelectedSa360Campaign,
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
export const selectGoogleCustomers = (state) => state.google.customers;

// Overall stats selectors
export const selectGoogleOverallStats = (state) => state.google.overallStats;
export const selectGoogleOverallStatsLoading = (state) => state.google.overallStatsLoading;
export const selectGoogleOverallStatsError = (state) => state.google.overallStatsError;

// SA360 reports selectors
export const selectGoogleSa360Reports = (state) => state.google.sa360Reports;
export const selectGoogleSa360ReportsLoading = (state) => state.google.sa360ReportsLoading;
export const selectGoogleSa360ReportsError = (state) => state.google.sa360ReportsError;

// Selected SA360 campaign selector
export const selectGoogleSelectedSa360Campaign = (state) => state.google.selectedSa360Campaign;

// SA360 campaign report selectors
export const selectGoogleSa360CampaignReport = (state) => state.google.sa360CampaignReport;
export const selectGoogleSa360CampaignReportLoading = (state) => state.google.sa360CampaignReportLoading;
export const selectGoogleSa360CampaignReportError = (state) => state.google.sa360CampaignReportError;

// SA360 keyword view selectors
export const selectGoogleSa360KeywordView = (state) => state.google.sa360KeywordView;
export const selectGoogleSa360KeywordViewLoading = (state) => state.google.sa360KeywordViewLoading;
export const selectGoogleSa360KeywordViewError = (state) => state.google.sa360KeywordViewError;

// SA360 demographic data selectors
export const selectGoogleSa360DemographicData = (state) => state.google.sa360DemographicData;
export const selectGoogleSa360DemographicDataLoading = (state) => state.google.sa360DemographicDataLoading;
export const selectGoogleSa360DemographicDataError = (state) => state.google.sa360DemographicDataError;

// SA360 device targeting selectors
export const selectGoogleSa360DeviceTargeting = (state) => state.google.sa360DeviceTargeting;
export const selectGoogleSa360DeviceTargetingLoading = (state) => state.google.sa360DeviceTargetingLoading;
export const selectGoogleSa360DeviceTargetingError = (state) => state.google.sa360DeviceTargetingError;

// SA360 audience targeting selectors
export const selectGoogleSa360AudienceTargeting = (state) => state.google.sa360AudienceTargeting;
export const selectGoogleSa360AudienceTargetingLoading = (state) => state.google.sa360AudienceTargetingLoading;
export const selectGoogleSa360AudienceTargetingError = (state) => state.google.sa360AudienceTargetingError;

// SA360 assets selectors
export const selectGoogleSa360Assets = (state) => state.google.sa360Assets;
export const selectGoogleSa360AssetsLoading = (state) => state.google.sa360AssetsLoading;
export const selectGoogleSa360AssetsError = (state) => state.google.sa360AssetsError;

// SA360 campaign assets selectors (without specific campaign)
export const selectGoogleSa360CampaignAssets = (state) => state.google.sa360CampaignAssets;
export const selectGoogleSa360CampaignAssetsLoading = (state) => state.google.sa360CampaignAssetsLoading;
export const selectGoogleSa360CampaignAssetsError = (state) => state.google.sa360CampaignAssetsError;

// Helper selectors
export const selectGoogleIsConnected = (state) => state.google.connectedAccounts.length > 0;
export const selectGoogleHasValidToken = (state) => {
  const tokens = state.google.tokens;
  if (!tokens.expires_at) return false;
  return new Date(tokens.expires_at) > new Date();
};

export default googleSlice.reducer; 