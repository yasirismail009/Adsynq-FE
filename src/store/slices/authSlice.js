import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { setAccessToken, setRefreshToken, clearTokens } from '../../utils/auth';
import { createSubscription, fetchCurrentSubscription } from './subscriptionSlice';

// Rate limiting utility
const rateLimiter = {
  attempts: new Map(),
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

const checkRateLimit = (key) => {
  const now = Date.now();
  const attempts = rateLimiter.attempts.get(key) || [];
  
  // Remove old attempts outside the window
  const recentAttempts = attempts.filter(timestamp => now - timestamp < rateLimiter.windowMs);
  
  if (recentAttempts.length >= rateLimiter.maxAttempts) {
    return false;
  }
  
  recentAttempts.push(now);
  rateLimiter.attempts.set(key, recentAttempts);
  return true;
};

// Input validation
const validateCredentials = (credentials) => {
  const errors = [];
  
  if (!credentials.email || !credentials.email.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!credentials.password || !credentials.password.trim()) {
    errors.push('Password is required');
  } else if (credentials.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  return errors;
};

const validateSignupData = (userData) => {
  const errors = [];
  
  if (!userData.email || !userData.email.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!userData.password || !userData.password.trim()) {
    errors.push('Password is required');
  } else if (userData.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
    errors.push('Password must contain at least one lowercase letter, one uppercase letter, and one number');
  }
  
  if (!userData.username || !userData.username.trim()) {
    errors.push('Username is required');
  } else if (userData.username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  } else if (!/^[a-zA-Z0-9_-]+$/.test(userData.username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  return errors;
};

// Async thunks with enhanced security
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      // Input validation
      const validationErrors = validateCredentials(credentials);
      if (validationErrors.length > 0) {
        return rejectWithValue(validationErrors.join(', '));
      }
      
      // Rate limiting check
      const rateLimitKey = `login:${credentials.email}`;
      if (!checkRateLimit(rateLimitKey)) {
        return rejectWithValue('Too many login attempts. Please try again in 15 minutes.');
      }
      
      const response = await apiService.auth.login(credentials);
      
      if (response.data.error === false && response.data.result) {
        const { access, refresh, user, subscription } = response.data.result;

        // Validate token structure
        if (!access || !refresh || !user) {
          return rejectWithValue('Invalid response from server');
        }

        // Store tokens securely
        setAccessToken(access);
        setRefreshToken(refresh);

        // Clear rate limiting for successful login
        rateLimiter.attempts.delete(rateLimitKey);

        return {
          user,
          token: access,
          refreshToken: refresh,
          subscription
        };
      } else {
        return rejectWithValue(response.data.message || 'Login failed');
      }
    } catch (error) {
      // Enhanced error handling
      if (error.response?.status === 429) {
        return rejectWithValue('Too many requests. Please try again later.');
      } else if (error.response?.status === 401) {
        return rejectWithValue('Invalid email or password');
      } else if (error.response?.status >= 500) {
        return rejectWithValue('Server error. Please try again later.');
      } else if (!error.response) {
        return rejectWithValue('Network error. Please check your connection.');
      }
      
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (userData, { rejectWithValue }) => {
    try {
      // Input validation
      const validationErrors = validateSignupData(userData);
      if (validationErrors.length > 0) {
        return rejectWithValue(validationErrors.join(', '));
      }
      
      // Rate limiting check
      const rateLimitKey = `signup:${userData.email}`;
      if (!checkRateLimit(rateLimitKey)) {
        return rejectWithValue('Too many signup attempts. Please try again in 15 minutes.');
      }
      
      const response = await apiService.auth.register(userData);
      
      if (response.data.error === false && response.data.result) {
        const { access, refresh, user } = response.data.result;
        
        // Validate token structure
        if (!access || !refresh || !user) {
          return rejectWithValue('Invalid response from server');
        }
        
        // Store tokens securely
        setAccessToken(access);
        setRefreshToken(refresh);
        
        // Clear rate limiting for successful signup
        rateLimiter.attempts.delete(rateLimitKey);
        
        return {
          user,
          token: access,
          refreshToken: refresh
        };
      } else {
        return rejectWithValue(response.data.message || 'Signup failed');
      }
    } catch (error) {
      // Enhanced error handling
      if (error.response?.status === 409) {
        return rejectWithValue('User already exists with this email or username');
      } else if (error.response?.status === 429) {
        return rejectWithValue('Too many requests. Please try again later.');
      } else if (error.response?.status >= 500) {
        return rejectWithValue('Server error. Please try again later.');
      } else if (!error.response) {
        return rejectWithValue('Network error. Please check your connection.');
      }
      
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Always attempt to call logout API for proper session cleanup
      await apiService.auth.logout();
    } catch (error) {
      // Log error but don't fail logout - always clear local state
      console.warn('Logout API call failed, but clearing local state:', error);
    } finally {
      // Always clear tokens and local state regardless of API response
      clearTokens();
    }
    
    return null;
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const refreshToken = state.auth.refreshToken;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiService.auth.refresh(refreshToken);
      
      if (response.data.error === false && response.data.result) {
        const { access, refresh } = response.data.result;
        
        // Validate new tokens
        if (!access || !refresh) {
          throw new Error('Invalid token response');
        }
        
        // Store new tokens
        setAccessToken(access);
        setRefreshToken(refresh);
        
        return {
          token: access,
          refreshToken: refresh
        };
      } else {
        return rejectWithValue(response.data.message || 'Token refresh failed');
      }
    } catch (error) {
      // Clear tokens on refresh failure
      clearTokens();
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.user.profile();
      
      if (response.data.error === false && response.data.result) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  subscription: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastActivity: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLastActivity: (state) => {
      state.lastActivity = new Date().toISOString();
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.subscription = null;
      state.isAuthenticated = false;
      state.lastActivity = null;
      state.error = null;
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
      state.lastLoginAttempt = new Date().toISOString();
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
    initializeAuth: (state) => {
      state.isLoading = true;
    },
    authInitialized: (state) => {
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.subscription = action.payload.subscription;
        state.lastActivity = new Date().toISOString();
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.loginAttempts += 1;
        state.lastLoginAttempt = new Date().toISOString();
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.lastActivity = new Date().toISOString();
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.subscription = null;
        state.lastActivity = null;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Clear auth state even on logout failure
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.subscription = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      });

    // Refresh token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.lastActivity = new Date().toISOString();
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Auto logout on token refresh failure
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      });

    // Fetch user profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.lastActivity = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Subscription creation - sync with auth state
    builder
      .addCase(createSubscription.fulfilled, (state, action) => {
        // Update subscription in auth state when subscription is created
        state.subscription = action.payload;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        // Update subscription in auth state when current subscription is fetched
        state.subscription = action.payload;
      });
  },
});

// Export actions
export const { 
  clearError, 
  updateLastActivity, 
  setToken, 
  updateUserProfile, 
  setUser, 
  clearAuth,
  incrementLoginAttempts,
  resetLoginAttempts,
  initializeAuth,
  authInitialized
} = authSlice.actions;

// Export selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectLoginAttempts = (state) => state.auth.loginAttempts;
export const selectLastLoginAttempt = (state) => state.auth.lastLoginAttempt;

// Helper selectors
export const selectIsRateLimited = (state) => {
  const { loginAttempts, lastLoginAttempt } = state.auth;
  if (loginAttempts >= 5 && lastLoginAttempt) {
    const timeSinceLastAttempt = Date.now() - new Date(lastLoginAttempt).getTime();
    return timeSinceLastAttempt < 15 * 60 * 1000; // 15 minutes
  }
  return false;
};

export default authSlice.reducer; 