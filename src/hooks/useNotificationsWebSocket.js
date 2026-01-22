import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { websocketService } from '../utils/websocket-service';
import {
  addNotification,
  updateNotification,
  removeNotification,
  setUnreadCount,
} from '../store/slices/notificationSlice';

/**
 * Hook to manage WebSocket connection for notifications
 * Automatically connects when component mounts and disconnects on unmount
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoConnect - Automatically connect on mount (default: true)
 * @param {Function} options.onNotification - Callback when new notification arrives
 * @param {Function} options.onUnreadCountChange - Callback when unread count changes
 */
export function useNotificationsWebSocket(options = {}) {
  const {
    autoConnect = true,
    onNotification,
    onUnreadCountChange,
  } = options;

  const dispatch = useDispatch();
  const callbacksRef = useRef({ onNotification, onUnreadCountChange });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onNotification, onUnreadCountChange };
  }, [onNotification, onUnreadCountChange]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!autoConnect) return;

    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    websocketService.initialize(baseURL);

    // Handle new notifications
    const unsubscribeNotification = websocketService.on('notification_created', (notification) => {
      dispatch(addNotification(notification));
      if (callbacksRef.current.onNotification) {
        callbacksRef.current.onNotification(notification);
      }
    });

    // Handle notification updates
    const unsubscribeUpdated = websocketService.on('notification_updated', (data) => {
      if (data.id && data.updates) {
        dispatch(updateNotification({ id: data.id, updates: data.updates }));
      }
    });

    // Handle notification deletions
    const unsubscribeDeleted = websocketService.on('notification_deleted', (data) => {
      if (data.id) {
        dispatch(removeNotification(data.id));
      }
    });

    // Handle unread count updates
    const unsubscribeUnreadCount = websocketService.on('unread_count', (data) => {
      const count = data?.unread_count ?? data?.count ?? data;
      if (typeof count === 'number') {
        dispatch(setUnreadCount(count));
        if (callbacksRef.current.onUnreadCountChange) {
          callbacksRef.current.onUnreadCountChange(count);
        }
      }
    });

    // Handle generic notification messages (fallback)
    const unsubscribeGeneric = websocketService.on('notification', (notification) => {
      if (notification && notification.id) {
        dispatch(addNotification(notification));
        if (callbacksRef.current.onNotification) {
          callbacksRef.current.onNotification(notification);
        }
      }
    });

    return () => {
      unsubscribeNotification();
      unsubscribeUpdated();
      unsubscribeDeleted();
      unsubscribeUnreadCount();
      unsubscribeGeneric();
    };
  }, [autoConnect, dispatch]);

  // Manual connect/disconnect functions
  const connect = useCallback(() => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    websocketService.initialize(baseURL);
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const getStatus = useCallback(() => {
    return websocketService.getStatus();
  }, []);

  return {
    connect,
    disconnect,
    getStatus,
    isConnected: websocketService.isConnected,
  };
}
