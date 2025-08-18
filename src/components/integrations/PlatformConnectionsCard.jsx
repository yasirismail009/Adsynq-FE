import { motion } from 'framer-motion';
import { 
  UserIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  LinkIcon,
  GlobeAltIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { 
  processPlatformConnections, 
  getConnectionStatus, 
  getStatusColor, 
  formatPageData,
  calculateConnectionMetrics,
  isValidConnectionsData 
} from '../../utils/platform-connections';

const PlatformConnectionsCard = ({ connectionsData }) => {
  if (!connectionsData || !connectionsData.result) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          No platform connections found
        </div>
      </div>
    );
  }

  const { result } = connectionsData;
  const { meta_connections, google_accounts, tiktok_connections, total_connections } = result;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Connections</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total_connections}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <LinkIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Meta Connections</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.total_meta_connections}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <img 
                src="/assets/facebook.svg" 
                alt="Meta" 
                className="h-6 w-6 object-contain"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Google Accounts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.total_google_accounts}</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <img 
                src="/assets/google.svg" 
                alt="Google" 
                className="h-6 w-6 object-contain"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">TikTok Connections</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.total_tiktok_connections}</p>
            </div>
            <div className="p-2 bg-black rounded-lg">
              <img 
                src="/assets/tiktok.svg" 
                alt="TikTok" 
                className="h-6 w-6 object-contain"
              />
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default PlatformConnectionsCard; 