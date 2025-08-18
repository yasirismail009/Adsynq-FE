import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunks for API calls
// Mock data for development (matches API response format)
const mockIntegrations = [
  {
    id: "google",
    title: "Google Ads",
    description: "Manage Google Ads campaigns, track performance, and optimize ad spend",
    domain: "yasirismail321@gmail.com",
    integrations: [
      {
        type: "google",
        name: "Google Ads",
        status: "needs_refresh",
        lastSync: null
      }
    ],
    metrics: {
      campaigns: 0,
      ads: 0,
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0
    },
    status: "needs_refresh",
    paymentStatus: "paid",
    createdDate: "30/06/2025",
    updatedDate: "18/07/2025",
    userData: {
      name: "Muhammad Yasir Ismail",
      email: "yasirismail321@gmail.com",
      image: "https://lh3.googleusercontent.com/a/ACg8ocKTLSKHweADG5F8trpI1J6EtPHaxLZkOCTCtWgAaHw5jelNeuxh=s96-c"
    },
    platformData: {
      note: "Found 1 Google account(s) but all are inactive. Please reconnect your Google account.",
      connectionHealth: "needs_refresh",
      tokenStatus: "expired",
      tokenExpiresAt: "2025-07-09T07:11:53.132316+00:00",
      needsRefresh: false,
      syncStatus: "never_synced",
      availablePlatforms: ["google_ads", "search_ads_360"],
      oauthScopes: [
        "https://www.googleapis.com/auth/admanager",
        "https://www.googleapis.com/auth/doubleclicksearch",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/adwords",
        "openid"
      ],
      accountAgeDays: 18,
      connectionSummary: {
        status: "disconnected",
        tokenValid: false,
        hasRefreshToken: true,
        platformsCount: 2,
        lastActivity: "2025-07-18T20:41:01.270451+00:00"
      }
    }
  },
  {
    id: "meta",
    title: "Meta Ads",
    description: "Manage Facebook and Instagram advertising campaigns",
    domain: "business@example.com",
    integrations: [
      {
        type: "meta",
        name: "Meta Ads",
        status: "active",
        lastSync: "2025-01-27T10:30:00Z"
      }
    ],
    metrics: {
      campaigns: 3,
      ads: 8,
      spend: 10200,
      impressions: 300000,
      clicks: 9000,
      conversions: 450
    },
    status: "active",
    paymentStatus: "paid",
    createdDate: "15/01/2025",
    updatedDate: "27/01/2025",
    userData: {
      name: "Meta Business Account",
      email: "business@example.com",
      image: null
    },
    platformData: {
      note: "Facebook and Instagram campaigns are running successfully.",
      connectionHealth: "excellent",
      tokenStatus: "valid",
      tokenExpiresAt: "2025-02-27T10:30:00Z",
      needsRefresh: false,
      syncStatus: "synced",
      availablePlatforms: ["facebook", "instagram", "messenger"],
      oauthScopes: [
        "ads_management",
        "ads_read",
        "business_management",
        "pages_read_engagement"
      ],
      accountAgeDays: 12,
      connectionSummary: {
        status: "connected",
        tokenValid: true,
        hasRefreshToken: true,
        platformsCount: 3,
        lastActivity: "2025-01-27T10:30:00Z"
      }
    }
  },
  {
    id: "tiktok",
    title: "TikTok Ads",
    description: "Create and manage TikTok advertising campaigns",
    domain: "y***1@gmail.com",
    integrations: [
      {
        type: "tiktok",
        name: "TikTok Ads",
        status: "active",
        lastSync: "2025-07-05T15:05:58.489848+00:00"
      }
    ],
    metrics: {
      campaigns: 0,
      ads: 0,
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0
    },
    status: "active",
    paymentStatus: "paid",
    createdDate: new Date().toLocaleDateString('en-GB'),
    updatedDate: new Date().toLocaleDateString('en-GB'),
    userData: {
      name: "user5835681783823",
      email: "y***1@gmail.com",
      image: null
    },
    platformData: {
      note: "TikTok account connected and active."
    }
  },
  {
    id: "linkedin",
    title: "LinkedIn Ads",
    description: "Manage LinkedIn advertising campaigns and B2B marketing",
    domain: "business@example.com",
    integrations: [
      {
        type: "linkedin",
        name: "LinkedIn Ads",
        status: "inactive",
        lastSync: null
      }
    ],
    metrics: {
      campaigns: 0,
      ads: 0,
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0
    },
    status: "inactive",
    paymentStatus: "paid",
    createdDate: new Date().toLocaleDateString('en-GB'),
    updatedDate: new Date().toLocaleDateString('en-GB'),
    userData: {
      name: "LinkedIn Business Account",
      email: "business@example.com",
      image: null
    },
    platformData: {
      note: "LinkedIn Ads integration coming soon."
    }
  },
  {
    id: "shopify",
    title: "Shopify",
    description: "Connect your Shopify store for e-commerce analytics",
    domain: "example.myshopify.com",
    integrations: [
      {
        type: "shopify",
        name: "Shopify",
        status: "inactive",
        lastSync: null
      }
    ],
    metrics: {
      total_orders: 0,
      total_revenue: 0,
      total_customers: 0,
      products_count: 0
    },
    status: "inactive",
    paymentStatus: "paid",
    createdDate: new Date().toLocaleDateString('en-GB'),
    updatedDate: new Date().toLocaleDateString('en-GB'),
    userData: {
      name: "Shopify Store",
      email: "store@example.myshopify.com",
      image: null
    },
    platformData: {
      note: "Connect your Shopify store to access e-commerce analytics and data.",
      productsCount: 0,
      collectionsCount: 0
    }
  }
];

