'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { ScholarPilotLogo } from '@/components/brand';
import { NotificationBell } from '@/components/notification-dropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function useIsAdmin(userEmail: string | undefined | null) {
  return !!userEmail && adminEmails.includes(userEmail.toLowerCase());
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/scholarships', label: 'Scholarships', icon: 'school' },
  { href: '/applications', label: 'Applications', icon: 'description' },
  { href: '/eligibility', label: 'Eligibility Checker', icon: 'verified_user' },
  { href: '/sop-review', label: 'SOP Review', icon: 'history_edu' },
  { href: '/transcript-analyzer', label: 'Transcript Analyzer', icon: 'analytics' },
  { href: '/assistant', label: 'AI Advisor', icon: 'auto_awesome' },
];

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Admin', icon: 'admin_panel_settings' },
];

const accountNavItems: NavItem[] = [
  { href: '/profile', label: 'Profile', icon: 'person' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = React.useState(false);

  const initials =
    profile?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U';

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => {
    const isAdmin = useIsAdmin(user?.email);
    return (
      <>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-[14px] font-medium',
                  active
                    ? 'bg-tertiary-container text-on-tertiary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                )}
              >
                <span className="material-symbols-outlined text-[20px]" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        {isAdmin && (
          <nav className="flex flex-col gap-0.5 mt-3">
            <p className="px-2.5 pb-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Management
            </p>
            {adminNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-[14px] font-medium',
                    active
                      ? 'bg-tertiary-container text-on-tertiary-container font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </>
    );
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col h-screen fixed top-0 left-0 bg-surface-container-low w-[256px] border-r border-outline-variant/30 z-30">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 mb-2">
          <ScholarPilotLogo className="w-9 h-9 shrink-0" />
          <div>
            <h1 className="font-headline-sm text-[20px] font-bold text-primary tracking-tight">
              ScholarPilot
            </h1>
            <p className="text-[14px] text-on-surface-variant">
              AI Admissions Copilot
            </p>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 flex flex-col gap-1 px-3">
          <NavLinks />
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-5 flex flex-col gap-1 pt-6 border-t border-outline-variant/30">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-[14px] font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high w-full"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden md:ml-[256px]">
        {/* Mobile sheet */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="left" className="w-72 p-0 bg-surface-container-low">
              <SheetTitle className="flex items-center gap-3 px-7 py-6">
                <ScholarPilotLogo className="w-8 h-8 shrink-0" />
                <div>
                  <span className="text-[20px] font-bold text-primary tracking-tight block">
                    ScholarPilot
                  </span>
                  <span className="text-[12px] text-on-surface-variant">
                    AI Admissions Copilot
                  </span>
                </div>
              </SheetTitle>
              <div className="px-4">
                <NavLinks onNavigate={() => setOpen(false)} />
                <div className="flex flex-col gap-1 mt-4 border-t border-outline-variant/30 pt-3">
                  <p className="px-2.5 pb-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Account
                  </p>
                  {accountNavItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-[14px] font-medium',
                          active
                            ? 'bg-tertiary-container text-on-tertiary-container font-semibold shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                        )}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-[14px] font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high w-full"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Log Out
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Top navigation bar */}
        <header className="sticky top-0 z-40 bg-surface-container-lowest backdrop-blur-md shadow-sm border-b border-outline-variant/30 px-10 py-4 flex justify-between items-center w-full">
          {/* Mobile hamburger + logo */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-on-surface-variant">menu</span>
            </Button>
            <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
              <ScholarPilotLogo className="w-7 h-7 shrink-0" />
              <span className="text-[20px] font-bold text-primary tracking-tight">
                ScholarPilot
              </span>
            </Link>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 w-full max-w-md">
            <span className="material-symbols-outlined text-on-surface-variant mr-3 text-[20px]">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-[16px] text-on-surface w-full outline-none placeholder:text-on-surface-variant"
              placeholder="Search scholarships, universities..."
              onFocus={() => router.push('/scholarships')}
              readOnly
            />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <NotificationBell />
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-outline-variant/30">
              <div className="text-right">
                <p className="text-[14px] font-medium text-on-surface">
                  {profile?.full_name ?? 'Student'}
                </p>
                <p className="text-[12px] text-on-surface-variant truncate max-w-[160px]">
                  {user?.email}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-white">
                    <Avatar className="w-10 h-10 ring-2 ring-outline-variant/50">
                      <AvatarImage src={undefined} />
                      <AvatarFallback className="text-[12px] font-bold text-white bg-gradient-to-br from-primary to-primary-container">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="text-sm font-medium">
                      {profile?.full_name ?? 'Student'}
                    </span>
                    <span className="truncate text-xs font-normal text-on-surface-variant">
                      {user?.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <span className="material-symbols-outlined mr-2 text-sm">person</span> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <span className="material-symbols-outlined mr-2 text-sm">settings</span> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <span className="material-symbols-outlined mr-2 text-sm">logout</span> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 md:px-10 py-4 md:py-5 max-w-[1440px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
