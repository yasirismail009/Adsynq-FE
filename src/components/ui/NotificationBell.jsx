import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon, CheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  selectUnreadCount,
  selectNotificationList,
  selectNotificationLoading,
  selectNotificationError,
} from '../../store/slices/notificationSlice';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { useNotificationsWebSocket } from '../../hooks/useNotificationsWebSocket';

/**
 * Renders a short metadata summary for sync_completed notifications.
 * Meta: ad_accounts_synced, campaigns_synced, campaign_insights_synced, account_insights_synced
 * Google: customers_synced, campaigns_synced, assets_synced, ad_groups_synced, asset_groups_synced
 */
function SyncMetadataSummary({ metadata }) {
  if (!metadata || typeof metadata !== 'object') return null;
  const parts = [];
  if (metadata.ad_accounts_synced != null) parts.push(`${metadata.ad_accounts_synced} ad accounts`);
  if (metadata.customers_synced != null) parts.push(`${metadata.customers_synced} customers`);
  if (metadata.campaigns_synced != null) parts.push(`${metadata.campaigns_synced} campaigns`);
  if (metadata.campaign_insights_synced != null) parts.push(`${metadata.campaign_insights_synced} campaign insights`);
  if (metadata.account_insights_synced != null) parts.push(`${metadata.account_insights_synced} account insights`);
  if (metadata.assets_synced != null) parts.push(`${metadata.assets_synced} assets`);
  if (metadata.ad_groups_synced != null) parts.push(`${metadata.ad_groups_synced} ad groups`);
  if (metadata.asset_groups_synced != null) parts.push(`${metadata.asset_groups_synced} asset groups`);
  if (parts.length === 0) return null;
  return (
    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
      {parts.join(', ')}
    </span>
  );
}

export default function NotificationBell() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const unreadCount = useSelector(selectUnreadCount);
  const notifications = useSelector(selectNotificationList);
  const loading = useSelector(selectNotificationLoading);
  const error = useSelector(selectNotificationError);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Use WebSocket for real-time notifications; unread count comes via 'unread_count' WS events
  useNotificationsWebSocket({
    autoConnect: true,
  });

  const loadList = useCallback(() => {
    dispatch(
      fetchNotifications({
        is_read: false,
        limit: 20,
        offset: 0,
      })
    );
  }, [dispatch]);

  // No REST poll for unread count — WebSocket provides updates via 'unread_count' events

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      loadList();
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, loadList]);

  const handleBellClick = () => {
    setOpen((prev) => !prev);
  };

  const handleMarkAsRead = async (id) => {
    await dispatch(markAsRead(id));
  };

  const handleMarkAllRead = async () => {
    await dispatch(markAllAsRead());
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleBellClick}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
        aria-label={t('notifications.ariaLabel')}
      >
        <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-[min(24rem,90vw)] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 rtl:right-auto rtl:left-0"
          >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">
                {t('notifications.title')}
              </span>
              {notifications.filter((n) => !n.is_read).length > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <CheckIcon className="w-4 h-4" />
                  {t('notifications.markAllRead')}
                </button>
              )}
            </div>

            <div className="max-h-[20rem] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                </div>
              ) : error ? (
                <p className="px-4 py-6 text-sm text-red-600 dark:text-red-400">{error}</p>
              ) : notifications.filter((n) => !n.is_read).length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                  {t('notifications.empty')}
                </p>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.filter((n) => !n.is_read).map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(n.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {n.title}
                          </p>
                          {n.message && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                              {n.message}
                            </p>
                          )}
                          <SyncMetadataSummary metadata={n.metadata} />
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatRelativeTime(n.created_at)}
                          </p>
                        </div>
                        {!n.is_read && (
                          <CheckCircleIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" aria-hidden />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
