'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  ClipboardList,
  Bell,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Award,
  CheckCircle2,
  Circle,
  AlertCircle,
  Search,
  User,
  FileText,
  Rocket,
  BarChart3,
  Calendar,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { ApplicationStatusBadge } from '@/components/application-status-badge';
import { DeadlinePill, daysUntil } from '@/components/scholarship-utils';
import { ScholarshipCard } from '@/components/scholarship-card';
import {
  listSavedScholarships,
  listApplications,
} from '@/lib/db';
import type { Application, SavedScholarship, Scholarship } from '@/lib/types';

type SavedWithScholarship = SavedScholarship & { scholarship: Scholarship };
type ApplicationWithScholarship = Application & { scholarship: Scholarship };

const chartConfig = {
  not_started: { label: 'Not started', color: 'hsl(var(--muted-foreground))' },
  researching: { label: 'Researching', color: 'hsl(199, 89%, 48%)' },
  drafting: { label: 'Drafting', color: 'hsl(38, 92%, 50%)' },
  submitted: { label: 'Submitted', color: 'hsl(var(--primary))' },
  awarded: { label: 'Awarded', color: 'hsl(142, 71%, 45%)' },
  rejected: { label: 'Rejected', color: 'hsl(0, 84%, 60%)' },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<SavedWithScholarship[]>([]);
  const [applications, setApplications] = useState<ApplicationWithScholarship[]>([]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const [savedData, appsData] = await Promise.all([
          listSavedScholarships(user.id),
          listApplications(user.id),
        ]);
        if (!active) return;
        setSaved((savedData as SavedWithScholarship[]));
        setApplications((appsData as ApplicationWithScholarship[]));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const upcomingDeadlines = useMemo(() => {
    const all = [
      ...saved.map((s) => ({
        id: s.scholarship.id,
        title: s.scholarship.title,
        funding: s.scholarship.funding,
        deadline: s.scholarship.deadline,
        kind: 'saved' as const,
      })),
      ...applications.map((a) => ({
        id: a.scholarship.id,
        title: a.scholarship.title,
        funding: a.scholarship.funding,
        deadline: a.scholarship.deadline,
        kind: 'application' as const,
      })),
    ];
    return all
      .filter((d) => daysUntil(d.deadline) >= 0)
      .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
      .slice(0, 5);
  }, [saved, applications]);

  const stats = useMemo(() => ({
    saved: saved.length,
    applications: applications.length,
    inProgress: applications.filter(
      (a) => a.status !== 'not_started' && a.status !== 'awarded' && a.status !== 'rejected'
    ).length,
    awarded: applications.filter((a) => a.status === 'awarded').length,
    deadlines: upcomingDeadlines.length,
    avgProgress: applications.length > 0
      ? Math.round(applications.reduce((sum, a) => sum + a.progress, 0) / applications.length)
      : 0,
  }), [saved, applications, upcomingDeadlines]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {
      not_started: 0, researching: 0, drafting: 0, submitted: 0, awarded: 0, rejected: 0,
    };
    applications.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return Object.entries(counts)
      .map(([key, value]) => ({ status: chartConfig[key as keyof typeof chartConfig]?.label ?? key, fill: chartConfig[key as keyof typeof chartConfig]?.color ?? '#888', value }))
      .filter((d) => d.value > 0);
  }, [applications]);

  const recentActivity = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 4)
      .map((a) => ({
        id: a.id,
        title: a.scholarship.title,
        status: a.status,
        progress: a.progress,
        updatedAt: a.updated_at,
      }));
  }, [applications]);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    { label: 'Saved scholarships', value: stats.saved, icon: Bookmark, tone: 'text-primary', bg: 'bg-primary/10', href: '/scholarships' },
    { label: 'Active applications', value: stats.inProgress, icon: ClipboardList, tone: 'text-accent', bg: 'bg-accent/10', href: '/applications' },
    { label: 'Upcoming deadlines', value: stats.deadlines, icon: Bell, tone: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/10', href: '/applications' },
    { label: 'Awards won', value: stats.awarded, icon: Award, tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/10', href: '/applications' },
  ];

  const quickActions = [
    { label: 'Browse scholarships', href: '/scholarships', icon: Search, color: 'bg-primary/10 text-primary' },
    { label: 'Ask AI Assistant', href: '/assistant', icon: Sparkles, color: 'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' },
    { label: 'Update profile', href: '/profile', icon: User, color: 'bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400' },
    { label: 'Track application', href: '/applications', icon: ClipboardList, color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero banner */}
      <Card className="relative overflow-hidden border-border/70">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <CardContent className="relative flex flex-col items-start justify-between gap-6 py-7 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-muted-foreground">{greeting},</p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {firstName}
            </h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              {stats.saved === 0 && stats.applications === 0
                ? 'Welcome to ScholarPilot AI. Start by browsing scholarships and saving the ones that fit.'
                : `You have ${stats.saved} saved scholarship${stats.saved !== 1 ? 's' : ''} and ${stats.applications} tracked application${stats.applications !== 1 ? 's' : ''}. Keep the momentum going.`}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/scholarships">
                Find scholarships
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/assistant">
                <Sparkles className="mr-2 h-4 w-4" />
                Ask AI
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-center justify-between py-5">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  {loading ? (
                    <Skeleton className="mt-1.5 h-8 w-12" />
                  ) : (
                    <p className="mt-1 font-display text-3xl font-bold">{s.value}</p>
                  )}
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.bg} ${s.tone}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Quick actions</CardTitle>
          </div>
          <CardDescription className="text-xs">Jump to the most common tasks.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map((a) => (
              <Link key={a.label} href={a.href}>
                <div className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:border-primary/30 hover:bg-muted/30">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${a.color}`}>
                    <a.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{a.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main content: Saved + Sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Saved Scholarships */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Saved scholarships</h2>
              <p className="text-sm text-muted-foreground">Your most recently saved opportunities.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/scholarships">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {loading ? (
            <SavedSkeleton />
          ) : saved.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No saved scholarships yet"
              description="Browse the catalog and bookmark the ones that match your profile."
              action={{ label: 'Browse scholarships', href: '/scholarships' }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {saved.slice(0, 4).map((s) => (
                <ScholarshipCard key={s.scholarship.id} scholarship={s.scholarship} saved />
              ))}
            </div>
          )}

          {/* Applications in Progress */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Applications in progress</h2>
              <p className="text-sm text-muted-foreground">Track your active scholarship applications.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/applications">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {loading ? (
            <AppsSkeleton />
          ) : applications.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No applications tracked yet"
              description="Start tracking an application from a saved scholarship."
              action={{ label: 'Track an application', href: '/applications' }}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {applications.slice(0, 5).map((a) => (
                    <Link
                      key={a.id}
                      href={`/scholarships/${a.scholarship.id}`}
                      className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.scholarship.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{a.scholarship.university}</p>
                      </div>
                      <ApplicationStatusBadge status={a.status} />
                      <div className="hidden w-24 sm:block">
                        <Progress value={a.progress} className="h-1.5" />
                      </div>
                      <span className="hidden text-xs text-muted-foreground sm:block">{a.progress}%</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-base">Upcoming deadlines</CardTitle>
              </div>
              <CardDescription className="text-xs">Sorted by closest date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {loading ? (
                <SkeletonList count={4} />
              ) : upcomingDeadlines.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">No deadlines in the near future.</p>
                  <Button asChild size="sm" variant="ghost" className="mt-2">
                    <Link href="/scholarships">Find scholarships</Link>
                  </Button>
                </div>
              ) : (
                upcomingDeadlines.map((d) => (
                  <Link
                    key={d.id + d.kind}
                    href={`/scholarships/${d.id}`}
                    className="flex items-center gap-3 rounded-md border bg-card p-3 transition-colors hover:border-primary/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{d.funding}</p>
                    </div>
                    <DeadlinePill dateStr={d.deadline} />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Application Progress Chart */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Application progress</CardTitle>
              </div>
              <CardDescription className="text-xs">Distribution by status.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <Skeleton className="h-[160px] w-full" />
              ) : applications.length === 0 ? (
                <div className="flex h-[160px] items-center justify-center text-center">
                  <div>
                    <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-xs text-muted-foreground">No data yet. Track an application to see progress.</p>
                  </div>
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Recent activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <SkeletonList count={3} />
              ) : recentActivity.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((r) => (
                    <div key={r.id} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{r.title}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <ApplicationStatusBadge status={r.status} className="text-[10px]" />
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(r.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Average Progress */}
      {stats.applications > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium">Overall application progress</p>
                <p className="text-xs text-muted-foreground">
                  Average across {stats.applications} tracked application{stats.applications !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex w-full items-center gap-4 sm:w-auto">
              <Progress value={stats.avgProgress} className="h-2.5 flex-1 sm:w-40" />
              <span className="font-display text-2xl font-bold">{stats.avgProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">AI Insights</CardTitle>
              <CardDescription className="text-xs">Personalized guidance based on your profile and activity.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!profile?.cgpa && !profile?.major ? (
            <div className="flex items-start gap-3 rounded-lg border bg-background p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <p className="text-sm font-medium">Complete your profile for accurate eligibility scoring</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add your CGPA, major, and degree so AI can score every scholarship for you.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <Link href="/profile">Update profile</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <InsightCard icon={TrendingUp} title="Improve your match rate" body="Scholarships aligned with your major and degree are high-probability targets. Prioritize those first." />
              <InsightCard icon={Clock} title="Pace your applications" body="You have upcoming deadlines. Aim to submit at least 3 days early to avoid last-minute issues." />
              <InsightCard icon={CheckCircle2} title="Track every application" body="Students who track progress are more likely to submit complete applications on time." />
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg border border-dashed bg-background/50 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Circle className="h-3.5 w-3.5" />
              Want deeper, personalized advice?
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/assistant">
                Open AI Assistant
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function InsightCard({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action, compact }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: { label: string; href: string };
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 text-center ${compact ? 'p-6' : 'p-10'}`}>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>
      {action && (
        <Button asChild size="sm" variant="outline" className="mt-4">
          <Link href={action.href}>
            {action.label}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      )}
    </div>
  );
}

function SavedSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-0">
          <div className="p-4 pb-3 space-y-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-5 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="px-4 pb-3 space-y-2">
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <div className="px-4 pb-4 flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AppsSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="hidden h-1.5 w-24 sm:block" />
              <Skeleton className="hidden h-3 w-8 sm:block" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-md border p-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
