import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
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
  ClockIcon
} from '@heroicons/react/24/outline';
import { useIntegrations } from '../../hooks/useIntegrations';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { integrations } = useIntegrations();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
    { id: 'integrations', label: 'Integrations', icon: ChartBarIcon, href: '/integrations' },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, href: '/analytics' },
    { id: 'settings', label: 'Settings', icon: CogIcon, href: '/settings' },
  ];

  // Platform configuration for icons and colors
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
    },
    tiktok: { 
      name: 'TikTok Ads', 
      icon: '/assets/tiktok.svg',
      color: 'text-black dark:text-white',
      bgColor: 'bg-gray-100 dark:bg-gray-700'
    },
    shopify: { 
      name: 'Shopify', 
      icon: '/assets/shopify.svg',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    linkedin: { 
      name: 'LinkedIn Ads', 
      icon: '/assets/linkdln.svg',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    apple: { 
      name: 'Apple Search Ads', 
      icon: '🍎',
      color: 'text-gray-800 dark:text-gray-200',
      bgColor: 'bg-gray-100 dark:bg-gray-700'
    }
  };

  // Get connected integrations
  const connectedIntegrations = integrations.filter(integ => integ.status === 'active');
  const needsRefreshIntegrations = integrations.filter(integ => integ.status === 'needs_refresh');

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
      initial={{ width: isCollapsed ? 64 : 280 }}
      animate={{ width: isCollapsed ? 64 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">AdSynq</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
                      Connected Platforms
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              {/* Active Integrations */}
              {connectedIntegrations.map((integration) => {
                const primaryPlatform = integration.integrations.find(p => p.status === 'active') || integration.integrations[0];
                const platformType = primaryPlatform?.type || 'google';
                const platform = platformConfig[platformType] || platformConfig.google;
                const statusInfo = getStatusInfo('active');
                const StatusIcon = statusInfo.icon;

                return (
                  <Link
                    key={integration.id}
                    to={platformType === 'meta' ? `/facebook/${integration.id}` : `/platform/${integration.id}`}
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
                          {integration.userData?.name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {integration.userData.name}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}

              {/* Needs Refresh Integrations */}
              {needsRefreshIntegrations.map((integration) => {
                const primaryPlatform = integration.integrations.find(p => p.status === 'needs_refresh') || integration.integrations[0];
                const platformType = primaryPlatform?.type || 'google';
                const platform = platformConfig[platformType] || platformConfig.google;
                const statusInfo = getStatusInfo('needs_refresh');
                const StatusIcon = statusInfo.icon;

                return (
                  <Link
                    key={integration.id}
                    to={platformType === 'meta' ? `/facebook/${integration.id}` : `/platform/${integration.id}`}
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
                      No Connected Platforms
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-6">
                    Connect platforms in Integrations
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