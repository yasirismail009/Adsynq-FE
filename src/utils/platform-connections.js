/**
 * Platform Connections Utility Functions
 * Handles processing and manipulation of platform connections data from the API
 */

/**
 * Process platform connections data and extract useful information
 * @param {Object} connectionsData - Raw API response data
 * @returns {Object} Processed connections data
 */
export const processPlatformConnections = (connectionsData) => {
  if (!connectionsData || !connectionsData.result) {
    return {
      totalConnections: 0,
      platforms: {},
      summary: {
        meta: { count: 0, active: 0, pages: 0 },
        google: { count: 0, active: 0 },
        tiktok: { count: 0, active: 0 }
      }
    };
  }

  const { result } = connectionsData;
  const processed = {
    totalConnections: result.total_connections || 0,
    platforms: {},
    summary: {
      meta: { count: 0, active: 0, pages: 0 },
      google: { count: 0, active: 0 },
      tiktok: { count: 0, active: 0 }
    }
  };

  // Process Meta connections
  if (result.meta_connections && result.meta_connections.length > 0) {
    processed.platforms.meta = result.meta_connections.map(connection => ({
      id: connection.id,
      userId: connection.user,
      metaUser: connection.meta_user,
      tokenType: connection.token_type,
      expiresIn: connection.expires_in,
      scope: connection.scope,
      isActive: connection.is_active,
      pages: connection.pages || [],
      createdAt: connection.created_at,
      updatedAt: connection.updated_at,
      // Computed properties
      daysUntilExpiry: Math.floor(connection.expires_in / 86400),
      totalFollowers: (connection.pages || []).reduce((sum, page) => sum + (page.followers_count || 0), 0),
      publishedPages: (connection.pages || []).filter(page => page.is_published).length,
      draftPages: (connection.pages || []).filter(page => !page.is_published).length
    }));

    processed.summary.meta = {
      count: result.meta_connections.length,
      active: result.meta_connections.filter(c => c.is_active).length,
      pages: result.meta_connections.reduce((sum, c) => sum + (c.pages?.length || 0), 0)
    };
  }

  // Process Google accounts
  if (result.google_accounts && result.google_accounts.length > 0) {
    processed.platforms.google = result.google_accounts.map(account => ({
      id: account.id,
      // Add other Google account properties as needed
      ...account
    }));

    processed.summary.google = {
      count: result.google_accounts.length,
      active: result.google_accounts.filter(a => a.is_active).length
    };
  }

  // Process TikTok connections
  if (result.tiktok_connections && result.tiktok_connections.length > 0) {
    processed.platforms.tiktok = result.tiktok_connections.map(connection => ({
      id: connection.id,
      // Add other TikTok connection properties as needed
      ...connection
    }));

    processed.summary.tiktok = {
      count: result.tiktok_connections.length,
      active: result.tiktok_connections.filter(c => c.is_active).length
    };
  }

  return processed;
};

/**
 * Get connection status for a platform
 * @param {Object} connection - Connection object
 * @returns {string} Status string
 */
export const getConnectionStatus = (connection) => {
  if (!connection) return 'unknown';
  
  if (connection.isActive === false) return 'inactive';
  if (connection.isActive === true) return 'active';
  
  // Check token expiry
  if (connection.expiresIn && connection.expiresIn < 86400) { // Less than 1 day
    return 'expiring_soon';
  }
  
  return 'active';
};

/**
 * Get status color for connection status
 * @param {string} status - Connection status
 * @returns {string} Tailwind color classes
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
    case 'inactive':
      return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
    case 'expiring_soon':
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
  }
};

/**
 * Format page data for display
 * @param {Object} page - Page object from API
 * @returns {Object} Formatted page data
 */
export const formatPageData = (page) => {
  return {
    id: page.id,
    pageId: page.page_id,
    name: page.page_name,
    username: page.page_username,
    pictureUrl: page.page_picture_url,
    category: page.page_category,
    verificationStatus: page.page_verification_status,
    followersCount: page.followers_count || 0,
    isPublished: page.is_published,
    isActive: page.is_active,
    createdAt: page.created_at,
    // Computed properties
    formattedFollowers: (page.followers_count || 0).toLocaleString(),
    isVerified: page.page_verification_status === 'verified',
    status: page.is_published ? 'published' : 'draft'
  };
};

/**
 * Get platform icon and color configuration
 * @param {string} platform - Platform name
 * @returns {Object} Platform configuration
 */
export const getPlatformConfig = (platform) => {
  const configs = {
    meta: {
      name: 'Meta',
      icon: 'FacebookIcon',
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    google: {
      name: 'Google',
      icon: 'GlobeAltIcon',
      color: 'red',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400'
    },
    tiktok: {
      name: 'TikTok',
      icon: 'MusicalNoteIcon',
      color: 'black',
      bgColor: 'bg-black',
      textColor: 'text-white'
    }
  };

  return configs[platform] || {
    name: platform.charAt(0).toUpperCase() + platform.slice(1),
    icon: 'GlobeAltIcon',
    color: 'gray',
    bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    textColor: 'text-gray-600 dark:text-gray-400'
  };
};

/**
 * Calculate aggregated metrics from platform connections
 * @param {Object} connectionsData - Platform connections data
 * @returns {Object} Aggregated metrics
 */
export const calculateConnectionMetrics = (connectionsData) => {
  const processed = processPlatformConnections(connectionsData);
  
  const metrics = {
    totalConnections: processed.totalConnections,
    activeConnections: 0,
    totalPages: 0,
    totalFollowers: 0,
    platforms: {
      meta: { connections: 0, pages: 0, followers: 0 },
      google: { connections: 0 },
      tiktok: { connections: 0 }
    }
  };

  // Meta metrics
  if (processed.platforms.meta) {
    processed.platforms.meta.forEach(connection => {
      if (connection.isActive) metrics.activeConnections++;
      metrics.platforms.meta.connections++;
      metrics.platforms.meta.pages += connection.pages.length;
      metrics.platforms.meta.followers += connection.totalFollowers;
      metrics.totalPages += connection.pages.length;
      metrics.totalFollowers += connection.totalFollowers;
    });
  }

  // Google metrics
  if (processed.platforms.google) {
    processed.platforms.google.forEach(account => {
      if (account.is_active) metrics.activeConnections++;
      metrics.platforms.google.connections++;
    });
  }

  // TikTok metrics
  if (processed.platforms.tiktok) {
    processed.platforms.tiktok.forEach(connection => {
      if (connection.is_active) metrics.activeConnections++;
      metrics.platforms.tiktok.connections++;
    });
  }

  return metrics;
};

/**
 * Check if connections data is valid
 * @param {Object} connectionsData - Platform connections data
 * @returns {boolean} Whether data is valid
 */
export const isValidConnectionsData = (connectionsData) => {
  return connectionsData && 
         connectionsData.result && 
         typeof connectionsData.result === 'object' &&
         !connectionsData.error;
};

/**
 * Get connection health status
 * @param {Object} connection - Connection object
 * @returns {string} Health status
 */
export const getConnectionHealth = (connection) => {
  if (!connection) return 'unknown';
  
  if (!connection.isActive) return 'disconnected';
  
  // Check if token is expiring soon (within 7 days)
  if (connection.expiresIn && connection.expiresIn < 604800) {
    return 'expiring_soon';
  }
  
  // Check if connection is recent (within 30 days)
  if (connection.updatedAt) {
    const updatedDate = new Date(connection.updatedAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (updatedDate < thirtyDaysAgo) {
      return 'stale';
    }
  }
  
  return 'healthy';
}; 