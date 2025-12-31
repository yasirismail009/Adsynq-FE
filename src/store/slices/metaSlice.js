import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunk for fetching Meta overall stats
export const fetchMetaOverallStats = createAsyncThunk(
  'meta/fetchOverallStats',
  async (params = { date_from: '2023-01-01', date_to: '2025-12-31' }, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaOverallStats(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching Meta overall stats:', error);
      
      // Extract error message from response data
      let errorMessage = 'Failed to fetch Meta stats';
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

// Async thunk for fetching Meta user ad accounts
export const fetchMetaUserAdAccounts = createAsyncThunk(
  'meta/fetchUserAdAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaUserAdAccounts();
      return response.data;
    } catch (error) {
      console.error('Error fetching Meta user ad accounts:', error);

      // Extract error message from response data
      let errorMessage = 'Failed to fetch Meta user ad accounts';
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

// Async thunk for fetching Meta ad accounts
export const fetchMetaAdAccounts = createAsyncThunk(
  'meta/fetchAdAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaAdAccounts();
      return response.data;
    } catch (error) {
      console.error('Error fetching Meta ad accounts:', error);

      // Extract error message from response data
      let errorMessage = 'Failed to fetch Meta ad accounts';
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

// Async thunk for fetching Meta account overview graph
export const fetchMetaAccountOverviewGraph = createAsyncThunk(
  'meta/fetchAccountOverviewGraph',
  async ({ accountId, dateRange }, { rejectWithValue }) => {
    try {
      console.log('Async thunk - Fetching data for accountId:', accountId);
      console.log('Async thunk - Date range:', dateRange);
      
      const response = await apiService.marketing.metaAccountOverviewGraph(accountId, dateRange);
      
      console.log('Async thunk - Response received:', response.data);
      
      return { accountId, data: response.data };
    } catch (error) {
      
      console.error('Error fetching Meta account overview graph:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      
      // Extract error message from response data
      let errorMessage = 'Failed to fetch Meta account overview graph';
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

// Async thunk for fetching Meta campaign details
export const fetchMetaCampaignDetails = createAsyncThunk(
  'meta/fetchCampaignDetails',
  async ({ campaignId, dateRange = { date_from: '2023-01-01', date_to: new Date().toISOString().split('T')[0] } }, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaCampaignDetails(campaignId, dateRange);
      return { campaignId, data: response.data };
    } catch (error) {
      console.error('Error fetching Meta campaign details:', error);
      
      let errorMessage = 'Failed to fetch campaign details';
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

// Async thunk for fetching Meta campaign performance
export const fetchMetaCampaignPerformance = createAsyncThunk(
  'meta/fetchCampaignPerformance',
  async ({ campaignId, dateRange = { date_from: '2023-01-01', date_to: new Date().toISOString().split('T')[0] } }, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaCampaignPerformance(campaignId, dateRange);
      return { campaignId, data: response.data };
    } catch (error) {
      console.error('Error fetching Meta campaign performance:', error);
      
      let errorMessage = 'Failed to fetch campaign performance';
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

// Combined async thunk for fetching both campaign details and performance
export const fetchMetaCampaignData = createAsyncThunk(
  'meta/fetchCampaignData',
  async ({ campaignId, dateRange = { date_from: '2023-01-01', date_to: new Date().toISOString().split('T')[0] } }, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaCampaignData(campaignId, dateRange);
      return { campaignId, data: response.data };
    } catch (error) {
      console.error('Error fetching Meta campaign data:', error);
      
      let errorMessage = 'Failed to fetch campaign data';
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

// Campaign Insights Breakdowns
export const fetchMetaCampaignInsightsBreakdowns = createAsyncThunk(
  'meta/fetchCampaignInsightsBreakdowns',
  async ({ campaignId, dateRange = { date_from: '2023-01-01', date_to: new Date().toISOString().split('T')[0] } }, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaCampaignInsightsBreakdowns(campaignId, dateRange);
      return response.data;
    } catch (error) {
      console.error('Error fetching Meta campaign insights breakdowns:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaign insights breakdowns');
    }
  }
);

// Campaign Insights Hourly
export const fetchMetaCampaignInsightsHourly = createAsyncThunk(
  'meta/fetchCampaignInsightsHourly',
  async ({ campaignId, dateRange = { date_from: '2023-01-01', date_to: new Date().toISOString().split('T')[0] } }, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaCampaignInsightsHourly(campaignId, dateRange);
      return response.data;
    } catch (error) {
      console.error('Error fetching Meta campaign insights hourly:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaign insights hourly');
    }
  }
);

// Campaign Insights Region
export const fetchMetaCampaignInsightsRegion = createAsyncThunk(
  'meta/fetchCampaignInsightsRegion',
  async ({ campaignId, dateRange = { date_from: '2023-01-01', date_to: new Date().toISOString().split('T')[0] } }, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaCampaignInsightsRegion(campaignId, dateRange);
      return response.data;
    } catch (error) {
      console.error('Error fetching Meta campaign insights region:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaign insights region');
    }
  }
);

// Campaign Insights Device
export const fetchMetaCampaignInsightsDevice = createAsyncThunk(
  'meta/fetchCampaignInsightsDevice',
  async ({ campaignId, dateRange = { date_from: '2023-01-01', date_to: new Date().toISOString().split('T')[0] } }, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.metaCampaignInsightsDevice(campaignId, dateRange);
      return response.data;
    } catch (error) {
      console.error('Error fetching Meta campaign insights device:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaign insights device');
    }
  }
);

// Campaign Insights Publisher Platform
export const fetchMetaCampaignInsightsPublisherPlatform = createAsyncThunk(
  'meta/fetchCampaignInsightsPublisherPlatform',
  async ({ campaignId, dateRange = { date_from: '2023-01-01', date_to: new Date().toISOString().split('T')[0] } }, { rejectWithValue }) => {
    try {
      console.log('Publisher Platform API call - campaignId:', campaignId, 'dateRange:', dateRange);
      const response = await apiService.marketing.metaCampaignInsightsPublisherPlatform(campaignId, dateRange);
      console.log('Publisher Platform API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching Meta campaign insights publisher platform:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaign insights publisher platform');
    }
  }
);

const initialState = {
  overallStats: null,
  userAdAccounts: null,
  adAccounts: null,
  accountOverviewGraph: {}, // Store graph data by accountId
  campaignDetails: null,
  campaignPerformance: null,
  campaignData: null, // Single campaign data object

  // Campaign Insights Data
  campaignInsightsBreakdowns: null,
  campaignInsightsHourly: null,
  campaignInsightsRegion: null,
  campaignInsightsDevice: null,
  campaignInsightsPublisherPlatform: null,
  
  // Loading states
  loading: {
    overallStats: false,
    userAdAccounts: false,
    adAccounts: false,
    accountOverviewGraph: {}, // Track loading state per accountId
    campaignDetails: false,
    campaignPerformance: false,
    campaignData: false, // Single loading state
    campaignInsightsBreakdowns: false,
    campaignInsightsHourly: false,
    campaignInsightsRegion: false,
    campaignInsightsDevice: false,
    campaignInsightsPublisherPlatform: false
  },
  
  // Error states
  errors: {
    overallStats: null,
    userAdAccounts: null,
    adAccounts: null,
    accountOverviewGraph: {}, // Track errors per accountId
    campaignDetails: null,
    campaignPerformance: null,
    campaignData: null, // Single error state
    campaignInsightsBreakdowns: null,
    campaignInsightsHourly: null,
    campaignInsightsRegion: null,
    campaignInsightsDevice: null,
    campaignInsightsPublisherPlatform: null
  }
};

// Helper function to ensure proper state structure
const ensureProperStateStructure = (state) => {
  // Ensure accountOverviewGraph exists
  if (!state.accountOverviewGraph) {
    state.accountOverviewGraph = {};
  }
  
  // Ensure loading.accountOverviewGraph exists
  if (!state.loading.accountOverviewGraph) {
    state.loading.accountOverviewGraph = {};
  } else if (typeof state.loading.accountOverviewGraph === 'boolean') {
    state.loading.accountOverviewGraph = {};
  }
  
  // Ensure errors.accountOverviewGraph exists
  if (!state.errors.accountOverviewGraph) {
    state.errors.accountOverviewGraph = {};
  } else if (typeof state.errors.accountOverviewGraph === 'string' || state.errors.accountOverviewGraph === null) {
    state.errors.accountOverviewGraph = {};
  }
  
  // Ensure campaign-related state exists
  if (!state.campaignDetails) {
    state.campaignDetails = {};
  }
  if (!state.campaignPerformance) {
    state.campaignPerformance = {};
  }
  if (!state.campaignData) {
    state.campaignData = {};
  }
  if (!state.loading.campaignDetails) {
    state.loading.campaignDetails = {};
  }
  if (!state.loading.campaignPerformance) {
    state.loading.campaignPerformance = {};
  }
  if (!state.loading.campaignData) {
    state.loading.campaignData = {};
  }
  if (!state.errors.campaignDetails) {
    state.errors.campaignDetails = {};
  }
  if (!state.errors.campaignPerformance) {
    state.errors.campaignPerformance = {};
  }
  if (!state.errors.campaignData) {
    state.errors.campaignData = {};
  }
  
  return state;
};

// Helper function to ensure proper state structure for campaign data
const ensureCampaignStateStructure = (state) => {
  // Ensure campaign-related state exists as single objects
  if (state.campaignDetails === undefined) {
    state.campaignDetails = null;
  }
  if (state.campaignPerformance === undefined) {
    state.campaignPerformance = null;
  }
  if (state.campaignData === undefined) {
    state.campaignData = null;
  }
  
  // Ensure loading states exist as booleans
  if (state.loading.campaignDetails === undefined) {
    state.loading.campaignDetails = false;
  }
  if (state.loading.campaignPerformance === undefined) {
    state.loading.campaignPerformance = false;
  }
  if (state.loading.campaignData === undefined) {
    state.loading.campaignData = false;
  }
  
  // Ensure error states exist as null
  if (state.errors.campaignDetails === undefined) {
    state.errors.campaignDetails = null;
  }
  if (state.errors.campaignPerformance === undefined) {
    state.errors.campaignPerformance = null;
  }
  if (state.errors.campaignData === undefined) {
    state.errors.campaignData = null;
  }
};

const metaSlice = createSlice({
  name: 'meta',
  initialState,
  reducers: {
    clearMetaData: (state) => {
      state.overallStats = null;
      state.userAdAccounts = null;
      state.accountOverviewGraph = {};
      state.campaignDetails = null;
      state.campaignPerformance = null;
      state.campaignData = null;
      state.errors.overallStats = null;
      state.errors.userAdAccounts = null;
      state.errors.accountOverviewGraph = {};
      state.errors.campaignDetails = null;
      state.errors.campaignPerformance = null;
      state.errors.campaignData = null;
      state.loading.accountOverviewGraph = {};
      state.loading.campaignDetails = false;
      state.loading.campaignPerformance = false;
      state.loading.campaignData = false;
    },
    // Clear insights data when date range changes
    clearInsightsData: (state) => {
      state.campaignInsightsBreakdowns = null;
      state.campaignInsightsHourly = null;
      state.campaignInsightsRegion = null;
      state.campaignInsightsDevice = null;
      state.campaignInsightsPublisherPlatform = null;
      
      // Clear loading states
      state.loading.campaignInsightsBreakdowns = false;
      state.loading.campaignInsightsHourly = false;
      state.loading.campaignInsightsRegion = false;
      state.loading.campaignInsightsDevice = false;
      state.loading.campaignInsightsPublisherPlatform = false;
      
      // Clear error states
      state.errors.campaignInsightsBreakdowns = null;
      state.errors.campaignInsightsHourly = null;
      state.errors.campaignInsightsRegion = null;
      state.errors.campaignInsightsDevice = null;
      state.errors.campaignInsightsPublisherPlatform = null;
    },
    
    // Clear campaign data
    clearCampaignData: (state) => {
      state.campaignData = null;
      state.loading.campaignData = false;
      state.errors.campaignData = null;
    },
    clearMetaErrors: (state) => {
      state.errors.overallStats = null;
      state.errors.userAdAccounts = null;
      state.errors.accountOverviewGraph = {};
      state.errors.campaignDetails = null;
      state.errors.campaignPerformance = null;
    },
    clearAccountOverviewGraph: (state, action) => {
      const accountId = action.payload;
      if (accountId) {
        delete state.accountOverviewGraph[accountId];
        delete state.loading.accountOverviewGraph[accountId];
        delete state.errors.accountOverviewGraph[accountId];
      } else {
        state.accountOverviewGraph = {};
        state.loading.accountOverviewGraph = {};
        state.errors.accountOverviewGraph = {};
      }
    },
    resetMetaState: (state) => {
      // Reset to initial state structure
      state.overallStats = null;
      state.userAdAccounts = null;
      state.accountOverviewGraph = {};
      state.campaignDetails = null;
      state.campaignPerformance = null;
      state.campaignData = null;
      state.loading.overallStats = false;
      state.loading.userAdAccounts = false;
      state.loading.accountOverviewGraph = {};
      state.loading.campaignDetails = false;
      state.loading.campaignPerformance = false;
      state.loading.campaignData = false;
      state.errors.overallStats = null;
      state.errors.userAdAccounts = null;
      state.errors.accountOverviewGraph = {};
      state.errors.campaignDetails = null;
      state.errors.campaignPerformance = null;
      state.errors.campaignData = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Meta overall stats
    builder
      .addCase(fetchMetaOverallStats.pending, (state) => {
        state.loading.overallStats = true;
        state.errors.overallStats = null;
      })
      .addCase(fetchMetaOverallStats.fulfilled, (state, action) => {
        state.loading.overallStats = false;
        state.overallStats = action.payload;
        state.errors.overallStats = null;
      })
      .addCase(fetchMetaOverallStats.rejected, (state, action) => {
        state.loading.overallStats = false;
        state.errors.overallStats = action.payload;
      });

    // Fetch Meta user ad accounts
    builder
      .addCase(fetchMetaUserAdAccounts.pending, (state) => {
        state.loading.userAdAccounts = true;
        state.errors.userAdAccounts = null;
      })
      .addCase(fetchMetaUserAdAccounts.fulfilled, (state, action) => {
        state.loading.userAdAccounts = false;
        state.userAdAccounts = action.payload;
        state.errors.userAdAccounts = null;
      })
      .addCase(fetchMetaUserAdAccounts.rejected, (state, action) => {
        state.loading.userAdAccounts = false;
        state.errors.userAdAccounts = action.payload;
      });

    // Fetch Meta ad accounts
    builder
      .addCase(fetchMetaAdAccounts.pending, (state) => {
        state.loading.adAccounts = true;
        state.errors.adAccounts = null;
      })
      .addCase(fetchMetaAdAccounts.fulfilled, (state, action) => {
        state.loading.adAccounts = false;
        state.adAccounts = action.payload;
        state.errors.adAccounts = null;
      })
      .addCase(fetchMetaAdAccounts.rejected, (state, action) => {
        state.loading.adAccounts = false;
        state.errors.adAccounts = action.payload;
      });

    // Fetch Meta account overview graph
    builder
      .addCase(fetchMetaAccountOverviewGraph.pending, (state, action) => {
        ensureProperStateStructure(state);
        const accountId = action.meta.arg.accountId;
        state.loading.accountOverviewGraph[accountId] = true;
        state.errors.accountOverviewGraph[accountId] = null;
      })
      .addCase(fetchMetaAccountOverviewGraph.fulfilled, (state, action) => {
        ensureProperStateStructure(state);
        const { accountId, data } = action.payload;
        
        console.log('Redux - Storing data for accountId:', accountId);
        console.log('Redux - Data being stored:', data);
        
        state.loading.accountOverviewGraph[accountId] = false;
        // Store the data for this specific account
        state.accountOverviewGraph[accountId] = data;
        state.errors.accountOverviewGraph[accountId] = null;
        
        console.log('Redux - Final state for accountId:', state.accountOverviewGraph[accountId]);
        console.log('Redux - All accountOverviewGraph keys:', Object.keys(state.accountOverviewGraph));
      })
      .addCase(fetchMetaAccountOverviewGraph.rejected, (state, action) => {
        ensureProperStateStructure(state);
        const accountId = action.meta.arg.accountId;
        state.loading.accountOverviewGraph[accountId] = false;
        state.errors.accountOverviewGraph[accountId] = action.payload;
      });

    // Fetch Meta campaign details
    builder
      .addCase(fetchMetaCampaignDetails.pending, (state) => {
        ensureCampaignStateStructure(state);
        state.loading.campaignDetails = true;
        state.errors.campaignDetails = null;
      })
      .addCase(fetchMetaCampaignDetails.fulfilled, (state, action) => {
        const { data } = action.payload;
        ensureCampaignStateStructure(state);
        state.loading.campaignDetails = false;
        state.campaignDetails = data;
        state.errors.campaignDetails = null;
      })
      .addCase(fetchMetaCampaignDetails.rejected, (state, action) => {
        ensureCampaignStateStructure(state);
        state.loading.campaignDetails = false;
        state.errors.campaignDetails = action.payload;
      });

    // Fetch Meta campaign performance
    builder
      .addCase(fetchMetaCampaignPerformance.pending, (state) => {
        ensureCampaignStateStructure(state);
        state.loading.campaignPerformance = true;
        state.errors.campaignPerformance = null;
      })
      .addCase(fetchMetaCampaignPerformance.fulfilled, (state, action) => {
        const { data } = action.payload;
        ensureCampaignStateStructure(state);
        state.loading.campaignPerformance = false;
        state.campaignPerformance = data;
        state.errors.campaignPerformance = null;
      })
      .addCase(fetchMetaCampaignPerformance.rejected, (state, action) => {
        ensureCampaignStateStructure(state);
        state.loading.campaignPerformance = false;
        state.errors.campaignPerformance = action.payload;
      });

    // Combined campaign data fetch
    builder
      .addCase(fetchMetaCampaignData.pending, (state) => {
        ensureCampaignStateStructure(state);
        state.loading.campaignData = true;
        state.errors.campaignData = null;
      })
      .addCase(fetchMetaCampaignData.fulfilled, (state, action) => {
        const { data } = action.payload;
        ensureCampaignStateStructure(state);
        state.loading.campaignData = false;
        state.campaignData = data;
        state.errors.campaignData = null;
      })
      .addCase(fetchMetaCampaignData.rejected, (state, action) => {
        ensureCampaignStateStructure(state);
        state.loading.campaignData = false;
        state.errors.campaignData = action.payload;
      });

    // Campaign Insights Breakdowns
    builder
      .addCase(fetchMetaCampaignInsightsBreakdowns.pending, (state) => {
        state.loading.campaignInsightsBreakdowns = true;
        state.errors.campaignInsightsBreakdowns = null;
      })
      .addCase(fetchMetaCampaignInsightsBreakdowns.fulfilled, (state, action) => {
        state.loading.campaignInsightsBreakdowns = false;
        state.campaignInsightsBreakdowns = action.payload;
        state.errors.campaignInsightsBreakdowns = null;
      })
      .addCase(fetchMetaCampaignInsightsBreakdowns.rejected, (state, action) => {
        state.loading.campaignInsightsBreakdowns = false;
        state.errors.campaignInsightsBreakdowns = action.payload;
      });

    // Campaign Insights Hourly
    builder
      .addCase(fetchMetaCampaignInsightsHourly.pending, (state) => {
        state.loading.campaignInsightsHourly = true;
        state.errors.campaignInsightsHourly = null;
      })
      .addCase(fetchMetaCampaignInsightsHourly.fulfilled, (state, action) => {
        state.loading.campaignInsightsHourly = false;
        state.campaignInsightsHourly = action.payload;
        state.errors.campaignInsightsHourly = null;
      })
      .addCase(fetchMetaCampaignInsightsHourly.rejected, (state, action) => {
        state.loading.campaignInsightsHourly = false;
        state.errors.campaignInsightsHourly = action.payload;
      });

    // Campaign Insights Region
    builder
      .addCase(fetchMetaCampaignInsightsRegion.pending, (state) => {
        state.loading.campaignInsightsRegion = true;
        state.errors.campaignInsightsRegion = null;
      })
      .addCase(fetchMetaCampaignInsightsRegion.fulfilled, (state, action) => {
        state.loading.campaignInsightsRegion = false;
        state.campaignInsightsRegion = action.payload;
        state.errors.campaignInsightsRegion = null;
      })
      .addCase(fetchMetaCampaignInsightsRegion.rejected, (state, action) => {
        state.loading.campaignInsightsRegion = false;
        state.errors.campaignInsightsRegion = action.payload;
      });

    // Campaign Insights Device
    builder
      .addCase(fetchMetaCampaignInsightsDevice.pending, (state) => {
        state.loading.campaignInsightsDevice = true;
        state.errors.campaignInsightsDevice = null;
      })
      .addCase(fetchMetaCampaignInsightsDevice.fulfilled, (state, action) => {
        state.loading.campaignInsightsDevice = false;
        state.campaignInsightsDevice = action.payload;
        state.errors.campaignInsightsDevice = null;
      })
      .addCase(fetchMetaCampaignInsightsDevice.rejected, (state, action) => {
        state.loading.campaignInsightsDevice = false;
        state.errors.campaignInsightsDevice = action.payload;
      });

    // Campaign Insights Publisher Platform
    builder
      .addCase(fetchMetaCampaignInsightsPublisherPlatform.pending, (state) => {
        state.loading.campaignInsightsPublisherPlatform = true;
        state.errors.campaignInsightsPublisherPlatform = null;
      })
      .addCase(fetchMetaCampaignInsightsPublisherPlatform.fulfilled, (state, action) => {
        state.loading.campaignInsightsPublisherPlatform = false;
        state.campaignInsightsPublisherPlatform = action.payload;
        state.errors.campaignInsightsPublisherPlatform = null;
      })
      .addCase(fetchMetaCampaignInsightsPublisherPlatform.rejected, (state, action) => {
        state.loading.campaignInsightsPublisherPlatform = false;
        state.errors.campaignInsightsPublisherPlatform = action.payload;
      });
  }
});

// Selectors
export const selectMetaOverallStats = (state) => state.meta.overallStats;
export const selectMetaUserAdAccounts = (state) => state.meta.userAdAccounts;
export const selectMetaAdAccounts = (state) => state.meta.adAccounts;
export const selectMetaAdAccountsLoading = (state) => state.meta.loading.adAccounts;
export const selectMetaAdAccountsError = (state) => state.meta.errors.adAccounts;
export const selectMetaLoading = (state) => state.meta.loading;
export const selectMetaErrors = (state) => state.meta.errors;

// Account overview graph selectors
export const selectMetaAccountOverviewGraph = (state, accountId) => {
  // Ensure state structure exists
  if (!state?.meta) {
    console.warn('Meta state not found');
    return null;
  }
  
  // Ensure accountOverviewGraph exists
  if (!state.meta.accountOverviewGraph) {
    console.warn('accountOverviewGraph not found in meta state');
    return null;
  }
  
  // Return data for specific accountId
  const data = state.meta.accountOverviewGraph[accountId];
  console.log(`Selector - accountId: ${accountId}, data:`, data);
  return data || null;
};

export const selectMetaAccountOverviewGraphLoading = (state, accountId) => {
  // Ensure state structure exists
  if (!state?.meta?.loading) {
    return false;
  }
  
  const loadingState = state.meta.loading.accountOverviewGraph;
  
  // Handle old boolean structure
  if (typeof loadingState === 'boolean') {
    return loadingState;
  }
  
  // Handle object structure
  if (loadingState && typeof loadingState === 'object') {
    return loadingState[accountId] || false;
  }
  
  return false;
};

export const selectMetaAccountOverviewGraphError = (state, accountId) => {
  // Ensure state structure exists
  if (!state?.meta?.errors) {
    return null;
  }
  
  const errorState = state.meta.errors.accountOverviewGraph;
  
  // Handle old string/null structure
  if (typeof errorState === 'string' || errorState === null) {
    return errorState;
  }
  
  // Handle object structure
  if (errorState && typeof errorState === 'object') {
    return errorState[accountId] || null;
  }
  
  return null;
};

// Campaign selectors
export const selectMetaCampaignDetails = (state) => {
  return state?.meta?.campaignDetails || null;
};

export const selectMetaCampaignPerformance = (state) => {
  return state?.meta?.campaignPerformance || null;
};

export const selectMetaCampaignDetailsLoading = (state) => {
  return state?.meta?.loading?.campaignDetails || false;
};

export const selectMetaCampaignPerformanceLoading = (state) => {
  return state?.meta?.loading?.campaignPerformance || false;
};

export const selectMetaCampaignDetailsError = (state) => {
  return state?.meta?.errors?.campaignDetails || null;
};

export const selectMetaCampaignPerformanceError = (state) => {
  return state?.meta?.errors?.campaignPerformance || null;
};

// Combined campaign data selectors
export const selectMetaCampaignData = (state) => {
  return state?.meta?.campaignData || null;
};

export const selectMetaCampaignDataLoading = (state) => {
  return state?.meta?.loading?.campaignData || false;
};

export const selectMetaCampaignDataError = (state) => {
  return state?.meta?.errors?.campaignData || null;
};

// Campaign Insights Selectors
export const selectMetaCampaignInsightsBreakdowns = (state) => {
  return state?.meta?.campaignInsightsBreakdowns || null;
};

export const selectMetaCampaignInsightsHourly = (state) => {
  return state?.meta?.campaignInsightsHourly || null;
};

export const selectMetaCampaignInsightsRegion = (state) => {
  return state?.meta?.campaignInsightsRegion || null;
};

export const selectMetaCampaignInsightsDevice = (state) => {
  return state?.meta?.campaignInsightsDevice || null;
};

export const selectMetaCampaignInsightsPublisherPlatform = (state) => {
  return state?.meta?.campaignInsightsPublisherPlatform || null;
};

// Campaign Insights Loading Selectors
export const selectMetaCampaignInsightsBreakdownsLoading = (state) => {
  return state?.meta?.loading?.campaignInsightsBreakdowns || false;
};

export const selectMetaCampaignInsightsHourlyLoading = (state) => {
  return state?.meta?.loading?.campaignInsightsHourly || false;
};

export const selectMetaCampaignInsightsRegionLoading = (state) => {
  return state?.meta?.loading?.campaignInsightsRegion || false;
};

export const selectMetaCampaignInsightsDeviceLoading = (state) => {
  return state?.meta?.loading?.campaignInsightsDevice || false;
};

export const selectMetaCampaignInsightsPublisherPlatformLoading = (state) => {
  return state?.meta?.loading?.campaignInsightsPublisherPlatform || false;
};

// Campaign Insights Error Selectors
export const selectMetaCampaignInsightsBreakdownsError = (state) => {
  return state?.meta?.errors?.campaignInsightsBreakdowns || null;
};

export const selectMetaCampaignInsightsHourlyError = (state) => {
  return state?.meta?.errors?.campaignInsightsHourly || null;
};

export const selectMetaCampaignInsightsRegionError = (state) => {
  return state?.meta?.errors?.campaignInsightsRegion || null;
};

export const selectMetaCampaignInsightsDeviceError = (state) => {
  return state?.meta?.errors?.campaignInsightsDevice || null;
};

export const selectMetaCampaignInsightsPublisherPlatformError = (state) => {
  return state?.meta?.errors?.campaignInsightsPublisherPlatform || null;
};

// Actions
export const { clearMetaData, clearCampaignData, clearMetaErrors, clearAccountOverviewGraph, resetMetaState, clearInsightsData } = metaSlice.actions;

export default metaSlice.reducer; 