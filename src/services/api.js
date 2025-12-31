
import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from '../utils/auth';
import { getSecureHeaders, validateToken, logSecurityEvent, secureLogout } from '../utils/security';

// Base URL configuration
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance WITHOUT token (for public endpoints like login, register, refresh)
const axiosPublic = axios.create({
  baseURL,
  headers: getSecureHeaders(),
  timeout: 10000, // 10 second timeout
});

// Create axios instance WITH token (for protected endpoints)
const axiosPrivate = axios.create({
  baseURL,
  headers: getSecureHeaders(),
  timeout: 10000, // 10 second timeout
});

// Public instance interceptors (no token)
axiosPublic.interceptors.request.use(
  (config) => {
    // Don't add token for public routes
    return config;
  },
  (error) => {
    console.error('Public request interceptor error:', error);
    return Promise.reject(error);
  }
);

axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Public response interceptor error:', error);
    return Promise.reject(error);
  }
);

// Private instance interceptors (with token and refresh logic)
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    
    if (token) {
      // Validate token before using it
      if (!validateToken(token)) {
        logSecurityEvent('invalid_token_used', { url: config.url });
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(new Error('Invalid token'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log security events for sensitive operations
    if (config.url?.includes('/auth/') || config.url?.includes('/user/')) {
      logSecurityEvent('api_request', { 
        url: config.url, 
        method: config.method,
        hasToken: !!token 
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Private request interceptor error:', error);
    logSecurityEvent('request_interceptor_error', { error: error.message });
    return Promise.reject(error);
  }
);

// Track ongoing refresh request to prevent multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Log error details in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: originalRequest?.url,
        method: originalRequest?.method,
        hasRetry: originalRequest?._retry,
        errorMessage: error.response?.data
      });
    }

    // If there's no token at all, redirect to login
    const hasToken = getAccessToken();
    if (!hasToken) {
      console.error('No access token found, redirecting to login');
      logSecurityEvent('no_token_found', { url: originalRequest?.url });
      clearTokens();
      // Use React Router navigation instead of window.location
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest?.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosPrivate(originalRequest);
        }).catch(err => {
          console.error('Queued request failed:', err);
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) { throw new Error('No refresh token available'); }

        const response = await axiosPublic.post('/auth/token/refresh/', { refresh: refreshToken });
        
        if (response.data.error === false && response.data.result) {
          const { access, refresh } = response.data.result;
          setAccessToken(access);
          setRefreshToken(refresh);
          if (originalRequest?.headers) { originalRequest.headers.Authorization = `Bearer ${access}`; }
          processQueue(null, access);
          return axiosPrivate(originalRequest);
        } else {
          throw new Error(response.data.message || 'Invalid refresh token response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        
        // Clear tokens and redirect to login
        logSecurityEvent('token_refresh_failed', { error: refreshError.message });
        clearTokens();
        secureLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => axiosPublic.post('/auth/login/', credentials),
    register: (userData) => axiosPublic.post('/auth/signup/', userData),
    refresh: (refreshToken) => axiosPublic.post('/auth/token/refresh/', { refresh: refreshToken }),
    logout: () => axiosPrivate.post('/auth/logout/'),
    verify: () => axiosPrivate.get('/auth/verify/'),
  },
  
  // User endpoints
  user: {
    profile: () => axiosPrivate.get('/user/profile/'),
    updateProfile: (data) => axiosPrivate.put('/user/profile/', data),
    changePassword: (data) => axiosPrivate.post('/user/change-password/', data),
  },
  
  // Dashboard endpoints
  dashboard: {
    stats: () => axiosPrivate.get('/dashboard/stats/'),
    recentActivity: () => axiosPrivate.get('/dashboard/recent-activity/'),
    overview: () => axiosPrivate.get('/dashboard/overview/'),
    metrics: (params) => axiosPrivate.get('/dashboard/metrics/', { params }),
    charts: (params) => axiosPrivate.get('/dashboard/charts/', { params }),
  },
  
  // Integrations endpoints
  integrations: {
    list: () => axiosPrivate.get('/marketing/integrations/'),
    connect: (integrationId) => axiosPrivate.post(`/marketing/integrations/${integrationId}/connect/`),
    disconnect: (integrationId) => axiosPrivate.post(`/marketing/integrations/${integrationId}/disconnect/`),
    create: (data) => axiosPrivate.post('/marketing/integrations/', data),
    update: (id, data) => axiosPrivate.put(`/marketing/integrations/${id}/`, data),
    delete: (id) => axiosPrivate.delete(`/marketing/integrations/${id}/`),
    get: (id) => axiosPrivate.get(`/marketing/integrations/${id}/`),
  },

  // Marketing endpoints
  marketing: {
    platformConnections: () => axiosPrivate.get('/marketing/platforms/connections/'),
    googleConnect: (data) => axiosPrivate.post('/marketing/google/connect/', data),
    googleDisconnect: (accountId) => axiosPrivate.post(`/marketing/google/disconnect/${accountId}/`),
    googleRefreshTokens: () => axiosPrivate.post(`/marketing/google/refresh-token/`),
    googleAccountData: (accountId) => axiosPrivate.get(`/marketing/google/account/${accountId}/`),
    googleOverallStats: (params) => axiosPrivate.get('/marketing/google/overall-stats/', { 
      params,
      timeout: 120000 // 2 minutes timeout for SA360 overall stats
    }),
    googleSa360Reports: (googleAccountId, customerId, params) => axiosPrivate.get(`/marketing/sa360/connections/${googleAccountId}/customers/${customerId}/reports/`, { params }),
    googleSa360CampaignReport: (googleAccountId, customerId, campaignId, params) => axiosPrivate.get(`/marketing/sa360/connections/${googleAccountId}/customers/${customerId}/campaigns/${campaignId}/details/`, { params }),
    googleSa360KeywordView: (googleAccountId, customerId, campaignId, params) => axiosPrivate.get(`/marketing/sa360/connections/${googleAccountId}/customers/${customerId}/campaigns/${campaignId}/keyword-view/`, { params }),
    googleSa360DemographicData: (googleAccountId, customerId, campaignId, params) => axiosPrivate.get(`/marketing/sa360/connections/${googleAccountId}/customers/${customerId}/campaigns/${campaignId}/demographic-data/`, { params }),
    googleSa360DeviceTargeting: (googleAccountId, customerId, campaignId, params) => axiosPrivate.get(`/marketing/sa360/connections/${googleAccountId}/customers/${customerId}/campaigns/${campaignId}/device-targeting/`, { params }),
    googleSa360AudienceTargeting: (googleAccountId, customerId, campaignId, params) => axiosPrivate.get(`/marketing/sa360/connections/${googleAccountId}/customers/${customerId}/campaigns/${campaignId}/audience-targeting/`, { params }),
    googleSa360Assets: (googleAccountId, customerId, campaignId, params) => axiosPrivate.get(`/marketing/sa360/connections/${googleAccountId}/customers/${customerId}/campaigns/${campaignId}/assets/`, { params }),
    googleSa360CampaignAssets: (googleAccountId, customerId, params) => axiosPrivate.get(`/marketing/sa360/connections/${googleAccountId}/customers/${customerId}/campaign-assets/`, { params }),
    metaConnect: (data) => axiosPrivate.post('/meta/connect/', data),
    metaDisconnect: (accountId) => axiosPrivate.post(`/meta/disconnect/${accountId}/`),
    metaRefreshTokens: (accountId) => axiosPrivate.post(`/meta/refresh-tokens/${accountId}/`),
    metaAccountData: (accountId) => axiosPrivate.get(`/meta/account/${accountId}/`),
    metaAccountOverviewGraph: (accountId, params) => axiosPrivate.get(`/meta/account-overview-graph/${accountId}/`, { params }),
    metaOverallStats: (params) => axiosPrivate.get('/meta/overall-stats/', { params }),
    metaUserAdAccounts: () => axiosPrivate.get('/meta/user-ad-accounts-graph/'),
    metaCampaignDetails: (campaignId, params) => axiosPrivate.get(`/meta/campaign-details/${campaignId}/`, { params }),
    metaCampaignPerformance: (campaignId, params) => axiosPrivate.get(`/meta/campaign-details/${campaignId}/`, { params }),
    metaCampaignData: (campaignId, params) => axiosPrivate.get(`/meta/campaign-details/${campaignId}/`, { params }),
    metaCampaignInsightsBreakdowns: (campaignId, params) => axiosPrivate.get(`/meta/campaign-insights-breakdowns/${campaignId}/`, { params }),
    metaCampaignInsightsHourly: (campaignId, params) => axiosPrivate.get(`/meta/campaign-insights-hourly/${campaignId}/`, { params }),
    metaCampaignInsightsRegion: (campaignId, params) => axiosPrivate.get(`/meta/campaign-insights-region/${campaignId}/`, { params }),
    metaCampaignInsightsDevice: (campaignId, params) => axiosPrivate.get(`/meta/campaign-insights-device/${campaignId}/`, { params }),
    metaCampaignInsightsPublisherPlatform: (campaignId, params) => axiosPrivate.get(`/meta/campaign-insights-publisher-platform/${campaignId}/`, { params }),
    tiktokConnect: (data) => axiosPrivate.post('/marketing/tiktok/connect/', data),
    tiktokDisconnect: (accountId) => axiosPrivate.post(`/marketing/tiktok/disconnect/${accountId}/`),
    tiktokRefreshTokens: (accountId) => axiosPrivate.post(`/marketing/tiktok/refresh-tokens/${accountId}/`),
    tiktokAccountData: (accountId) => axiosPrivate.get(`/marketing/tiktok/account/${accountId}/`),
    tiktokSaveOAuth: (code) => axiosPrivate.get(`/tiktok/oauth/save/?code=${code}`),
    shopifyConnect: (data) => axiosPrivate.post('/shopify/oauth/callback/', data),
    shopifyDisconnect: (accountId) => axiosPrivate.post(`/marketing/shopify/disconnect/${accountId}/`),
    shopifyRefreshTokens: (accountId) => axiosPrivate.post(`/marketing/shopify/refresh-tokens/${accountId}/`),
    shopifyAccountData: (accountId) => axiosPrivate.get(`/marketing/shopify/account/${accountId}/`),
         
  },

  // Notifications endpoints
  notifications: {
    list: (params) => axiosPrivate.get('/notifications/', { params }),
    markAsRead: (notificationId) => axiosPrivate.put(`/notifications/${notificationId}/read/`),
    markAllAsRead: () => axiosPrivate.put('/notifications/read-all/'),
    delete: (notificationId) => axiosPrivate.delete(`/notifications/${notificationId}/`),
    update: (notificationId, data) => axiosPrivate.put(`/notifications/${notificationId}/`, data),
  },
};

export { axiosPublic, axiosPrivate };
export default axiosPrivate; 