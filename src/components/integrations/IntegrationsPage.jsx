import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Squares2X2Icon,
  ListBulletIcon,
  ArchiveBoxIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import IntegrationCard from './IntegrationCard';
import CustomerSelectionDialog from './CustomerSelectionDialog';
import MetaAdAccountSelectionDialog from './MetaAdAccountSelectionDialog';
import { useIntegrations } from '../../hooks/useIntegrations';
import { useSubscription } from '../../hooks/useSubscription';
import { redirectToPlatformAuth, OAuthManager } from '../../utils/oauth-manager';
import { fetchCurrentSubscription } from '../../store/slices/subscriptionSlice';
import { apiService } from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../hooks/useToast';
import { fetchGoogleOAuthProfile, extractOAuthParams, validateOAuthParams } from '../../utils/google-oauth-handler';
import { connectGoogleAccount, refreshGoogleTokens } from '../../store/slices/googleSlice';
import { fetchFacebookOAuthProfile, extractFacebookOAuthParams, validateFacebookOAuthParams } from '../../utils/facebook-oauth-handler';
import { connectMetaAccount, refreshMetaTokens, disconnectAndDeleteMetaAccount } from '../../store/slices/facebookSlice';
import { disconnectAndDeleteGoogleAccount } from '../../store/slices/googleSlice';
import { updateIntegration } from '../../store/slices/integrationsSlice';
import { showSubscriptionDialog } from '../../store/slices/subscriptionSlice';
// TikTok and Shopify integrations removed - currently targeting only Google and Meta
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store/hooks';
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
    removeIntegration,
    loadIntegrations
  } = useIntegrations();

  // Get subscription status from Redux
  const { hasSubscription, plan, planType, subscription } = useSubscription();

  console.log('IntegrationsPage subscription:', subscription);

  // Local state for connection loading
  const [connectingPlatforms, setConnectingPlatforms] = useState(new Set());
  const [disconnectingPlatforms, setDisconnectingPlatforms] = useState(new Set());
  const [oauthProcessing, setOauthProcessing] = useState(false);
  const [oauthData, setOauthData] = useState(null);
  const [oauthError, setOauthError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [navigating, setNavigating] = useState(false);
  
  // Customer selection modal state
  const [showCustomerSelection, setShowCustomerSelection] = useState(false);
  const [availableCustomers, setAvailableCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  
  // Meta ad account selection modal state
  const [showMetaAdAccountSelection, setShowMetaAdAccountSelection] = useState(false);
  const [availableMetaAdAccounts, setAvailableMetaAdAccounts] = useState([]);
  const [loadingMetaAdAccounts, setLoadingMetaAdAccounts] = useState(false);

  // Platform connections state
  const [platformConnections, setPlatformConnections] = useState(null);
  const [loadingConnections, setLoadingConnections] = useState(false);
  
  // Refs to prevent duplicate API calls
  const hasFetchedCustomersRef = useRef(false);
  const hasFetchedMetaAccountsRef = useRef(false);
  const hasInitializedRef = useRef(false);
  
  const dispatch = useDispatch();

  // Fetch available customers for selection
  const fetchAvailableCustomers = useCallback(async () => {
    if (hasFetchedCustomersRef.current || loadingCustomers) {
      console.log('Skipping duplicate customers fetch');
      return;
    }
    
    console.log('Fetching available customers...');
    hasFetchedCustomersRef.current = true;
    setLoadingCustomers(true);
    try {
      const response = await apiService.marketing.getCustomers();
      console.log('Customers API response:', response);
      if (response.data.error === false && response.data.result) {
        const customers = response.data.result.customers || [];
        console.log('Setting customers:', customers);
        setAvailableCustomers(customers);
      } else {
        console.log('API returned error or no data:', response.data);
        hasFetchedCustomersRef.current = false; // Allow retry on error
      }
    } catch (error) {
      console.error('Failed to fetch available customers:', error);
      hasFetchedCustomersRef.current = false; // Allow retry on error
    } finally {
      setLoadingCustomers(false);
    }
  }, [loadingCustomers]);

  // Fetch available Meta ad accounts for selection
  const fetchAvailableMetaAdAccounts = useCallback(async () => {
    if (hasFetchedMetaAccountsRef.current || loadingMetaAdAccounts) {
      console.log('Skipping duplicate Meta ad accounts fetch');
      return;
    }
    
    console.log('Fetching Meta ad accounts...');
    hasFetchedMetaAccountsRef.current = true;
    setLoadingMetaAdAccounts(true);
    try {
      const response = await apiService.marketing.getAdAccountsList();
      console.log('Meta ad accounts API response:', response);
      if (response.data.error === false && response.data.result) {
        const adAccounts = response.data.result.ad_accounts || [];
        console.log('Setting Meta ad accounts:', adAccounts);
        setAvailableMetaAdAccounts(adAccounts);
      } else {
        console.log('API returned error or no data:', response.data);
        hasFetchedMetaAccountsRef.current = false; // Allow retry on error
      }
    } catch (error) {
      console.error('Failed to fetch Meta ad accounts:', error);
      hasFetchedMetaAccountsRef.current = false; // Allow retry on error
    } finally {
      setLoadingMetaAdAccounts(false);
    }
  }, [loadingMetaAdAccounts]);

  // Handle customer selection (legacy - for single customer)
  const handleCustomerSelect = async (customerId) => {
    try {
      setLoadingCustomers(true);
      await apiService.marketing.selectGoogleCustomer(customerId);

      // Refresh subscription data to reflect the selection
      await dispatch(fetchCurrentSubscription());

      showSuccessToast('Customer selected successfully!');
      setShowCustomerSelection(false);
    } catch (error) {
      console.error('Failed to select customer:', error);
      showErrorToast('Failed to select customer. Please try again.');
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Handle bulk selection (customers and campaigns) for Google
  const handleBulkSelect = async (data) => {
    try {
      setLoadingCustomers(true);
      const response = await apiService.marketing.bulkSelectGoogleEntities(data);

      if (response.data.error === false) {
        // Refresh subscription data to reflect the selection
        await dispatch(fetchCurrentSubscription());
        
        // Refresh platform connections
        await fetchPlatformConnections();

        // Use the API response message or create a detailed message
        const result = response.data.result;
        let successMessage = response.data.message || 'Selection completed successfully!';
        
        if (result?.summary) {
          const summary = result.summary;
          const customerCount = summary.customers?.selected || 0;
          const campaignCount = summary.campaigns?.selected || 0;
          
          if (customerCount > 0 && campaignCount > 0) {
            successMessage = `${customerCount} customer(s) and ${campaignCount} campaign(s) selected successfully!`;
          } else if (customerCount > 0) {
            successMessage = `${customerCount} customer(s) selected successfully!`;
          }
        }

        showSuccessToast(successMessage);
        setShowCustomerSelection(false);
      } else {
        throw new Error(response.data.message || 'Failed to select customers and campaigns');
      }
    } catch (error) {
      console.error('Failed to select customers and campaigns:', error);
      showErrorToast(error.response?.data?.message || 'Failed to select customers and campaigns. Please try again.');
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Handle Meta ad account selection (bulk select)
  const handleMetaAdAccountSelect = async (data) => {
    try {
      setLoadingMetaAdAccounts(true);
      const response = await apiService.marketing.bulkSelectMetaEntities(data);

      if (response.data.error === false) {
        // Refresh subscription data to reflect the selection
        await dispatch(fetchCurrentSubscription());
        
        // Refresh platform connections
        await fetchPlatformConnections();

        // Use the API response message or create a detailed message
        const result = response.data.result;
        let successMessage = response.data.message || 'Selection completed successfully!';
        
        if (result?.summary) {
          const summary = result.summary;
          const accountCount = summary.ad_accounts?.selected || 0;
          const campaignCount = summary.campaigns?.selected || 0;
          
          if (accountCount > 0 && campaignCount > 0) {
            successMessage = `${accountCount} ad account(s) and ${campaignCount} campaign(s) selected successfully!`;
          } else if (accountCount > 0) {
            successMessage = `${accountCount} ad account(s) selected successfully!`;
          }
        }

        showSuccessToast(successMessage);
        setShowMetaAdAccountSelection(false);
      } else {
        throw new Error(response.data.message || 'Failed to select ad accounts and campaigns');
      }
    } catch (error) {
      console.error('Failed to select Meta ad accounts and campaigns:', error);
      showErrorToast(error.response?.data?.message || 'Failed to select ad accounts and campaigns. Please try again.');
    } finally {
      setLoadingMetaAdAccounts(false);
    }
  };

  // Fetch platform connections
  const fetchPlatformConnections = useCallback(async () => {
    if (loadingConnections) {
      console.log('Skipping duplicate platform connections fetch');
      return;
    }
    
    setLoadingConnections(true);
    try {
      const response = await apiService.marketing.platformConnections();
      if (response.data.error === false && response.data.result) {
        setPlatformConnections(response.data.result);
      }
    } catch (error) {
      console.error('Failed to fetch platform connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  }, [loadingConnections]);

  // Load integrations and ensure subscription data is available
  useEffect(() => {
    if (hasInitializedRef.current) {
      console.log('Skipping duplicate initialization');
      return;
    }
    
    hasInitializedRef.current = true;
    console.log('Initializing IntegrationsPage - loading data');
    loadIntegrations();
    fetchPlatformConnections();

    // Ensure subscription data is loaded
    if (!subscription) {
      console.log('Subscription not available, fetching...');
      dispatch(fetchCurrentSubscription());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if customer/ad account selection modal should be shown
  useEffect(() => {
    // Skip if subscription is not loaded yet
    if (!subscription) {
      return;
    }

    console.log('Selection modal check:', {
      subscription,
      hasGoogleAccount: subscription?.has_google_account,
      googleHasSelected: subscription?.google_customer_status?.has_selected,
      hasMetaAccount: subscription?.has_meta_account,
      metaHasSelected: subscription?.meta_ad_account_status?.has_selected
    });

    // Check for Google - show modal
    if (subscription.has_google_account && !subscription.google_customer_status?.has_selected) {
      console.log('Showing Google customer selection modal');
      fetchAvailableCustomers();
      setShowCustomerSelection(true);
      setShowMetaAdAccountSelection(false); // Close Meta modal if open
      return;
    }
    
    // Check for Meta - show modal
    if (subscription.has_meta_account && !subscription.meta_ad_account_status?.has_selected) {
      console.log('Showing Meta ad account selection modal');
      fetchAvailableMetaAdAccounts();
      setShowMetaAdAccountSelection(true);
      setShowCustomerSelection(false); // Close Google modal if open
      return;
    }
    
    console.log('Hiding selection modals - accounts already selected');
    setShowCustomerSelection(false);
    setShowMetaAdAccountSelection(false);
  }, [subscription, fetchAvailableCustomers, fetchAvailableMetaAdAccounts]);

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
      
      // Navigate to account selection page
      const integration = integrations.find(integ =>
        integ.integrations.some(platform => platform.type === 'google')
      );
      navigate(`/integrations/select-accounts?platform=google&integrationId=${integration?.id}`);

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
      
      // Navigate to account selection page
      const integration = integrations.find(integ =>
        integ.integrations.some(platform => platform.type === 'meta')
      );
      navigate(`/integrations/select-accounts?platform=meta&integrationId=${integration?.id}`);

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
        
        // Navigate to account selection page
        navigate(`/integrations/select-accounts?platform=google&integrationId=${integration?.id}`);
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

  const handleEmptyStateConnect = () => {
    // Show subscription dialog when user tries to connect with no integrations
    dispatch(showSubscriptionDialog());
  };

  const handleSubscribe = () => {
    // Navigate to pricing page when user needs to subscribe
    navigate('/pricing');
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
      
      // Update the integration status using Redux
      await dispatch(updateIntegration({
        id: integration.id,
        data: {
          ...integration,
          status: 'active',
          updatedDate: new Date().toLocaleDateString('en-GB')
        }
      })).unwrap();
      
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
        await dispatch(updateIntegration({
          id: integration.id,
          data: {
            ...integration,
            status: 'inactive',
            updatedDate: new Date().toLocaleDateString('en-GB')
          }
        })).unwrap();
        
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
    const connectionId = integration.platformData?.accountId || integration.id;

    try {
      setDisconnectingPlatforms(prev => new Set(prev).add(platformType));
      setOauthError(null);

      let result;

      if (platformType === 'google') {
        // Use Redux thunk for Google disconnect and delete
        result = await dispatch(disconnectAndDeleteGoogleAccount(connectionId)).unwrap();
      } else if (platformType === 'meta') {
        // Use Redux thunk for Meta disconnect and delete
        result = await dispatch(disconnectAndDeleteMetaAccount(connectionId)).unwrap();
      }

      if (result.success) {
        console.log(`Successfully disconnected ${platformType} account. Deleted ${result.data.deleted_counts.total_records} records`);

        // Update the integration status to inactive using Redux
        await dispatch(updateIntegration({
          id: integration.id,
          data: {
            ...integration,
            status: 'inactive',
            updatedDate: new Date().toLocaleDateString('en-GB'),
            userData: null // Clear user data since account is disconnected
          }
        })).unwrap();

        // Show success message
        setSuccess(`${platformType.charAt(0).toUpperCase() + platformType.slice(1)} account disconnected successfully!`);

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 5000);

      } else {
        throw new Error(result.message || 'Failed to disconnect account');
      }

    } catch (error) {
      console.error('Error disconnecting:', error);
      setOauthError(error.message || 'Failed to disconnect account');
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
          
          // Get Google account data if this is a Google integration
          const googleAccounts = platformType === 'google' && platformConnections?.google_accounts ? platformConnections.google_accounts : null;
          
          // Get Meta connections data if this is a Meta integration
          const metaConnections = platformType === 'meta' && platformConnections?.meta_connections ? platformConnections.meta_connections : null;
          
          console.log('IntegrationsPage - Integration:', integration.id, 'platformType:', platformType, 'googleAccounts:', googleAccounts, 'metaConnections:', metaConnections, 'platformConnections:', platformConnections);
          
          return (
            <IntegrationCard
              key={integration.id}
              {...integration}
              userData={integration.userData}
              platformData={integration.platformData}
              googleAccounts={googleAccounts}
              metaConnections={metaConnections}
              onView={() => handleView(integration.id)}
              onEdit={() => handleEdit(integration.id)}
              onDuplicate={() => handleDuplicate(integration.id)}
              onDelete={() => handleDelete(integration.id)}
              onConnect={() => handleConnect(integration)}
              onDisconnect={() => handleDisconnect(integration)}
              onRefreshTokens={() => handleRefreshTokens(integration)}
              onSubscribe={handleSubscribe}
              hasSubscription={hasSubscription}
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
          <button
            onClick={!hasSubscription ? handleSubscribe : handleEmptyStateConnect}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            {!hasSubscription ? t('integrations.subscribe') : t('integrations.connectIntegration')}
          </button>
        </motion.div>
      )}

      {/* Customer Selection Dialog (Google) */}
      <CustomerSelectionDialog
        isOpen={showCustomerSelection}
        onClose={() => setShowCustomerSelection(false)}
        availableCustomers={availableCustomers}
        loadingCustomers={loadingCustomers}
        onCustomerSelect={handleCustomerSelect}
        onSubmit={handleBulkSelect}
        onRetry={fetchAvailableCustomers}
      />

      {/* Meta Ad Account Selection Dialog */}
      <MetaAdAccountSelectionDialog
        isOpen={showMetaAdAccountSelection}
        onClose={() => setShowMetaAdAccountSelection(false)}
        availableAdAccounts={availableMetaAdAccounts}
        loadingAdAccounts={loadingMetaAdAccounts}
        onSubmit={handleMetaAdAccountSelect}
        onRetry={fetchAvailableMetaAdAccounts}
      />
    </div>
  );
};

export default IntegrationsPage; 