'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className={cn('text-[#6B7280] dark:text-[#87929a]', className)}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {mounted ? (
        isDark ? (
          <span className="material-symbols-outlined text-[18px]">light_mode</span>
        ) : (
          <span className="material-symbols-outlined text-[18px]">dark_mode</span>
        )
      ) : (
        <span className="material-symbols-outlined text-[18px] opacity-0">light_mode</span>
      )}
    </Button>
  );
}
