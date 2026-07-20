'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  listNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/lib/db';
import type { Notification } from '@/lib/types';

const typeIcons: Record<string, string> = {
  deadline: 'schedule',
  status: 'trending_up',
  general: 'info',
};

const typeColors: Record<string, string> = {
  deadline: 'text-error',
  status: 'text-success',
  general: 'text-primary',
};

function formatRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    if (!user) return;
    try {
      const [notifs, count] = await Promise.all([
        listNotifications(user.id),
        getUnreadNotificationCount(user.id),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch {
      // Silently fail — non-critical
    }
  }, [user]);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleOpen = React.useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen && user) {
        setLoading(true);
        fetchNotifications().finally(() => setLoading(false));
      }
    },
    [user, fetchNotifications]
  );

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Non-critical
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Non-critical
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      const wasUnread = notifications.find((n) => n.id === id && !n.read);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Non-critical
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          notifications
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-error text-white text-[10px] font-bold rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 bg-surface-container-lowest border-outline-variant/30"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30">
          <h3 className="text-[16px] font-semibold text-on-surface">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[13px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant">
              <span className="material-symbols-outlined text-[40px] mb-2 opacity-40">
                notifications_off
              </span>
              <p className="text-[14px]">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 border-b border-outline-variant/20 transition-colors',
                  !notification.read && 'bg-primary/5',
                  'hover:bg-surface-container-high/50'
                )}
              >
                {/* Type icon */}
                <span
                  className={cn(
                    'material-symbols-outlined text-[20px] mt-0.5 shrink-0',
                    typeColors[notification.type] ?? 'text-on-surface-variant'
                  )}
                >
                  {typeIcons[notification.type] ?? 'circle_notifications'}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      onClick={() => {
                        if (!notification.read) handleMarkRead(notification.id);
                        setOpen(false);
                      }}
                      className="block"
                    >
                      <p
                        className={cn(
                          'text-[14px] leading-snug',
                          !notification.read
                            ? 'font-semibold text-on-surface'
                            : 'font-medium text-on-surface-variant'
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-[13px] text-on-surface-variant mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    </Link>
                  ) : (
                    <div
                      onClick={() => {
                        if (!notification.read) handleMarkRead(notification.id);
                      }}
                      className="cursor-pointer"
                    >
                      <p
                        className={cn(
                          'text-[14px] leading-snug',
                          !notification.read
                            ? 'font-semibold text-on-surface'
                            : 'font-medium text-on-surface-variant'
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-[13px] text-on-surface-variant mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  )}
                  <p className="text-[11px] text-on-surface-variant/70 mt-1">
                    {formatRelativeTime(notification.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className="p-1 rounded-full hover:bg-surface-container-high transition-colors"
                      title="Mark as read"
                    >
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                        mark_email_read
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-1 rounded-full hover:bg-surface-container-high transition-colors"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                      close
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-outline-variant/30 text-center">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-[13px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all notifications
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
