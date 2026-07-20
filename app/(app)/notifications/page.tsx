'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
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

const typeLabels: Record<string, string> = {
  deadline: 'Deadline',
  status: 'Status',
  general: 'General',
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

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

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  React.useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      listNotifications(user.id),
      getUnreadNotificationCount(user.id),
    ])
      .then(([notifs, count]) => {
        setNotifications(notifs);
        setUnreadCount(count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      const wasUnread = notifications.find((n) => n.id === id && !n.read);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const filtered =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="mx-auto max-w-3xl space-y-lg">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="font-headline-lg text-headline-lg text-primary">
            Notifications
          </h1>
          <p className="text-body-lg text-on-surface-variant/80">
            Stay updated on your scholarships and applications.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[14px] font-medium text-primary hover:text-primary/80 transition-colors shrink-0 mt-1"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors',
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
          )}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            'px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors',
            filter === 'unread'
              ? 'bg-primary text-white'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
          )}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification list */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-3 opacity-40">
              {filter === 'unread' ? 'mark_email_read' : 'notifications_off'}
            </span>
            <p className="text-[16px] font-medium">
              {filter === 'unread'
                ? 'All caught up!'
                : 'No notifications yet'}
            </p>
            <p className="text-[14px] mt-1">
              {filter === 'unread'
                ? 'You have read all your notifications.'
                : 'Notifications about your scholarships will appear here.'}
            </p>
          </div>
        ) : (
          filtered.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'flex items-start gap-4 px-5 py-4 border-b border-outline-variant/20 transition-colors',
                !notification.read && 'bg-primary/5',
                'hover:bg-surface-container-high/50'
              )}
            >
              {/* Type icon */}
              <span
                className={cn(
                  'material-symbols-outlined text-[24px] mt-0.5 shrink-0',
                  typeColors[notification.type] ?? 'text-on-surface-variant'
                )}
              >
                {typeIcons[notification.type] ?? 'circle_notifications'}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      onClick={() => {
                        if (!notification.read) handleMarkRead(notification.id);
                      }}
                      className={cn(
                        'text-[15px] leading-snug hover:underline',
                        !notification.read
                          ? 'font-semibold text-on-surface'
                          : 'font-medium text-on-surface-variant'
                      )}
                    >
                      {notification.title}
                    </Link>
                  ) : (
                    <p
                      className={cn(
                        'text-[15px] leading-snug',
                        !notification.read
                          ? 'font-semibold text-on-surface'
                          : 'font-medium text-on-surface-variant'
                      )}
                    >
                      {notification.title}
                    </p>
                  )}
                  <span className="text-[11px] font-medium text-on-surface-variant/60 bg-surface-container-high px-2 py-0.5 rounded-full">
                    {typeLabels[notification.type] ?? 'General'}
                  </span>
                </div>
                <p className="text-[14px] text-on-surface-variant/80 mt-0.5">
                  {notification.message}
                </p>
                <p className="text-[12px] text-on-surface-variant/60 mt-2">
                  {formatRelativeTime(notification.created_at)} · {formatDate(notification.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {!notification.read && (
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors"
                    title="Mark as read"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                      mark_email_read
                    </span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    close
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
