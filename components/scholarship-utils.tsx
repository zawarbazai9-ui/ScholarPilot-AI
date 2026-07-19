'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function deadlineLabel(dateStr: string): {
  text: string;
  tone: 'urgent' | 'soon' | 'normal' | 'past';
} {
  const days = daysUntil(dateStr);
  if (days < 0) return { text: 'Closed', tone: 'past' };
  if (days === 0) return { text: 'Today', tone: 'urgent' };
  if (days === 1) return { text: 'Tomorrow', tone: 'urgent' };
  if (days <= 14) return { text: `in ${days} days`, tone: 'soon' };
  if (days <= 60) return { text: `in ${days} days`, tone: 'normal' };
  const date = new Date(dateStr + 'T00:00:00');
  return {
    text: date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    tone: 'normal',
  };
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DeadlinePill({
  dateStr,
  className,
}: {
  dateStr: string;
  className?: string;
}) {
  const { text, tone } = useMemo(() => deadlineLabel(dateStr), [dateStr]);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        tone === 'urgent' &&
          'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
        tone === 'soon' &&
          'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        tone === 'normal' && 'bg-muted text-muted-foreground',
        tone === 'past' && 'bg-muted text-muted-foreground line-through',
        className
      )}
    >
      {tone !== 'past' && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            tone === 'urgent' && 'bg-rose-500',
            tone === 'soon' && 'bg-amber-500',
            tone === 'normal' && 'bg-muted-foreground'
          )}
        />
      )}
      {text}
    </span>
  );
}
