import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Squares2X2Icon, 
  ListBulletIcon,
  ArchiveBoxIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import IntegrationCard from './IntegrationCard';
import { useIntegrations } from '../../hooks/useIntegrations';
import { redirectToPlatformAuth, OAuthManager } from '../../utils/oauth-manager';
import { fetchGoogleOAuthProfile, extractOAuthParams, validateOAuthParams } from '../../utils/google-oauth-handler';
import { connectGoogleAccount, refreshGoogleTokens } from '../../store/slices/googleSlice';
import { fetchFacebookOAuthProfile, extractFacebookOAuthParams, validateFacebookOAuthParams } from '../../utils/facebook-oauth-handler';
import { connectMetaAccount, refreshMetaTokens } from '../../store/slices/facebookSlice';
// TikTok and Shopify integrations removed - currently targeting only Google and Meta
import { useDispatch } from 'react-redux';
import SA360CampaignAssetsTest from './SA360CampaignAssetsTest';


const IntegrationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    integrations,
    loading,
    error,
    filters,
    viewMode,
    showFilters,
    showWelcomeBanner,
    updateSearchFilter,
    updateStatusFilter,
    updatePaymentStatusFilter,
    updateIntegrationTypeFilter,
    toggleFiltersVisibility,
    updateViewMode,
    hideBanner,
    editIntegration,
    removeIntegration,
    loadIntegrations
  } = useIntegrations();

  // Local state for connection loading
  const [connectingPlatforms, setConnectingPlatforms] = useState(new Set());
  const [disconnectingPlatforms, setDisconnectingPlatforms] = useState(new Set());
  const [oauthProcessing, setOauthProcessing] = useState(false);
  const [oauthData, setOauthData] = useState(null);
  const [oauthError, setOauthError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [navigating, setNavigating] = useState(false);
  

  
  const dispatch = useDispatch();

  // Load integrations when component mounts
  useEffect(() => {
    loadIntegrations();
  }, []);

  // Handle OAuth callback on component mount
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');
      console.log("Test",code, state, error);
      
      if (code && state === 'google') {
        // Handle Google OAuth callback
        handleGoogleOAuthCallback(code);
        
        // Clean up URL
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } else if (code && state === 'meta') {
        // Handle Facebook OAuth callback
        handleFacebookOAuthCallback(code);
        
        // Clean up URL
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } else if (code && state) {
        // Handle other OAuth callbacks (Google, Meta, etc.)
        if (state === 'google' || state === 'meta') {
          handleOAuthCallback(state, code);
          
          // Clean up URL
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } else if (error) {
        console.error('OAuth error:', error);
        setOauthError(error);
        
        // Clean up URL
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    };

    handleOAuthCallback();
  }, []);

  const handleGoogleOAuthCallback = async (code) => {
    try {
      setOauthProcessing(true);
      setOauthError(null);
      setOauthData(null);
      
      console.log('Processing Google OAuth callback with code:', code);
      
      // Fetch OAuth profile using the new approach
      const oauthData = await fetchGoogleOAuthProfile(code);
      setOauthData(oauthData);
      
      console.log('Google OAuth profile data:', oauthData);
      
      // Connect the Google account
      const result = await dispatch(connectGoogleAccount(oauthData)).unwrap();
      console.log('Google account connected successfully:', result);
      
      // Refresh integrations to show the new connection
      loadIntegrations();
      
    } catch (error) {
      console.error('Error processing Google OAuth callback:', error);
      setOauthError(error.message || 'Failed to process Google OAuth callback');
    } finally {
      setOauthProcessing(false);
    }
  };

  const handleFacebookOAuthCallback = async (code) => {
    try {
      setOauthProcessing(true);
      setOauthError(null);
      setOauthData(null);
      
      console.log('Processing Facebook OAuth callback with code:', code);
      
      // Fetch OAuth profile using the Facebook handler
      const oauthData = await fetchFacebookOAuthProfile(code);
      setOauthData(oauthData);
      
      console.log('Facebook OAuth profile data:', oauthData);
      
      // Connect the Facebook account
      const result = await dispatch(connectMetaAccount(oauthData)).unwrap();
      console.log('Facebook account connected successfully:', result);
      
      // Refresh integrations to show the new connection
      loadIntegrations();
      
    } catch (error) {
      console.error('Error processing Facebook OAuth callback:', error);
      setOauthError(error.message || 'Failed to process Facebook OAuth callback');
    } finally {
      setOauthProcessing(false);
    }
  };

  // TikTok and Shopify OAuth handlers removed - currently targeting only Google and Meta





  const handleOAuthCallback = async (platform, code) => {
    try {
      // Simulate OAuth callback processing
      console.log(`Processing OAuth callback for ${platform}`, { code });
      
      // For Google OAuth, simulate the actual payload structure
      if (platform === 'google') {
        // Simulate the actual Google OAuth response payload
        const googleOAuthPayload = {
          user_data: {
            id: "113057969003083685143",
            name: "Muhammad Yasir Ismail",
            email: "yasirismail321@gmail.com",
            picture: "https://lh3.googleusercontent.com/a/ACg8ocKTLSKHweADG5F8trpI1J6EtPHaxLZkOCTCtWgAaHw5jelNeuxh=s96-c"
          },
          token_data: {
            access_token: "ya29.xxx",
            refresh_token: "1//xxx",
            expires_in: 3599,
            scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/doubleclicksearch"
          }
        };
        
        // Log the complete payload to console
        console.log('Google OAuth Success Payload:', googleOAuthPayload);
        console.log('User Data:', googleOAuthPayload.user_data);
        console.log('Token Data:', googleOAuthPayload.token_data);
        
        // Show success message but don't redirect
        console.log('Google OAuth login successful! User is logged in but staying on current page.');
        
        // Update the integration with the real user data
        const integration = integrations.find(integ => 
          integ.integrations.some(platform => platform.type === 'google')
        );
        
        if (integration) {
          await editIntegration(integration.id, {
            ...integration,
            status: 'active',
            updatedDate: new Date().toLocaleDateString('en-GB'),
            userData: {
              name: googleOAuthPayload.user_data.name,
              email: googleOAuthPayload.user_data.email,
              image: googleOAuthPayload.user_data.picture
            }
          });
        }
        
        // Don't redirect to dashboard - stay on current page
        return;
      }
      
      // For other platforms, use the existing logic
      // Here you would typically:
      // 1. Exchange code for tokens
      // 2. Fetch user data
      // 3. Update integration status
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Find the integration for this platform and update it
      const integration = integrations.find(integ => 
        integ.integrations.some(platform => platform.type === platform)
      );
      
      if (integration) {
        // Mock user data that would come from OAuth
        const mockUserData = {
          name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} User`,
          email: `user@${platform}.com`,
          image: null
        };
        
        await editIntegration(integration.id, {
          ...integration,
          status: 'active',
          updatedDate: new Date().toLocaleDateString('en-GB'),
          userData: mockUserData
        });
      }
      
    } catch (error) {
      console.error('Error processing OAuth callback:', error);
    } finally {
      setConnectingPlatforms(prev => {
        const newSet = new Set(prev);
        newSet.delete(platform);
        return newSet;
      });
    }
  };

  const handleView = (id) => {
    console.log('View integration:', id);
    
    // Set navigating state
    setNavigating(true);
    
    // Find the integration by ID
    const integration = integrations.find(integ => integ.id === id);
    if (!integration) {
      console.error('Integration not found:', id);
      setNavigating(false);
      return;
    }
    
    // Get the primary platform type
    const primaryPlatform = integration.integrations.find(p => p.status === 'active') || integration.integrations[0];
    const platformType = primaryPlatform?.type || 'google';
    
    console.log('Platform type:', platformType);
    console.log('Integration data:', integration);
    console.log('Primary platform:', primaryPlatform);
    
    // Navigate to appropriate dashboard based on platform type
    if (platformType === 'google') {
      console.log('Navigating to Google Dashboard');
      navigate('/google');
    } else if (platformType === 'meta') {
      console.log('Navigating to Facebook Dashboard');
      navigate(`/meta/${id}`);
    } else {
      console.log('Navigating to Platform Dashboard');
      navigate(`/platform/${id}`);
    }
    
    // Reset navigating state after a short delay
    setTimeout(() => setNavigating(false), 1000);
  };

  const handleEdit = (id) => {
    console.log('Edit integration:', id);
  };

  const handleDuplicate = (id) => {
    console.log('Duplicate integration:', id);
  };

  const handleDelete = (id) => {
    console.log('Delete integration:', id);
    removeIntegration(id);
  };

  const handleConnect = async (integration) => {
    const platformType = integration.integrations[0]?.type || 'google';
    
    try {
      setConnectingPlatforms(prev => new Set(prev).add(platformType));
      
      // Handle different platform OAuth flows (currently only Google and Meta supported)
      if (platformType === 'google') {
        // Use OAuth manager for Google
        OAuthManager.setActiveRequest(platformType, 'google');
        redirectToPlatformAuth(platformType);
      } else {
        // Use OAuth manager for other platforms
        OAuthManager.setActiveRequest(platformType);
        redirectToPlatformAuth(platformType);
      }
      
    } catch (error) {
      console.error('Error initiating connection:', error);
      setConnectingPlatforms(prev => {
        const newSet = new Set(prev);
        newSet.delete(platformType);
        return newSet;
      });
    }
  };



  const handleRefreshTokens = async (integration) => {
    const platformType = integration.integrations[0]?.type || 'google';
    
    try {
      setConnectingPlatforms(prev => new Set(prev).add(platformType));
      
      // Get the account ID from the integration data
      const accountId = integration.platformData?.accountId || integration.id;
      
      console.log(`Refreshing ${platformType} tokens for account:`, accountId);
      
      let result;
      
      // Handle different platform refresh token flows
      switch (platformType) {
        case 'google':
          result = await dispatch(refreshGoogleTokens(accountId)).unwrap();
          console.log('Google tokens refreshed successfully:', result);
          break;
          
        case 'meta':
          result = await dispatch(refreshMetaTokens(accountId)).unwrap();
          console.log('Meta tokens refreshed successfully:', result);
          break;
          
        default:
          console.log(`Refresh tokens not implemented for ${platformType}`);
          return;
      }
      
      // Update the integration status
      await editIntegration(integration.id, {
        ...integration,
        status: 'active',
        updatedDate: new Date().toLocaleDateString('en-GB')
      });
      
      // Show success message
      setSuccess(`${platformType.charAt(0).toUpperCase() + platformType.slice(1)} tokens refreshed successfully!`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      
      // Check if the error is about no refresh token available
      if (error.message && error.message.includes('No refresh token available')) {
        // Update the integration status to inactive so it shows connect button
        await editIntegration(integration.id, {
          ...integration,
          status: 'inactive',
          updatedDate: new Date().toLocaleDateString('en-GB')
        });
        
        setOauthError('No refresh token available. Please reconnect your account.');
      } else {
        setOauthError(error.message || 'Failed to refresh tokens');
      }
    } finally {
      setConnectingPlatforms(prev => {
        const newSet = new Set(prev);
        newSet.delete(platformType);
        return newSet;
      });
    }
  };

  const handleDisconnect = async (integration) => {
    const platformType = integration.integrations[0]?.type || 'google';
    
    try {
      setDisconnectingPlatforms(prev => new Set(prev).add(platformType));
      
      // Here you would typically:
      // 1. Revoke OAuth tokens
      // 2. Clear stored credentials
      // 3. Update the integration status
      
      // Simulate disconnection process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await editIntegration(integration.id, {
        ...integration,
        status: 'inactive',
        updatedDate: new Date().toLocaleDateString('en-GB')
      });
      
    } catch (error) {
      console.error('Error disconnecting:', error);
    } finally {
      setDisconnectingPlatforms(prev => {
        const newSet = new Set(prev);
        newSet.delete(platformType);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">Error loading integrations: {error}</p>
        <button 
          onClick={loadIntegrations}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      {showWelcomeBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">{t('integrations.welcome', { name: 'Andreas' })} 👋</h2>
              <p className="text-blue-100">
                {t('integrations.welcomeMessage')}
                {integrations.length > 0 && (
                  <span className="block mt-1">
                    {t('integrations.platformsAvailable', { 
                      count: integrations.length, 
                      connected: integrations.filter(integ => integ.status === 'active').length 
                    })}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md">
                {t('integrations.addNewPlatform')}
              </button>
              <button
                onClick={hideBanner}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* OAuth Processing Status */}
      {oauthProcessing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('integrations.processingOAuthCallback')}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {t('integrations.connectingYourAccount')}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* OAuth Success Message */}
      {oauthData && !oauthProcessing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                {t('integrations.accountConnectedSuccessfully')}
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {oauthData.user_data?.name || t('common.user')} ({oauthData.user_data?.email || t('common.noEmail')})
                {oauthData.pages_data && oauthData.pages_data.length > 0 && (
                  <span className="block mt-1">
                    {t('integrations.foundPages', { count: oauthData.pages_data.length, defaultValue: `Found ${oauthData.pages_data.length} page${oauthData.pages_data.length !== 1 ? 's' : ''}` })}
                  </span>
                )}
                {oauthData.advertiser_accounts && oauthData.advertiser_accounts.length > 0 && (
                  <span className="block mt-1">
                    {t('integrations.foundAdvertiserAccounts', { count: oauthData.advertiser_accounts.length, defaultValue: `Found ${oauthData.advertiser_accounts.length} advertiser account${oauthData.advertiser_accounts.length !== 1 ? 's' : ''}` })}
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      )}



      {/* OAuth Error Message */}
      {oauthError && !oauthProcessing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {t('integrations.oauthConnectionFailed')}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {oauthError}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* OAuth Success Message */}
      {success && !oauthProcessing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                {t('integrations.oauthConnectionSuccessful')}
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {success}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Title and Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('integrations.title')}
            </h1>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
              {integrations.length} {t('integrations.platforms')}
              {integrations.filter(integ => integ.status === 'active').length > 0 && (
                <span className="ml-1 text-green-600 dark:text-green-400">
                  • {integrations.filter(integ => integ.status === 'active').length} {t('integrations.connected')}
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => updateViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Archived Button */}
            <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200">
              <ArchiveBoxIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{t('integrations.archived')}</span>
            </button>

            {/* Show Filters Button */}
            <button
              onClick={toggleFiltersVisibility}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                showFilters
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{t('integrations.showFilters')}</span>
            </button>





            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('integrations.searchIntegrations')}
                value={filters.search}
                onChange={(e) => updateSearchFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Manual Refresh Button - Only in development */}
            {import.meta.env.DEV && (
              <button
                onClick={loadIntegrations}
                disabled={loading}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium"
              >
                {loading ? t('common.loading') : t('integrations.refreshAPI')}
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('integrations.platformType')}
                </label>
                <select 
                  value={filters.integrationType}
                  onChange={(e) => updateIntegrationTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">{t('integrations.allPlatforms')}</option>
                  <option value="google">{t('integrations.googleAds')}</option>
                  <option value="meta">{t('integrations.metaAds')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('integrations.connectionStatus')}
                </label>
                <select 
                  value={filters.status}
                  onChange={(e) => updateStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">{t('integrations.allStatus')}</option>
                  <option value="active">{t('integrations.connected')}</option>
                  <option value="inactive">{t('integrations.notConnected')}</option>
                  <option value="error">{t('common.error')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('integrations.accountType')}
                </label>
                <select 
                  value={filters.paymentStatus}
                  onChange={(e) => updatePaymentStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">{t('integrations.allTypes')}</option>
                  <option value="paid">{t('integrations.paid')}</option>
                  <option value="free">{t('integrations.free')}</option>
                  <option value="trial">{t('integrations.trial')}</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* SA360 Campaign Assets API Test */}
      <div className="mb-6">
        <SA360CampaignAssetsTest />
      </div>

      {/* Integrations Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' 
          : 'grid-cols-1'
      }`}>
        {integrations.map((integration) => {
          // Get the primary platform (first active one, or first one if none active)
          const primaryPlatform = integration.integrations.find(p => p.status === 'active') || integration.integrations[0];
          const platformType = primaryPlatform?.type || 'google';
          const isConnecting = connectingPlatforms.has(platformType);
          const isDisconnecting = disconnectingPlatforms.has(platformType);
          
          return (
            <IntegrationCard
              key={integration.id}
              {...integration}
              userData={integration.userData}
              platformData={integration.platformData}
              onView={() => handleView(integration.id)}
              onEdit={() => handleEdit(integration.id)}
              onDuplicate={() => handleDuplicate(integration.id)}
              onDelete={() => handleDelete(integration.id)}
              onConnect={() => handleConnect(integration)}
              onDisconnect={() => handleDisconnect(integration)}
              onRefreshTokens={() => handleRefreshTokens(integration)}
              isConnecting={isConnecting}
              isDisconnecting={isDisconnecting}
              isNavigating={navigating}
            />
          );
        })}
      </div>

      {/* Empty State */}
      {integrations.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('integrations.noIntegrations')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filters.search ? t('common.search') : t('integrations.connectFirst')}
          </p>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium">
            {t('integrations.connectIntegration')}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default IntegrationsPage; 