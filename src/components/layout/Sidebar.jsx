import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { showSubscriptionDialog } from '../../store/slices/subscriptionSlice';
import {
  HomeIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  DocumentTextIcon,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ScaleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { fetchPlatformConnections, selectPlatformConnections } from '../../store/slices/dashboardSlice';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const platformConnections = useSelector(selectPlatformConnections);

  const menuItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: HomeIcon, href: '/dashboard' },
    { id: 'comparison', label: 'ROI', icon: ScaleIcon, href: '/comparison' },
    { id: 'pricing', label: t('sidebar.pricing'), icon: CurrencyDollarIcon, href: '/pricing' },
    { id: 'integrations', label: t('sidebar.integrations'), icon: ChartBarIcon, href: '/integrations' },
    { id: 'analytics', label: t('sidebar.analytics'), icon: ChartBarIcon, href: '/analytics' },
    { id: 'settings', label: t('sidebar.settings'), icon: CogIcon, href: '/settings' },
  ];

  const handleSubscriptionClick = () => {
    dispatch(showSubscriptionDialog());
  };

  // Fetch platform connections on mount
  useEffect(() => {
    dispatch(fetchPlatformConnections());
  }, [dispatch]);

  // Platform configuration for icons and colors (currently only Google and Meta supported)
  const platformConfig = {
    google: { 
      name: 'Google Ads', 
      icon: '/assets/google.svg',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    meta: { 
      name: 'Meta Ads', 
      icon: '/assets/facebook.svg',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    }
  };

  // Process platform connections directly from API response
  const connections = [];
  
  if (platformConnections?.error === false && platformConnections?.result) {
    const result = platformConnections.result;
    
    // Process Google accounts - take first active one
    if (result.google_accounts && Array.isArray(result.google_accounts) && result.google_accounts.length > 0) {
      const googleAccount = result.google_accounts[0];
      const googleUser = googleAccount.google_account || {};
      const isActive = googleAccount.is_active && !googleAccount.is_token_expired;
      const needsRefresh = googleAccount.needs_refresh || googleAccount.is_token_expired;
      
      connections.push({
        id: `google-${googleAccount.google_account_id}`,
        platformType: 'google',
        name: googleUser.name || 'Google User',
        email: googleUser.email || 'google@example.com',
        picture: googleUser.picture || null,
        status: isActive ? 'active' : needsRefresh ? 'needs_refresh' : 'inactive',
        accountId: googleAccount.google_account_id
      });
    }
    
    // Process Meta connections - take first active one
    if (result.meta_connections && Array.isArray(result.meta_connections) && result.meta_connections.length > 0) {
      const metaConnection = result.meta_connections[0];
      const isActive = metaConnection.is_active && !metaConnection.is_token_expired;
      const needsRefresh = metaConnection.needs_refresh || metaConnection.is_token_expired;
      
      connections.push({
        id: `meta-${metaConnection.connection_id}`,
        platformType: 'meta',
        name: metaConnection.account_name || 'Meta Business Account',
        email: metaConnection.account_email || 'business@example.com',
        picture: null,
        status: isActive ? 'active' : needsRefresh ? 'needs_refresh' : 'inactive',
        accountId: metaConnection.connection_id,
        connectionId: metaConnection.connection_id
      });
    }
  }
  
  const connectedIntegrations = connections.filter(conn => conn.status === 'active');
  const needsRefreshIntegrations = connections.filter(conn => conn.status === 'needs_refresh');

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/20'
        };
      case 'needs_refresh':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
        };
      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-700'
        };
    }
  };

  return (
    <motion.div
      initial={{ width: isCollapsed ? 64 : 220 }}
      animate={{ width: isCollapsed ? 64 : 220 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 rtl:flex-row-reverse">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <div className="w-8 h-8 bg-[#174A6E] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">KAMPALO</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 rtl:rotate-180" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 rtl:rotate-180" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-2 border-blue-700 dark:border-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}

        {/* Connected Integrations Section */}
        {(connectedIntegrations.length > 0 || needsRefreshIntegrations.length > 0) && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent rounded-lg p-2 -mx-2">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-3"
                >
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <LinkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {t('sidebar.connectedPlatforms')}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              {/* Active Integrations */}
              {connectedIntegrations.map((connection) => {
                const platform = platformConfig[connection.platformType] || platformConfig.google;
                const statusInfo = getStatusInfo('active');
                const StatusIcon = statusInfo.icon;

                return (
                  <Link
                    key={connection.id}
                    to={connection.platformType === 'meta' ? `/meta/${connection.id}` : '/google'}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group"
                  >
                    {/* Platform Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${platform.bgColor}`}>
                      {platform.icon.endsWith('.svg') ? (
                        <img 
                          src={platform.icon} 
                          alt={platform.name} 
                          className="w-5 h-5 object-contain"
                        />
                      ) : (
                        <span className="text-sm font-bold">
                          {platform.icon}
                        </span>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex-1 min-w-0"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium truncate">
                              {platform.name}
                            </span>
                            <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
                          </div>
                          {connection.name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {connection.name}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}

              {/* Needs Refresh Integrations */}
              {needsRefreshIntegrations.map((connection) => {
                const platform = platformConfig[connection.platformType] || platformConfig.google;
                const statusInfo = getStatusInfo('needs_refresh');
                const StatusIcon = statusInfo.icon;

                return (
                  <Link
                    key={connection.id}
                    to={connection.platformType === 'meta' ? `/meta/${connection.id}` : '/google'}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group"
                  >
                    {/* Platform Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${platform.bgColor}`}>
                      {platform.icon.endsWith('.svg') ? (
                        <img 
                          src={platform.icon} 
                          alt={platform.name} 
                          className="w-5 h-5 object-contain"
                        />
                      ) : (
                        <span className="text-sm font-bold">
                          {platform.icon}
                        </span>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex-1 min-w-0"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium truncate">
                              {platform.name}
                            </span>
                            <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
                          </div>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 truncate">
                            Needs refresh
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Subscription Button */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="px-3 py-2"
              >
                <button
                  onClick={handleSubscriptionClick}
                  className="w-full flex items-center space-x-3 px-3 py-3 bg-gradient-to-r from-[#174A6E] to-[#0B3049] hover:from-[#0B3049] hover:to-[#174A6E] text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <CurrencyDollarIcon className="w-5 h-5" />
                  <span className="font-medium">{t('subscription.managePlan')}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* No Connections Message */}
        {connectedIntegrations.length === 0 && needsRefreshIntegrations.length === 0 && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-3 py-2"
                >
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <LinkIcon className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {t('sidebar.noConnectedPlatforms')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ltr:ml-6 rtl:mr-6">
                    {t('sidebar.connectPlatforms')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <UserCircleIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  John Doe
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  john@company.com
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar; 