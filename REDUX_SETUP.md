# Redux Toolkit & Axios Setup Documentation

This document provides a comprehensive guide to the Redux Toolkit and Axios interceptors setup for the AdSynq B2B SaaS application.

## 🏗️ Architecture Overview

### Redux Store Structure
```
store/
├── index.js              # Main store configuration
├── hooks.js              # Custom Redux hooks
└── slices/
    ├── authSlice.js      # Authentication state
    ├── uiSlice.js        # UI state (sidebar, theme, etc.)
    ├── dashboardSlice.js # Dashboard data and metrics
    └── notificationSlice.js # Notifications management
```

### API Services Structure
```
services/
└── api.js               # Axios instance with interceptors
```

## 🔧 Redux Toolkit Setup

### Store Configuration
The store is configured with Redux Toolkit and includes:
- **Redux Persist**: For persisting auth and UI state
- **DevTools**: Enabled in development
- **Serializable Check**: Configured for Redux Persist

### Slices Overview

#### 1. Auth Slice (`authSlice.js`)
Manages authentication state including:
- User login/logout
- Token management
- Profile data
- Session management

**Key Features:**
- Automatic token refresh
- Session persistence
- Error handling
- Activity tracking

#### 2. UI Slice (`uiSlice.js`)
Manages UI state including:
- Sidebar collapse state
- Theme preferences
- Loading states
- Toast notifications
- Search and filters
- Pagination

#### 3. Dashboard Slice (`dashboardSlice.js`)
Manages dashboard data including:
- Overview metrics
- Chart data
- Recent activity
- Filters and date ranges

#### 4. Notification Slice (`notificationSlice.js`)
Manages notifications including:
- Notification list
- Read/unread status
- Real-time updates
- Filtering and pagination

## 🌐 Axios Interceptors Setup

### Request Interceptor
- **Authentication**: Automatically adds Bearer token to requests
- **Activity Tracking**: Updates last activity timestamp
- **Debugging**: Adds request timestamps for performance monitoring

### Response Interceptor
- **Token Refresh**: Automatically handles 401 errors with token refresh
- **Error Handling**: Shows toast notifications for errors
- **Performance Logging**: Logs request duration
- **Session Management**: Handles session expiration

## 📚 Usage Examples

### Using Redux Hooks

#### Basic State Access
```jsx
import { useAuth, useUI, useDashboard } from '../store/hooks';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { sidebarCollapsed, theme } = useUI();
  const { overview, charts } = useDashboard();

  // Component logic
}
```

#### Dispatching Actions
```jsx
import { useAppDispatch } from '../store/hooks';
import { loginUser, toggleSidebar, showToast } from '../store/slices';

function LoginForm() {
  const dispatch = useAppDispatch();

  const handleLogin = async (credentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      dispatch(showToast({
        message: 'Login successful!',
        type: 'success'
      }));
    } catch (error) {
      dispatch(showToast({
        message: error.message,
        type: 'error'
      }));
    }
  };
}
```

#### Using Async Thunks
```jsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDashboardData } from '../store/slices/dashboardSlice';

function Dashboard() {
  const dispatch = useAppDispatch();
  const { overview, isLoading, error } = useAppSelector(state => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* Dashboard content */}</div>;
}
```

### Using API Services

#### Making API Calls
```jsx
import { authAPI, dashboardAPI } from '../services/api';

// Authentication
const login = async (credentials) => {
  const response = await authAPI.login(credentials);
  return response.data;
};

// Dashboard data
const getDashboardData = async () => {
  const response = await dashboardAPI.getDashboardData();
  return response.data;
};

// With parameters
const getMetrics = async (dateRange) => {
  const response = await dashboardAPI.getMetrics({ dateRange });
  return response.data;
};
```

#### Custom API Calls
```jsx
import api from '../services/api';

// Custom GET request
const customGet = async (url, params) => {
  const response = await api.get(url, { params });
  return response.data;
};

// Custom POST request
const customPost = async (url, data) => {
  const response = await api.post(url, data);
  return response.data;
};

// File upload
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
```

## 🎯 Best Practices

### Redux Best Practices

1. **Use Custom Hooks**: Always use the provided custom hooks for better code organization
2. **Async Actions**: Use `createAsyncThunk` for API calls
3. **Error Handling**: Always handle errors in async thunks
4. **State Normalization**: Keep state normalized for better performance
5. **Selectors**: Use selectors for derived state

