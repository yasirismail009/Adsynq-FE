import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import IntegrationsPage from './components/integrations/IntegrationsPage';
import PlatformDashboard from './components/integrations/PlatformDashboard';
import GoogleDashboard from './components/integrations/GoogleDashboard';
import GoogleAccountDetail from './components/integrations/GoogleAccountDetail';
import SA360CampaignDetail from './components/integrations/SA360CampaignDetail';
import FacebookDashboard from './components/integrations/FacebookDashboard';
import AdAccountDetail from './components/integrations/AdAccountDetail';
import CampaignDetail from './components/integrations/CampaignDetail';
import PlaceholderPage from './components/pages/PlaceholderPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import Toast from './components/ui/Toast';
import ThemeProvider from './components/ui/ThemeProvider';
import ThemeToggle from './components/ui/ThemeToggle';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useAppSelector } from './store/hooks';
import { setToken, setUser, initializeAuth, authInitialized } from './store/slices/authSlice';
import { getAccessToken, getRefreshToken, getUserFromToken, isTokenExpired } from './utils/auth';

// OAuth Callback Handler Component
const OAuthCallbackHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    
    // If we have OAuth parameters, redirect to integrations page
    if (code || error) {
      console.log('OAuth callback detected on root path, redirecting to integrations');
      navigate('/integrations', { replace: true });
    }
  }, [location, navigate]);
  
  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  
  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Auth Initialization Component
const AuthInitializer = () => {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const performAuthInitialization = () => {
      // Check if we already have authentication state from Redux persistence
      if (isAuthenticated && token) {
        console.log('Auth state already exists from Redux persistence');
        return;
      }
      
      dispatch(initializeAuth());
      
      try {
        const token = getAccessToken();
        const refreshToken = getRefreshToken();
        
        console.log('Auth initialization - token exists:', !!token);
        console.log('Auth initialization - refresh token exists:', !!refreshToken);
        console.log('Current Redux auth state - isAuthenticated:', isAuthenticated);
        console.log('Current Redux auth state - token exists:', !!token);
        
        if (token) {
          // Check if token is expired
          if (isTokenExpired(token)) {
            console.log('Token is expired, clearing tokens');
            // Token is expired, don't set authentication state
            dispatch(authInitialized());
            return;
          }
          
          // Token is valid, extract user info from token
          const userData = getUserFromToken(token);
          console.log('Auth initialization - user data from token:', userData);
          
          if (userData) {
            console.log('Initializing auth with existing token');
            dispatch(setToken(token));
            dispatch(setUser(userData));
          } else {
            console.log('Could not extract user data from token');
            // For now, let's try to set authentication based on token existence
            // This is a fallback for non-JWT tokens or tokens with different structure
            console.log('Setting authentication based on token existence');
            dispatch(setToken(token));
            dispatch(setUser({ id: 'user', email: 'user@example.com' })); // Fallback user data
          }
        }
        
        dispatch(authInitialized());
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch(authInitialized());
      }
    };

    // Only initialize if not already loading
    if (!isLoading) {
      performAuthInitialization();
    }
  }, [dispatch, isLoading, isAuthenticated, token]);

  return null;
};

function App() {
  return (
    <ThemeProvider>
        <Router>
          <AuthInitializer />
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <OAuthCallbackHandler />
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/integrations" element={
              <ProtectedRoute>
                <Layout><IntegrationsPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/platform/:platformId" element={
              <ProtectedRoute>
                <Layout><PlatformDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/google" element={
              <ProtectedRoute>
                <Layout><GoogleDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/google/ad-account/:accountId" element={
              <ProtectedRoute>
                <Layout><GoogleAccountDetail /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/google/sa360/campaign/:googleAccountId/:customerId/:campaignId" element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary>
                    <SA360CampaignDetail />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/facebook/:platformId" element={
              <ProtectedRoute>
                <Layout><FacebookDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/facebook/ad-account/:accountId" element={
              <ProtectedRoute>
                <Layout><AdAccountDetail /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/facebook/campaign/:campaignId" element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary>
                    <CampaignDetail />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout><PlaceholderPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <Layout><PlaceholderPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout><PlaceholderPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout><PlaceholderPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
        <Toast />
        {/* Floating theme toggle */}
        <div className="fixed bottom-6 right-6 z-50">
          <ThemeToggle />
        </div>
      </ThemeProvider>
  );
}

export default App;
