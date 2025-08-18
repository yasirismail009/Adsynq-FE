import { useDispatch, useSelector } from 'react-redux';

// Typed hooks for better IDE support
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;

// Custom hooks for specific slices
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  
  return {
    ...auth,
    dispatch,
  };
};

export const useUI = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.ui);
  
  return {
    ...ui,
    dispatch,
  };
};

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const dashboard = useAppSelector((state) => state.dashboard);
  
  return {
    ...dashboard,
    dispatch,
  };
};

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications);
  
  return {
    ...notifications,
    dispatch,
  };
};

// Specific selector hooks
export const useUser = () => useAppSelector((state) => state.auth.user);
export const useToken = () => useAppSelector((state) => state.auth.token);
export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated);
export const useAuthLoading = () => useAppSelector((state) => state.auth.isLoading);
export const useAuthError = () => useAppSelector((state) => state.auth.error);

export const useSidebarCollapsed = () => useAppSelector((state) => state.ui.sidebarCollapsed);
export const useTheme = () => useAppSelector((state) => state.ui.theme);
export const useToast = () => useAppSelector((state) => state.ui.toast);
export const useModal = () => useAppSelector((state) => state.ui.modals);
export const useSearchQuery = () => useAppSelector((state) => state.ui.searchQuery);
export const useFilters = () => useAppSelector((state) => state.ui.filters);
export const usePagination = () => useAppSelector((state) => state.ui.pagination);

export const useDashboardOverview = () => useAppSelector((state) => state.dashboard.overview);
export const useDashboardMetrics = () => useAppSelector((state) => state.dashboard.metrics);
export const useDashboardCharts = () => useAppSelector((state) => state.dashboard.charts);
export const useRecentActivity = () => useAppSelector((state) => state.dashboard.recentActivity);
export const useDashboardLoading = () => useAppSelector((state) => state.dashboard.isLoading);
export const useDashboardErrors = () => useAppSelector((state) => state.dashboard.errors);
export const useDashboardFilters = () => useAppSelector((state) => state.dashboard.filters);

export const useNotificationList = () => useAppSelector((state) => state.notifications.notifications);
export const useUnreadCount = () => useAppSelector((state) => state.notifications.unreadCount);
export const useNotificationLoading = () => useAppSelector((state) => state.notifications.isLoading);
export const useNotificationError = () => useAppSelector((state) => state.notifications.error);

// Helper hooks
export const useIsLoading = (key) => useAppSelector((state) => state.ui.loadingStates[key] || false);
export const useIsAnyLoading = () => useAppSelector((state) => 
  Object.values(state.ui.loadingStates).some(Boolean)
);

export const useHasUnreadNotifications = () => useAppSelector((state) => 
  state.notifications.unreadCount > 0
);

export const useUnreadNotifications = () => useAppSelector((state) => 
  state.notifications.notifications.filter(n => !n.read)
);

export const useReadNotifications = () => useAppSelector((state) => 
  state.notifications.notifications.filter(n => n.read)
);

export const useNotificationsByType = (type) => useAppSelector((state) => 
  state.notifications.notifications.filter(n => n.type === type)
);

export const useIsDashboardLoading = (key) => useAppSelector((state) => 
  state.dashboard.isLoading[key] || false
);

export const useDashboardError = (key) => useAppSelector((state) => 
  state.dashboard.errors[key]
);

export const useHasAnyDashboardError = () => useAppSelector((state) => 
  Object.values(state.dashboard.errors).some(Boolean)
); 