import { cn } from '@/lib/utils';

export function ScholarPilotLogo({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground',
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-1/2 w-1/2"
        aria-hidden="true"
      >
        <path
          d="M12 3L2 8l10 5 8-4v6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 11v4c0 1 2.5 3 6 3s6-2 6-3v-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="7" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
}
