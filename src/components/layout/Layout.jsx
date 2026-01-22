import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePremiumAutoSelect } from '../../hooks/usePremiumAutoSelect';

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Error boundary component
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Layout Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please refresh the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#174A6E] dark:bg-[#174A6E] text-white rounded-lg hover:bg-[#0B3049] dark:hover:bg-[#0B3049] transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return children;
};

const Layout = ({ children }) => {
  const { t } = useTranslation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Auto-select all campaigns when subscription is Premium Plan
  usePremiumAutoSelect();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return t('sidebar.dashboard');
      case '/integrations':
        return t('sidebar.integrations');
      case '/analytics':
        return t('sidebar.analytics');
      case '/pricing':
        return t('sidebar.pricing');
      case '/customers':
        return 'Customers';
      case '/reports':
        return 'Reports';
      case '/settings':
        return t('sidebar.settings');
      default:
        return 'KAMPALO';
    }
  };

  // Get breadcrumb based on current route
  const getBreadcrumb = () => {
    const path = location.pathname;
    const dashboard = t('sidebar.dashboard');
    switch (path) {
      case '/dashboard':
        return dashboard;
      case '/integrations':
        return `${dashboard} > ${t('sidebar.integrations')}`;
      case '/analytics':
        return `${dashboard} > ${t('sidebar.analytics')}`;
      case '/pricing':
        return `${dashboard} > ${t('sidebar.pricing')}`;
      case '/customers':
        return `${dashboard} > Customers`;
      case '/reports':
        return `${dashboard} > Reports`;
      case '/settings':
        return `${dashboard} > ${t('sidebar.settings')}`;
      default:
        return dashboard;
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            isCollapsed={isSidebarCollapsed} 
            onToggle={toggleSidebar} 
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={toggleMobileMenu}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed ltr:left-0 rtl:right-0 top-0 h-full z-50 lg:hidden"
              >
                <Sidebar 
                  isCollapsed={false} 
                  onToggle={toggleMobileMenu} 
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header 
            onMenuToggle={toggleMobileMenu}
            showMenuButton={isMobile}
          />

          {/* Page Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {getBreadcrumb()}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getPageTitle()}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('auth.welcomeBack')}! {t('dashboard.overview')}
              </p>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            <Suspense fallback={<LoadingSpinner />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-6 ${(location.pathname === '/dashboard' || location.pathname === '/comparison') ? 'text-sm' : ''}`}
              >
                {children}
              </motion.div>
            </Suspense>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Layout; 