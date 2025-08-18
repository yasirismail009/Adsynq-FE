/**
 * Shopify API Utility Functions
 * API calls for Shopify OAuth and data operations
 */

/**
 * Save Shopify OAuth code to backend (Updated for OAuth 2.0 Token Exchange)
 * @param {string} sessionToken - Session token from OAuth callback
 * @param {string} shop - Shop domain
 * @returns {Promise<Object>} Response from backend
 */
export const saveShopifyOAuthCode = async (sessionToken, shop) => {
  try {
    console.log('🛍️ === SAVE SHOPIFY OAUTH CODE (TOKEN EXCHANGE) ===');
    console.log('🛍️ Session Token:', sessionToken?.substring(0, 20) + '...');
    console.log('🛍️ Shop:', shop);

    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const saveUrl = `${baseURL}/shopify/oauth/save/`;

    console.log('🔗 Save API URL:', saveUrl);

    const response = await fetch(saveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        session_token: sessionToken, 
        shop,
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
        requested_token_type: 'urn:shopify:params:oauth:token-type:online-access-token'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🛍️ ❌ Save OAuth code failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Save OAuth code failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('🛍️ ✅ OAuth code saved successfully:', result);

    return result;
  } catch (error) {
    console.error('🛍️ ❌ Error in saveShopifyOAuthCode:', error);
    throw error;
  }
};

/**
 * Get Shopify shop data using access token
 * @param {string} accessToken - Shopify access token
 * @param {string} shop - Shop domain
 * @returns {Promise<Object>} Shop data
 */
export const getShopifyShopData = async (accessToken, shop) => {
  try {
    console.log('🔄 Fetching Shopify shop data...');

    const response = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch shop data: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const shopData = await response.json();
    console.log('✅ Shopify shop data fetched:', shopData);

    return shopData.shop;
  } catch (error) {
    console.error('❌ Error fetching Shopify shop data:', error);
    throw error;
  }
};

/**
 * Get Shopify products using access token
 * @param {string} accessToken - Shopify access token
 * @param {string} shop - Shop domain
 * @param {number} limit - Number of products to fetch (default: 50)
 * @returns {Promise<Object>} Products data
 */
export const getShopifyProducts = async (accessToken, shop, limit = 50) => {
  try {
    console.log('🔄 Fetching Shopify products...');

    const response = await fetch(`https://${shop}/admin/api/2023-10/products.json?limit=${limit}`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const productsData = await response.json();
    console.log('✅ Shopify products fetched:', productsData);

    return productsData.products;
  } catch (error) {
    console.error('❌ Error fetching Shopify products:', error);
    throw error;
  }
};

/**
 * Get Shopify orders using access token
 * @param {string} accessToken - Shopify access token
 * @param {string} shop - Shop domain
 * @param {number} limit - Number of orders to fetch (default: 50)
 * @returns {Promise<Object>} Orders data
 */
export const getShopifyOrders = async (accessToken, shop, limit = 50) => {
  try {
    console.log('🔄 Fetching Shopify orders...');

    const response = await fetch(`https://${shop}/admin/api/2023-10/orders.json?limit=${limit}&status=any`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const ordersData = await response.json();
    console.log('✅ Shopify orders fetched:', ordersData);

    return ordersData.orders;
  } catch (error) {
    console.error('❌ Error fetching Shopify orders:', error);
    throw error;
  }
};

/**
 * Get Shopify customers using access token
 * @param {string} accessToken - Shopify access token
 * @param {string} shop - Shop domain
 * @param {number} limit - Number of customers to fetch (default: 50)
 * @returns {Promise<Object>} Customers data
 */
export const getShopifyCustomers = async (accessToken, shop, limit = 50) => {
  try {
    console.log('🔄 Fetching Shopify customers...');

    const response = await fetch(`https://${shop}/admin/api/2023-10/customers.json?limit=${limit}`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const customersData = await response.json();
    console.log('✅ Shopify customers fetched:', customersData);

    return customersData.customers;
  } catch (error) {
    console.error('❌ Error fetching Shopify customers:', error);
    throw error;
  }
};

/**
 * Test Shopify API configuration
 * @returns {Object} Configuration status
 */
export const testShopifyAPIConfig = () => {
  const clientId = import.meta.env.VITE_SHOPIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SHOPIFY_REDIRECT_URI;
  
  console.log('=== SHOPIFY API CONFIGURATION TEST ===');
  console.log('Client ID:', clientId ? '✅ Configured' : '❌ Missing');
  console.log('Redirect URI:', redirectUri ? '✅ Configured' : '❌ Missing');
  console.log('======================================');
  
  return {
    clientIdConfigured: !!clientId,
    redirectUriConfigured: !!redirectUri,
    isConfigured: !!(clientId && redirectUri)
  };
}; 