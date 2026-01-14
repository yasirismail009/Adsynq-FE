import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunks for subscription operations
export const fetchSubscriptionPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.subscriptions.getPlans();

      // Handle different response formats
      if (response.data.error === false && response.data.result) {
        return response.data.result;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        // Handle paginated response format
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Failed to fetch subscription plans');
    }
  }
);

export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.subscriptions.getCurrent();
      return response.data;
    } catch (error) {
      // Don't treat 404 as an error - endpoint might not be implemented yet
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(error.response?.data || 'Failed to fetch current subscription');
    }
  }
);

export const fetchSubscriptionUsage = createAsyncThunk(
  'subscription/fetchUsage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.subscriptions.getUsage();
      return response.data;
    } catch (error) {
      // Don't treat 404 as an error - endpoint might not be implemented yet
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(error.response?.data || 'Failed to fetch subscription usage');
    }
  }
);

export const fetchSubscriptionHistory = createAsyncThunk(
  'subscription/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.subscriptions.getHistory();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch subscription history');
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscription/create',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const response = await apiService.subscriptions.create(subscriptionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create subscription');
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'subscription/update',
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await apiService.subscriptions.update(updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update subscription');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.subscriptions.cancel();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to cancel subscription');
    }
  }
);

export const checkFeatureAccess = createAsyncThunk(
  'subscription/checkFeature',
  async (feature, { rejectWithValue }) => {
    try {
      const response = await apiService.subscriptions.checkFeature(feature);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to check feature access');
    }
  }
);

const initialState = {
  // Plans
  plans: [],
  plansLoading: false,
  plansError: null,

  // Current subscription
  currentSubscription: null,
  subscriptionLoading: false,
  subscriptionError: null,

  // Usage
  usage: null,
  usageLoading: false,
  usageError: null,

  // History
  history: [],
  historyLoading: false,
  historyError: null,

  // Feature checking
  featureAccess: {},
  featureLoading: false,
  featureError: null,

  // Operations
  operationLoading: false,
  operationError: null,

  // Dialog state
  showSubscriptionDialog: false,
  selectedPlanId: null, // Plan ID to pre-select when dialog opens
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.subscriptionError = null;
      state.usageError = null;
      state.plansError = null;
      state.historyError = null;
      state.featureError = null;
      state.operationError = null;
    },
    showSubscriptionDialog: (state, action) => {
      state.showSubscriptionDialog = true;
      state.selectedPlanId = action.payload?.planId || null;
    },
    hideSubscriptionDialog: (state) => {
      state.showSubscriptionDialog = false;
      state.selectedPlanId = null;
    },
    resetSubscriptionState: (state) => {
      state.currentSubscription = null;
      state.usage = null;
      state.history = [];
      state.plans = [];
      state.featureAccess = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.plansLoading = true;
        state.plansError = null;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.plansLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.plansLoading = false;
        state.plansError = action.payload;
      })

      // Fetch Current Subscription
      .addCase(fetchCurrentSubscription.pending, (state) => {
        state.subscriptionLoading = true;
        state.subscriptionError = null;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.subscriptionLoading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(fetchCurrentSubscription.rejected, (state, action) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload;
      })

      // Fetch Usage
      .addCase(fetchSubscriptionUsage.pending, (state) => {
        state.usageLoading = true;
        state.usageError = null;
      })
      .addCase(fetchSubscriptionUsage.fulfilled, (state, action) => {
        state.usageLoading = false;
        state.usage = action.payload;
      })
      .addCase(fetchSubscriptionUsage.rejected, (state, action) => {
        state.usageLoading = false;
        state.usageError = action.payload;
      })

      // Fetch History
      .addCase(fetchSubscriptionHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchSubscriptionHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchSubscriptionHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload;
      })

      // Create Subscription
      .addCase(createSubscription.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.currentSubscription = action.payload;
        state.showSubscriptionDialog = false;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      })

      // Update Subscription
      .addCase(updateSubscription.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.currentSubscription = action.payload;
        state.showSubscriptionDialog = false;
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      })

      // Cancel Subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.currentSubscription = action.payload;
        state.showSubscriptionDialog = false;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      })

      // Check Feature Access
      .addCase(checkFeatureAccess.pending, (state) => {
        state.featureLoading = true;
        state.featureError = null;
      })
      .addCase(checkFeatureAccess.fulfilled, (state, action) => {
        state.featureLoading = false;
        state.featureAccess[action.meta.arg] = action.payload;
      })
      .addCase(checkFeatureAccess.rejected, (state, action) => {
        state.featureLoading = false;
        state.featureError = action.payload;
      });
  },
});

