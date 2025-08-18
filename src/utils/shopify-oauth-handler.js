/**
 * Shopify OAuth utility functions
 * Handles Shopify OAuth flow and data management
 */

/**
 * Get Shopify OAuth authorization URL
 * @param {string} shop - Shopify shop domain (e.g., 'mystore.myshopify.com')
 * @returns {string} OAuth authorization URL
 */
export const getShopifyAuthUrl = (shop) => {
  const clientId = import.meta.env.VITE_SHOPIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SHOPIFY_REDIRECT_URI;
  // Standard scopes that don't require special permissions
  const scope = 'read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_marketing_events,write_marketing_events,read_inventory,write_inventory,read_discounts,write_discounts,read_fulfillments,write_fulfillments,read_content,write_content,read_script_tags,write_script_tags,read_themes,write_themes,read_files,write_files,read_locations,write_locations,read_shipping,write_shipping,read_price_rules,write_price_rules,read_gift_cards,write_gift_cards,read_draft_orders,write_draft_orders,read_metaobjects,write_metaobjects,read_metaobject_definitions,write_metaobject_definitions,read_translations,read_locales,write_locales,read_markets,write_markets,read_payment_terms,write_payment_terms,read_payment_customizations,write_payment_customizations,read_delivery_customizations,write_delivery_customizations,read_cart_transforms,write_cart_transforms,read_checkout_branding_settings,write_checkout_branding_settings,read_online_store_pages,read_online_store_navigation,write_online_store_navigation,read_customer_events,write_pixels,read_customer_merge,write_customer_merge,read_order_edits,write_order_edits,read_returns,write_returns,read_purchase_options,write_purchase_options,read_validations,write_validations,read_privacy_settings,write_privacy_settings,read_legal_policies,read_app_proxy,write_app_proxy,read_assigned_fulfillment_orders,write_assigned_fulfillment_orders,read_merchant_managed_fulfillment_orders,write_merchant_managed_fulfillment_orders,read_third_party_fulfillment_orders,write_third_party_fulfillment_orders';

  if (!clientId || !redirectUri) {
    throw new Error('Shopify client ID or redirect URI not configured. Please set VITE_SHOPIFY_CLIENT_ID and VITE_SHOPIFY_REDIRECT_URI');
  }

  return `https://${shop}/admin/oauth/authorize?` +
    `client_id=${clientId}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${'shopify'}`;
};

/**
 * Redirect to Shopify OAuth authorization
 * @param {string} shop - Shopify shop domain
 */
export const redirectToShopifyAuth = (shop) => {
  if (typeof window !== 'undefined') {
    window.location.href = getShopifyAuthUrl(shop);
  }
};

/**
 * Get stored Shopify data from localStorage
 * @returns {Object|null} Stored Shopify data or null
 */
export const getStoredShopifyData = () => {
  if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem('shopifyData');
    return storedData ? JSON.parse(storedData) : null;
  }
  return null;
};

/**
 * Clear stored Shopify data from localStorage
 */
export const clearStoredShopifyData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('shopifyData');
  }
};

/**
 * Validate Shopify domain format
 * @param {string} shop - Shopify shop domain
 * @returns {boolean} True if valid Shopify domain
 */
export const validateShopifyDomain = (shop) => {
  // Basic validation for Shopify domain format
  const shopifyDomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  return shopifyDomainRegex.test(shop);
};

/**
 * Format Shopify domain to proper format
 * @param {string} shop - Shopify shop domain or name
 * @returns {string} Properly formatted Shopify domain
 */
export const formatShopifyDomain = (shop) => {
  // Remove protocol and trailing slash if present
  let formattedShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  // If it's already a full domain, return as is
  if (formattedShop.includes('.myshopify.com')) {
    return formattedShop;
  }
  
  // If it's just the shop name, append .myshopify.com
  if (!formattedShop.includes('.')) {
    return `${formattedShop}.myshopify.com`;
  }
  
  return formattedShop;
};

