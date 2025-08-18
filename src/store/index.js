import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

// Import slices
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import dashboardSlice from './slices/dashboardSlice';
import notificationSlice from './slices/notificationSlice';
import themeSlice from './slices/themeSlice';
import integrationsSlice from './slices/integrationsSlice';
import googleSlice from './slices/googleSlice';
import facebookSlice from './slices/facebookSlice';
import tiktokSlice from './slices/tiktokSlice';
import shopifySlice from './slices/shopifySlice';
import metaSlice from './slices/metaSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  version: 1, // Add versioning for future migrations
  timeout: 10000, // 10 second timeout for storage operations
  // Persist all store data for better user experience
  // This ensures users don't lose their data on page refresh
  whitelist: [
    'auth', 
    'ui', 
    'theme', 
    'integrations',
    'dashboard',
    'notifications',
    'google',
    'facebook',
    'tiktok',
    'shopify',
    'meta'
  ],
  // Optional: Add transforms for data compression or filtering
  transforms: []
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  dashboard: dashboardSlice,
  notifications: notificationSlice,
  theme: themeSlice,
  integrations: integrationsSlice,
  google: googleSlice,
  facebook: facebookSlice,
  tiktok: tiktokSlice,
  shopify: shopifySlice,
  meta: metaSlice,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  preloadedState: {
    meta: {
      overallStats: null,
      userAdAccounts: null,
      accountOverviewGraph: {},
      loading: {
        overallStats: false,
        userAdAccounts: false,
        accountOverviewGraph: false
      },
      errors: {
        overallStats: null,
        userAdAccounts: null,
        accountOverviewGraph: null
      }
    }
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['persist'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Export store types for reference
// RootState: ReturnType<typeof store.getState>
// AppDispatch: typeof store.dispatch 