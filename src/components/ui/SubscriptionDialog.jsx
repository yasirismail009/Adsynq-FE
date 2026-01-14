import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  XMarkIcon,
  CheckIcon,
  StarIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import {
  fetchSubscriptionPlans,
  fetchCurrentSubscription,
  fetchSubscriptionUsage,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  selectSubscriptionPlans,
  selectSubscriptionPlansLoading,
  selectSubscriptionPlansError,
  selectCurrentSubscription,
  selectSubscriptionLoading,
  selectSubscriptionError,
  selectSubscriptionUsage,
  selectSubscriptionOperationLoading,
  selectSubscriptionOperationError,
  selectShowSubscriptionDialog,
  selectSelectedPlanId,
  hideSubscriptionDialog,
  clearSubscriptionError
} from '../../store/slices/subscriptionSlice';

const SubscriptionDialog = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const show = useSelector(selectShowSubscriptionDialog);
  const selectedPlanId = useSelector(selectSelectedPlanId);

  // Redux state
  const plans = useSelector(selectSubscriptionPlans);
  const plansLoading = useSelector(selectSubscriptionPlansLoading);
  const plansError = useSelector(selectSubscriptionPlansError);
  const currentSubscription = useSelector(selectCurrentSubscription);
  const subscriptionLoading = useSelector(selectSubscriptionLoading);
  const subscriptionError = useSelector(selectSubscriptionError);
  const usage = useSelector(selectSubscriptionUsage);
  const operationLoading = useSelector(selectSubscriptionOperationLoading);
  const operationError = useSelector(selectSubscriptionOperationError);

  // Local state
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingInterval, setBillingInterval] = useState('monthly');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Load data when dialog opens
  useEffect(() => {
    if (show) {
      dispatch(fetchSubscriptionPlans());

      // Only fetch current subscription and usage if user is authenticated
      // These endpoints might not exist yet, so handle gracefully
      try {
        dispatch(fetchCurrentSubscription());
        dispatch(fetchSubscriptionUsage());
      } catch (error) {
        console.warn('Subscription endpoints not available:', error);
      }

      setBillingInterval('monthly');
      setShowCancelConfirm(false);
    }
  }, [show, dispatch]);

  // Pre-select plan when plans are loaded and selectedPlanId is provided
  useEffect(() => {
    if (show && plans.length > 0 && selectedPlanId && !selectedPlan) {
      const planToSelect = plans.find(p => p.id === selectedPlanId || String(p.id) === String(selectedPlanId));
      if (planToSelect) {
        setSelectedPlan(planToSelect);
      }
    }
  }, [show, plans, selectedPlanId, selectedPlan]);

  // Handle dialog close
  const handleClose = () => {
    dispatch(hideSubscriptionDialog());
    dispatch(clearSubscriptionError());
  };

  // Handle plan selection
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  // Handle subscription creation
  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    try {
      // If user already has a subscription, use update instead of create
      if (currentSubscription) {
        await dispatch(updateSubscription({
          plan_id: selectedPlan.id,
          billing_interval: billingInterval,
        })).unwrap();
      } else {
        await dispatch(createSubscription({
          plan_id: selectedPlan.id,
          billing_interval: billingInterval,
        })).unwrap();
      }

      // Success - refresh current subscription and dialog will close automatically via Redux
      dispatch(fetchCurrentSubscription());
    } catch (error) {
      // If create fails with 409 (conflict), try update instead
      if (error?.response?.status === 409 || error?.status === 409) {
        try {
          await dispatch(updateSubscription({
            plan_id: selectedPlan.id,
            billing_interval: billingInterval,
          })).unwrap();
          dispatch(fetchCurrentSubscription());
        } catch (updateError) {
          // Error handled by Redux
          console.error('Failed to update subscription:', updateError);
        }
      } else {
        // Error handled by Redux
        console.error('Failed to create subscription:', error);
      }
    }
  };

  // Handle subscription update
  const handleUpdateSubscription = async () => {
    if (!selectedPlan) return;

    try {
      await dispatch(updateSubscription({
        plan_id: selectedPlan.id,
        billing_interval: billingInterval,
      })).unwrap();

      // Success - refresh current subscription and dialog will close automatically via Redux
      dispatch(fetchCurrentSubscription());
    } catch (error) {
      // Error handled by Redux
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    try {
      await dispatch(cancelSubscription()).unwrap();
      setShowCancelConfirm(false);
    } catch (error) {
      // Error handled by Redux
    }
  };

  // Get plan features for display
  const getPlanFeatures = (plan) => {
    const features = [];

    if (plan.max_ad_accounts !== null) {
      features.push(`${plan.max_ad_accounts === -1 ? t('subscription.unlimited') : plan.max_ad_accounts} ${t('subscription.adAccounts')}`);
    }
    if (plan.max_campaigns !== null) {
      features.push(`${plan.max_campaigns === -1 ? t('subscription.unlimited') : plan.max_campaigns} ${t('subscription.campaigns')}`);
    }

    if (plan.has_google_ads) features.push(t('subscription.features.googleAds'));
    if (plan.has_meta_ads) features.push(t('subscription.features.metaAds'));
    if (plan.has_advanced_analytics) features.push(t('subscription.features.advancedAnalytics'));
    if (plan.has_custom_reports) features.push(t('subscription.features.customReports'));
    if (plan.has_api_access) features.push(t('subscription.features.apiAccess'));
    if (plan.has_priority_support) features.push(t('subscription.features.prioritySupport'));
    if (plan.has_white_label) features.push(t('subscription.features.whiteLabel'));
    if (plan.has_custom_integrations) features.push(t('subscription.features.customIntegrations'));

    return features;
  };

  // Get plan icon
  const getPlanIcon = (planType) => {
    switch (planType) {
      case 'free':
        return StarIcon;
      case 'premium':
        return SparklesIcon;
      case 'enterprise':
        return BuildingOfficeIcon;
      default:
        return StarIcon;
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentSubscription ? t('subscription.manageSubscription') : t('subscription.choosePlan')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {currentSubscription ? t('subscription.updatePlanDescription') : t('subscription.selectPlanDescription')}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current Subscription Status */}
            {currentSubscription && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      {t('subscription.currentPlan')}: {currentSubscription.plan?.name}
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      {t('subscription.status')}: {currentSubscription.status}
                      {currentSubscription.cancel_at_period_end && (
                        <span className="ml-2 text-orange-600 dark:text-orange-400">
                          ({t('subscription.cancelsAt', { date: new Date(currentSubscription.current_period_end).toLocaleDateString() })})
                        </span>
                      )}
                    </p>
                  </div>
                  {usage && (
                    <div className="text-right">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {usage.ad_accounts_used}/{usage.ad_accounts_limit === -1 ? '∞' : usage.ad_accounts_limit} {t('subscription.adAccounts')}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {usage.campaigns_used}/{usage.campaigns_limit === -1 ? '∞' : usage.campaigns_limit} {t('subscription.campaigns')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Messages */}
            {(plansError || subscriptionError || operationError) && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-800 dark:text-red-200">
                    {typeof (plansError || subscriptionError || operationError) === 'object'
                      ? JSON.stringify(plansError || subscriptionError || operationError)
                      : (plansError || subscriptionError || operationError) || 'An error occurred'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {plansLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{t('subscription.loadingPlans')}</span>
              </div>
            )}

            {/* Plans Grid */}
            {!plansLoading && plans.length > 0 && (
              <div className="space-y-6">
                {/* Billing Interval Toggle */}
                <div className="flex items-center justify-center">
                  <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex">
                    <button
                      onClick={() => setBillingInterval('monthly')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        billingInterval === 'monthly'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {t('subscription.monthly')}
                    </button>
                    <button
                      onClick={() => setBillingInterval('yearly')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        billingInterval === 'yearly'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {t('subscription.yearly')}
                      <span className="ltr:ml-1 rtl:mr-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded">
                        {t('subscription.save')} 17%
                      </span>
                    </button>
                  </div>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.map((plan) => {
                    const Icon = getPlanIcon(plan.plan_type);
                    const isCurrentPlan = currentSubscription?.plan?.id === plan.id;
                    const isSelected = selectedPlan?.id === plan.id;
                    const price = billingInterval === 'yearly' ? parseFloat(plan.price_yearly || 0) : parseFloat(plan.price_monthly || 0);

                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 p-6 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                            : isCurrentPlan
                            ? 'border-green-500 ring-2 ring-green-500/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => handlePlanSelect(plan)}
                      >
                        {/* Current Plan Badge */}
                        {isCurrentPlan && (
                          <div className="absolute -top-3 ltr:left-4 rtl:right-4">
                            <div className="flex items-center ltr:space-x-1 rtl:space-x-reverse bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                              <CheckCircleIcon className="w-3 h-3" />
                              <span>{t('subscription.currentPlan')}</span>
                            </div>
                          </div>
                        )}

                        {/* Popular Badge */}
                        {plan.is_popular && !isCurrentPlan && (
                          <div className="absolute -top-3 ltr:right-4 rtl:left-4">
                            <div className="flex items-center ltr:space-x-1 rtl:space-x-reverse bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                              <StarIconSolid className="w-3 h-3" />
                              <span>{t('subscription.mostPopular')}</span>
                            </div>
                          </div>
                        )}

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            plan.plan_type === 'free' ? 'bg-gray-100 dark:bg-gray-700' :
                            plan.plan_type === 'premium' ? 'bg-blue-100 dark:bg-blue-900/20' :
                            'bg-purple-100 dark:bg-purple-900/20'
                          }`}>
                            <Icon className={`w-6 h-6 ${
                              plan.plan_type === 'free' ? 'text-gray-600' :
                              plan.plan_type === 'premium' ? 'text-blue-600 dark:text-blue-500' :
                              'text-purple-600 dark:text-purple-500'
                            }`} />
                          </div>
                        </div>

                        {/* Plan Name */}
                        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                          {plan.name}
                        </h3>

                        {/* Price */}
                        <div className="text-center mb-4">
                          {price === 0 || price === '0' || price === '0.00' ? (
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                              {t('subscription.free')}
                            </span>
                          ) : (
                            <>
                              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                ${typeof price === 'string' ? price : price.toFixed(2)}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400 ltr:ml-1 rtl:mr-1">
                                /{billingInterval === 'yearly' ? t('subscription.year') : t('subscription.month')}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-4">
                          {plan.description}
                        </p>

                        {/* Features */}
                        <ul className="space-y-2 mb-6">
                          {getPlanFeatures(plan).slice(0, 4).map((feature, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <CheckIcon className="w-4 h-4 text-green-500 ltr:mr-2 rtl:ml-2 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                            </li>
                          ))}
                          {getPlanFeatures(plan).length > 4 && (
                            <li className="text-sm text-gray-500 dark:text-gray-400 ltr:pl-6 rtl:pr-6">
                              +{getPlanFeatures(plan).length - 4} {t('subscription.moreFeatures')}
                            </li>
                          )}
                        </ul>

                        {/* Selection Indicator */}
                        <div className="flex justify-center">
                          {isSelected ? (
                            <div className="flex items-center text-blue-600 dark:text-blue-400">
                              <CheckCircleIcon className="w-5 h-5 mr-1" />
                              <span className="text-sm font-medium">{t('subscription.selected')}</span>
                            </div>
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              {currentSubscription && !currentSubscription.cancel_at_period_end && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                >
                  {t('subscription.cancelSubscription')}
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>

              {selectedPlan && (
                <button
                  onClick={handleSubscribe}
                  disabled={operationLoading || selectedPlan.id === currentSubscription?.plan?.id}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
                >
                  {operationLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {currentSubscription ? t('subscription.updating') : t('subscription.subscribing')}
                    </div>
                  ) : currentSubscription ? (
                    t('subscription.updatePlan')
                  ) : (
                    t('subscription.subscribeNow')
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Cancel Confirmation Modal */}
          <AnimatePresence>
            {showCancelConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowCancelConfirm(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center">
                    <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('subscription.cancelConfirmTitle')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {t('subscription.cancelConfirmMessage')}
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={handleCancelSubscription}
                        disabled={operationLoading}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                      >
                        {operationLoading ? t('subscription.cancelling') : t('subscription.confirmCancel')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionDialog;
