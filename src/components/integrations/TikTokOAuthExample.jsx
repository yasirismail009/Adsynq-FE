import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  connectTikTokAccount 
} from '../../store/slices/tiktokSlice';
import { redirectToTikTokAuth } from '../../utils/tiktok-oauth-handler';
import { exchangeCodeForTokenAndProfile } from '../../utils/tiktok-api';

const TikTokOAuthExample = ({ onRefresh, router }) => {
  const dispatch = useDispatch();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const fetchUserProfile = useCallback(async (code) => {
    if (isProcessingOAuth) {
      console.log('⚠️ OAuth already in progress, skipping duplicate request');
      return;
    }

    console.log('=== fetchUserProfile called with code ===', code);
    setIsProcessingOAuth(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Call the TikTok Business API directly to get token and user profile
      const profileData = await exchangeCodeForTokenAndProfile(code);
      console.log('Profile data from API:', profileData);
      
      const { user_data, token_data, advertiser_data } = profileData;
      console.log('Profile payload:', { user_data, token_data, advertiser_data });
      
      // Connect the TikTok account using Redux
      const connectResult = await dispatch(connectTikTokAccount({
        user_data,
        token_data,
        advertiser_data
      }));
      console.log('connectResult:', connectResult);
      
      if (connectTikTokAccount.fulfilled.match(connectResult)) {
        console.log('TikTok account connected successfully');
        setSuccess('TikTok account connected successfully!');
        
        // Refetch connections to update the UI
        if (onRefresh) {
          await onRefresh();
        }
        
        // Refresh router if available
        if (router && router.refresh) {
          router.refresh();
        }
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        console.error('TikTok connection failed:', connectResult);
        setError('Failed to connect TikTok account');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setError(error.message || 'An error occurred during OAuth processing');
    } finally {
      setIsProcessingOAuth(false);
    }
  }, [dispatch, isProcessingOAuth, onRefresh, router]);

  const handleTikTokConnect = () => {
    setError(null);
    setSuccess(null);
    redirectToTikTokAuth();
  };

  const handleOAuthCallback = (code) => {
    fetchUserProfile(code);
  };

  return (
    <div className="space-y-6">
      {/* TikTok OAuth Integration Example */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                TikTok OAuth Integration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect your TikTok Business account
              </p>
            </div>
          </div>
          
          <button
            onClick={handleTikTokConnect}
            disabled={isProcessingOAuth}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isProcessingOAuth
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800 text-white'
            }`}
          >
            {isProcessingOAuth ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
                <span>Connect TikTok</span>
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 dark:text-green-200 font-medium">{success}</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Integration Details */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                OAuth Flow
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Redirect to TikTok OAuth</li>
                <li>• Exchange code for token</li>
                <li>• Fetch user & business data</li>
                <li>• Store connection data</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Data Retrieved
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• User profile information</li>
                <li>• Business account details</li>
                <li>• Analytics & metrics</li>
                <li>• Audience demographics</li>
              </ul>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              How to Use
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p>1. Click "Connect TikTok" to start OAuth flow</p>
              <p>2. Complete authorization on TikTok</p>
              <p>3. Handle callback with <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">handleOAuthCallback(code)</code></p>
              <p>4. Use <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">fetchUserProfile(code)</code> to process the connection</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TikTokOAuthExample; 