/**
 * Extract OAuth parameters from URL
 * @returns {Object} OAuth parameters
 */
export const extractShopifyOAuthParams = () => {
  if (typeof window === 'undefined') return {};
  
  const urlParams = new URLSearchParams(window.location.search);
  
  // Log all URL parameters for debugging
  console.log('🔍 === SHOPIFY OAUTH PARAMETERS DEBUG ===');
  console.log('🔍 Full URL:', window.location.href);
  console.log('🔍 URL Search:', window.location.search);
  console.log('🔍 All URL Parameters:');
  
  // Log all parameters that Shopify might return
  const allParams = {};
  for (const [key, value] of urlParams.entries()) {
    allParams[key] = value;
    console.log(`🔍   ${key}:`, value);
  }
  
  // Standard Shopify OAuth parameters
  const params = {
    code: urlParams.get('code'),
    shop: urlParams.get('shop'),
    state: urlParams.get('state'),
    hmac: urlParams.get('hmac'),
    timestamp: urlParams.get('timestamp'),
    error: urlParams.get('error'),
    error_description: urlParams.get('error_description'),
    // Additional parameters that Shopify might return
    session: urlParams.get('session'),
    host: urlParams.get('host'),
    protocol: urlParams.get('protocol'),
    locale: urlParams.get('locale'),
    currency: urlParams.get('currency'),
    country: urlParams.get('country'),
    timezone: urlParams.get('timezone'),
    // Any other parameters
    ...allParams
  };
  
  console.log('🔍 Extracted Shopify OAuth Parameters:', params);
  console.log('🔍 === END SHOPIFY OAUTH PARAMETERS DEBUG ===');
  
  return params;
};

/**
 * Exchange session token for access token using Shopify OAuth 2.0 Token Exchange
 * @param {string} shop - Shopify shop domain
 * @param {string} sessionToken - Session token from OAuth callback
 * @returns {Promise<Object>} Access token response
 */
export const exchangeShopifyToken = async (shop, sessionToken) => {
  const clientId = import.meta.env.VITE_SHOPIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SHOPIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Shopify client ID or client secret not configured. Please set VITE_SHOPIFY_CLIENT_ID and VITE_SHOPIFY_CLIENT_SECRET');
  }
  
  console.log('🛍️ === SHOPIFY TOKEN EXCHANGE ===');
  console.log('🛍️ Shop:', shop);
  console.log('🛍️ Session Token:', sessionToken?.substring(0, 20) + '...');
  
  const tokenExchangeUrl = `https://${shop}/admin/oauth/access_token`;
  
  const requestBody = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
    subject_token: sessionToken,
    subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
    requested_token_type: 'urn:shopify:params:oauth:token-type:online-access-token'
  };
  
  console.log('🛍️ Token Exchange URL:', tokenExchangeUrl);
  console.log('🛍️ Request Body:', {
    ...requestBody,
    client_secret: '***HIDDEN***',
    subject_token: sessionToken?.substring(0, 20) + '...'
  });
  
  try {
    const response = await fetch(tokenExchangeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('🛍️ Token Exchange Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🛍️ Token Exchange Error:', errorText);
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
    }
    
    const tokenData = await response.json();
    console.log('🛍️ ✅ Token Exchange Successful');
    console.log('🛍️ Access Token:', tokenData.access_token?.substring(0, 20) + '...');
    console.log('🛍️ Token Type:', tokenData.token_type);
    console.log('🛍️ Scope:', tokenData.scope);
    console.log('🛍️ Expires In:', tokenData.expires_in);
    
    return tokenData;
  } catch (error) {
    console.error('🛍️ ❌ Token Exchange Failed:', error);
    throw error;
  }
};

/**
 * Validate OAuth parameters
 * @param {Object} params - OAuth parameters
 * @returns {boolean} True if valid
 */
export const validateShopifyOAuthParams = (params) => {
  if (!params.code || !params.shop || !params.state) {
    return false;
  }
  
  // Validate shop domain format
  if (!validateShopifyDomain(params.shop)) {
    return false;
  }
  
  return true;
};

