import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChartBarIcon, 
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Modal from '../ui/Modal';
import { usePlanType, useUsageLimits } from '../../hooks/useSubscription';

const CustomerSelectionDialog = ({
  isOpen,
  onClose,
  availableCustomers,
  loadingCustomers,
  onCustomerSelect,
  onRetry,
  onSubmit
}) => {
  const { t } = useTranslation();
  const { isFree, isPremium } = usePlanType();
  const { maxAdAccounts } = useUsageLimits();
  
  // State for selected customers and campaigns
  const [selectedCustomers, setSelectedCustomers] = useState(new Set());
  const [selectedCampaigns, setSelectedCampaigns] = useState(new Map()); // Map<customerId, Set<campaignId>>
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine limits based on plan
  const maxCustomers = isFree ? 1 : isPremium ? 2 : Infinity;
  const maxCampaignsPerCustomer = isFree ? 1 : Infinity; // Free: 1 campaign total, Premium: all campaigns

  // Reset selections when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCustomers(new Set());
      setSelectedCampaigns(new Map());
      setExpandedCustomer(null);
    }
  }, [isOpen]);

  // Handle customer selection
  const handleCustomerToggle = (customerId) => {
    const newSelected = new Set(selectedCustomers);
    
    if (newSelected.has(customerId)) {
      // Deselect customer
      newSelected.delete(customerId);
      // Remove all campaigns for this customer
      const newCampaigns = new Map(selectedCampaigns);
      newCampaigns.delete(customerId);
      setSelectedCampaigns(newCampaigns);
      setExpandedCustomer(null);
    } else {
      // For free plan: only allow 1 customer at a time
      if (isFree && newSelected.size >= 1) {
        // If trying to select a different customer, replace the current one
        const currentCustomerId = Array.from(newSelected)[0];
        newSelected.delete(currentCustomerId);
        // Clear campaigns from the previous customer
        const newCampaigns = new Map(selectedCampaigns);
        newCampaigns.delete(currentCustomerId);
        setSelectedCampaigns(newCampaigns);
      } else if (!isFree && newSelected.size >= maxCustomers) {
        return; // Cannot select more customers
      }
      newSelected.add(customerId);
      setExpandedCustomer(customerId);
    }
    
    setSelectedCustomers(newSelected);
  };

  // Handle campaign selection
  const handleCampaignToggle = (customerId, campaignId) => {
    const customerCampaigns = selectedCampaigns.get(customerId) || new Set();
    const newCustomerCampaigns = new Set(customerCampaigns);
    
    if (newCustomerCampaigns.has(campaignId)) {
      newCustomerCampaigns.delete(campaignId);
    } else {
      // Check limit for free plan (1 campaign total across all customers)
      if (isFree) {
        const totalSelected = Array.from(selectedCampaigns.values()).reduce((sum, set) => sum + set.size, 0);
        if (totalSelected >= 1) {
          return; // Cannot select more campaigns on free plan
        }
      }
      newCustomerCampaigns.add(campaignId);
    }
    
    const newCampaigns = new Map(selectedCampaigns);
    if (newCustomerCampaigns.size > 0) {
      newCampaigns.set(customerId, newCustomerCampaigns);
    } else {
      newCampaigns.delete(customerId);
    }
    setSelectedCampaigns(newCampaigns);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (selectedCustomers.size === 0) {
      return;
    }

    // For free plan: validate that exactly 1 customer and 1 campaign are selected
    if (isFree) {
      if (selectedCustomers.size !== 1) {
        console.warn('Free plan requires exactly 1 customer');
        return;
      }
      if (getTotalSelectedCampaigns() !== 1) {
        console.warn('Free plan requires exactly 1 campaign');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const customerIds = Array.from(selectedCustomers);
      const campaignIds = Array.from(selectedCampaigns.values()).flatMap(set => Array.from(set));
      
      const data = {};
      if (customerIds.length > 0) {
        data.customer_ids = customerIds;
      }
      // Only include campaigns for free plan - non-free plans can only select ad accounts/customers
      // For free plan, ensure exactly 1 campaign is included
      if (isFree && campaignIds.length === 1) {
        data.campaign_ids = campaignIds;
      }

      if (onSubmit) {
        await onSubmit(data);
      } else if (onCustomerSelect) {
        // Fallback to old API for single customer
        if (customerIds.length === 1) {
          await onCustomerSelect(customerIds[0]);
        }
      }
    } catch (error) {
      console.error('Failed to submit selection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if customer can be selected
  const canSelectCustomer = (customerId) => {
    // For free plan: can only select 1 customer, but can switch to a different one
    if (isFree) {
      return selectedCustomers.size < 1 || selectedCustomers.has(customerId);
    }
    return selectedCustomers.size < maxCustomers;
  };

  // Get total selected campaigns count
  const getTotalSelectedCampaigns = () => {
    return Array.from(selectedCampaigns.values()).reduce((sum, set) => sum + set.size, 0);
  };

  // Check if submit is enabled
  // For free plan: must have exactly 1 customer and exactly 1 campaign
  // For other plans: must have at least 1 customer
  const canSubmit = selectedCustomers.size > 0 && 
    (!isFree || (selectedCustomers.size === 1 && getTotalSelectedCampaigns() === 1));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('integrations.customerSelection.title', 'Select Google Customer & Campaigns')}
      size="default"
    >
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('integrations.customerSelection.subtitle', 'Choose Google Ads customers and their campaigns to connect with your subscription.')}
        </p>

        {/* Plan limits info */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-400">
            <ChartBarIcon className="w-4 h-4" />
            <span>
              {isFree 
                ? t('integrations.customerSelection.freeLimit', 'Free Plan: Select exactly 1 ad account and 1 campaign')
                : isPremium
                ? t('integrations.customerSelection.premiumLimit', 'Premium Plan: Select up to 2 customers (campaigns not available)')
                : t('integrations.customerSelection.enterpriseLimit', 'Enterprise Plan: Select unlimited customers (campaigns not available)')
              }
            </span>
          </div>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-500">
            {t('integrations.customerSelection.selected', 'Selected:')} {selectedCustomers.size} {t('integrations.customers.selected', 'customer(s)')}
            {isFree && `, ${getTotalSelectedCampaigns()} ${t('common.campaigns', 'campaign(s)')}`}
            {!isFree && (
              <span className="ml-2 text-orange-600 dark:text-orange-400">
                ({t('integrations.customerSelection.campaignsNotAvailable', 'Campaigns not available for this plan')})
              </span>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loadingCustomers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                {t('common.loading', 'Loading...')}
              </span>
            </div>
          ) : availableCustomers.length === 0 ? (
            <div className="text-center py-8">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('integrations.customerSelection.noCustomers', 'No Customers Available')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('integrations.customerSelection.noCustomersDesc', 'Unable to load customer accounts. Please try again.')}
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {t('common.retry', 'Retry')}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {availableCustomers.map((customer) => {
                const isSelected = selectedCustomers.has(customer.customer_id || customer.id);
                const isExpanded = expandedCustomer === (customer.customer_id || customer.id);
                const customerCampaigns = selectedCampaigns.get(customer.customer_id || customer.id) || new Set();
                const campaigns = customer.campaigns || [];
                const customerId = customer.customer_id || customer.id;

                return (
                  <div
                    key={customerId}
                    className={`border rounded-lg overflow-hidden transition-colors ${
                      isSelected 
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {/* Customer Row */}
                    <div
                      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        !canSelectCustomer(customerId) && !isSelected ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => canSelectCustomer(customerId) || isSelected ? handleCustomerToggle(customerId) : null}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            <CheckCircleIcon className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {customer.descriptive_name || customer.name || `Customer ${customerId}`}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ID: {customerId} • {customer.currency_code || customer.currency || 'USD'} • {campaigns.length} {t('common.campaigns', 'Campaigns')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isSelected && isFree && customerCampaigns.size > 0 && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                            {customerCampaigns.size} {t('integrations.customers.selected', 'selected')}
                          </span>
                        )}
                        {/* Only show expand button for free plan to select campaigns */}
                        {isFree && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSelected) {
                              setExpandedCustomer(isExpanded ? null : customerId);
                            } else if (canSelectCustomer(customerId)) {
                              handleCustomerToggle(customerId);
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

                    {/* Campaigns List (Expanded) - Only show for free plan */}
                    {isSelected && isExpanded && campaigns.length > 0 && isFree && (
                      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          {t('common.campaigns', 'Campaigns')}
                        </h4>
                        {campaigns.map((campaign) => {
                          const campaignId = campaign.campaign_id || campaign.id;
                          const isCampaignSelected = customerCampaigns.has(campaignId);
                          const canSelect = !isFree || getTotalSelectedCampaigns() < 1 || isCampaignSelected;

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
                              onClick={() => canSelect ? handleCampaignToggle(customerId, campaignId) : null}
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
                                    {campaign.name}
                                  </h5>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {campaign.advertising_channel_type} • {campaign.status}
                                  </p>
                                </div>
                              </div>
                              {!canSelect && isFree && (
                                <SparklesIcon className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                          );
                        })}
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
            {selectedCustomers.size > 0 ? (
              <span>
                {selectedCustomers.size} {t('integrations.customers.selected', 'customer(s)')}
                {isFree && ` • ${getTotalSelectedCampaigns()} ${t('common.campaigns', 'campaign(s)')}`}
                {' '}{t('integrations.customerSelection.selected', 'selected')}
                {isFree && (selectedCustomers.size !== 1 || getTotalSelectedCampaigns() !== 1) && (
                  <span className="ml-2 text-orange-600 dark:text-orange-400 text-xs">
                    ({t('integrations.customerSelection.freeRequirement', 'Free plan requires exactly 1 ad account and 1 campaign')})
                  </span>
                )}
              </span>
            ) : (
              <span>
                {isFree 
                  ? t('integrations.customerSelection.freeSelectFirst', 'Please select exactly 1 ad account and 1 campaign')
                  : t('integrations.customerSelection.selectCustomerFirst', 'Please select at least one customer')
                }
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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

export default CustomerSelectionDialog;