export const fetchIntegrations = createAsyncThunk(
  'integrations/fetchIntegrations',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching integrations from API...');
      const response = await apiService.integrations.list();
      
      console.log('API Response:', response?.data);
      
      // Handle the new API response format
      if (response?.data?.error === false && response?.data?.result) {
        const integrationsData = response.data.result;
        
        console.log('Integrations data:', integrationsData);
        
        // Transform the API response to match our expected format
        const transformedIntegrations = Object.entries(integrationsData).map(([platform, data]) => {
          // Skip the summary object
          if (platform === 'summary') {
            return null;
          }
          
          console.log(`Processing platform: ${platform}`, data);
          
          // Handle different data structures for different platforms
          let userData = null;
          let domain = `${platform}@example.com`;
          let lastSync = null;
          let connectionStatus = data.connected ? 'active' : 'inactive';
          
          if (platform === 'google' && data.data?.google_account) {
            // Google has detailed account information
            userData = {
              name: data.data.google_account.name || 'Google User',
              email: data.data.google_account.email || 'google@example.com',
              image: data.data.google_account.picture
            };
            domain = data.data.google_account.email || 'google@example.com';
            lastSync = data.data.last_sync_at;
            
            // Determine connection status based on Google's detailed data
            if (data.data.is_active && !data.data.is_token_expired) {
              connectionStatus = 'active';
            } else if (data.data.has_refresh_token && data.data.is_token_expired) {
              connectionStatus = 'needs_refresh';
            } else {
              connectionStatus = 'inactive';
            }
          } else if (platform === 'meta') {
            // Meta has account info
            userData = {
              name: data.data.account_name || 'Meta Business Account',
              email: data.data.account_email || 'business@example.com',
              image: null
            };
            domain = data.data.account_email || 'business@example.com';
            lastSync = data.data.last_sync;
          } else if (platform === 'tiktok') {
            // TikTok has account info
            userData = {
              name: data.data.account_name || 'TikTok User',
              email: data.data.account_email || 'tiktok@example.com',
              image: null
            };
            domain = data.data.account_email || 'tiktok@example.com';
            lastSync = data.data.last_sync;
          } else if (platform === 'linkedin') {
            // LinkedIn has account info
            userData = {
              name: data.data.account_name || 'LinkedIn Business Account',
              email: data.data.account_email || 'business@example.com',
              image: null
            };
            domain = data.data.account_email || 'business@example.com';
            lastSync = data.data.last_sync;
          } else if (platform === 'shopify') {
            // Shopify has store info
            userData = {
              name: data.data?.store_name || 'My Shopify Store',
              email: data.data?.store_url || 'https://example.myshopify.com',
              image: null
            };
            domain = data.data?.store_url || 'https://example.myshopify.com';
            lastSync = data.data?.last_sync;
          }
          
          const transformedIntegration = {
            id: platform,
            title: data.title,
            description: data.description,
            domain: domain,
            integrations: [{
              type: platform,
              name: data.title,
              status: connectionStatus,
              lastSync: lastSync
            }],
            metrics: platform === 'shopify' ? {
              total_orders: data.data?.metrics?.total_orders || 0,
              total_revenue: data.data?.metrics?.total_revenue || 0,
              total_customers: data.data?.metrics?.total_customers || 0,
              products_count: data.data?.metrics?.products_count || 0
            } : {
              campaigns: data.data?.metrics?.total_campaigns || 0,
              ads: data.data?.metrics?.active_campaigns || 0,
              spend: data.data?.metrics?.spend_30d || 0,
              impressions: data.data?.metrics?.impressions_30d || 0,
              clicks: data.data?.metrics?.clicks_30d || 0,
              conversions: data.data?.metrics?.conversions_30d || 0
            },
            status: connectionStatus,
            paymentStatus: 'paid', // Default to paid for now
            createdDate: data.data?.created_at ? new Date(data.data.created_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
            updatedDate: data.data?.updated_at ? new Date(data.data.updated_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
            userData: userData,
            // Additional platform-specific data
            platformData: {
              note: data.note,
              connectionHealth: data.data?.connection_health,
              tokenStatus: data.data?.token_status,
              tokenExpiresAt: data.data?.token_expires_at,
              needsRefresh: data.data?.needs_refresh,
              syncStatus: data.data?.sync_status,
              availablePlatforms: data.data?.available_platforms || [],
              oauthScopes: data.data?.oauth_scopes || [],
              accountAgeDays: data.data?.account_age_days,
              connectionSummary: data.data?.connection_summary,
              // Platform-specific metrics
              adAccountsCount: data.data?.ad_accounts_count,
              pagesCount: data.data?.pages_count,
              advertisersCount: data.data?.advertisers_count,
              productsCount: data.data?.products_count,
              collectionsCount: data.data?.collections_count,
              companyPagesCount: data.data?.company_pages_count
            }
          };
          
          console.log(`Transformed integration for ${platform}:`, transformedIntegration);
          return transformedIntegration;
        }).filter(Boolean); // Remove null entries (like summary)
        
        console.log('Final transformed integrations:', transformedIntegrations);
        return transformedIntegrations;
      } else {
        console.error('Invalid API response format:', response?.data);
        return mockIntegrations;
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return mockIntegrations;
    }
  }
);

export const createIntegration = createAsyncThunk(
  'integrations/createIntegration',
  async (integrationData, { rejectWithValue }) => {
    try {
      const response = await apiService.integrations.create(integrationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create integration');
    }
  }
);

export const updateIntegration = createAsyncThunk(
  'integrations/updateIntegration',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.integrations.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update integration');
    }
  }
);

