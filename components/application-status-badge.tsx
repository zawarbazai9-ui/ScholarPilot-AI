import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  not_started: {
    label: 'Not started',
    className: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  },
  researching: {
    label: 'Researching',
    className: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/20',
    dot: 'bg-sky-500',
  },
  drafting: {
    label: 'Drafting',
    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20',
    dot: 'bg-amber-500',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-primary/10 text-primary border-primary/20',
    dot: 'bg-primary',
  },
  awarded: {
    label: 'Awarded',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/20',
    dot: 'bg-rose-500',
  },
};

export function ApplicationStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const config = statusConfig[status] ?? statusConfig.not_started;
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 font-medium', config.className, className)}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </Badge>
  );
}
