import { useAppSelector } from '../store/hooks';
import {
  selectCurrentSubscription,
  selectCurrentPlan,
  selectCurrentPlanId,
  selectCurrentPlanType,
  selectCurrentPlanName,
  selectIsSubscriptionActive,
  selectIsSubscriptionCanceled,
  selectSubscriptionStatus,
  selectBillingInterval,
  selectHasGoogleAdsAccess,
  selectHasMetaAdsAccess,
  selectHasAdvancedAnalytics,
  selectMaxAdAccounts,
  selectMaxCampaigns,
  selectMaxConnections
} from '../store/slices/subscriptionSlice';

// Main subscription hook
export const useSubscription = () => {
  const subscription = useAppSelector(selectCurrentSubscription);
  const plan = useAppSelector(selectCurrentPlan);
  const isActive = useAppSelector(selectIsSubscriptionActive);
  const isCanceled = useAppSelector(selectIsSubscriptionCanceled);
  const status = useAppSelector(selectSubscriptionStatus);

  return {
    subscription,
    plan,
    isActive,
    isCanceled,
    status,
    hasSubscription: !!subscription && isActive
  };
};

// Current plan hook
export const useCurrentPlan = () => {
  const plan = useAppSelector(selectCurrentPlan);
  const planId = useAppSelector(selectCurrentPlanId);
  const planType = useAppSelector(selectCurrentPlanType);
  const planName = useAppSelector(selectCurrentPlanName);

  return {
    plan,
    planId,
    planType,
    planName
  };
};

// Feature access hooks
export const useFeatureAccess = () => {
  const hasGoogleAds = useAppSelector(selectHasGoogleAdsAccess);
  const hasMetaAds = useAppSelector(selectHasMetaAdsAccess);
  const hasAdvancedAnalytics = useAppSelector(selectHasAdvancedAnalytics);

  return {
    hasGoogleAds,
    hasMetaAds,
    hasAdvancedAnalytics
  };
};

// Usage limits hooks
export const useUsageLimits = () => {
  const maxAdAccounts = useAppSelector(selectMaxAdAccounts);
  const maxCampaigns = useAppSelector(selectMaxCampaigns);
  const maxConnections = useAppSelector(selectMaxConnections);

  return {
    maxAdAccounts,
    maxCampaigns,
    maxConnections
  };
};

// Billing info hook
export const useBillingInfo = () => {
  const billingInterval = useAppSelector(selectBillingInterval);

  return {
    billingInterval
  };
};

// Helper functions for checking plan types
export const usePlanType = () => {
  const planType = useAppSelector(selectCurrentPlanType);

  return {
    isFree: planType === 'free',
    isPremium: planType === 'premium',
    isEnterprise: planType === 'enterprise',
    planType
  };
};