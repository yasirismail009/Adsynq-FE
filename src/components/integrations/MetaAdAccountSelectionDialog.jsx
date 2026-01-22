import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { 
  ChartBarIcon, 
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Modal from '../ui/Modal';
import { usePlanType, useUsageLimits } from '../../hooks/useSubscription';
import { selectSubscriptionId } from '../../store/slices/subscriptionSlice';

const MetaAdAccountSelectionDialog = ({
  isOpen,
  onClose,
  availableAdAccounts,
  loadingAdAccounts,
  onSubmit,
  onRetry
}) => {
  const { t } = useTranslation();
  const { isFree, isPremium, isEnterprise } = usePlanType();
  const { maxAdAccounts, maxCampaigns } = useUsageLimits();
  const subscriptionId = useSelector(selectSubscriptionId);
  
  // State for selected ad accounts and campaigns
  const [selectedAccounts, setSelectedAccounts] = useState(new Set());
  const [selectedCampaigns, setSelectedCampaigns] = useState(new Map()); // Map<accountId, Set<campaignId>>
  const [expandedAccount, setExpandedAccount] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine limits based on subscription ID
  // If subscription ID === 1: can select 1 ad account and 1 campaign
  // Otherwise: can only select ad accounts (no campaign selection)
  const isSubscriptionIdOne = subscriptionId === 1;
  const maxAccounts = isFree ? 1 : isPremium ? 2 : Infinity;
  const allowCampaignSelection = isSubscriptionIdOne; // Only allow campaign selection if subscription ID === 1
  const maxCampaignsPerAccount = isSubscriptionIdOne ? 1 : 0; // 1 campaign if subscription ID === 1, 0 otherwise (disabled)

  // Reset selections when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAccounts(new Set());
      setSelectedCampaigns(new Map());
      setExpandedAccount(null);
    } else {
      // Pre-select accounts that are already selected (using clean_id for backend compatibility)
      const preSelected = new Set(
        availableAdAccounts
          .filter(account => account.is_selected)
          .map(account => account.clean_id || account.account_id_clean || account.account_id || account.ad_account_id || account.id)
      );
      setSelectedAccounts(preSelected);
    }
  }, [isOpen, availableAdAccounts]);

  // Handle ad account selection
  const handleAccountToggle = (accountId) => {
    const newSelected = new Set(selectedAccounts);
    
    if (newSelected.has(accountId)) {
      // Deselect account
      newSelected.delete(accountId);
      // Remove all campaigns for this account
      const newCampaigns = new Map(selectedCampaigns);
      newCampaigns.delete(accountId);
      setSelectedCampaigns(newCampaigns);
      setExpandedAccount(null);
    } else {
      // Check limit
      if (newSelected.size >= maxAccounts) {
        return; // Cannot select more accounts
      }
      newSelected.add(accountId);
      // Only expand if campaign selection is allowed (subscription ID === 1)
      if (allowCampaignSelection) {
        setExpandedAccount(accountId);
      }
    }
    
    setSelectedAccounts(newSelected);
  };

  // Handle campaign selection (only allowed if subscription ID === 1)
  const handleCampaignToggle = (accountId, campaignId) => {
    // Only allow campaign selection if subscription ID === 1
    if (!allowCampaignSelection) {
      return;
    }
    
    const accountCampaigns = selectedCampaigns.get(accountId) || new Set();
    const newAccountCampaigns = new Set(accountCampaigns);
    
    if (newAccountCampaigns.has(campaignId)) {
      newAccountCampaigns.delete(campaignId);
    } else {
      // Check limit: 1 campaign total across all accounts (subscription ID === 1)
      if (isSubscriptionIdOne) {
        const totalSelected = Array.from(selectedCampaigns.values()).reduce((sum, set) => sum + set.size, 0);
        if (totalSelected >= 1) {
          return; // Cannot select more than 1 campaign
        }
      }
      newAccountCampaigns.add(campaignId);
    }
    
    const newCampaigns = new Map(selectedCampaigns);
    if (newAccountCampaigns.size > 0) {
      newCampaigns.set(accountId, newAccountCampaigns);
    } else {
      newCampaigns.delete(accountId);
    }
    setSelectedCampaigns(newCampaigns);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (selectedAccounts.size === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const accountIds = Array.from(selectedAccounts);
      const campaignIds = Array.from(selectedCampaigns.values()).flatMap(set => Array.from(set));
      
      // Prepare data for POST /api/meta/bulk-select/
      const data = {};
      if (accountIds.length > 0) {
        data.ad_account_ids = accountIds;
      }
      // Only include campaign_ids if subscription ID === 1
      if (allowCampaignSelection && campaignIds.length > 0) {
        data.campaign_ids = campaignIds;
      }

      console.log('Submitting Meta bulk select:', data);

      if (onSubmit) {
        await onSubmit(data);
      }
    } catch (error) {
      console.error('Failed to submit selection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if account can be selected
  const canSelectAccount = () => {
    return isEnterprise || selectedAccounts.size < maxAccounts;
  };

  // Get total selected campaigns count
  const getTotalSelectedCampaigns = () => {
    return Array.from(selectedCampaigns.values()).reduce((sum, set) => sum + set.size, 0);
  };

  // Check if submit is enabled
  // If subscription ID === 1: require 1 account and 1 campaign
  // Otherwise: only require at least 1 account
  const canSubmit = selectedAccounts.size > 0 && 
    (isSubscriptionIdOne ? getTotalSelectedCampaigns() === 1 : true);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('integrations.metaAdAccountSelection.title', 'Select Meta Ad Accounts & Campaigns')}
      size="default"
    >
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('integrations.metaAdAccountSelection.subtitle', 'Choose Meta ad accounts and their campaigns to connect with your subscription.')}
        </p>

        {/* Plan limits info */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-400">
            <ChartBarIcon className="w-4 h-4" />
            <span>
              {isSubscriptionIdOne
                ? t('integrations.metaAdAccountSelection.subscriptionOneLimit', 'Select 1 ad account and 1 campaign')
                : isFree 
                ? t('integrations.metaAdAccountSelection.freeLimit', 'Free Plan: Select 1 ad account and 1 campaign')
                : isPremium
                ? t('integrations.metaAdAccountSelection.premiumLimit', 'Premium Plan: Select up to 2 ad accounts (campaigns not available)')
                : t('integrations.metaAdAccountSelection.enterpriseLimit', 'Enterprise Plan: Select unlimited ad accounts (campaigns not available)')
              }
            </span>
          </div>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-500">
            {t('integrations.metaAdAccountSelection.selected', 'Selected:')} {selectedAccounts.size} {t('integrations.accounts', 'account(s)')}, {getTotalSelectedCampaigns()} {t('common.campaigns', 'campaign(s)')}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loadingAdAccounts ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                {t('common.loading', 'Loading...')}
              </span>
            </div>
          ) : availableAdAccounts.length === 0 ? (
            <div className="text-center py-8">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('integrations.metaAdAccountSelection.noAccounts', 'No Ad Accounts Available')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('integrations.metaAdAccountSelection.noAccountsDesc', 'Unable to load ad accounts. Please try again.')}
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg transition-colors"
                >
                  {t('common.retry', 'Retry')}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {availableAdAccounts.map((account) => {
                // Use clean_id for backend API (without "act_" prefix)
                const accountId = account.clean_id || account.account_id_clean || account.account_id || account.ad_account_id || account.id;
                const accountName = account.account_name || account.ad_account_name || account.name;
                const accountStatus = account.account_status;
                const currency = account.currency || 'USD';
                const campaigns = account.campaigns || [];
                const campaignsCount = account.campaigns_count || campaigns.length;
                const isSelected = selectedAccounts.has(accountId);
                const isExpanded = expandedAccount === accountId;
                const accountCampaigns = selectedCampaigns.get(accountId) || new Set();
                
                // Convert account_status (1 = Active, 3 = Disabled, etc.)
                const statusText = accountStatus === 1 ? 'Active' : accountStatus === 3 ? 'Disabled' : 'Inactive';

                return (
                  <div
                    key={accountId}
                    className={`border rounded-lg overflow-hidden transition-colors ${
                      isSelected 
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    } ${
                      !canSelectAccount() && !isSelected ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {/* Account Row */}
                    <div
                      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        !canSelectAccount() && !isSelected ? 'cursor-not-allowed' : ''
                      }`}
                      onClick={() => canSelectAccount() || isSelected ? handleAccountToggle(accountId) : null}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-[#174A6E] border-[#174A6E]' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            <CheckCircleIcon className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {accountName || `Account ${accountId}`}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ID: {accountId} • {currency} • {statusText} • {campaignsCount} {t('common.campaigns', 'campaigns')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isSelected && accountCampaigns.size > 0 && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                            {accountCampaigns.size} {t('integrations.customers.selected', 'selected')}
                          </span>
                        )}
                        {/* Only show expand button if subscription ID === 1 (campaigns available) */}
                        {allowCampaignSelection && campaigns.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelected) {
                                setExpandedAccount(isExpanded ? null : accountId);
                              } else if (canSelectAccount()) {
                                handleAccountToggle(accountId);
                              }
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            {isExpanded ? (
                              <XMarkIcon className="w-5 h-5" />
                            ) : (
                              <ChartBarIcon className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Campaigns List (Expanded) - Only show if subscription ID === 1 */}
                    {isSelected && isExpanded && allowCampaignSelection && campaigns.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          {t('common.campaigns', 'Campaigns')}
                        </h4>
                        {campaigns.map((campaign) => {
                          const campaignId = campaign.campaign_id || campaign.id;
                          const isCampaignSelected = accountCampaigns.has(campaignId);
                          const totalSelected = getTotalSelectedCampaigns();
                          const canSelect = (isSubscriptionIdOne && totalSelected < 1) || isCampaignSelected;

                          return (
                            <div
                              key={campaignId}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                isCampaignSelected
                                  ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                              } ${
                                !canSelect ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                              onClick={() => canSelect ? handleCampaignToggle(accountId, campaignId) : null}
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                  isCampaignSelected
                                    ? 'bg-green-600 border-green-600'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {isCampaignSelected && (
                                    <CheckCircleIcon className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {campaign.campaign_name || campaign.name}
                                  </h5>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {campaign.objective || 'N/A'} • {campaign.status || 'Active'}
                                  </p>
                                </div>
                              </div>
                              {!canSelect && isSubscriptionIdOne && (
                                <SparklesIcon className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Show message if campaigns are not available for this subscription */}
                    {isSelected && isExpanded && !allowCampaignSelection && campaigns.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          {t('integrations.metaAdAccountSelection.campaignsNotAvailable', 'Campaign selection is not available for your subscription plan. Only ad accounts can be selected.')}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer with Submit Button */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedAccounts.size > 0 ? (
              <span>
                {selectedAccounts.size} {t('integrations.accounts', 'account(s)')}
                {allowCampaignSelection && ` • ${getTotalSelectedCampaigns()} ${t('common.campaigns', 'campaign(s)')}`}
                {' '}{t('integrations.metaAdAccountSelection.selected', 'selected')}
              </span>
            ) : (
              <span>
                {t('integrations.metaAdAccountSelection.selectAccountFirst', 'Please select at least one ad account')}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="px-4 py-2 bg-[#174A6E] hover:bg-[#0B3049] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t('common.submitting', 'Submitting...')}</span>
                </>
              ) : (
                <span>{t('common.submit', 'Submit')}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MetaAdAccountSelectionDialog;
