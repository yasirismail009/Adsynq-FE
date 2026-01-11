import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showSuccessToast, showErrorToast } from '../../hooks/useToast';
import { useSubscription } from '../../hooks/useSubscription';
import {
  CheckIcon,
  StarIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import {
  fetchSubscriptionPlans,
  selectSubscriptionPlans,
  selectSubscriptionPlansLoading,
  selectSubscriptionPlansError,
  fetchCurrentSubscription,
  selectCurrentSubscription,
  selectSubscriptionLoading,
  showSubscriptionDialog,
  createSubscription
} from '../../store/slices/subscriptionSlice';

const PricingPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Redux state
  const plans = useSelector(selectSubscriptionPlans);
  const loading = useSelector(selectSubscriptionPlansLoading);
  const error = useSelector(selectSubscriptionPlansError);
  const { subscription: currentSubscription, plan: currentPlan } = useSubscription();

  // Fetch plans and current subscription on component mount
  useEffect(() => {
    dispatch(fetchSubscriptionPlans());
    dispatch(fetchCurrentSubscription());
  }, [dispatch]);

  // Transform API data to UI format
  const getPlanIcon = (planType) => {
    switch (planType?.toLowerCase()) {
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

  const getPlanStyling = (planType) => {
    switch (planType?.toLowerCase()) {
      case 'free':
        return {
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          buttonVariant: 'outline',
          popular: false
        };
      case 'premium':
        return {
          iconColor: 'text-blue-600 dark:text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          buttonVariant: 'primary',
          popular: true
        };
      case 'enterprise':
        return {
          iconColor: 'text-purple-600 dark:text-purple-500',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
          buttonVariant: 'outline',
          popular: false
        };
      default:
        return {
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          buttonVariant: 'outline',
          popular: false
        };
    }
  };

  // Transform plans data for UI - fallback to hardcoded plans if API fails or returns invalid data
  const fallbackPlans = [
    {
      id: 'free',
      name: t('pricing.free.name'),
      description: t('pricing.free.description'),
      plan_type: 'free',
      price_monthly: 0,
      price_yearly: 0,
      buttonText: t('pricing.free.buttonText'),
      features: [
        t('pricing.free.features.accounts', { count: 1 }),
        t('pricing.free.features.campaigns', { count: 1 }),
        t('pricing.free.features.basicAnalytics'),
        t('pricing.free.features.emailSupport'),
        t('pricing.free.features.googleAds'),
        t('pricing.free.features.metaAds')
      ]
    },
    {
      id: 'premium',
      name: t('pricing.premium.name'),
      description: t('pricing.premium.description'),
      plan_type: 'premium',
      price_monthly: 29,
      price_yearly: 290,
      buttonText: t('pricing.premium.buttonText'),
      features: [
        t('pricing.premium.features.accounts', { count: 4 }),
        t('pricing.premium.features.campaigns', { count: 8 }),
        t('pricing.premium.features.advancedAnalytics'),
        t('pricing.premium.features.prioritySupport'),
        t('pricing.premium.features.googleAds'),
        t('pricing.premium.features.metaAds'),
        t('pricing.premium.features.customReports'),
        t('pricing.premium.features.apiAccess')
      ]
    },
    {
      id: 'enterprise',
      name: t('pricing.enterprise.name'),
      description: t('pricing.enterprise.description'),
      plan_type: 'enterprise',
      price_monthly: null,
      price_yearly: null,
      buttonText: t('pricing.enterprise.buttonText'),
      features: [
        t('pricing.enterprise.features.accounts'),
        t('pricing.enterprise.features.campaigns'),
        t('pricing.enterprise.features.enterpriseAnalytics'),
        t('pricing.enterprise.features.dedicatedSupport'),
        t('pricing.enterprise.features.googleAds'),
        t('pricing.enterprise.features.metaAds'),
        t('pricing.enterprise.features.whiteLabel'),
        t('pricing.enterprise.features.customIntegrations'),
        t('pricing.enterprise.features.sla')
      ]
    }
  ];

  // Use API data if available and valid, otherwise use fallback
  const plansToUse = (Array.isArray(plans) && plans.length > 0) ? plans : fallbackPlans;

  const pricingTiers = plansToUse.map(plan => {
    const styling = getPlanStyling(plan.plan_type);
    const Icon = getPlanIcon(plan.plan_type);

    // Check if this plan is the user's current subscription
    const isCurrentPlan = currentPlan?.id === plan.id;

    return {
      id: plan.id || plan.name?.toLowerCase(),
      name: plan.name,
      price: (plan.price_monthly !== null && plan.price_monthly !== undefined) ? `$${plan.price_monthly}` : t('pricing.contactUs'),
      description: plan.description || '',
      icon: Icon,
      iconColor: styling.iconColor,
      bgColor: styling.bgColor,
      borderColor: styling.borderColor,
      buttonText: isCurrentPlan ? t('pricing.currentPlan') :
                  (plan.buttonText || ((plan.price_monthly !== null && plan.price_monthly !== undefined) ? t('pricing.getStarted') : t('pricing.contactSales'))),
      buttonVariant: isCurrentPlan ? 'current' : styling.buttonVariant,
      popular: styling.popular,
      isCurrentPlan,
      features: plan.features || []
    };
  }) || [];

  const getButtonStyles = (variant, popular) => {
    const baseStyles = "w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
      case 'outline':
        return `${baseStyles} border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800`;
      case 'current':
        return `${baseStyles} bg-green-600 text-white cursor-not-allowed opacity-75`;
      default:
        return baseStyles;
    }
  };

  const handlePlanSubscribe = (tier) => {
    // Handle different button actions based on plan type
    const planType = (tier.plan_type || String(tier.id || '').toLowerCase() || 'free').toLowerCase();

    switch (planType) {
      case 'free':
      case '1': // Handle numeric ID for free plan
        // For free plan, create subscription directly (no payment needed)
        const freePlanId = typeof tier.id === 'number' ? tier.id : 1; // Use the actual ID or default to 1
        dispatch(createSubscription({
          plan_id: freePlanId,
          billing_interval: 'monthly', // Free plan doesn't need billing interval
        })).unwrap()
        .then(() => {
          // Success - show success message and redirect to integrations
          showSuccessToast('Free subscription created successfully!');
          // Optionally redirect to integrations page after successful subscription
          // navigate('/integrations');
        })
        .catch((error) => {
          // Error - show error message
          const errorMessage = error?.message || 'Failed to create free subscription';
          showErrorToast(errorMessage);
          console.error('Failed to create free subscription:', error);
        });
        break;

      case 'premium':
      case '2': // Handle numeric ID for premium plan
        // For premium plan, show subscription dialog to select billing interval
        dispatch(showSubscriptionDialog());
        break;

      case 'enterprise':
      case '3': // Handle numeric ID for enterprise plan
        // For enterprise plan, redirect to contact sales
        window.location.href = 'mailto:sales@adsynq.com?subject=Enterprise Plan Inquiry';
        break;

      default:
        // Default behavior - show subscription dialog
        dispatch(showSubscriptionDialog());
        break;
    }
  };

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {t('pricing.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4"
          >
            {t('pricing.subtitle')}
          </motion.p>
        </div>

        {/* Loading State */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[1, 2, 3].map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 animate-pulse"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-6 mx-auto"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-24 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
              <div className="space-y-3 mb-8">
                {[1, 2, 3, 4].map(featureIndex => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 mt-0.5"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  </div>
                ))}
              </div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {t('pricing.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4"
          >
            {t('pricing.subtitle')}
          </motion.p>
        </div>

        {/* Error State */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center"
          >
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
              {t('common.error')}
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-6">
              {typeof error === 'string' ? error : t('pricing.errorLoadingPlans')}
            </p>
            <button
              onClick={() => dispatch(fetchSubscriptionPlans())}
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              {t('common.retry')}
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
        >
          {t('pricing.title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4"
        >
          {t('pricing.subtitle')}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-500 dark:text-gray-500 max-w-2xl mx-auto"
        >
          {t('pricing.platformsNote')}
        </motion.p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingTiers.map((tier, index) => {
          const Icon = tier.icon;

          return (
            <motion.div
              key={tier.id || tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 overflow-hidden ${
                tier.isCurrentPlan
                  ? 'ring-2 ring-green-500 dark:ring-green-400 border-green-200 dark:border-green-800'
                  : tier.popular
                    ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                    : tier.borderColor
              }`}
            >
              {/* Badges */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                {tier.popular && (
                  <div className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <StarIconSolid className="w-4 h-4" />
                    <span>{t('pricing.mostPopular')}</span>
                  </div>
                )}
                {tier.isCurrentPlan && (
                  <div className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <CheckIcon className="w-4 h-4" />
                    <span>{t('pricing.currentPlan')}</span>
                  </div>
                )}
              </div>

              {/* Header */}
              <div className={`p-8 ${tier.bgColor}`}>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-700 mb-6 mx-auto">
                  <Icon className={`w-8 h-8 ${tier.iconColor}`} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  {tier.name}
                </h3>

                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {tier.price}
                  </span>
                  {tier.price && !tier.price.includes(t('pricing.contactUs')) && (
                    <span className="text-gray-600 dark:text-gray-400 ml-1">
                      /{t('pricing.perMonth')}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {tier.description}
                </p>
              </div>

              {/* Features */}
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3 rtl:space-x-reverse">
                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => !tier.isCurrentPlan && handlePlanSubscribe(tier)}
                  disabled={tier.isCurrentPlan}
                  className={getButtonStyles(tier.buttonVariant, tier.popular)}
                >
                  {tier.buttonText}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-16"
      >
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 max-w-4xl mx-auto">
          <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('pricing.needCustomPlan')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('pricing.contactUs')}
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200">
            {t('pricing.contactSales')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PricingPage;
