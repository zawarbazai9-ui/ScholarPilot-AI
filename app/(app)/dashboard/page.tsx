'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
        setSaved(savedData as SavedWithScholarship[]);
        setApplications(appsData as ApplicationWithScholarship[]);
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

  const recentActivity = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 4)
      .map((a) => ({
        id: a.id,
        title: a.scholarship.title,
        university: a.scholarship.university,
        status: a.status,
        progress: a.progress,
        updatedAt: a.updated_at,
      }));
  }, [applications]);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-xl animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">
            {greeting}, {firstName}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant/80 mt-1">
            {stats.saved === 0 && stats.applications === 0
              ? 'Ready to find your perfect academic path today?'
              : `You have ${stats.saved} saved scholarship${stats.saved !== 1 ? 's' : ''} and ${stats.applications} tracked application${stats.applications !== 1 ? 's' : ''}.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <Link href="/scholarships">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold transition-all hover:opacity-90 shadow-sm active:scale-95">
              <span className="material-symbols-outlined text-[20px]">search</span>
              <span className="font-label-md text-label-md">Find Scholarships</span>
            </button>
          </Link>
          <Link href="/eligibility">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-xl font-bold transition-all hover:bg-surface-container active:scale-95">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
              <span className="font-label-md text-label-md">Check Eligibility</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Bento Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest p-6 rounded-xl shadow-card border border-outline-variant/20">
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))
        ) : (
          <>
            <Link href="/scholarships">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-card border border-outline-variant/20 flex flex-col gap-1 hover:-translate-y-0.5 hover:shadow-card-hover transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 bg-secondary-fixed rounded-lg">
                    <span className="material-symbols-outlined text-on-secondary-fixed-variant">library_books</span>
                  </span>
                   <span className="text-[12px] font-bold text-success">
                     {stats.saved > 0 ? `${stats.saved} saved` : 'Start exploring'}
                  </span>
                </div>
                <p className="text-headline-md font-headline-md text-primary">{stats.saved}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Scholarships Saved
                </p>
              </div>
            </Link>

            <Link href="/applications">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-card border border-outline-variant/20 flex flex-col gap-1 hover:-translate-y-0.5 hover:shadow-card-hover transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 bg-tertiary-fixed rounded-lg">
                    <span className="material-symbols-outlined text-on-tertiary-fixed-variant">outgoing_mail</span>
                  </span>
                  <span className="text-[12px] font-bold text-on-surface-variant">
                    {stats.inProgress} active
                  </span>
                </div>
                <p className="text-headline-md font-headline-md text-primary">{stats.applications}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Applications Tracked
                </p>
              </div>
            </Link>

            <div className="bg-error-container/20 p-6 rounded-xl shadow-card border border-error/10 flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 bg-error-container rounded-lg">
                  <span className="material-symbols-outlined text-on-error-container">event_note</span>
                </span>
                <span className="text-[12px] font-bold text-error">
                  {stats.deadlines > 0 ? 'Action needed' : 'All clear'}
                </span>
              </div>
              <p className="text-headline-md font-headline-md text-primary">{stats.deadlines}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Upcoming Deadlines
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-card border border-outline-variant/20 flex flex-col gap-1 hover:-translate-y-0.5 hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 bg-primary-fixed rounded-lg">
                  <span className="material-symbols-outlined text-on-primary-fixed-variant" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                </span>
                <span className="text-[12px] font-bold text-success">Awarded</span>
              </div>
              <p className="text-headline-md font-headline-md text-primary">{stats.awarded}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Awards Won
              </p>
            </div>
          </>
        )}
      </div>

      {/* Main Layout: Left (Recommendations + Apps) + Right (Deadlines) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-xl">
          {/* Saved Scholarships */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                Saved Scholarships
              </h3>
              <Link href="/scholarships" className="text-secondary font-label-md text-label-md hover:underline">
                View all recommendations
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30">
                    <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-56 mb-4" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : saved.length === 0 ? (
              <div className="bg-surface-container-lowest p-10 rounded-xl border border-dashed border-outline-variant/50 text-center">
                <span className="material-symbols-outlined text-5xl text-outline-variant/40 block mb-3">bookmark_border</span>
                <p className="font-label-md text-label-md text-on-surface-variant">No saved scholarships yet</p>
                <p className="text-body-sm text-on-surface-variant/70 mt-1 mb-4">Browse the catalog and bookmark the ones that match your profile.</p>
                <Link href="/scholarships">
                  <button className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-md hover:opacity-90 transition-all">
                    Browse Scholarships
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {saved.slice(0, 4).map((s) => (
                  <ScholarshipCard key={s.scholarship.id} scholarship={s.scholarship} saved />
                ))}
              </div>
            )}
          </div>

          {/* Applications in Progress */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-on-tertiary-container">description</span>
                Applications in Progress
              </h3>
              <Link href="/applications" className="text-secondary font-label-md text-label-md hover:underline">
                View all
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-3" />
                    <Skeleton className="h-1.5 w-full" />
                  </div>
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-surface-container-lowest p-10 rounded-xl border border-dashed border-outline-variant/50 text-center">
                <span className="material-symbols-outlined text-5xl text-outline-variant/40 block mb-3">assignment</span>
                <p className="font-label-md text-label-md text-on-surface-variant">No applications tracked yet</p>
                <p className="text-body-sm text-on-surface-variant/70 mt-1 mb-4">Start tracking an application from a saved scholarship.</p>
                <Link href="/applications">
                  <button className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-md hover:opacity-90 transition-all">
                    Track Application
                  </button>
                </Link>
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/20 overflow-hidden">
                {applications.slice(0, 5).map((a, idx) => (
                  <div key={a.id}>
                    <Link
                      href={`/scholarships/${a.scholarship.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-surface-container-low/50 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-label-md text-label-md font-bold text-primary truncate group-hover:text-secondary transition-colors">
                          {a.scholarship.title}
                        </p>
                        <p className="text-[12px] text-on-surface-variant">{a.scholarship.university}</p>
                      </div>
                      <ApplicationStatusBadge status={a.status} />
                      <div className="hidden sm:flex flex-col items-end gap-1 w-24">
                        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-secondary h-1.5 rounded-full transition-all"
                            style={{ width: `${a.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-outline">{a.progress}%</span>
                      </div>
                    </Link>
                    {idx < Math.min(applications.length, 5) - 1 && (
                      <div className="h-px bg-outline-variant/20 mx-5" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-sm">
            <div className="p-4 bg-secondary-container/10 border border-secondary/10 rounded-xl flex items-center gap-4 group cursor-pointer hover:bg-secondary-container/20 transition-colors">
              <span className="material-symbols-outlined text-secondary">auto_awesome</span>
              <div className="flex-1">
                <p className="font-label-md text-label-md font-bold text-on-secondary-container">AI Eligibility Checker</p>
                <p className="text-[12px] text-on-secondary-container/80">Get instant match scores for your profile</p>
              </div>
              <Link href="/eligibility">
                <span className="material-symbols-outlined text-on-secondary-container">chevron_right</span>
              </Link>
            </div>
            <div className="p-4 bg-tertiary-container/10 border border-tertiary/10 rounded-xl flex items-center gap-4 group cursor-pointer hover:bg-tertiary-container/20 transition-colors">
              <span className="material-symbols-outlined text-on-tertiary-container">history_edu</span>
              <div className="flex-1">
                <p className="font-label-md text-label-md font-bold text-on-tertiary-container">SOP Review</p>
                <p className="text-[12px] text-on-tertiary-container/80">AI-powered statement of purpose feedback</p>
              </div>
              <Link href="/sop-review">
                <span className="material-symbols-outlined text-on-tertiary-container">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Deadlines + Activity */}
        <div className="space-y-xl">
          {/* Upcoming Deadlines */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-sm text-headline-sm text-primary">Deadlines</h3>
              <button className="p-1 text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined">calendar_month</span>
              </button>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/20 overflow-hidden">
              <div className="p-4 space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-12 h-14 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
                ) : upcomingDeadlines.length === 0 ? (
                  <div className="py-6 text-center">
                    <span className="material-symbols-outlined text-4xl text-outline-variant/40 block mb-2">event_available</span>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">No upcoming deadlines</p>
                    <Link href="/scholarships">
                      <button className="mt-3 text-secondary font-label-md text-label-md hover:underline">
                        Find scholarships
                      </button>
                    </Link>
                  </div>
                ) : (
                  upcomingDeadlines.map((d, idx) => {
                    const days = daysUntil(d.deadline);
                    const isUrgent = days <= 7;
                    const deadlineDate = new Date(d.deadline);
                    const month = deadlineDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                    const day = deadlineDate.getDate();
                    return (
                      <div key={d.id + d.kind}>
                        <Link href={`/scholarships/${d.id}`} className="flex gap-3 group cursor-pointer">
                          <div className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg ${isUrgent ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'}`}>
                            <span className="text-[10px] font-bold uppercase">{month}</span>
                            <span className="text-headline-sm font-bold">{day}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-label-md text-label-md font-bold text-primary truncate group-hover:text-secondary transition-colors">
                              {d.title}
                            </h5>
                            <p className="text-[12px] text-on-surface-variant">{d.funding}</p>
                            <div className="mt-1 w-full bg-surface-container h-1 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${isUrgent ? 'bg-error' : 'bg-secondary'}`} style={{ width: `${Math.max(10, 100 - (days / 60) * 100)}%` }} />
                            </div>
                            <p className={`text-[10px] mt-1 font-bold ${isUrgent ? 'text-error' : 'text-outline'}`}>
                              {days === 0 ? 'Due today' : days === 1 ? '1 day left' : `${days} days left`}
                            </p>
                          </div>
                        </Link>
                        {idx < upcomingDeadlines.length - 1 && (
                          <div className="h-px bg-outline-variant/20 my-3" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <Link href="/applications">
                <button className="w-full py-3 bg-surface-container-low text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                  View Full Calendar
                </button>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Recent Activity</h3>
              <div className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/20 overflow-hidden">
                <div className="p-4 space-y-3">
                  {recentActivity.map((r) => (
                    <div key={r.id} className="flex items-start gap-3">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                      <div className="min-w-0 flex-1">
                        <p className="font-label-md text-label-md font-bold text-primary truncate">{r.title}</p>
                        <p className="text-[12px] text-on-surface-variant">{r.university}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <ApplicationStatusBadge status={r.status} className="text-[10px]" />
                          <span className="text-[10px] text-outline">{formatRelativeTime(r.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Assistant CTA */}
          <div className="p-5 bg-gradient-to-br from-primary to-primary-container rounded-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-headline-sm text-headline-sm text-white mb-1">Need help?</h3>
              <p className="font-body-sm text-body-sm text-white/70 mb-4">Ask our AI Advisor for personalized guidance on your applications.</p>
              <Link href="/assistant">
                <button className="bg-on-tertiary-container text-tertiary-container px-5 py-2.5 rounded-xl font-bold text-label-md group-hover:scale-105 transition-transform flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  Ask AI Advisor
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
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