### API Best Practices

1. **Error Handling**: Let interceptors handle common errors
2. **Token Management**: Don't manually handle tokens, let interceptors do it
3. **Request Cancellation**: Use AbortController for cancellable requests
4. **Retry Logic**: Implement retry logic for failed requests when needed
5. **Loading States**: Use Redux loading states for UI feedback

### Performance Optimization

1. **Memoization**: Use `useMemo` and `useCallback` for expensive operations
2. **Selective Re-renders**: Use specific selectors to avoid unnecessary re-renders
3. **Lazy Loading**: Implement lazy loading for large datasets
4. **Debouncing**: Debounce search and filter inputs

## 🔒 Security Features

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Automatic Refresh**: Seamless token refresh
- **Session Management**: Proper session handling
- **Logout Cleanup**: Complete state cleanup on logout

### Error Handling
- **Graceful Degradation**: App continues to work even with API errors
- **User Feedback**: Clear error messages via toast notifications
- **Retry Mechanisms**: Automatic retry for transient errors
- **Fallback UI**: Loading and error states for better UX

## 🚀 Advanced Features

### Real-time Updates
```jsx
// WebSocket integration example
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'notification') {
      dispatch(addNotification(data.notification));
    }
  };

  return () => ws.close();
}, [dispatch]);
```

### Optimistic Updates
```jsx
const updateUser = createAsyncThunk(
  'users/updateUser',
  async (userData, { dispatch }) => {
    // Optimistic update
    dispatch(updateUserOptimistic(userData));
    
    try {
      const response = await userAPI.updateUser(userData.id, userData);
      return response.data;
    } catch (error) {
      // Revert optimistic update on error
      dispatch(revertUserUpdate(userData));
      throw error;
    }
  }
);
```

### Caching
```jsx
// Implement caching with Redux Toolkit Query or custom solution
const useCachedData = (key, fetchFn, dependencies) => {
  const dispatch = useAppDispatch();
  const cachedData = useAppSelector(state => state.cache[key]);

  useEffect(() => {
    if (!cachedData || Date.now() - cachedData.timestamp > 5 * 60 * 1000) {
      fetchFn().then(data => {
        dispatch(setCachedData({ key, data }));
      });
    }
  }, dependencies);

  return cachedData?.data;
};
```

## 🧪 Testing

### Redux Testing
```jsx
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../store/slices/authSlice';

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: { auth: authSlice },
    preloadedState,
  });
};

test('displays user name when authenticated', () => {
  const store = createTestStore({
    auth: {
      user: { name: 'John Doe' },
      isAuthenticated: true,
    },
  });

  render(
    <Provider store={store}>
      <UserProfile />
    </Provider>
  );

  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

### API Testing
```jsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { authAPI } from '../services/api';

const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        user: { id: 1, name: 'John Doe' },
        token: 'fake-token',
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('login API call', async () => {
  const response = await authAPI.login({
    email: 'test@example.com',
    password: 'password',
  });

  expect(response.data.user.name).toBe('John Doe');
});
```

## 📝 Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=AdSynq
VITE_APP_VERSION=1.0.0
```

## 🔄 Migration Guide

### From Redux Classic
1. Replace `createStore` with `configureStore`
2. Replace `createReducer` with `createSlice`
3. Replace `createAction` with slice actions
4. Update selectors to use the new state structure

### From Redux Thunk
1. Replace `createAsyncThunk` with `createAsyncThunk` (same API)
2. Update error handling to use `rejectWithValue`
3. Update loading states to use slice reducers

## 📞 Support

For questions and issues:
1. Check the Redux Toolkit documentation
2. Review the Axios documentation
3. Check the component examples in the codebase
4. Open an issue in the repository

## 🎉 Conclusion

This setup provides a robust foundation for state management and API communication in your B2B SaaS application. The combination of Redux Toolkit and Axios interceptors ensures:

- **Reliable State Management**: Predictable state updates with Redux Toolkit
- **Seamless API Communication**: Automatic token handling and error management
- **Great Developer Experience**: Custom hooks and TypeScript-like support
- **Production Ready**: Error boundaries, loading states, and performance optimizations

Happy coding! 🚀 