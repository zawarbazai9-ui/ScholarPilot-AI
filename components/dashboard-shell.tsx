'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  Sparkles,
  FileSearch,
  FileText,
  Shield,
  ClipboardCheck,
  User,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScholarPilotLogo } from '@/components/brand';

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function useIsAdmin(userEmail: string | undefined | null) {
  return !!userEmail && adminEmails.includes(userEmail.toLowerCase());
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scholarships', label: 'Scholarships', icon: GraduationCap },
  { href: '/applications', label: 'Applications', icon: ClipboardList },
  { href: '/eligibility', label: 'Eligibility Checker', icon: FileSearch },
  { href: '/sop-review', label: 'SOP Review', icon: FileText },
  { href: '/transcript-analyzer', label: 'Transcript Analyzer', icon: ClipboardCheck },
  { href: '/assistant', label: 'AI Assistant', icon: Sparkles },
];

const adminNavItems = [
  { href: '/admin', label: 'Admin', icon: Shield },
];

const secondaryNavItems = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
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

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => {
    const isAdmin = useIsAdmin(user?.email);
    return (
    <>
      <nav className="flex flex-col gap-1">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {isAdmin && (
        <nav className="flex flex-col gap-1">
          <p className="px-3 pb-2 pt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Management
          </p>
          {adminNavItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
      <nav className="flex flex-col gap-1">
        <p className="px-3 pb-2 pt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Account
        </p>
        {secondaryNavItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
    );
  };

  const UserCard = () => (
    <div className="flex items-center gap-3 rounded-md border bg-card p-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={undefined} />
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {profile?.full_name ?? user?.email}
        </p>
        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-background px-3 py-5 lg:flex">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 pb-6"
        >
          <ScholarPilotLogo className="h-7 w-7" />
          <span className="font-display text-lg font-semibold tracking-tight">
            ScholarPilot
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="space-y-3 pt-3">
          <UserCard />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile sheet */}
      <div className="flex w-full flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-sm lg:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4">
              <SheetTitle className="flex items-center gap-2 px-2 pb-4 pt-1">
                <ScholarPilotLogo className="h-7 w-7" />
                <span className="font-display text-lg font-semibold">
                  ScholarPilot
                </span>
              </SheetTitle>
              <div className="flex flex-col gap-2">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
              <div className="mt-auto space-y-3 pt-4">
                <UserCard />
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 lg:hidden"
          >
            <ScholarPilotLogo className="h-6 w-6" />
            <span className="font-display text-base font-semibold">
              ScholarPilot
            </span>
          </Link>

          <div className="relative ml-2 hidden flex-1 items-center md:flex">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search scholarships, applications…"
              className="h-9 w-full max-w-md rounded-md border border-input bg-muted/40 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/50 focus:bg-background"
              onFocus={(e) => {
                router.push('/scholarships');
              }}
              readOnly
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-1 rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
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
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
