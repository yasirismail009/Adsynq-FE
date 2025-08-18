import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.dashboard.overview();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.dashboard.metrics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch metrics');
    }
  }
);

export const fetchChartData = createAsyncThunk(
  'dashboard/fetchChartData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.dashboard.charts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chart data');
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchRecentActivity',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.dashboard.recentActivity(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent activity');
    }
  }
);

export const fetchPlatformConnections = createAsyncThunk(
  'dashboard/fetchPlatformConnections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.marketing.platformConnections();
      console.log('Platform connections response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Platform connections error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch platform connections');
    }
  }
);

// Initial state
const initialState = {
  // Dashboard overview data
  overview: {
    totalRevenue: 0,
    activeUsers: 0,
    conversionRate: 0,
    avgSession: 0,
  },
  
  // Metrics data
  metrics: {
    revenue: [],
    users: [],
    conversions: [],
    sessions: [],
  },
  
  // Chart data
  charts: {
    revenueTrend: [],
    customerGrowth: [],
    conversionSources: [],
    dailyActivity: [],
  },
  
  // Recent activity
  recentActivity: [],
  
  // Platform connections data
  platformConnections: [],
  
  // Loading states
  isLoading: {
    overview: false,
    metrics: false,
    charts: false,
    activity: false,
    platformConnections: false,
  },
  
  // Error states
  errors: {
    overview: null,
    metrics: null,
    charts: null,
    activity: null,
    platformConnections: null,
  },
  
  // Filters and date ranges
  filters: {
    dateRange: '30d', // '7d', '30d', '90d', '1y'
    period: 'daily', // 'hourly', 'daily', 'weekly', 'monthly'
  },
  
  // Last updated timestamp
  lastUpdated: null,
};

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Update filters
    setDateRange: (state, action) => {
      state.filters.dateRange = action.payload;
    },
    setPeriod: (state, action) => {
      state.filters.period = action.payload;
    },
    
    // Clear errors
    clearError: (state, action) => {
      const key = action.payload;
      if (state.errors[key]) {
        state.errors[key] = null;
      }
    },
    
    // Clear all errors
    clearAllErrors: (state) => {
      state.errors = {
        overview: null,
        metrics: null,
        charts: null,
        activity: null,
      };
    },
    
    // Update specific data
    updateOverview: (state, action) => {
      state.overview = { ...state.overview, ...action.payload };
    },
    updateMetrics: (state, action) => {
      const { key, data } = action.payload;
      state.metrics[key] = data;
    },
    updateChartData: (state, action) => {
      const { key, data } = action.payload;
      state.charts[key] = data;
    },
    
    // Add activity item
    addActivityItem: (state, action) => {
      state.recentActivity.unshift(action.payload);
      // Keep only last 50 items
      if (state.recentActivity.length > 50) {
        state.recentActivity = state.recentActivity.slice(0, 50);
      }
    },
    
    // Reset dashboard
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch dashboard data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading.overview = true;
        state.errors.overview = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading.overview = false;
        state.overview = action.payload.overview;
        state.charts = action.payload.charts;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading.overview = false;
        state.errors.overview = action.payload;
      });

    // Fetch metrics
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.isLoading.metrics = true;
        state.errors.metrics = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.isLoading.metrics = false;
        state.metrics = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.isLoading.metrics = false;
        state.errors.metrics = action.payload;
      });

    // Fetch chart data
    builder
      .addCase(fetchChartData.pending, (state) => {
        state.isLoading.charts = true;
        state.errors.charts = null;
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.isLoading.charts = false;
        state.charts = { ...state.charts, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.isLoading.charts = false;
        state.errors.charts = action.payload;
      });

    // Fetch recent activity
    builder
      .addCase(fetchRecentActivity.pending, (state) => {
        state.isLoading.activity = true;
        state.errors.activity = null;
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.isLoading.activity = false;
        state.recentActivity = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchRecentActivity.rejected, (state, action) => {
        state.isLoading.activity = false;
        state.errors.activity = action.payload;
      });

    // Fetch platform connections
    builder
      .addCase(fetchPlatformConnections.pending, (state) => {
        state.isLoading.platformConnections = true;
        state.errors.platformConnections = null;
      })
      .addCase(fetchPlatformConnections.fulfilled, (state, action) => {
        state.isLoading.platformConnections = false;
        state.platformConnections = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchPlatformConnections.rejected, (state, action) => {
        state.isLoading.platformConnections = false;
        state.errors.platformConnections = action.payload;
      });
  },
});

// Export actions
export const {
  setDateRange,
  setPeriod,
  clearError,
  clearAllErrors,
  updateOverview,
  updateMetrics,
  updateChartData,
  addActivityItem,
  resetDashboard,
} = dashboardSlice.actions;

// Export selectors
export const selectDashboard = (state) => state.dashboard;
export const selectOverview = (state) => state.dashboard.overview;
export const selectMetrics = (state) => state.dashboard.metrics;
export const selectCharts = (state) => state.dashboard.charts;
export const selectRecentActivity = (state) => state.dashboard.recentActivity;
export const selectPlatformConnections = (state) => state.dashboard.platformConnections;
export const selectDashboardLoading = (state) => state.dashboard.isLoading;
export const selectDashboardErrors = (state) => state.dashboard.errors;
export const selectDashboardFilters = (state) => state.dashboard.filters;
export const selectLastUpdated = (state) => state.dashboard.lastUpdated;

// Helper selectors
export const selectIsDashboardLoading = (key) => (state) => state.dashboard.isLoading[key] || false;
export const selectDashboardError = (key) => (state) => state.dashboard.errors[key];
export const selectHasAnyError = (state) => Object.values(state.dashboard.errors).some(Boolean);

export default dashboardSlice.reducer; 