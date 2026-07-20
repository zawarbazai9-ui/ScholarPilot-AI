'use client';

import { useCallback, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// ── Score helpers ───────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (s >= 60) return 'text-sky-600 dark:text-sky-400';
  if (s >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreLabel(s: number): string {
  if (s >= 80) return 'Excellent fit';
  if (s >= 60) return 'Good fit';
  if (s >= 40) return 'Moderate fit';
  return 'Low fit';
}

function scoreBadgeClass(s: number): string {
  if (s >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
  if (s >= 60) return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
  if (s >= 40) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
  return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';
}

function scoreProgressColor(s: number): string {
  if (s >= 80) return 'bg-emerald-500';
  if (s >= 60) return 'bg-sky-500';
  if (s >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

// ── Types ──────────────────────────────────────────────────

type Course = {
  name: string;
  grade: string;
  credits: string;
  category: string;
};

type AnalysisResult = {
  student_info: {
    name: string | null;
    institution: string | null;
    degree: string | null;
    graduation_date: string | null;
  };
  academic_record: {
    gpa: string;
    total_credits: string | null;
    courses: Course[];
  };
  strengths: string[];
  weaknesses: string[];
  gpa_trend: string;
  program_fit: {
    score: number;
    meets_requirements: string[];
    missing_requirements: string[];
    recommendations: string[];
  };
  course_analysis: {
    relevant_courses: string[];
    grade_summary: string;
    prerequisite_check: string;
  };
};

// ── Main Page ──────────────────────────────────────────────

export default function TranscriptAnalyzerPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((f: File) => {
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      // Extract text client-side
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjsLib: any = await import('pdfjs-dist');
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
      const transcriptText = textParts.join('\n\n');

      if (!transcriptText.trim() || transcriptText.trim().length < 50) {
        throw new Error('Could not extract text from PDF. The file may be scanned/image-based.');
      }

      const res = await fetch('/api/transcript-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptText,
          requirements: requirements.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
      setResult(data.analysis);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setAnalyzing(false);
    }
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    setError(null);
    setRequirements('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="mx-auto max-w-4xl space-y-xl">
      {/* Page Header */}
      <div className="space-y-lg">
        <h1 className="font-headline-lg text-headline-lg text-primary">Transcript Analyzer</h1>
        <p className="text-body-lg text-on-surface-variant/80">
          Upload your transcript and optionally paste program requirements to check your fit.
        </p>
      </div>

      {/* Upload card */}
      <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2 mb-lg">
          <div className="bg-secondary-container p-2 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">description</span>
          </div>
          <div>
            <p className="text-headline-md font-headline-md text-on-surface">Upload Transcript</p>
            <p className="text-body-sm text-on-surface-variant">
              PDF format, max 10MB. Text-based PDFs work best.
            </p>
          </div>
        </div>

        <div className="space-y-lg">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
              dragOver
                ? 'border-secondary bg-secondary/5'
                : file
                ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/5'
                : 'border-outline-variant/30 hover:border-outline-variant/50'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onFileChange}
            />
            {file ? (
              <>
                <span className="material-symbols-outlined text-[20px] text-emerald-500">check_circle</span>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-on-surface-variant">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">upload</span>
                <p className="text-sm font-medium">
                  Drop your transcript here or click to browse
                </p>
                <p className="text-xs text-on-surface-variant">PDF only</p>
              </>
            )}
          </div>

          {/* Program requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">
              Program requirements{' '}
              <span className="text-on-surface-variant">(optional)</span>
            </Label>
            <Textarea
              id="requirements"
              placeholder={`Paste the program requirements here, e.g.:\n- Minimum GPA: 3.5\n- Prerequisites: Calculus I & II, Statistics, Intro to CS\n- Strong recommendation letters\n- Research experience preferred`}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-on-surface-variant">
              Adding specific requirements gives a more accurate fit assessment.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!file || analyzing}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold transition-all hover:opacity-90 shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {analyzing ? (
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">gps_fixed</span>
              )}
              {analyzing ? 'Analyzing...' : 'Analyze transcript'}
            </button>
            {(file || result) && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-xl font-bold transition-all hover:bg-surface-container active:scale-95"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error-container/20 border border-error/10 p-xl rounded-2xl shadow-sm">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] mt-0.5 shrink-0 text-error">error</span>
            <div>
              <p className="text-sm font-medium text-error">Analysis failed</p>
              <p className="mt-1 text-xs text-on-surface-variant">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {analyzing && (
        <div className="space-y-xl">
          <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
            <Skeleton className="h-6 w-48" />
            <div className="grid gap-4 mt-4 sm:grid-cols-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-20 w-full mt-3" />
            <Skeleton className="h-20 w-full mt-3" />
          </div>
        </div>
      )}

      {/* Results */}
      {result && <AnalysisResults result={result} />}
    </div>
  );
}

// ── Results Component ──────────────────────────────────────

function AnalysisResults({ result }: { result: AnalysisResult }) {
  const fit = result.program_fit;
  const fitScore = Math.min(100, Math.max(0, fit.score ?? 0));

  return (
    <div className="space-y-xl">
      {/* Student info + GPA */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Student Info */}
        <div className="lg:col-span-1 bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-secondary-container p-2 rounded-lg">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <p className="text-headline-sm font-headline-sm text-on-surface">Student Info</p>
          </div>
          <div className="space-y-2 text-sm">
            <InfoRow label="Name" value={result.student_info.name} />
            <InfoRow label="Institution" value={result.student_info.institution} />
            <InfoRow label="Degree" value={result.student_info.degree} />
            <InfoRow label="Graduation" value={result.student_info.graduation_date} />
            <Separator className="my-3" />
            <InfoRow label="GPA" value={result.academic_record.gpa} bold />
            <InfoRow label="Total Credits" value={result.academic_record.total_credits} />
          </div>
        </div>

        {/* Fit score */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-secondary-container p-2 rounded-lg">
              <span className="material-symbols-outlined text-[20px]">gps_fixed</span>
            </div>
            <p className="text-headline-sm font-headline-sm text-on-surface">Program Fit</p>
          </div>

          {/* Score ring */}
          <div className="flex items-center gap-6">
            <div className="relative h-28 w-28 shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-container-high" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - fitScore / 100)}
                  className={scoreProgressColor(fitScore)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${scoreColor(fitScore)}`}>
                  {fitScore}
                </span>
                <span className="text-[10px] text-on-surface-variant">/100</span>
              </div>
            </div>
            <div>
              <Badge className={scoreBadgeClass(fitScore)}>{scoreLabel(fitScore)}</Badge>
              <p className="mt-2 text-xs text-on-surface-variant">
                GPA Trend: {result.gpa_trend}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-secondary-container p-2 rounded-lg">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
            <p className="text-headline-sm font-headline-sm text-on-surface">Strengths</p>
          </div>
          {result.strengths.length > 0 ? (
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-on-surface-variant italic">No strengths identified.</p>
          )}
        </div>

        <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-secondary-container p-2 rounded-lg">
              <span className="material-symbols-outlined text-[20px]">error</span>
            </div>
            <p className="text-headline-sm font-headline-sm text-on-surface">Weaknesses</p>
          </div>
          {result.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {result.weaknesses.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-on-surface-variant italic">No weaknesses identified.</p>
          )}
        </div>
      </div>

      {/* Requirements check */}
      <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2 mb-lg">
          <div className="bg-secondary-container p-2 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
          </div>
          <p className="text-headline-sm font-headline-sm text-on-surface">Requirements Check</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Met
            </p>
            {fit.meets_requirements.length > 0 ? (
              <ul className="space-y-1.5">
                {fit.meets_requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="material-symbols-outlined mt-0.5 text-[20px] shrink-0 text-emerald-500">check_circle</span>
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-on-surface-variant italic">None identified.</p>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">
              Missing
            </p>
            {fit.missing_requirements.length > 0 ? (
              <ul className="space-y-1.5">
                {fit.missing_requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="material-symbols-outlined mt-0.5 text-[20px] shrink-0 text-error">cancel</span>
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-on-surface-variant italic">None — all requirements met!</p>
            )}
          </div>
        </div>
      </div>

      {/* Course analysis */}
      <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2 mb-lg">
          <div className="bg-secondary-container p-2 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
          </div>
          <p className="text-headline-sm font-headline-sm text-on-surface">Course Analysis</p>
        </div>

        <div className="space-y-3 text-sm">
          <InfoRow label="Prerequisite check" value={result.course_analysis.prerequisite_check} />
          <InfoRow label="Grade summary" value={result.course_analysis.grade_summary} />
        </div>

        {result.course_analysis.relevant_courses.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Relevant courses
            </p>
            <div className="flex flex-wrap gap-2">
              {result.course_analysis.relevant_courses.map((c, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Course list */}
        {result.academic_record.courses.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              All courses
            </p>
            <div className="max-h-64 overflow-y-auto rounded-xl border border-outline-variant/30">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-surface-container-high">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Course</th>
                    <th className="px-3 py-2 text-left font-medium">Grade</th>
                    <th className="px-3 py-2 text-left font-medium">Credits</th>
                    <th className="px-3 py-2 text-left font-medium">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {result.academic_record.courses.map((c, i) => (
                    <tr key={i} className="border-t border-outline-variant/30">
                      <td className="px-3 py-1.5">{c.name}</td>
                      <td className="px-3 py-1.5 font-medium">{c.grade}</td>
                      <td className="px-3 py-1.5">{c.credits}</td>
                      <td className="px-3 py-1.5">
                        <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {fit.recommendations.length > 0 && (
        <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-secondary-container p-2 rounded-lg">
              <span className="material-symbols-outlined text-[20px]">lightbulb</span>
            </div>
            <p className="text-headline-sm font-headline-sm text-on-surface">Recommendations</p>
          </div>
          <ul className="space-y-2">
            {fit.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Helper ─────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string | null | undefined;
  bold?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-on-surface-variant">{label}</span>
      <span className={bold ? 'font-semibold' : ''}>{value}</span>
    </div>
  );
}
