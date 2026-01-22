import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { selectCurrentPlanType, selectCurrentSubscription } from '../store/slices/subscriptionSlice';
import { autoSelectAllCampaignsForPremium } from '../utils/premium-campaign-auto-select';
import { showSuccessToast, showErrorToast } from './useToast';

/** Routes where premium auto-select (bulk-select API) should NOT run. */
const SKIP_AUTO_SELECT_PATHS = ['/comparison', '/dashboard', '/pricing', '/analytics', '/customers', '/reports', '/settings'];

/**
 * Hook that automatically selects all campaigns for selected ad accounts/customers
 * when subscription is Premium Plan
 * 
 * This hook watches for subscription plan type changes and triggers auto-selection
 * when the plan becomes Premium. It only runs on /integrations (and nested routes)
 * so that bulk-select is not called on Comparison or other read-only pages.
 * Skips entirely when both google_customer_status.has_selected and
 * meta_ad_account_status.has_selected are true (already selected).
 */
export const usePremiumAutoSelect = () => {
  const planType = useSelector(selectCurrentPlanType);
  const subscription = useSelector(selectCurrentSubscription);
  const previousPlanTypeRef = useRef(null);
  const hasAutoSelectedRef = useRef(false);
  const location = useLocation();
  const pathname = location?.pathname || '';

  useEffect(() => {
    const isSkipPath = SKIP_AUTO_SELECT_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
    if (isSkipPath) {
      previousPlanTypeRef.current = planType;
      return;
    }

    const googleHasSelected = subscription?.google_customer_status?.has_selected === true;
    const metaHasSelected = subscription?.meta_ad_account_status?.has_selected === true;
    if (googleHasSelected && metaHasSelected) {
      previousPlanTypeRef.current = planType;
      return;
    }

    // Only proceed if plan is Premium and we haven't already auto-selected
    if (planType === 'premium' && previousPlanTypeRef.current !== 'premium') {
      // Check if this is a new Premium subscription (not just a re-render)
      if (!hasAutoSelectedRef.current || previousPlanTypeRef.current !== 'premium') {
        console.log('Premium Plan detected, auto-selecting all campaigns...');
        
        // Trigger auto-select (pass subscription so we skip platforms with has_selected)
        autoSelectAllCampaignsForPremium(planType, subscription)
          .then(result => {
            if (result.success) {
              if (result.details?.google?.campaignsSelected > 0 || 
                  result.details?.meta?.campaignsSelected > 0) {
                showSuccessToast(result.message || 'All campaigns auto-selected for Premium Plan');
              }
              hasAutoSelectedRef.current = true;
            } else {
              // Don't show error if no campaigns found (this is normal)
              if (!result.message.includes('No campaigns found')) {
                console.warn('Auto-select campaigns:', result.message);
              }
            }
          })
          .catch(error => {
            console.error('Error in premium auto-select:', error);
            // Don't show error toast - this is a background operation
          });
      }
    }

    // Update previous plan type
    previousPlanTypeRef.current = planType;
  }, [planType, pathname, subscription]);

  // Reset hasAutoSelectedRef when plan changes away from Premium
  useEffect(() => {
    if (planType !== 'premium') {
      hasAutoSelectedRef.current = false;
    }
  }, [planType]);
};
