import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PlaceholderPage = () => {
  const location = useLocation();
  const pageName = location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Placeholder Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-blue-600 dark:text-blue-400">🚧</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {pageName} Page Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This page is under development. Check back soon for updates!
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>• Analytics Dashboard</span>
            <span>• Customer Management</span>
            <span>• Report Generation</span>
          </div>
        </div>
      </div>

      {/* Sample Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4"></div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Feature {item}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This feature will be available soon with full functionality.
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PlaceholderPage; 