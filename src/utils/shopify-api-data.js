/**
 * Comprehensive Shopify API Data Structures
 * Contains all possible data we can get from Shopify's access token APIs
 */

/**
 * Complete Shopify Shop Data Structure
 */
export const createShopifyShopData = (shop) => ({
  id: 987654321,
  name: 'Test Store',
  email: 'test@example.com',
  domain: shop,
  myshopify_domain: shop,
  address1: '123 Test St',
  city: 'Test City',
  province: 'CA',
  country: 'US',
  zip: '12345',
  phone: '+1-555-123-4567',
  customer_email: 'test@example.com',
  timezone: 'America/Los_Angeles',
  currency: 'USD',
  money_format: '${{amount}}',
  plan_display_name: 'Basic Shopify',
  plan_name: 'basic',
  shop_owner: 'Test Owner',
  has_storefront: true,
  shopify_payments_enabled: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

/**
 * Shopify Access Token Response Structure
 */
export const createShopifyTokenData = () => ({
  access_token: 'shpat_' + Math.random().toString(36).substring(2, 15),
  token_type: 'Bearer',
  scope: 'read_products,write_products,read_orders,write_orders,read_customers,write_customers',
  expires_in: 3600,
  expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
});

/**
 * Shopify User Data Structure
 */
export const createShopifyUserData = () => ({
  id: 123456789,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  account_owner: true,
  locale: 'en',
  collaborator: false,
  email_verified: true,
  created_at: new Date().toISOString()
});

/**
 * Shopify Analytics Data Structure
 */
export const createShopifyAnalyticsData = () => ({
  store_overview: {
    total_orders: 1250,
    total_revenue: 45678.90,
    total_customers: 890,
    total_products: 156,
    average_order_value: 36.54,
    currency: 'USD'
  },
  sales: {
    total_sales: 45678.90,
    net_sales: 42345.67,
    refunds: 3333.23,
    shipping: 2345.67,
    taxes: 3456.78,
    currency: 'USD'
  },
  orders: {
    total_orders: 1250,
    pending_orders: 45,
    fulfilled_orders: 1180,
    cancelled_orders: 25,
    average_processing_time: 2.5
  },
  customers: {
    total_customers: 890,
    new_customers: 234,
    returning_customers: 656,
    customer_lifetime_value: 51.32
  },
  products: {
    total_products: 156,
    active_products: 142,
    draft_products: 14,
    low_stock_products: 12,
    out_of_stock_products: 3
  },
  traffic: {
    total_sessions: 45678,
    unique_visitors: 12345,
    page_views: 89012,
    bounce_rate: 0.35,
    average_session_duration: 180
  }
});

/**
 * Shopify Product Data Structure
 */
export const createShopifyProductData = (count = 10) => {
  const products = [];
  for (let i = 1; i <= count; i++) {
    products.push({
      id: 1000000000 + i,
      title: `Test Product ${i}`,
      body_html: `<p>This is test product ${i} description.</p>`,
      vendor: 'Test Vendor',
      product_type: 'Test Type',
      created_at: new Date().toISOString(),
      handle: `test-product-${i}`,
      status: 'active',
      tags: `test, product, ${i}`,
      variants: [
        {
          id: 2000000000 + i,
          product_id: 1000000000 + i,
          title: 'Default Title',
          price: '29.99',
          sku: `SKU-${i}`,
          inventory_quantity: 100,
          weight: 0.5,
          weight_unit: 'lb'
        }
      ],
      images: [
        {
          id: 5000000000 + i,
          product_id: 1000000000 + i,
          src: `https://cdn.shopify.com/s/files/1/0000/0000/products/test-product-${i}.jpg`,
          width: 800,
          height: 600
        }
      ]
    });
  }
  return products;
};

/**
 * Shopify Order Data Structure
 */
export const createShopifyOrderData = (count = 10) => {
  const orders = [];
  for (let i = 1; i <= count; i++) {
    orders.push({
      id: 6000000000 + i,
      name: `#100${i}`,
      email: `customer${i}@example.com`,
      created_at: new Date().toISOString(),
      number: 1000 + i,
      total_price: '29.99',
      subtotal_price: '25.99',
      total_tax: '4.00',
      currency: 'USD',
      financial_status: 'paid',
      fulfillment_status: 'fulfilled',
      customer: {
        id: 11000000000 + i,
        email: `customer${i}@example.com`,
        first_name: 'John',
        last_name: 'Doe',
        orders_count: 1,
        total_spent: '29.99'
      },
      line_items: [
        {
          id: 8000000000 + i,
          title: `Test Product ${i}`,
          quantity: 1,
          price: '25.99',
          sku: `SKU-${i}`
        }
      ],
      shipping_address: {
        first_name: 'John',
        last_name: 'Doe',
        address1: '123 Test St',
        city: 'Test City',
        province: 'CA',
        country: 'US',
        zip: '12345'
      }
    });
  }
  return orders;
};

/**
 * Shopify Customer Data Structure
 */
export const createShopifyCustomerData = (count = 10) => {
  const customers = [];
  for (let i = 1; i <= count; i++) {
    customers.push({
      id: 11000000000 + i,
      email: `customer${i}@example.com`,
      first_name: 'John',
      last_name: 'Doe',
      orders_count: Math.floor(Math.random() * 10) + 1,
      total_spent: (Math.random() * 1000 + 50).toFixed(2),
      state: 'enabled',
      verified_email: true,
      currency: 'USD',
      phone: '+1-555-123-4567',
      tags: `customer, test, ${i}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  return customers;
};

/**
 * Complete Shopify Connection Data Structure
 */
export const createCompleteShopifyConnectionData = (shop) => ({
  connection_id: `shopify_${Date.now()}`,
  platform: 'shopify',
  status: 'connected',
  connected_at: new Date().toISOString(),
  last_sync_at: new Date().toISOString(),
  shop: shop,
  shop_data: createShopifyShopData(shop),
  token_data: createShopifyTokenData(),
  user_data: createShopifyUserData(),
  analytics: createShopifyAnalyticsData(),
  products: createShopifyProductData(50),
  orders: createShopifyOrderData(100),
  customers: createShopifyCustomerData(200),
  settings: {
    auto_sync: true,
    sync_interval: 3600,
    sync_products: true,
    sync_orders: true,
    sync_customers: true,
    sync_analytics: true
  },
  permissions: {
    read_products: true,
    write_products: true,
    read_orders: true,
    write_orders: true,
    read_customers: true,
    write_customers: true
  },
  performance: {
    api_calls_today: 150,
    api_calls_limit: 1000,
    response_time_average: 250
  }
});

/**
 * Helper function to create mock data for testing
 */
export const createMockShopifyData = (shop) => ({
  connection: createCompleteShopifyConnectionData(shop),
  shop: createShopifyShopData(shop),
  tokens: createShopifyTokenData(),
  user: createShopifyUserData(),
  analytics: createShopifyAnalyticsData(),
  products: createShopifyProductData(10),
  orders: createShopifyOrderData(20),
  customers: createShopifyCustomerData(30)
});

export default {
  createShopifyShopData,
  createShopifyTokenData,
  createShopifyUserData,
  createShopifyAnalyticsData,
  createShopifyProductData,
  createShopifyOrderData,
  createShopifyCustomerData,
  createCompleteShopifyConnectionData,
  createMockShopifyData
}; 