export const deleteIntegration = createAsyncThunk(
  'integrations/deleteIntegration',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.integrations.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete integration');
    }
  }
);

export const connectIntegration = createAsyncThunk(
  'integrations/connectIntegration',
  async (integrationId, { rejectWithValue }) => {
    try {
      const response = await apiService.integrations.connect(integrationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to connect integration');
    }
  }
);

export const disconnectIntegration = createAsyncThunk(
  'integrations/disconnectIntegration',
  async (integrationId, { rejectWithValue }) => {
    try {
      const response = await apiService.integrations.disconnect(integrationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disconnect integration');
    }
  }
);

// Initial state
const initialState = {
  integrations: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    status: 'all',
    paymentStatus: 'all',
    integrationType: 'all'
  },
  viewMode: 'grid',
  showFilters: false,
  showWelcomeBanner: true
};

// Integrations slice
const integrationsSlice = createSlice({
  name: 'integrations',
  initialState,
  reducers: {
    // Set search filter
    setSearchFilter: (state, action) => {
      state.filters.search = action.payload;
    },
    
    // Set status filter
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    
    // Set payment status filter
    setPaymentStatusFilter: (state, action) => {
      state.filters.paymentStatus = action.payload;
    },
    
    // Set integration type filter
    setIntegrationTypeFilter: (state, action) => {
      state.filters.integrationType = action.payload;
    },
    
    // Toggle filters visibility
    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },
    
    // Set view mode
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    // Hide welcome banner
    hideWelcomeBanner: (state) => {
      state.showWelcomeBanner = false;
    },
    
    // Clear all filters
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: 'all',
        paymentStatus: 'all',
        integrationType: 'all'
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch integrations
      .addCase(fetchIntegrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIntegrations.fulfilled, (state, action) => {
        state.loading = false;
        state.integrations = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchIntegrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create integration
      .addCase(createIntegration.fulfilled, (state, action) => {
        if (!Array.isArray(state.integrations)) {
          state.integrations = [];
        }
        state.integrations.push(action.payload);
      })
      
      // Update integration
      .addCase(updateIntegration.fulfilled, (state, action) => {
        if (!Array.isArray(state.integrations)) {
          state.integrations = [];
        }
        const index = state.integrations.findIndex(integration => integration.id === action.payload.id);
        if (index !== -1) {
          state.integrations[index] = action.payload;
        }
      })
      
      // Delete integration
      .addCase(deleteIntegration.fulfilled, (state, action) => {
        if (!Array.isArray(state.integrations)) {
          state.integrations = [];
        }
        state.integrations = state.integrations.filter(integration => integration.id !== action.payload);
      });
  }
});

// Export actions
export const {
  setSearchFilter,
  setStatusFilter,
  setPaymentStatusFilter,
  setIntegrationTypeFilter,
  toggleFilters,
  setViewMode,
  hideWelcomeBanner,
  clearFilters
} = integrationsSlice.actions;

// Export selectors
export const selectIntegrations = (state) => {
  const integrations = state.integrations.integrations;
  return Array.isArray(integrations) ? integrations : [];
};
export const selectIntegrationsLoading = (state) => state.integrations.loading;
export const selectIntegrationsError = (state) => state.integrations.error;

// Memoized filters selector
export const selectIntegrationsFilters = createSelector(
  [(state) => state.integrations.filters],
  (filters) => ({
    search: filters?.search || '',
    status: filters?.status || 'all',
    paymentStatus: filters?.paymentStatus || 'all',
    integrationType: filters?.integrationType || 'all'
  })
);

export const selectViewMode = (state) => state.integrations.viewMode;
export const selectShowFilters = (state) => state.integrations.showFilters;
export const selectShowWelcomeBanner = (state) => state.integrations.showWelcomeBanner;

// Memoized filtered integrations selector
export const selectFilteredIntegrations = createSelector(
  [selectIntegrations, selectIntegrationsFilters],
  (integrations, filters) => {
    // Safety check: ensure integrations is an array
    if (!Array.isArray(integrations)) {
      return [];
    }
    
    // Safety check: ensure filters is an object with required properties
    const safeFilters = {
      search: filters?.search || '',
      status: filters?.status || 'all',
      paymentStatus: filters?.paymentStatus || 'all',
      integrationType: filters?.integrationType || 'all'
    };
    
    return integrations.filter(integration => {
      // Safety check: ensure integration is a valid object
      if (!integration || typeof integration !== 'object') {
        return false;
      }
      
      // Search filter
      if (safeFilters.search) {
        const searchLower = safeFilters.search.toLowerCase();
        const matchesSearch = 
          integration.title?.toLowerCase().includes(searchLower) ||
          integration.domain?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (safeFilters.status !== 'all' && integration.status !== safeFilters.status) {
        return false;
      }
      
      // Payment status filter
      if (safeFilters.paymentStatus !== 'all' && integration.paymentStatus !== safeFilters.paymentStatus) {
        return false;
      }
      
      // Integration type filter
      if (safeFilters.integrationType !== 'all') {
        const hasIntegrationType = integration.integrations?.some(
          integration => integration.type === safeFilters.integrationType
        );
        if (!hasIntegrationType) return false;
      }
      
      return true;
    });
  }
);

export default integrationsSlice.reducer; 