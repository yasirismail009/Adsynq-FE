import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { 
  redirectToShopifyAuth, 
  validateShopifyDomain, 
  formatShopifyDomain,
  testShopifyOAuthConfig,
  createMockShopifyConnectionData
} from '../../utils/shopify-oauth-handler';
import { connectShopifyAccount } from '../../store/slices/shopifySlice';
import { useDispatch } from 'react-redux';

const ShopifyOAuthExample = () => {
  const [shopDomain, setShopDomain] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const dispatch = useDispatch();

  const handleConnect = async () => {
    console.log('🔄 Shopify connect button clicked');
    console.log('Current shop domain:', shopDomain);
    
    if (!shopDomain.trim()) {
      setError('Please enter a Shopify store domain');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      setSuccess(null);
      setConnectionStatus('validating');

      // Format the shop domain
      const formattedShop = formatShopifyDomain(shopDomain);
      console.log('Formatted shop domain:', formattedShop);
      
      // Validate the domain
      if (!validateShopifyDomain(formattedShop)) {
        throw new Error('Invalid Shopify domain format. Please use format: mystore.myshopify.com');
      }

      setConnectionStatus('redirecting');
      
      // Test configuration
      const config = testShopifyOAuthConfig();
      console.log('Shopify config test result:', config);
      if (!config.isConfigured) {
        throw new Error('Shopify OAuth not configured. Please set VITE_SHOPIFY_CLIENT_ID and VITE_SHOPIFY_REDIRECT_URI');
      }

      // Redirect to Shopify OAuth
      console.log('Redirecting to Shopify OAuth...');
      redirectToShopifyAuth(formattedShop);
      
    } catch (err) {
      console.error('Shopify connection error:', err);
      setError(err.message);
      setConnectionStatus(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConfig = () => {
    const config = testShopifyOAuthConfig();
    console.log('Shopify OAuth Configuration:', config);
    
    if (config.isConfigured) {
      setSuccess('✅ Shopify OAuth is properly configured!');
    } else {
      setError('❌ Shopify OAuth configuration is missing. Please check your environment variables.');
    }
  };

  const handleTestMockConnection = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setSuccess(null);
      
      const mockData = createMockShopifyConnectionData('test-store.myshopify.com');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Mock Shopify connection data:', mockData);
      setSuccess('✅ Mock Shopify connection test completed! Check console for data.');
      
    } catch (err) {
      console.error('Mock connection error:', err);
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'validating':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'redirecting':
        return <ArrowRightIcon className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return <ShoppingBagIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'validating':
        return 'Validating domain...';
      case 'redirecting':
        return 'Redirecting to Shopify...';
      default:
        return 'Ready to connect';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
          <ShoppingBagIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Shopify OAuth Test
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Test Shopify OAuth connection flow
          </p>
        </div>
      </div>

      {/* Configuration Test */}
      <div className="mb-6">
        <button
          onClick={handleTestConfig}
          className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
        >
          Test Configuration
        </button>
      </div>

      {/* Mock Connection Test */}
      <div className="mb-6">
        <button
          onClick={handleTestMockConnection}
          disabled={isConnecting}
          className="px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50"
        >
          Test Mock Connection
        </button>
      </div>

      {/* Input Test */}
      <div className="mb-6">
        <button
          onClick={() => {
            console.log('🔄 Testing input - current value:', shopDomain);
            setShopDomain('test-store.myshopify.com');
            console.log('🔄 Set test value');
          }}
          className="px-4 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors"
        >
          Test Input (Set Test Value)
        </button>
      </div>

      {/* Connection Form */}
      <div className="space-y-4">
        <div>
          <label htmlFor="shopDomain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Shopify Store Domain
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="shopDomain"
              value={shopDomain}
              onChange={(e) => {
                console.log('🔄 Shopify input changed:', e.target.value);
                setShopDomain(e.target.value);
              }}
              placeholder="mystore.myshopify.com"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleConnect}
              disabled={isConnecting || !shopDomain.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {getStatusIcon()}
              <span>Connect</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter your Shopify store domain (e.g., mystore.myshopify.com)
          </p>
        </div>

        {/* Status Display */}
        {connectionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400"
          >
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </motion.div>
        )}

        {/* Success Display */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Instructions:
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Enter your Shopify store domain (e.g., mystore.myshopify.com)</li>
          <li>• Click "Connect" to start the OAuth flow</li>
          <li>• You'll be redirected to Shopify for authorization</li>
          <li>• After authorization, you'll be redirected back to this app</li>
          <li>• The connection will be processed automatically</li>
        </ul>
      </div>

      {/* Environment Variables Info */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Required Environment Variables:
        </h4>
        <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <code>VITE_SHOPIFY_CLIENT_ID</code> - Your Shopify app client ID
          <br />
          <code>VITE_SHOPIFY_REDIRECT_URI</code> - Your OAuth redirect URI
        </div>
      </div>
    </div>
  );
};

export default ShopifyOAuthExample; 