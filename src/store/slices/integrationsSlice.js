import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunks for API calls
// Using platform connections API - no mock data needed

export const fetchIntegrations = createAsyncThunk(
  'integrations/fetchIntegrations',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching integrations from platform connections API...');
      const response = await apiService.marketing.platformConnections();
      
      console.log('Platform Connections API Response:', response?.data);
      
      // Handle the platform connections API response format
      if (response?.data?.error === false && response?.data?.result) {
        const result = response.data.result;
        const transformedIntegrations = [];
        
        // Process Google accounts - each account becomes a separate integration
        if (result.google_accounts && Array.isArray(result.google_accounts)) {
          result.google_accounts.forEach((account, index) => {
            const googleAccount = account.google_account || {};
            const connectionStatus = account.is_active && !account.is_token_expired 
              ? 'active' 
              : account.has_refresh_token && account.is_token_expired 
                ? 'needs_refresh' 
                : 'inactive';
            
            const integration = {
              id: `google-${account.google_account_id || index}`,
              title: 'Google Ads',
              description: 'Manage Google Ads campaigns, track performance, and optimize ad spend',
              domain: googleAccount.email || 'google@example.com',
              integrations: [{
                type: 'google',
                name: 'Google Ads',
                status: connectionStatus,
                lastSync: account.last_sync_at
              }],
              metrics: {
                campaigns: 0,
                ads: 0,
                spend: 0,
                impressions: 0,
                clicks: 0,
                conversions: 0
              },
              status: connectionStatus,
              paymentStatus: 'paid',
              createdDate: account.created_at ? new Date(account.created_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
              updatedDate: account.last_sync_at ? new Date(account.last_sync_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
              userData: {
                name: googleAccount.name || 'Google User',
                email: googleAccount.email || 'google@example.com',
                image: googleAccount.picture || null
              },
              platformData: {
                googleAccountId: account.google_account_id,
                accountId: account.google_account_id, // For compatibility with refresh/disconnect
                availablePlatforms: account.available_platforms || [],
                tokenExpiresAt: account.token_expires_at,
                hasRefreshToken: account.has_refresh_token,
                isTokenExpired: account.is_token_expired,
                needsRefresh: account.needs_refresh,
                timeUntilExpirySeconds: account.time_until_expiry_seconds,
                connectionHealth: account.is_active && !account.is_token_expired ? 'excellent' : account.is_token_expired ? 'needs_refresh' : 'inactive',
                tokenStatus: account.is_token_expired ? 'expired' : account.is_active ? 'valid' : 'inactive',
                syncStatus: account.last_sync_at ? 'synced' : 'never_synced',
                isActive: account.is_active
              }
            };
            
            transformedIntegrations.push(integration);
            console.log(`Transformed Google integration:`, integration);
          });
        }
        
        // Process Meta connections - each connection becomes a separate integration
        if (result.meta_connections && Array.isArray(result.meta_connections)) {
          result.meta_connections.forEach((connection, index) => {
            const connectionStatus = connection.is_active && !connection.is_token_expired 
              ? 'active' 
              : connection.needs_refresh 
                ? 'needs_refresh' 
                : 'inactive';
            
            const integration = {
              id: `meta-${connection.connection_id || index}`,
              title: 'Meta Ads',
              description: 'Manage Facebook and Instagram advertising campaigns',
              domain: connection.account_email || 'business@example.com',
              integrations: [{
                type: 'meta',
                name: 'Meta Ads',
                status: connectionStatus,
                lastSync: connection.last_sync_at
              }],
              metrics: {
                campaigns: 0,
                ads: 0,
                spend: 0,
                impressions: 0,
                clicks: 0,
                conversions: 0
              },
              status: connectionStatus,
              paymentStatus: 'paid',
              createdDate: connection.created_at ? new Date(connection.created_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
              updatedDate: connection.updated_at ? new Date(connection.updated_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
              userData: {
                name: connection.account_name || 'Meta Business Account',
                email: connection.account_email || 'business@example.com',
                image: null
              },
              platformData: {
                connectionId: connection.connection_id,
                accountId: connection.connection_id, // For compatibility with refresh/disconnect
                platformAccountId: connection.platform_account_id,
                platform: connection.platform,
                connectionType: connection.connection_type,
                tokenExpiresAt: connection.token_expires_at,
                hasRefreshToken: connection.has_refresh_token,
                isTokenExpired: connection.is_token_expired,
                needsRefresh: connection.needs_refresh,
                timeUntilExpirySeconds: connection.time_until_expiry_seconds,
                connectionHealth: connection.is_active && !connection.is_token_expired ? 'excellent' : connection.is_token_expired ? 'needs_refresh' : 'inactive',
                tokenStatus: connection.is_token_expired ? 'expired' : connection.is_active ? 'valid' : 'inactive',
                syncStatus: connection.last_sync_at ? 'synced' : 'never_synced',
                isActive: connection.is_active
              }
            };
            
            transformedIntegrations.push(integration);
            console.log(`Transformed Meta integration:`, integration);
          });
        }
        
        // Always ensure Google and Meta platforms are available, even if not connected
        const hasGoogle = transformedIntegrations.some(integ => 
          integ.integrations?.some(p => p.type === 'google')
        );
        const hasMeta = transformedIntegrations.some(integ => 
          integ.integrations?.some(p => p.type === 'meta')
        );
        
        // Add Google platform if not present
        if (!hasGoogle) {
          transformedIntegrations.push({
            id: 'google-new',
            title: 'Google Ads',
            description: 'Manage Google Ads campaigns, track performance, and optimize ad spend',
            domain: 'google@example.com',
            integrations: [{
              type: 'google',
              name: 'Google Ads',
              status: 'inactive',
              lastSync: null
            }],
            metrics: {
              campaigns: 0,
              ads: 0,
              spend: 0,
              impressions: 0,
              clicks: 0,
              conversions: 0
            },
            status: 'inactive',
            paymentStatus: 'paid',
            createdDate: new Date().toLocaleDateString('en-GB'),
            updatedDate: new Date().toLocaleDateString('en-GB'),
            userData: null,
            platformData: null
          });
          console.log('Added default Google integration (not connected)');
        }
        
        // Add Meta platform if not present
        if (!hasMeta) {
          transformedIntegrations.push({
            id: 'meta-new',
            title: 'Meta Ads',
            description: 'Manage Facebook and Instagram advertising campaigns',
            domain: 'business@example.com',
            integrations: [{
              type: 'meta',
              name: 'Meta Ads',
              status: 'inactive',
              lastSync: null
            }],
            metrics: {
              campaigns: 0,
              ads: 0,
              spend: 0,
              impressions: 0,
              clicks: 0,
              conversions: 0
            },
            status: 'inactive',
            paymentStatus: 'paid',
            createdDate: new Date().toLocaleDateString('en-GB'),
            updatedDate: new Date().toLocaleDateString('en-GB'),
            userData: null,
            platformData: null
          });
          console.log('Added default Meta integration (not connected)');
        }
        
        console.log('Final transformed integrations:', transformedIntegrations);
        return transformedIntegrations;
      } else {
        console.error('Invalid API response format:', response?.data);
        // Even if API response is invalid, return default Google and Meta platforms
        return [
          {
            id: 'google-new',
            title: 'Google Ads',
            description: 'Manage Google Ads campaigns, track performance, and optimize ad spend',
            domain: 'google@example.com',
            integrations: [{
              type: 'google',
              name: 'Google Ads',
              status: 'inactive',
              lastSync: null
            }],
            metrics: {
              campaigns: 0,
              ads: 0,
              spend: 0,
              impressions: 0,
              clicks: 0,
              conversions: 0
            },
            status: 'inactive',
            paymentStatus: 'paid',
            createdDate: new Date().toLocaleDateString('en-GB'),
            updatedDate: new Date().toLocaleDateString('en-GB'),
            userData: null,
            platformData: null
          },
          {
            id: 'meta-new',
            title: 'Meta Ads',
            description: 'Manage Facebook and Instagram advertising campaigns',
            domain: 'business@example.com',
            integrations: [{
              type: 'meta',
              name: 'Meta Ads',
              status: 'inactive',
              lastSync: null
            }],
            metrics: {
              campaigns: 0,
              ads: 0,
              spend: 0,
              impressions: 0,
              clicks: 0,
              conversions: 0
            },
            status: 'inactive',
            paymentStatus: 'paid',
            createdDate: new Date().toLocaleDateString('en-GB'),
            updatedDate: new Date().toLocaleDateString('en-GB'),
            userData: null,
            platformData: null
          }
        ];
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      // Even on error, return default Google and Meta platforms so users can connect
      return [
        {
          id: 'google-new',
          title: 'Google Ads',
          description: 'Manage Google Ads campaigns, track performance, and optimize ad spend',
          domain: 'google@example.com',
          integrations: [{
            type: 'google',
            name: 'Google Ads',
            status: 'inactive',
            lastSync: null
          }],
          metrics: {
            campaigns: 0,
            ads: 0,
            spend: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0
          },
          status: 'inactive',
          paymentStatus: 'paid',
          createdDate: new Date().toLocaleDateString('en-GB'),
          updatedDate: new Date().toLocaleDateString('en-GB'),
          userData: null,
          platformData: null
        },
        {
          id: 'meta-new',
          title: 'Meta Ads',
          description: 'Manage Facebook and Instagram advertising campaigns',
          domain: 'business@example.com',
          integrations: [{
            type: 'meta',
            name: 'Meta Ads',
            status: 'inactive',
            lastSync: null
          }],
          metrics: {
            campaigns: 0,
            ads: 0,
            spend: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0
          },
          status: 'inactive',
          paymentStatus: 'paid',
          createdDate: new Date().toLocaleDateString('en-GB'),
          updatedDate: new Date().toLocaleDateString('en-GB'),
          userData: null,
          platformData: null
        }
      ];
    }
  }
);

// Local state update functions (connections are managed through platform-specific APIs)
export const updateIntegration = createAsyncThunk(
  'integrations/updateIntegration',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      // Just update local state - actual updates happen through platform-specific APIs
      // After platform operations, refresh the connections list
      await dispatch(fetchIntegrations());
      return { id, ...data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update integration');
    }
  }
);

export const deleteIntegration = createAsyncThunk(
  'integrations/deleteIntegration',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      // Just remove from local state - actual deletion happens through platform-specific APIs
      // After platform operations, refresh the connections list
      await dispatch(fetchIntegrations());
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete integration');
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
      
      // Update integration (local state update - actual updates via platform APIs)
      .addCase(updateIntegration.fulfilled, (state, action) => {
        if (!Array.isArray(state.integrations)) {
          state.integrations = [];
        }
        const index = state.integrations.findIndex(integration => integration.id === action.payload.id);
        if (index !== -1) {
          state.integrations[index] = { ...state.integrations[index], ...action.payload };
        }
      })
      
      // Delete integration (local state update - actual deletion via platform APIs)
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