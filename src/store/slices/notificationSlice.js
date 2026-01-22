import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

/**
 * Notifications API (see Notifications Frontend Implementation Guide):
 * - List: GET /notifications/?is_read=&notification_type=&limit=&offset=
 *   Response: { error, result: Notification[], message, code }
 * - Unread count: GET /notifications/unread-count/
 *   Response: { error, result: { unread_count }, message, code }
 * - Mark read: POST /notifications/{id}/read/
 * - Mark all read: POST /notifications/mark-all-read/
 * - Delete: DELETE /notifications/{id}/
 */

const getResult = (data) => {
  if (data?.error === true) throw new Error(data.message || 'Request failed');
  return data?.result;
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.notifications.list(params);
      const result = getResult(response.data);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.notifications.unreadCount();
      const result = getResult(response.data);
      return result?.unread_count ?? 0;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await apiService.notifications.markAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.notifications.markAllAsRead();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to mark all as read');
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
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete notification');
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isLoadingUnreadCount: false,
  error: null,
  lastFetched: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = Math.max(0, action.payload);
    },
    addNotification: (state, action) => {
      const n = action.payload;
      const idx = state.notifications.findIndex((x) => x.id === n.id);
      if (idx >= 0) return;
      state.notifications.unshift(n);
      if (!n.is_read) state.unreadCount = Math.max(0, state.unreadCount + 1);
      if (state.notifications.length > 100) state.notifications = state.notifications.slice(0, 100);
    },
    updateNotification: (state, action) => {
      const { id, updates } = action.payload;
      const idx = state.notifications.findIndex((n) => n.id === id);
      if (idx === -1) return;
      const prev = state.notifications[idx];
      const wasUnread = !prev.is_read;
      state.notifications[idx] = { ...prev, ...updates };
      const nowUnread = !(updates.is_read ?? prev.is_read);
      if (wasUnread && !nowUnread) state.unreadCount = Math.max(0, state.unreadCount - 1);
      else if (!wasUnread && nowUnread) state.unreadCount += 1;
    },
    removeNotification: (state, action) => {
      const id = action.payload;
      const idx = state.notifications.findIndex((n) => n.id === id);
      if (idx === -1) return;
      const n = state.notifications[idx];
      if (!n.is_read) state.unreadCount = Math.max(0, state.unreadCount - 1);
      state.notifications.splice(idx, 1);
    },
    clearNotificationError: (state) => {
      state.error = null;
    },
    resetNotifications: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = Array.isArray(action.payload) ? action.payload : [];
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnreadCount.pending, (state) => {
        state.isLoadingUnreadCount = true;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.isLoadingUnreadCount = false;
        state.unreadCount = Math.max(0, action.payload ?? 0);
      })
      .addCase(fetchUnreadCount.rejected, (state) => {
        state.isLoadingUnreadCount = false;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        const idx = state.notifications.findIndex((n) => n.id === id);
        if (idx !== -1 && !state.notifications[idx].is_read) {
          state.notifications[idx] = { ...state.notifications[idx], is_read: true, read_at: new Date().toISOString() };
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (idx === -1) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, is_read: true, read_at: n.read_at || new Date().toISOString() }));
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const idx = state.notifications.findIndex((n) => n.id === id);
        if (idx !== -1) {
          const n = state.notifications[idx];
          if (!n.is_read) state.unreadCount = Math.max(0, state.unreadCount - 1);
          state.notifications.splice(idx, 1);
        }
      });
  },
});

export const {
  setUnreadCount,
  addNotification,
  updateNotification,
  removeNotification,
  clearNotificationError,
  resetNotifications,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications;
export const selectNotificationList = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationLoading = (state) => state.notifications.isLoading;
export const selectUnreadCountLoading = (state) => state.notifications.isLoadingUnreadCount;
export const selectNotificationError = (state) => state.notifications.error;
export const selectLastFetched = (state) => state.notifications.lastFetched;

export const selectUnreadNotifications = (state) =>
  state.notifications.notifications.filter((n) => !n.is_read);
export const selectReadNotifications = (state) =>
  state.notifications.notifications.filter((n) => n.is_read);
export const selectHasUnreadNotifications = (state) => state.notifications.unreadCount > 0;

export default notificationSlice.reducer;
