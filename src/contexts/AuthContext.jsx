import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  getAccessToken, 
  setAccessToken, 
  setRefreshToken, 
  clearTokens,
  isTokenExpired,
  getUserFromToken
} from '../utils/auth';
import { showSuccessToast, showErrorToast, showLoadingToast, showInfoToast } from '../hooks/useToast';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAccessToken();
        if (token) {
          // Check if token is expired
          if (isTokenExpired(token)) {
            console.log('Token is expired, clearing tokens');
            clearTokens();
            setUser(null);
            setIsAuthenticated(false);
          } else {
            // Token is valid, extract user info from token
            const userData = getUserFromToken(token);
            if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              console.log('Could not extract user data from token, clearing tokens');
              clearTokens();
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const loadingToast = showLoadingToast('Signing in...');
    
    try {
      const response = await apiService.auth.login({ email, password });
      
      // Handle the actual API response structure
      if (response.data.error === false && response.data.result) {
        const { access, refresh, user: userData, subscription: subscriptionData } = response.data.result;

        setAccessToken(access);
        setRefreshToken(refresh);

        setUser(userData);
        setSubscription(subscriptionData);
        setIsAuthenticated(true);
        
        toast.dismiss(loadingToast);
        showSuccessToast('Successfully signed in!');
        
        return { success: true };
      } else {
        toast.dismiss(loadingToast);
        const errorMessage = response.data.message || 'Login failed';
        showErrorToast(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      showErrorToast(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    const loadingToast = showLoadingToast('Creating your account...');
    
    try {
      const response = await apiService.auth.register(userData);
      
      // Handle the actual API response structure
      if (response.data.error === false && response.data.result) {
        const { access, refresh, user: newUser } = response.data.result;
        
        setAccessToken(access);
        setRefreshToken(refresh);
        
        setUser(newUser);
        setIsAuthenticated(true);
        
        toast.dismiss(loadingToast);
        showSuccessToast('Account created successfully!');
        
        return { success: true };
      } else {
        toast.dismiss(loadingToast);
        const errorMessage = response.data.message || 'Signup failed';
        showErrorToast(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || 'Failed to create account';
      showErrorToast(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    const loadingToast = showLoadingToast('Signing out...');

    try {
      await apiService.auth.logout();
      clearTokens();
      setUser(null);
      setSubscription(null);
      setIsAuthenticated(false);
      
      toast.dismiss(loadingToast);
      showSuccessToast('Successfully signed out');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens even if API call fails
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      
      toast.dismiss(loadingToast);
      showInfoToast('Signed out');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const refreshToken = async (refreshToken) => {
    try {
      const response = await apiService.auth.refresh(refreshToken);
      
      if (response.data.error === false && response.data.result) {
        const { access, refresh } = response.data.result;
        
        setAccessToken(access);
        setRefreshToken(refresh);
        
        return {
          token: access,
          refreshToken: refresh
        };
      } else {
        throw new Error(response.data.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  const value = {
    user,
    subscription,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateUser,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 