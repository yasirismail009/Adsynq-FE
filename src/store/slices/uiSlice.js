import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  sidebarCollapsed: false,
  theme: 'light', // 'light' or 'dark'
  loadingStates: {},
  modals: {
    isOpen: false,
    type: null,
    data: null,
  },
  toast: {
    isVisible: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    duration: 5000,
  },
  searchQuery: '',
  filters: {},
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
  },
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },

    // Theme actions
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },

    // Loading states
    setLoading: (state, action) => {
      const { key, isLoading } = action.payload;
      state.loadingStates[key] = isLoading;
    },
    clearLoading: (state, action) => {
      const key = action.payload;
      delete state.loadingStates[key];
    },

    // Modal actions
    openModal: (state, action) => {
      state.modals = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modals = {
        isOpen: false,
        type: null,
        data: null,
      };
    },

    // Toast actions
    showToast: (state, action) => {
      state.toast = {
        isVisible: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 5000,
      };
    },
    hideToast: (state) => {
      state.toast.isVisible = false;
    },

    // Search actions
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
    },

    // Filter actions
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    clearFilter: (state, action) => {
      const key = action.payload;
      delete state.filters[key];
    },
    clearAllFilters: (state) => {
      state.filters = {};
    },

    // Pagination actions
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.currentPage = 1; // Reset to first page
    },
    setTotalItems: (state, action) => {
      state.pagination.totalItems = action.payload;
    },
    resetPagination: (state) => {
      state.pagination.currentPage = 1;
    },

    // Reset all UI state
    resetUI: (state) => {
      return { ...initialState, theme: state.theme }; // Keep theme preference
    },
  },
});

// Export actions
export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleTheme,
  setTheme,
  setLoading,
  clearLoading,
  openModal,
  closeModal,
  showToast,
  hideToast,
  setSearchQuery,
  clearSearch,
  setFilter,
  clearFilter,
  clearAllFilters,
  setCurrentPage,
  setPageSize,
  setTotalItems,
  resetPagination,
  resetUI,
} = uiSlice.actions;

// Export selectors
export const selectUI = (state) => state.ui;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectTheme = (state) => state.ui.theme;
export const selectLoadingStates = (state) => state.ui.loadingStates;
export const selectModal = (state) => state.ui.modals;
export const selectToast = (state) => state.ui.toast;
export const selectSearchQuery = (state) => state.ui.searchQuery;
export const selectFilters = (state) => state.ui.filters;
export const selectPagination = (state) => state.ui.pagination;

// Helper selectors
export const selectIsLoading = (key) => (state) => state.ui.loadingStates[key] || false;
export const selectIsAnyLoading = (state) => Object.values(state.ui.loadingStates).some(Boolean);

export default uiSlice.reducer; 