'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  GraduationCap,
  Target,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Transcript Analyzer
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload your transcript and optionally paste program requirements to check your fit.
        </p>
      </div>

      {/* Upload card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Upload Transcript</CardTitle>
              <CardDescription>
                PDF format, max 10MB. Text-based PDFs work best.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-500/5'
                : file
                ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
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
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drop your transcript here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">PDF only</p>
              </>
            )}
          </div>

          {/* Program requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">
              Program requirements{' '}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="requirements"
              placeholder={`Paste the program requirements here, e.g.:\n- Minimum GPA: 3.5\n- Prerequisites: Calculus I & II, Statistics, Intro to CS\n- Strong recommendation letters\n- Research experience preferred`}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Adding specific requirements gives a more accurate fit assessment.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleAnalyze} disabled={!file || analyzing}>
              {analyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Target className="mr-2 h-4 w-4" />
              )}
              {analyzing ? 'Analyzing...' : 'Analyze transcript'}
            </Button>
            {(file || result) && (
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Analysis failed</p>
              <p className="mt-1 text-xs text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {analyzing && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
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
    <div className="space-y-6">
      {/* Student info + GPA */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Student Info</p>
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
          </CardContent>
        </Card>

        {/* Fit score */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                <Target className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Program Fit</p>
            </div>

            {/* Score ring */}
            <div className="flex items-center gap-6">
              <div className="relative h-28 w-28 shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/50" />
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
                  <span className={`font-display text-2xl font-bold ${scoreColor(fitScore)}`}>
                    {fitScore}
                  </span>
                  <span className="text-[10px] text-muted-foreground">/100</span>
                </div>
              </div>
              <div>
                <Badge className={scoreBadgeClass(fitScore)}>{scoreLabel(fitScore)}</Badge>
                <p className="mt-2 text-xs text-muted-foreground">
                  GPA Trend: {result.gpa_trend}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-medium">Strengths</p>
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
              <p className="text-sm text-muted-foreground italic">No strengths identified.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-medium">Weaknesses</p>
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
              <p className="text-sm text-muted-foreground italic">No weaknesses identified.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Requirements check */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-medium">Requirements Check</p>
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
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">None identified.</p>
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
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">None — all requirements met!</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course analysis */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            <p className="text-sm font-medium">Course Analysis</p>
          </div>

          <div className="space-y-3 text-sm">
            <InfoRow label="Prerequisite check" value={result.course_analysis.prerequisite_check} />
            <InfoRow label="Grade summary" value={result.course_analysis.grade_summary} />
          </div>

          {result.course_analysis.relevant_courses.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                All courses
              </p>
              <div className="max-h-64 overflow-y-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Course</th>
                      <th className="px-3 py-2 text-left font-medium">Grade</th>
                      <th className="px-3 py-2 text-left font-medium">Credits</th>
                      <th className="px-3 py-2 text-left font-medium">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.academic_record.courses.map((c, i) => (
                      <tr key={i} className="border-t">
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
        </CardContent>
      </Card>

      {/* Recommendations */}
      {fit.recommendations.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-medium">Recommendations</p>
            </div>
            <ul className="space-y-2">
              {fit.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
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
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? 'font-semibold' : ''}>{value}</span>
    </div>
  );
}
