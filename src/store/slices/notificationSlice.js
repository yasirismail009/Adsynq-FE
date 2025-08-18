import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.notifications.list(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await apiService.notifications.markAsRead(notificationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.notifications.markAllAsRead();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await apiService.notifications.delete(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  filters: {
    type: 'all', // 'all', 'info', 'warning', 'error', 'success'
    read: 'all', // 'all', 'read', 'unread'
  },
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
  },
  lastFetched: null,
};

// Notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add notification (for real-time updates)
    addNotification: (state, action) => {
      const notification = action.payload;
      state.notifications.unshift(notification);
      if (!notification.read) {
        state.unreadCount += 1;
      }
      // Keep only last 100 notifications
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
    },

    // Update notification
    updateNotification: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        const wasRead = state.notifications[index].read;
        const isRead = updates.read;
        
        state.notifications[index] = { ...state.notifications[index], ...updates };
        
        // Update unread count
        if (!wasRead && isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (wasRead && !isRead) {
          state.unreadCount += 1;
        }
      }
    },

    // Remove notification
    removeNotification: (state, action) => {
      const id = action.payload;
      const index = state.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },

    // Set filters
    setNotificationFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
      state.pagination.currentPage = 1; // Reset to first page
    },

    // Clear filters
    clearNotificationFilters: (state) => {
      state.filters = {
        type: 'all',
        read: 'all',
      };
      state.pagination.currentPage = 1;
    },

    // Set pagination
    setNotificationPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },

    // Clear error
    clearNotificationError: (state) => {
      state.error = null;
    },

    // Reset notifications
    resetNotifications: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.pagination.totalItems = action.payload.totalItems;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Mark as read
    builder
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = action.payload;
        const index = state.notifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          state.notifications[index] = notification;
          if (!notification.read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });

    // Mark all as read
    builder
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, read: true }));
        state.unreadCount = 0;
      });

    // Delete notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const index = state.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
          const notification = state.notifications[index];
          if (!notification.read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
        }
      });
  },
});

// Export actions
export const {
  addNotification,
  updateNotification,
  removeNotification,
  setNotificationFilter,
  clearNotificationFilters,
  setNotificationPage,
  clearNotificationError,
  resetNotifications,
} = notificationSlice.actions;

// Export selectors
export const selectNotifications = (state) => state.notifications;
export const selectNotificationList = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationLoading = (state) => state.notifications.isLoading;
export const selectNotificationError = (state) => state.notifications.error;
export const selectNotificationFilters = (state) => state.notifications.filters;
export const selectNotificationPagination = (state) => state.notifications.pagination;
export const selectLastFetched = (state) => state.notifications.lastFetched;

// Helper selectors
export const selectUnreadNotifications = (state) => 
  state.notifications.notifications.filter(n => !n.read);

export const selectReadNotifications = (state) => 
  state.notifications.notifications.filter(n => n.read);

export const selectNotificationsByType = (type) => (state) => 
  state.notifications.notifications.filter(n => n.type === type);

export const selectHasUnreadNotifications = (state) => 
  state.notifications.unreadCount > 0;

export default notificationSlice.reducer; 