// Selectors
export const selectSubscriptionPlans = (state) => state.subscription.plans;
export const selectSubscriptionPlansLoading = (state) => state.subscription.plansLoading;
export const selectSubscriptionPlansError = (state) => state.subscription.plansError;

export const selectCurrentSubscription = (state) => state.subscription.currentSubscription;
export const selectSubscriptionLoading = (state) => state.subscription.subscriptionLoading;
export const selectSubscriptionError = (state) => state.subscription.subscriptionError;

export const selectSubscriptionUsage = (state) => state.subscription.usage;
export const selectUsageLoading = (state) => state.subscription.usageLoading;
export const selectUsageError = (state) => state.subscription.usageError;

export const selectSubscriptionHistory = (state) => state.subscription.history;
export const selectHistoryLoading = (state) => state.subscription.historyLoading;
export const selectHistoryError = (state) => state.subscription.historyError;

export const selectFeatureAccess = (feature) => (state) => state.subscription.featureAccess[feature];
export const selectFeatureLoading = (state) => state.subscription.featureLoading;
export const selectFeatureError = (state) => state.subscription.featureError;

export const selectSubscriptionOperationLoading = (state) => state.subscription.operationLoading;
export const selectSubscriptionOperationError = (state) => state.subscription.operationError;

export const selectShowSubscriptionDialog = (state) => state.subscription.showSubscriptionDialog;
export const selectSelectedPlanId = (state) => state.subscription.selectedPlanId;

// Current plan selectors
export const selectCurrentPlan = (state) => state.subscription.currentSubscription?.plan;
export const selectCurrentPlanId = (state) => state.subscription.currentSubscription?.plan?.id;
export const selectCurrentPlanType = (state) => state.subscription.currentSubscription?.plan?.plan_type;
export const selectCurrentPlanName = (state) => state.subscription.currentSubscription?.plan?.name;

// Subscription status selectors
export const selectIsSubscriptionActive = (state) => state.subscription.currentSubscription?.is_active;
export const selectIsSubscriptionCanceled = (state) => state.subscription.currentSubscription?.is_canceled;
export const selectSubscriptionStatus = (state) => state.subscription.currentSubscription?.status;
export const selectBillingInterval = (state) => state.subscription.currentSubscription?.billing_interval;

// Feature access helpers
export const selectHasGoogleAdsAccess = (state) => state.subscription.currentSubscription?.plan?.has_google_ads;
export const selectHasMetaAdsAccess = (state) => state.subscription.currentSubscription?.plan?.has_meta_ads;
export const selectHasAdvancedAnalytics = (state) => state.subscription.currentSubscription?.plan?.has_advanced_analytics;
export const selectMaxAdAccounts = (state) => state.subscription.currentSubscription?.plan?.max_ad_accounts || 0;
export const selectMaxCampaigns = (state) => state.subscription.currentSubscription?.plan?.max_campaigns || 0;
export const selectMaxConnections = (state) => state.subscription.currentSubscription?.plan?.max_connections || 0;

export const {
  clearSubscriptionError,
  showSubscriptionDialog,
  hideSubscriptionDialog,
  resetSubscriptionState
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
