import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchIntegrations,
  updateIntegration,
  deleteIntegration,
  setSearchFilter,
  setStatusFilter,
  setPaymentStatusFilter,
  setIntegrationTypeFilter,
  toggleFilters,
  setViewMode,
  hideWelcomeBanner,
  clearFilters,
  selectFilteredIntegrations,
  selectIntegrationsLoading,
  selectIntegrationsError,
  selectIntegrationsFilters,
  selectViewMode,
  selectShowFilters,
  selectShowWelcomeBanner
} from '../store/slices/integrationsSlice';

export const useIntegrations = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const integrations = useAppSelector(selectFilteredIntegrations);
  const loading = useAppSelector(selectIntegrationsLoading);
  const error = useAppSelector(selectIntegrationsError);
  const filters = useAppSelector(selectIntegrationsFilters);
  const viewMode = useAppSelector(selectViewMode);
  const showFilters = useAppSelector(selectShowFilters);
  const showWelcomeBanner = useAppSelector(selectShowWelcomeBanner);

  // Actions
  const loadIntegrations = useCallback(() => {
    dispatch(fetchIntegrations());
  }, [dispatch]);

  const editIntegration = useCallback((id, data) => {
    return dispatch(updateIntegration({ id, data }));
  }, [dispatch]);

  const removeIntegration = useCallback((id) => {
    return dispatch(deleteIntegration(id));
  }, [dispatch]);

  const updateSearchFilter = useCallback((search) => {
    dispatch(setSearchFilter(search));
  }, [dispatch]);

  const updateStatusFilter = useCallback((status) => {
    dispatch(setStatusFilter(status));
  }, [dispatch]);

  const updatePaymentStatusFilter = useCallback((paymentStatus) => {
    dispatch(setPaymentStatusFilter(paymentStatus));
  }, [dispatch]);

  const updateIntegrationTypeFilter = useCallback((integrationType) => {
    dispatch(setIntegrationTypeFilter(integrationType));
  }, [dispatch]);

  const toggleFiltersVisibility = useCallback(() => {
    dispatch(toggleFilters());
  }, [dispatch]);

  const updateViewMode = useCallback((mode) => {
    dispatch(setViewMode(mode));
  }, [dispatch]);

  const hideBanner = useCallback(() => {
    dispatch(hideWelcomeBanner());
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Don't load integrations automatically - only when explicitly called
  // useEffect(() => {
  //   loadIntegrations();
  // }, [loadIntegrations]);

  return {
    // State
    integrations,
    loading,
    error,
    filters,
    viewMode,
    showFilters,
    showWelcomeBanner,
    
    // Actions
    loadIntegrations,
    editIntegration,
    removeIntegration,
    updateSearchFilter,
    updateStatusFilter,
    updatePaymentStatusFilter,
    updateIntegrationTypeFilter,
    toggleFiltersVisibility,
    updateViewMode,
    hideBanner,
    resetFilters
  };
}; 