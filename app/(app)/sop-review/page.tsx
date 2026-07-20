'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { SOPResult } from '@/lib/ai';

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: { str?: string }) => ('str' in item ? item.str ?? '' : ''))
      .join(' ');
    if (pageText.trim()) textParts.push(pageText);
  }

  return textParts.join('\n\n');
}

// ── Score helpers ───────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (s >= 60) return 'text-sky-600 dark:text-sky-400';
  if (s >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreBg(s: number): string {
  if (s >= 80) return 'bg-emerald-500';
  if (s >= 60) return 'bg-sky-500';
  if (s >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function scoreLabel(s: number): string {
  if (s >= 80) return 'Excellent';
  if (s >= 60) return 'Good';
  if (s >= 40) return 'Needs work';
  return 'Weak';
}

function scoreBadgeClass(s: number): string {
  if (s >= 80)
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
  if (s >= 60)
    return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
  if (s >= 40)
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
  return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';
}

// ── Dimension configs ───────────────────────────────────────

const DIMENSIONS = [
  { key: 'grammar' as const, label: 'Grammar', icon: 'edit_note', description: 'Spelling, punctuation, and sentence construction' },
  { key: 'structure' as const, label: 'Structure', icon: 'menu_book', description: 'Logical flow, paragraph organization, coherence' },
  { key: 'clarity' as const, label: 'Clarity', icon: 'psychology', description: 'Clear expression, no ambiguity or jargon overload' },
  { key: 'motivation' as const, label: 'Motivation', icon: 'gps_fixed', description: 'Passion, goals, and programme fit' },
  { key: 'academicTone' as const, label: 'Academic Tone', icon: 'chat', description: 'Formality, precision, and scholarly voice' },
];

// ── Page ────────────────────────────────────────────────────

export default function SOPReviewPage() {
  const [sop, setSop] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [result, setResult] = useState<SOPResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = sop.length;
  const wordCount = sop.trim() ? sop.trim().split(/\s+/).length : 0;

  const handlePDFUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    setPdfLoading(true);
    setError(null);
    try {
      const text = await extractTextFromPDF(file);
      if (!text.trim()) {
        setError('Could not extract text from the PDF. The file may be image-based.');
        return;
      }
      setSop(text.trim());
    } catch {
      setError('Failed to read the PDF. Please try again or paste your text manually.');
    } finally {
      setPdfLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  async function handleReview() {
    if (!sop.trim() || sop.trim().length < 50) return;
    setReviewing(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/sop-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sop: sop.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Request failed');
      setResult(data as SOPResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setReviewing(false);
    }
  }

  function handleReset() {
    setSop('');
    setResult(null);
    setError(null);
  }

  async function copySuggestions() {
    if (!result?.suggestions.length) return;
    const text = result.suggestions
      .map((s, i) => `${i + 1}. ${s}`)
      .join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="space-y-lg">
        <h1 className="font-headline-lg text-headline-lg text-primary">
          SOP Review
        </h1>
        <p className="text-body-lg text-on-surface-variant/80">
          Paste your Statement of Purpose and get instant AI-powered feedback.
        </p>
      </div>

      {/* Editor card */}
      <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-secondary-container text-on-secondary-container p-2 rounded-lg">
              <span className="material-symbols-outlined text-[20px]">description</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Your Statement of Purpose</h2>
              <p className="text-body-sm text-on-surface-variant">
                Paste or type your SOP below. Minimum 50 characters, maximum 10,000.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handlePDFUpload}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={pdfLoading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-xl font-bold"
            >
              {pdfLoading ? (
                <span className="material-symbols-outlined text-[20px] animate-spin mr-1.5">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[20px] mr-1.5">upload</span>
              )}
              {pdfLoading ? 'Extracting text...' : 'Upload PDF'}
            </Button>
            <span className="text-xs text-on-surface-variant/60">
              or paste your text below
            </span>
          </div>
          <Textarea
            placeholder="Paste your Statement of Purpose here..."
            value={sop}
            onChange={(e) => setSop(e.target.value)}
            rows={14}
            className="resize-y text-sm leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-xs text-on-surface-variant/60">
              <span>{wordCount} words</span>
              <span>{charCount.toLocaleString()} / 10,000 characters</span>
            </div>
            <div className="flex gap-2">
              {result && (
                <Button variant="outline" onClick={handleReset} className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-xl font-bold">
                  <span className="material-symbols-outlined text-[20px] mr-2">refresh</span>
                  Reset
                </Button>
              )}
              <Button
                onClick={handleReview}
                disabled={reviewing || sop.trim().length < 50}
                className="bg-primary text-on-primary rounded-xl font-bold"
              >
                {reviewing ? (
                  <span className="material-symbols-outlined text-[20px] animate-spin mr-2">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px] mr-2">auto_awesome</span>
                )}
                {reviewing ? 'Analyzing...' : 'Review SOP'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {reviewing && <LoadingSkeleton />}

      {/* Error */}
      {error && (
        <div className="border-error/10 bg-error-container/20 p-xl rounded-2xl shadow-sm border border-outline-variant/30">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] mt-0.5 shrink-0 text-error">error</span>
            <div>
              <p className="text-sm font-medium text-error">Review failed</p>
              <p className="mt-1 text-xs text-on-surface-variant">{error}</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={handleReview}>
                Try again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !reviewing && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Overall score header */}
          <OverallScore result={result} />

          {/* Dimension cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIMENSIONS.map((d) => (
              <DimensionCard
                key={d.key}
                label={d.label}
                icon={d.icon}
                description={d.description}
                score={result[d.key]}
              />
            ))}
          </div>

          {/* Suggestions */}
          <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">auto_awesome</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Suggestions for improvement</h3>
                <Badge variant="secondary" className="text-xs">
                  {result.suggestions.length}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={copySuggestions} className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-xl font-bold">
                {copied ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] mr-1.5">check</span>
                    Copied!
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px] mr-1.5">content_copy</span>
                    Copy all
                  </>
                )}
              </Button>
            </div>
            <div className="mt-4">
              {result.suggestions.length === 0 ? (
                <p className="py-4 text-center text-sm text-on-surface-variant">
                  No suggestions — your SOP looks great!
                </p>
              ) : (
                <ul className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function OverallScore({ result }: { result: SOPResult }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (result.overallScore / 100) * circumference;

  return (
    <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30 relative overflow-hidden">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-[0.03] ${scoreBg(result.overallScore)}`}
      />
      <div className="relative flex flex-col items-center gap-6 py-8 sm:flex-row">
        {/* Score ring */}
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-outline/20" />
            <circle
              cx="60" cy="60" r="54" fill="none" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              className={scoreBg(result.overallScore)}
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-display text-3xl font-bold ${scoreColor(result.overallScore)}`}>
              {result.overallScore}
            </span>
            <span className="text-[10px] text-on-surface-variant">/100</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <Badge className={scoreBadgeClass(result.overallScore)}>
            {scoreLabel(result.overallScore)}
          </Badge>
          {result.summary && (
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              {result.summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DimensionCard({
  label,
  icon,
  description,
  score,
}: {
  label: string;
  icon: string;
  description: string;
  score: number;
}) {
  return (
    <div className="bg-surface-container-lowest p-lg rounded-2xl shadow-sm border border-outline-variant/30">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${scoreBg(score)}/10`}>
          <span className={`material-symbols-outlined text-[20px] ${scoreColor(score)}`}>{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{label}</p>
            <span className={`text-lg font-bold ${scoreColor(score)}`}>{score}</span>
          </div>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-on-surface-variant">{description}</p>
      <Progress value={score} className="mt-2.5 h-1.5" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="flex flex-col items-center gap-6 py-8 sm:flex-row">
          <Skeleton className="h-32 w-32 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-3/4 max-w-sm" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-surface-container-lowest p-lg rounded-2xl shadow-sm border border-outline-variant/30">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-1.5 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
        <Skeleton className="h-5 w-48" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="mt-0.5 h-6 w-6 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
