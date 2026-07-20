'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { formatDate, daysUntil } from '@/components/scholarship-utils';
import { getCampusPhoto, getUniversityBadge } from '@/lib/images';
import {
  getScholarship,
  listSavedScholarshipIds,
  saveScholarship,
  unsaveScholarship,
  getApplicationByScholarship,
  createApplication,
  eligibilityScore,
  scoreTone,
} from '@/lib/db';
import type { Scholarship } from '@/lib/types';
import { notifyDeadlineApproaching } from '@/lib/notify';

export default function ScholarshipDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<{
    status: string;
    progress: number;
  } | null>(null);
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [heroCrestError, setHeroCrestError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, savedIds] = await Promise.all([
          getScholarship(id),
          user ? listSavedScholarshipIds(user.id) : Promise.resolve(new Set<string>()),
        ]);
        setScholarship(s);
        setSaved(savedIds.has(id));
        if (user && s) {
          const app = await getApplicationByScholarship(user.id, id);
          if (app) setApplication({ status: app.status, progress: app.progress });
        }
      } catch (err) {
        console.error('Failed to load scholarship', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setBarsAnimated(true), 200);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const toggleSave = async () => {
    if (!scholarship) return;
    setSaving(true);
    try {
      if (saved) {
        await unsaveScholarship(scholarship.id);
        setSaved(false);
        toast({ title: 'Removed from saved' });
      } else {
        await saveScholarship(scholarship.id);
        setSaved(true);
        toast({ title: 'Saved to your workspace' });
        if (user) {
          const days = daysUntil(scholarship.deadline);
          if (days > 0 && days <= 7) {
            notifyDeadlineApproaching(
              user.id,
              scholarship.title,
              days,
              scholarship.id
            ).catch(() => {});
          }
        }
      }
    } catch (err) {
      toast({
        title: 'Could not update',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const startTracking = async () => {
    if (!scholarship) return;
    try {
      await createApplication({
        scholarship_id: scholarship.id,
        status: 'researching',
        progress: 5,
      });
      setApplication({ status: 'researching', progress: 5 });
      toast({ title: 'Now tracking this application' });
    } catch (err) {
      toast({
        title: 'Could not start tracking',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-[3px] border-surface-container border-t-secondary rounded-full animate-spin" />
          <p className="text-on-surface-variant text-label-md">Loading scholarship…</p>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center max-w-sm p-10">
          <span className="material-symbols-outlined text-error text-[40px] mb-4 block">error</span>
          <h2 className="text-headline-md text-primary mb-2">Couldn't load scholarship</h2>
          <p className="text-on-surface-variant text-body-sm">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  const { score, reasons } = eligibilityScore(scholarship, profile);
  const tone = profile ? scoreTone(score) : null;

  const requirements = scholarship.requirements
    ? scholarship.requirements.split(';').map((r) => r.trim()).filter(Boolean)
    : [];

  const campusPhoto = getCampusPhoto(scholarship.country);
  const universityBadge = getUniversityBadge(scholarship.university, scholarship.country, scholarship.official_link);

  const hasStarted = Boolean(application);
  const isSaved = saved;

  const timelineSteps = [
    {
      step_number: 1,
      label: 'Prepare Materials',
      date_label: 'Current',
      icon: 'edit_document',
      description: 'Update CV, prepare your personal statement, and identify referees.',
      status: 'current' as const,
    },
    {
      step_number: 2,
      label: 'Application Submission',
      date_label: formatDate(scholarship.deadline),
      icon: 'send',
      description: 'Submit the application before the deadline.',
      status: 'upcoming' as const,
    },
    {
      step_number: 3,
      label: 'Interview & Decision',
      date_label: 'TBD',
      icon: 'groups',
      description: 'Shortlisted candidates are invited for interviews.',
      status: 'upcoming' as const,
    },
  ];

  const fundingItems = [
    { id: '1', label: 'Tuition Coverage', coverage: '100% Covered', percent: 100, sort_order: 1 },
    { id: '2', label: 'Living Allowance', coverage: 'Fully Funded', percent: 85, sort_order: 2 },
    { id: '3', label: 'Travel Grant', coverage: 'Included', percent: 60, sort_order: 3 },
    { id: '4', label: 'Health Insurance', coverage: 'Covered', percent: 70, sort_order: 4 },
  ];

  const eligibleCount = requirements.length;
  const totalChecks = eligibleCount + reasons.length;
  const progressPercent = totalChecks > 0 ? Math.round((eligibleCount / totalChecks) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto relative bg-background flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {/* ── Hero ──────────────────────────────────────────── */}
          <section className="relative h-80 w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center animate-fade-in">
              {campusPhoto && (
                <img
                  src={campusPhoto}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-transparent" />

            <div className="absolute bottom-0 left-0 w-full px-12 pb-8 flex items-end justify-between gap-6 flex-wrap max-w-7xl mx-auto">
              <div className="flex items-center gap-6 animate-fade-in-up">
                <div className="w-24 h-24 bg-surface-container-lowest p-2 rounded-2xl shadow-xl shrink-0 hidden sm:flex items-center justify-center relative">
                  {heroCrestError ? (
                    <span className="material-symbols-outlined text-primary text-[32px]">school</span>
                  ) : (
                    <img
                      src={universityBadge}
                      alt=""
                      className="w-full h-full object-contain"
                      onError={() => setHeroCrestError(true)}
                    />
                  )}
                </div>
                <div className="text-white">
                  <h2 className="text-headline-lg mb-1 drop-shadow-sm">
                    {scholarship.title}
                  </h2>
                  <p className="text-body-lg opacity-90 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                    {scholarship.university}, {scholarship.country}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={toggleSave}
                  disabled={saving}
                  className={`px-6 py-3 backdrop-blur-md border font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-60 ${
                    isSaved
                      ? 'bg-white/20 border-white/30 text-white'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={isSaved ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    bookmark
                  </span>
                  {isSaved ? 'Saved' : 'Save for Later'}
                </button>
                <button
                  onClick={startTracking}
                  disabled={hasStarted}
                  className="px-6 py-3 bg-secondary text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-80 disabled:hover:brightness-100"
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={hasStarted ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {hasStarted ? 'task_alt' : 'rocket_launch'}
                  </span>
                  {hasStarted ? 'Application Started' : 'Start Application'}
                </button>
              </div>
            </div>
          </section>

          {/* ── Bento Content ─────────────────────────────────── */}
          <div className="px-12 py-6 grid grid-cols-12 gap-6 max-w-7xl mx-auto">
            {/* Main Column */}
            <div className="col-span-12 space-y-6 lg:col-span-8">
              {/* Overview */}
              <div className="bg-surface-container-lowest p-10 rounded-2xl shadow-sm border border-outline-variant/30 card-hover animate-fade-in-up">
                <h3 className="text-headline-md mb-4 text-primary flex items-center gap-3">
                  <span className="material-symbols-outlined text-[24px]">info</span>
                  Scholarship Overview
                </h3>
                <p className="text-body-lg text-on-surface-variant leading-relaxed">
                  {scholarship.description}
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <span className="text-label-sm uppercase text-on-primary-container block mb-1">
                      Total Award
                    </span>
                    <p className="text-headline-sm font-bold text-primary">{scholarship.funding}</p>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <span className="text-label-sm uppercase text-on-primary-container block mb-1">
                      Slots
                    </span>
                    <p className="text-headline-sm font-bold text-primary">Multiple</p>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <span className="text-label-sm uppercase text-on-primary-container block mb-1">
                      Next Deadline
                    </span>
                    <p className="text-headline-sm font-bold text-secondary">{formatDate(scholarship.deadline)}</p>
                  </div>
                </div>
              </div>

              {/* Funding Breakdown */}
              <div className="bg-surface-container-lowest p-10 rounded-2xl shadow-sm border border-outline-variant/30 card-hover animate-fade-in-up">
                <h3 className="text-headline-md mb-4 text-primary flex items-center gap-3">
                  <span className="material-symbols-outlined text-[24px]">payments</span>
                  Funding Breakdown
                </h3>
                <div className="space-y-6">
                  {fundingItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-6">
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="text-label-md text-on-surface">{item.label}</span>
                          <span className="font-bold text-primary">{item.coverage}</span>
                        </div>
                        <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-secondary to-secondary-container bar-fill rounded-full"
                            style={{ width: barsAnimated ? `${item.percent}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 p-4 border-l-4 border-secondary bg-surface-container-low italic text-on-surface-variant rounded-r-lg flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">format_quote</span>
                  <span>
                    Scholarships also cover visa costs and health insurance for the duration of the degree.
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-surface-container-lowest p-10 rounded-2xl shadow-sm border border-outline-variant/30 card-hover animate-fade-in-up">
                <h3 className="text-headline-md mb-10 text-primary flex items-center gap-3">
                  <span className="material-symbols-outlined text-[24px]">route</span>
                  Application Timeline
                </h3>
                <div className="relative">
                  <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-outline-variant" />
                  <div className="space-y-10 relative">
                    {timelineSteps.map((step) => {
                      const isActive = step.status === 'current';
                      return (
                        <div key={step.step_number} className="flex items-start gap-6">
                          <div
                            className={`z-10 w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${
                              isActive
                                ? 'bg-secondary text-white shadow-lg ring-4 ring-secondary/20'
                                : 'bg-surface-container text-on-primary-container border border-outline-variant'
                            }`}
                          >
                            <span
                              className="material-symbols-outlined text-[26px]"
                              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                              {step.icon}
                            </span>
                          </div>
                          <div className="pt-2">
                            <p className={`text-label-sm uppercase ${isActive ? 'text-secondary' : 'text-on-primary-container'}`}>
                              Step {step.step_number} — {step.date_label}
                            </p>
                            <h4 className={`text-headline-sm mt-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                              {step.label}
                            </h4>
                            <p className="text-on-surface-variant mt-1">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="col-span-12 space-y-6 lg:col-span-4">
              {/* Eligibility */}
              <div className="bg-surface-container-lowest p-10 rounded-2xl shadow-sm border border-outline-variant/30 card-hover animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-headline-sm text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[22px]">fact_check</span>
                    Eligibility Checklist
                  </h3>
                  <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">
                    {eligibleCount}/{totalChecks}
                  </span>
                </div>

                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-success bar-fill rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="space-y-4">
                  {requirements.map((req, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl border bg-surface-bright border-outline-variant/10 transition-colors"
                    >
                      <span
                        className="material-symbols-outlined text-success text-[24px] shrink-0"
                         style={{ fontVariationSettings: "'FILL' 1" }}
                       >
                         check_circle
                       </span>
                       <div className="flex-1 min-w-0">
                         <p className="text-label-md text-primary">{req}</p>
                         <p className="text-xs text-success">Qualified</p>
                      </div>
                    </div>
                  ))}
                  {reasons.map((r, i) => (
                    <div
                      key={`reason-${i}`}
                      className="flex items-center gap-4 p-4 rounded-xl border bg-error-container/30 border-error/20 transition-colors"
                    >
                      <span
                        className="material-symbols-outlined text-error text-[24px] shrink-0"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        warning
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-label-md text-on-error-container">Attention Needed</p>
                        <p className="text-xs text-error">{r}</p>
                      </div>
                    </div>
                  ))}
                  {totalChecks === 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-xl border bg-surface-bright border-outline-variant/10 transition-colors">
                      <span className="material-symbols-outlined text-on-primary-container text-[24px] shrink-0">pending</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-label-md text-on-primary-container">Complete Profile</p>
                        <p className="text-xs text-on-surface-variant">Add your details to see eligibility</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Tips */}
              <div className="bg-primary-container p-10 rounded-2xl shadow-xl relative overflow-hidden group card-hover animate-fade-in-up">
                <div className="absolute inset-0 ai-inner-glow pointer-events-none opacity-50" />
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-tertiary/30 blur-3xl rounded-full animate-pulse-glow" />
                <div className="absolute -bottom-16 -left-12 w-40 h-40 bg-on-tertiary-container/10 blur-3xl rounded-full" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-on-tertiary-container rounded-lg flex items-center justify-center shadow-lg">
                      <span
                        className="material-symbols-outlined text-white text-[22px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        auto_awesome
                      </span>
                    </div>
                    <h3 className="text-headline-sm text-white">AI Admission Tips</h3>
                  </div>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container mt-2 shrink-0" />
                      <p className="text-body-sm text-white/90 leading-relaxed">
                        <span className="font-bold text-on-tertiary-container">Personal Statement:</span>{' '}
                        Tailor your essay to this specific scholarship's mission and values.
                      </p>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container mt-2 shrink-0" />
                      <p className="text-body-sm text-white/90 leading-relaxed">
                        <span className="font-bold text-on-tertiary-container">References:</span>{' '}
                        Get strong recommendation letters from academic referees who know your work.
                      </p>
                    </li>
                  </ul>
                  <button className="w-full mt-10 py-3 bg-tertiary-container text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-tertiary transition-colors border border-white/10 shadow-lg">
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                    Ask AI Anything
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
                <div className="bg-surface-container-high p-4 rounded-xl text-center card-hover">
                  <span className="material-symbols-outlined text-secondary block mb-1 text-[24px]">person_search</span>
                  <p className="text-xs text-on-primary-container">Competition</p>
                  <p className="font-bold text-primary">High</p>
                </div>
                <div className="bg-surface-container-high p-4 rounded-xl text-center card-hover">
                  <span className="material-symbols-outlined text-secondary block mb-1 text-[24px]">history_edu</span>
                  <p className="text-xs text-on-primary-container">Acceptance</p>
                  <p className="font-bold text-primary">Selective</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
