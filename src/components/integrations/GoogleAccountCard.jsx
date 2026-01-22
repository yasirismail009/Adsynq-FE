import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  SparklesIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { usePlanType } from '../../hooks/useSubscription';

const GoogleAccountCard = ({ account, onSelectCustomer }) => {
  const { t } = useTranslation();
  const { isFree, isPremium, isEnterprise } = usePlanType();

  const selectedCustomers = account.selected_customers?.filter(c => c.is_selected) || [];
  const nonSelectedCustomers = account.selected_customers?.filter(c => !c.is_selected) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Account Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {account.google_account?.picture && (
              <img
                src={account.google_account.picture}
                alt={account.google_account.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {account.google_account?.name || 'Google Account'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {account.google_account?.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedCustomers.length} {t('integrations.customers.selected', 'selected')}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {account.selected_customers_count || 0} {t('integrations.customers.total', 'total')}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Customers */}
      {selectedCustomers.length > 0 && (
        <div className="p-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {t('integrations.customers.selectedCustomers', 'Selected Customers')}
          </h4>
          <div className="space-y-3">
            {selectedCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {customer.descriptive_name || `Customer ${customer.customer_id}`}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ID: {customer.customer_id} • {customer.currency_code}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                  {t('integrations.customers.active', 'Active')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-Selected Customers (Blurred with Premium Icon) */}
      {nonSelectedCustomers.length > 0 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('integrations.customers.otherCustomers', 'Other Customers')}
            </h4>
            {isFree && (
              <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
                <SparklesIcon className="w-4 h-4" />
                <span>{t('integrations.customers.premiumRequired', 'Premium Required')}</span>
              </div>
            )}
          </div>
          <div className="space-y-3 relative">
            {nonSelectedCustomers.map((customer) => (
              <div
                key={customer.id}
                className="relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                style={{ 
                  opacity: 0.5,
                  filter: 'blur(3px)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h5 className="font-medium text-gray-600 dark:text-gray-400">
                      {customer.descriptive_name || `Customer ${customer.customer_id}`}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      ID: {customer.customer_id} • {customer.currency_code}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-[#174A6E] to-[#0B3049] text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg">
                    <SparklesIcon className="w-4 h-4" />
                    <span>{t('integrations.customers.premium', 'Premium')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GoogleAccountCard;
