import { useRef, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { apiService } from '../services/api';
import { markAsRead } from '../store/slices/notificationSlice';
import { useToast } from './useToast';
import { websocketService } from '../utils/websocket-service';

const TIMEOUT_MS = 8 * 60 * 1000;

/**
 * Listens for sync_completed notifications via WebSocket and shows a toast when one appears.
 * Uses WebSocket instead of polling for real-time updates.
 * Call startPolling() after triggering Google or Meta sync (connect with sync_data,
 * or bulk select). Stops when a new sync_completed is found or after TIMEOUT_MS.
 */
export function useSyncCompletedPolling() {
  const dispatch = useDispatch();
  const { success: showSuccess } = useToast();
  const knownIdsRef = useRef(new Set());
  const timeoutRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const isActiveRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    isActiveRef.current = false;
  }, []);

  const handleSyncCompleted = useCallback(async (notification) => {
    if (!isActiveRef.current) return;
    
    // Check if this is a sync_completed notification
    if (notification.notification_type !== 'sync_completed') return;
    
    // Check if we've already seen this notification
    if (knownIdsRef.current.has(notification.id)) return;
    
    knownIdsRef.current.add(notification.id);
    
    const msg = notification.title && notification.message
      ? `${notification.title} – ${notification.message}`
      : (notification.title || notification.message || 'Sync completed');
    
    showSuccess(msg, { duration: 5000 });
    await dispatch(markAsRead(notification.id));
    // Unread count updated locally in notificationSlice; no REST fetch when using WebSocket
    stopPolling();
  }, [dispatch, showSuccess, stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    knownIdsRef.current.clear();
    isActiveRef.current = true;

    // Seed known IDs from existing notifications
    const seed = async () => {
      try {
        const res = await apiService.notifications.list({
          notification_type: 'sync_completed',
          limit: 10,
          offset: 0,
        });
        const data = res.data;
        if (data?.error !== true && Array.isArray(data?.result)) {
          data.result
            .filter((n) => n.notification_type === 'sync_completed')
            .forEach((n) => knownIdsRef.current.add(n.id));
        }
      } catch {
        // ignore
      }
    };
    seed();

    // Subscribe to WebSocket notifications
    const unsubscribe = websocketService.on('notification_created', handleSyncCompleted);
    unsubscribeRef.current = unsubscribe;

    // Also listen to generic notification events as fallback
    const unsubscribeGeneric = websocketService.on('notification', handleSyncCompleted);
    
    // Combine unsubscribe functions
    unsubscribeRef.current = () => {
      unsubscribe();
      unsubscribeGeneric();
    };

    // Set timeout to stop listening after TIMEOUT_MS
    timeoutRef.current = setTimeout(() => {
      stopPolling();
    }, TIMEOUT_MS);
  }, [handleSyncCompleted, stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { startPolling, stopPolling };
}
