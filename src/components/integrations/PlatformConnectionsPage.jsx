import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeftIcon,
  PlusIcon,
  RefreshIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import PlatformConnectionsCard from './PlatformConnectionsCard';
import { 
  fetchPlatformConnections, 
  selectPlatformConnections, 
  selectDashboardLoading, 
  selectDashboardErrors 
} from '../../store/slices/dashboardSlice';

const PlatformConnectionsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const platformConnections = useSelector(selectPlatformConnections);
  const loading = useSelector(selectDashboardLoading);
  const errors = useSelector(selectDashboardErrors);

  // Fetch platform connections on component mount
  useEffect(() => {
    dispatch(fetchPlatformConnections());
  }, [dispatch]);

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchPlatformConnections());
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Handle connect new platform
  const handleConnectPlatform = () => {
    navigate('/integrations');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Platform Connections
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your connected advertising platforms and social media accounts
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading.platformConnections}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshIcon className={`w-4 h-4 ${loading.platformConnections ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleConnectPlatform}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-[#174A6E] border border-transparent rounded-lg hover:bg-[#0B3049] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#174A6E] transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Connect Platform</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading.platformConnections && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading platform connections...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {errors.platformConnections && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6"
        >
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Error Loading Platform Connections
              </h3>
              <p className="text-red-700 dark:text-red-300 mt-1">
                {errors.platformConnections}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <RefreshIcon className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Success State */}
      {platformConnections && !loading.platformConnections && !errors.platformConnections && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Success Message */}
          {platformConnections.result && platformConnections.result.total_connections > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    Platform connections loaded successfully
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Found {platformConnections.result.total_connections} total connection(s)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Platform Connections Data */}
          <PlatformConnectionsCard connectionsData={platformConnections} />

          {/* Additional Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleConnectPlatform}
                className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <PlusIcon className="w-6 h-6 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Connect New Platform
                </span>
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center space-x-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshIcon className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Refresh Data
                </span>
              </button>
              <button
                onClick={() => navigate('/integrations')}
                className="flex items-center justify-center space-x-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  View All Integrations
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {platformConnections && !loading.platformConnections && !errors.platformConnections && 
       (!platformConnections.result || platformConnections.result.total_connections === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <PlusIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Platform Connections Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Connect your advertising platforms to start tracking performance and managing campaigns from one place.
          </p>
          <button
            onClick={handleConnectPlatform}
            className="inline-flex items-center space-x-2 px-6 py-3 text-white bg-[#174A6E] rounded-lg hover:bg-[#0B3049] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#174A6E] transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Connect Your First Platform</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default PlatformConnectionsPage; 