/**
 * Test Shopify OAuth configuration
 * @returns {Object} Configuration status
 */
export const testShopifyOAuthConfig = () => {
  const clientId = import.meta.env.VITE_SHOPIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SHOPIFY_REDIRECT_URI;
  
  console.log('=== SHOPIFY OAUTH CONFIGURATION TEST ===');
  console.log('Client ID:', clientId ? '✅ Configured' : '❌ Missing');
  console.log('Redirect URI:', redirectUri ? '✅ Configured' : '❌ Missing');
  console.log('========================================');
  
  return {
    clientIdConfigured: !!clientId,
    redirectUriConfigured: !!redirectUri,
    isConfigured: !!(clientId && redirectUri)
  };
};

/**
 * Create mock Shopify connection data for testing
 * @param {string} shop - Shop domain
 * @returns {Object} Mock connection data
 */
export const createMockShopifyConnectionData = (shop) => {
  return {
    shop: shop,
    access_token: 'mock_access_token_' + Date.now(),
    scope: 'read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_marketing_events,write_marketing_events,read_inventory,write_inventory,read_discounts,write_discounts,read_fulfillments,write_fulfillments,read_content,write_content,read_script_tags,write_script_tags,read_themes,write_themes,read_files,write_files,read_locations,write_locations,read_shipping,write_shipping,read_price_rules,write_price_rules,read_gift_cards,write_gift_cards,read_draft_orders,write_draft_orders,read_metaobjects,write_metaobjects,read_metaobject_definitions,write_metaobject_definitions,read_translations,read_locales,write_locales,read_markets,write_markets,read_payment_terms,write_payment_terms,read_payment_customizations,write_payment_customizations,read_delivery_customizations,write_delivery_customizations,read_cart_transforms,write_cart_transforms,read_checkout_branding_settings,write_checkout_branding_settings,read_online_store_pages,read_online_store_navigation,write_online_store_navigation,read_customer_events,write_pixels,read_customer_merge,write_customer_merge,read_order_edits,write_order_edits,read_returns,write_returns,read_purchase_options,write_purchase_options,read_validations,write_validations,read_privacy_settings,write_privacy_settings,read_legal_policies,read_app_proxy,write_app_proxy,read_assigned_fulfillment_orders,write_assigned_fulfillment_orders,read_merchant_managed_fulfillment_orders,write_merchant_managed_fulfillment_orders,read_third_party_fulfillment_orders,write_third_party_fulfillment_orders',
    expires_in: 3600,
    associated_user: {
      id: 123456789,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      account_owner: true,
      locale: 'en',
      collaborator: false,
      email_verified: true
    },
    shop_data: {
      id: 987654321,
      name: 'Test Store',
      email: 'test@example.com',
      domain: shop,
      province: 'CA',
      country: 'US',
      address1: '123 Test St',
      city: 'Test City',
      zip: '12345',
      phone: '+1-555-123-4567',
      latitude: 37.7749,
      longitude: -122.4194,
      primary_locale: 'en',
      address2: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      country_code: 'US',
      country_name: 'United States',
      currency: 'USD',
      customer_email: 'test@example.com',
      timezone: 'America/Los_Angeles',
      iana_timezone: 'America/Los_Angeles',
      shop_owner: 'Test Owner',
      money_format: '${{amount}}',
      money_with_currency_format: '${{amount}} USD',
      weight_unit: 'lb',
      province_code: 'CA',
      taxes_included: false,
      auto_configure_tax_inclusivity: false,
      tax_shipping: null,
      county_taxes: true,
      plan_display_name: 'Basic Shopify',
      plan_name: 'basic',
      has_discounts: false,
      has_gift_cards: false,
      myshopify_domain: shop,
      google_apps_domain: null,
      google_apps_login_enabled: null,
      money_in_emails_format: '${{amount}}',
      money_with_currency_in_emails_format: '${{amount}} USD',
      eligible_for_payments: true,
      requires_extra_payments_agreement: false,
      password_enabled: false,
      has_storefront: true,
      finances: true,
      primary_location_id: 123456789,
      cookie_consent_level: 'implicit',
      visitor_tracking_consent_preference: 'allow_all',
      checkout_api_supported: true,
      multi_location_enabled: false,
      setup_required: false,
      pre_launch_enabled: false,
      enabled_presentment_currencies: ['USD'],
      transactional_sms_disabled: false,
      marketing_sms_consent_enabled_at_checkout: false,
      default_locale: 'en',
      automatic_tax_calculation_enabled: false,
      automatic_tax_included_in_pricing: false,
      automatic_tax_currency_exchange_enabled: false,
      product_subscription_consent_enabled_at_checkout: false,
      ecommerce_platform: 'shopify',
      shopify_payments_enabled: true,
      shopify_payments_account_id: 123456789,
      shopify_payments_account_owner: true,
      shopify_payments_account_owner_slug: 'test-owner',
      shopify_payments_account_owner_email: 'test@example.com',
      shopify_payments_account_owner_phone: '+1-555-123-4567',
      shopify_payments_account_owner_company: 'Test Company',
      shopify_payments_account_owner_first_name: 'Test',
      shopify_payments_account_owner_last_name: 'Owner',
      shopify_payments_account_owner_address1: '123 Test St',
      shopify_payments_account_owner_address2: null,
      shopify_payments_account_owner_city: 'Test City',
      shopify_payments_account_owner_province: 'CA',
      shopify_payments_account_owner_province_code: 'CA',
      shopify_payments_account_owner_zip: '12345',
      shopify_payments_account_owner_country: 'US',
      shopify_payments_account_owner_country_code: 'US',
      shopify_payments_account_owner_currency: 'USD',
      shopify_payments_account_owner_timezone: 'America/Los_Angeles',
      shopify_payments_account_owner_iana_timezone: 'America/Los_Angeles',
      shopify_payments_account_owner_plan_name: 'basic',
      shopify_payments_account_owner_plan_display_name: 'Basic Shopify',
      shopify_payments_account_owner_has_discounts: false,
      shopify_payments_account_owner_has_gift_cards: false,
      shopify_payments_account_owner_myshopify_domain: shop,
      shopify_payments_account_owner_google_apps_domain: null,
      shopify_payments_account_owner_google_apps_login_enabled: null,
      shopify_payments_account_owner_money_in_emails_format: '${{amount}}',
      shopify_payments_account_owner_money_with_currency_in_emails_format: '${{amount}} USD',
      shopify_payments_account_owner_eligible_for_payments: true,
      shopify_payments_account_owner_requires_extra_payments_agreement: false,
      shopify_payments_account_owner_password_enabled: false,
      shopify_payments_account_owner_has_storefront: true,
      shopify_payments_account_owner_finances: true,
      shopify_payments_account_owner_primary_location_id: 123456789,
      shopify_payments_account_owner_cookie_consent_level: 'implicit',
      shopify_payments_account_owner_visitor_tracking_consent_preference: 'allow_all',
      shopify_payments_account_owner_checkout_api_supported: true,
      shopify_payments_account_owner_multi_location_enabled: false,
      shopify_payments_account_owner_setup_required: false,
      shopify_payments_account_owner_pre_launch_enabled: false,
      shopify_payments_account_owner_enabled_presentment_currencies: ['USD'],
      shopify_payments_account_owner_transactional_sms_disabled: false,
      shopify_payments_account_owner_marketing_sms_consent_enabled_at_checkout: false,
      shopify_payments_account_owner_default_locale: 'en',
      shopify_payments_account_owner_automatic_tax_calculation_enabled: false,
      shopify_payments_account_owner_automatic_tax_included_in_pricing: false,
      shopify_payments_account_owner_automatic_tax_currency_exchange_enabled: false,
      shopify_payments_account_owner_product_subscription_consent_enabled_at_checkout: false,
      shopify_payments_account_owner_ecommerce_platform: 'shopify'
    }
  };
}; 