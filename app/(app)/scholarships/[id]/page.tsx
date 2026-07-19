'use client';

import * as React from 'react';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ClipboardList,
  ExternalLink,
  MapPin,
  GraduationCap,
  Building2,
  CalendarDays,
  Sparkles,
  FileText,
  CheckCircle2,
  Gift,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApplicationStatusBadge } from '@/components/application-status-badge';
import { formatDate } from '@/components/scholarship-utils';
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

export default function ScholarshipDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
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
      <div className="mx-auto max-w-4xl py-20">
        <div className="flex items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading scholarship…
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="mx-auto max-w-4xl py-20 text-center">
        <p className="font-medium text-lg">Scholarship not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been removed or the link is invalid.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/scholarships">Back to Explorer</Link>
        </Button>
      </div>
    );
  }

  const { score, reasons } = eligibilityScore(scholarship, profile);
  const tone = profile ? scoreTone(score) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back link */}
      <Link
        href="/scholarships"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Explorer
      </Link>

      {/* Hero card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />
              {scholarship.university}
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {scholarship.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/10 text-primary text-sm">{scholarship.funding}</Badge>
              <Badge variant="outline" className="text-sm">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                Due {formatDate(scholarship.deadline)}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <MapPin className="mr-1.5 h-3.5 w-3.5" />
                {scholarship.country}
              </Badge>
              {scholarship.degree && (
                <Badge variant="outline" className="text-sm">
                  <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                  {scholarship.degree}
                </Badge>
              )}
            </div>
          </div>

          {/* AI Match */}
          {profile && tone && (
            <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-accent/5 p-4 sm:min-w-[200px]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Match</p>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold">{score}%</span>
                <Badge className={tone.className}>{tone.label}</Badge>
              </div>
              {reasons.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {reasons.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Section icon={FileText} title="Description">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {scholarship.description}
            </p>
          </Section>

          {/* Eligibility / Requirements */}
          {scholarship.requirements && (
            <Section icon={CheckCircle2} title="Eligibility">
              <ul className="space-y-2">
                {scholarship.requirements
                  .split(';')
                  .map((r) => r.trim())
                  .filter(Boolean)
                  .map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {req}
                    </li>
                  ))}
              </ul>
            </Section>
          )}

          {/* Benefits */}
          <Section icon={Gift} title="Benefits">
            <div className="grid gap-3 sm:grid-cols-2">
              <BenefitCard label="Funding" value={scholarship.funding} />
              <BenefitCard label="Degree Level" value={scholarship.degree ?? 'Open to all'} />
              <BenefitCard label="Location" value={scholarship.country} />
              <BenefitCard
                label="Deadline"
                value={formatDate(scholarship.deadline)}
              />
            </div>
          </Section>

          {/* Required Documents */}
          <Section icon={FileText} title="Required Documents">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Please visit the official website for the complete list of required documents.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <a
                href={scholarship.official_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on official site
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Application tracker */}
          {application && (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your Application
              </p>
              <div className="mt-2 flex items-center gap-3">
                <ApplicationStatusBadge status={application.status} />
                <span className="text-xs text-muted-foreground">
                  {application.progress}% complete
                </span>
              </div>
              <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                <Link href="/applications">Open tracker</Link>
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <Button
              onClick={toggleSave}
              disabled={saving}
              variant={saved ? 'secondary' : 'outline'}
              className="w-full"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : saved ? (
                <BookmarkCheck className="mr-2 h-4 w-4" />
              ) : (
                <Bookmark className="mr-2 h-4 w-4" />
              )}
              {saved ? 'Saved' : 'Save scholarship'}
            </Button>

            {!application && (
              <Button variant="outline" className="w-full" onClick={startTracking}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Track application
              </Button>
            )}

            <Button asChild className="w-full">
              <a
                href={scholarship.official_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply now
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Quick facts */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Quick Facts
            </p>
            <div className="mt-3 space-y-3">
              <FactRow icon={Building2} label="University" value={scholarship.university} />
              <FactRow icon={MapPin} label="Country" value={scholarship.country} />
              <FactRow icon={GraduationCap} label="Degree" value={scholarship.degree ?? 'Any'} />
              <FactRow icon={Sparkles} label="Funding" value={scholarship.funding} />
              <FactRow icon={CalendarDays} label="Deadline" value={formatDate(scholarship.deadline)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function BenefitCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function FactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
