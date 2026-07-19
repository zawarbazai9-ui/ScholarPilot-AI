'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Loader2,
  FileSearch,
  ShieldAlert,
  Trophy,
  BarChart3,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { listScholarships } from '@/lib/db';
import type { Scholarship } from '@/lib/types';
import type { EligibilityResult } from '@/lib/ai';

// ── Score color helpers ─────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-sky-600 dark:text-sky-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-sky-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Strong match';
  if (score >= 60) return 'Good match';
  if (score >= 40) return 'Possible match';
  return 'Low match';
}

function scoreBadgeClass(score: number): string {
  if (score >= 80)
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
  if (score >= 60)
    return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
  if (score >= 40)
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
  return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';
}

// ── Main component ──────────────────────────────────────────

export function EligibilityChecker() {
  const { user, profile } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load scholarships
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await listScholarships();
        if (!active) return;
        setScholarships(data);
      } catch {
        if (active) setError('Failed to load scholarships.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const selectedScholarship = useMemo(
    () => scholarships.find((s) => s.id === selectedId) ?? null,
    [scholarships, selectedId]
  );

  const hasProfile = Boolean(profile?.cgpa || profile?.major || profile?.degree);

  async function handleCheck() {
    if (!selectedId || !user) return;
    setChecking(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scholarshipId: selectedId, userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Request failed');
      setResult(data as EligibilityResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setChecking(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setSelectedId('');
  }

  return (
    <div className="space-y-6">
      {/* ── Selector card ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileSearch className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Eligibility Checker</CardTitle>
              <CardDescription>
                Select a scholarship and get an AI-powered analysis of your fit.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile warning */}
          {!loading && !hasProfile && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Incomplete profile
                </p>
                <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400/80">
                  Add your CGPA, major, or degree in{' '}
                  <a href="/profile" className="underline underline-offset-2">
                    Profile
                  </a>{' '}
                  for an accurate eligibility assessment.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium">
                Choose a scholarship
              </label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scholarship..." />
                  </SelectTrigger>
                  <SelectContent>
                    {scholarships.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title} — {s.university}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCheck}
                disabled={!selectedId || checking}
              >
                {checking ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {checking ? 'Analyzing...' : 'Check eligibility'}
              </Button>
              {result && (
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Selected scholarship preview */}
          {selectedScholarship && !checking && !result && (
            <SelectedPreview scholarship={selectedScholarship} />
          )}
        </CardContent>
      </Card>

      {/* ── Loading skeleton ─────────────────────────────── */}
      {checking && <ResultSkeleton />}

      {/* ── Error ───────────────────────────────────────── */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 py-4">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Eligibility check failed
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={handleCheck}
              >
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Results ─────────────────────────────────────── */}
      {result && !checking && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Score header */}
          <ScoreHeader result={result} scholarship={selectedScholarship} />

          {/* Two-column detail */}
          <div className="grid gap-6 lg:grid-cols-2">
            <StrengthsCard strengths={result.strengths} />
            <WeaknessesCard weaknesses={result.weaknesses} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <MissingCard items={result.missingRequirements} />
            <RecommendationsCard items={result.recommendations} />
          </div>

          {/* Official link */}
          {selectedScholarship?.official_link && (
            <Card>
              <CardContent className="flex items-center justify-between py-4">
                <p className="text-sm text-muted-foreground">
                  Ready to apply?
                </p>
                <Button asChild size="sm">
                  <a
                    href={selectedScholarship.official_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit official page
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function SelectedPreview({ scholarship }: { scholarship: Scholarship }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{scholarship.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {scholarship.university} · {scholarship.country}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {scholarship.degree && (
            <Badge variant="secondary" className="text-xs">
              {scholarship.degree}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {scholarship.funding}
          </Badge>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
        {scholarship.description}
      </p>
      {scholarship.requirements && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground italic">
          Requirements: {scholarship.requirements}
        </p>
      )}
    </div>
  );
}

function ScoreHeader({
  result,
  scholarship,
}: {
  result: EligibilityResult;
  scholarship: Scholarship | null;
}) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (result.eligibilityScore / 100) * circumference;

  return (
    <Card className="relative overflow-hidden">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-[0.03] ${scoreBg(result.eligibilityScore)}`}
      />
      <CardContent className="relative flex flex-col items-center gap-6 py-8 sm:flex-row">
        {/* Score ring */}
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/40"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={scoreBg(result.eligibilityScore)}
              style={{
                transition: 'stroke-dashoffset 1s ease-in-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-display text-3xl font-bold ${scoreColor(result.eligibilityScore)}`}>
              {result.eligibilityScore}
            </span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <Badge className={scoreBadgeClass(result.eligibilityScore)}>
            {scoreLabel(result.eligibilityScore)}
          </Badge>
          {scholarship && (
            <p className="mt-2 text-sm text-muted-foreground">
              Assessment for{' '}
              <span className="font-medium text-foreground">
                {scholarship.title}
              </span>{' '}
              at {scholarship.university}
            </p>
          )}
          {result.overallSummary && (
            <p className="mt-3 text-sm leading-relaxed">
              {result.overallSummary}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StrengthsCard({ strengths }: { strengths: string[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-base">Strengths</CardTitle>
          <Badge variant="secondary" className="ml-auto text-xs">
            {strengths.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {strengths.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No strengths identified.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function WeaknessesCard({ weaknesses }: { weaknesses: string[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/15">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-base">Weaknesses</CardTitle>
          <Badge variant="secondary" className="ml-auto text-xs">
            {weaknesses.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {weaknesses.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No weaknesses identified.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {weaknesses.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700 dark:bg-red-500/15 dark:text-red-400">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function MissingCard({ items }: { items: string[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/15">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-base">Missing requirements</CardTitle>
          <Badge variant="secondary" className="ml-auto text-xs">
            {items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No missing requirements detected.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                  !
                </span>
                <span className="text-sm leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RecommendationsCard({ items }: { items: string[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/15">
            <Lightbulb className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <CardTitle className="text-base">Recommendations</CardTitle>
          <Badge variant="secondary" className="ml-auto text-xs">
            {items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No recommendations at this time.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
                  <Lightbulb className="h-3 w-3" />
                </span>
                <span className="text-sm leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-8 sm:flex-row">
          <Skeleton className="h-32 w-32 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-32" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-start gap-2.5">
                  <Skeleton className="mt-1 h-5 w-5 shrink-0 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
