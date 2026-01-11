import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckIcon,
  ChevronLeftIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useUsageLimits, usePlanType } from '../../hooks/useSubscription';
import { showSuccessToast, showErrorToast } from '../../hooks/useToast';
import { apiService } from '../../services/api';

const AdAccountSelection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get plan limits
  const { maxAdAccounts } = useUsageLimits();
  const { planType, isFree, isPremium, isEnterprise } = usePlanType();

  // Get platform from URL params
  const platform = searchParams.get('platform') || 'google';
  const integrationId = searchParams.get('integrationId');

  const [adAccounts, setAdAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    const fetchAdAccounts = async () => {
      setLoading(true);
      try {
        let response;

        if (platform === 'google') {
          // Fetch Google customers
          response = await apiService.marketing.getCustomers();
        } else if (platform === 'meta') {
          // Fetch Meta ad accounts
          response = await apiService.meta.getAdAccountsList();
        }

        if (response.data.error === false && response.data.result) {
          const accounts = platform === 'google'
            ? response.data.result.customers || []
            : response.data.result.ad_accounts || [];

          // Transform data to consistent format for UI
          const transformedAccounts = accounts.map(account => ({
            id: platform === 'google' ? account.customer_id : account.ad_account_id,
            name: platform === 'google' ? account.descriptive_name : account.ad_account_name,
            status: platform === 'google' ? account.status : account.ad_account_status,
            currency: account.currency_code || account.currency,
            isSelected: account.is_selected || false,
            // Keep original data for API calls
            originalData: account
          }));

          setAdAccounts(transformedAccounts);

          // Pre-select accounts that are already selected
          const preSelected = transformedAccounts
            .filter(account => account.isSelected)
            .map(account => account.id);

          setSelectedAccounts(preSelected);
        } else {
          console.error('API returned error:', response.data);
          showErrorToast('Failed to load ad accounts');
        }
      } catch (error) {
        console.error('Failed to fetch ad accounts:', error);
        const errorMessage = error.response?.data?.message || 'Failed to load ad accounts';
        showErrorToast(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAdAccounts();
  }, [platform]);

  const handleAccountSelect = (accountId) => {
    const maxSelection = isEnterprise ? adAccounts.length : maxAdAccounts;

    setSelectedAccounts(prev => {
      if (prev.includes(accountId)) {
        // Remove selection
        return prev.filter(id => id !== accountId);
      } else {
        // Add selection (check limit for non-enterprise)
        if (!isEnterprise && prev.length >= maxSelection) {
          showErrorToast(`You can only select up to ${maxSelection} ad account${maxSelection > 1 ? 's' : ''} with your ${planType} plan`);
          return prev;
        }
        return [...prev, accountId];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedAccounts.length === 0) {
      showErrorToast('Please select at least one ad account to continue');
      return;
    }

    setSaving(true);
    try {
      // Save the selected accounts to backend
      const selectionData = {
        platform,
        selected_accounts: selectedAccounts
      };

      if (platform === 'google') {
        await apiService.marketing.saveCustomerSelection(selectionData);
      } else if (platform === 'meta') {
        await apiService.meta.saveAdAccountSelection(selectionData);
      }

      showSuccessToast('Ad accounts configured successfully!');

      // Navigate to the appropriate dashboard based on platform
      if (platform === 'google') {
        navigate('/google');
      } else if (platform === 'meta') {
        navigate(`/meta/${integrationId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to save ad account selection:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save selection. Please try again.';
      showErrorToast(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getSelectionLimitText = () => {
    if (isEnterprise) {
      return t('integrations.selection.noLimit', 'No selection limit');
    }
    return t('integrations.selection.limit', { count: maxAdAccounts, plan: planType });
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'google':
        return t('integrations.googleAds');
      case 'meta':
        return t('integrations.metaAds');
      default:
        return platform;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading ad accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/integrations')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            {t('common.back')}
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('integrations.selection.title', 'Select Ad Accounts')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {t('integrations.selection.subtitle', { platform: getPlatformName() })}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 inline-block">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                {getSelectionLimitText()}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Ad Accounts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('integrations.selection.availableAccounts', 'Available Ad Accounts')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('integrations.selection.selectAccounts', 'Select the ad accounts you want to manage')}
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {adAccounts.map((account, index) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  (account.status && account.status.toLowerCase() !== 'active' && account.status !== 'ENABLED') ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedAccounts.includes(account.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedAccounts.includes(account.id) && (
                        <CheckIcon className="w-3 h-3 text-white" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {account.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {account.id} • {account.currency || 'USD'}
                      </p>
                      {account.status && account.status.toLowerCase() !== 'active' && account.status !== 'ENABLED' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 mt-1">
                          {account.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {account.status === 'active' && (
                  <button
                    onClick={() => handleAccountSelect(account.id)}
                    disabled={
                      (account.status && account.status.toLowerCase() !== 'active' && account.status !== 'ENABLED') ||
                      (!isEnterprise && !selectedAccounts.includes(account.id) && selectedAccounts.length >= maxAdAccounts)
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedAccounts.includes(account.id)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : (account.status && account.status.toLowerCase() !== 'active' && account.status !== 'ENABLED')
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : !isEnterprise && selectedAccounts.length >= maxAdAccounts
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {selectedAccounts.includes(account.id) ? t('common.selected') : t('common.select')}
                  </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {adAccounts.length === 0 && (
            <div className="p-8 text-center">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('integrations.selection.noAccounts', 'No Ad Accounts Found')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('integrations.selection.noAccountsDesc', 'Unable to load ad accounts. Please try again.')}
              </p>
            </div>
          )}
        </motion.div>

        {/* Continue Button */}
        {selectedAccounts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-center"
          >
            <button
              onClick={handleContinue}
              disabled={saving}
              className="flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              ) : (
                <ArrowRightIcon className="w-5 h-5 mr-3" />
              )}
              {t('integrations.selection.continue', 'Continue to Dashboard')}
            </button>
          </motion.div>
        )}

        {/* Selection Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t('integrations.selection.selectedCount', { count: selectedAccounts.length, total: isEnterprise ? adAccounts.length : maxAdAccounts })}
            </span>
            <span className={`font-medium ${
              selectedAccounts.length > (isEnterprise ? adAccounts.length : maxAdAccounts)
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}>
              {selectedAccounts.length}/{isEnterprise ? adAccounts.length : maxAdAccounts} {t('integrations.selection.accountsSelected', 'accounts selected')}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdAccountSelection;