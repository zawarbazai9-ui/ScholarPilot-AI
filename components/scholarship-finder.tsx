'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type FoundScholarship = {
  title: string;
  university: string;
  country: string;
  degree: string | null;
  funding: string;
  deadline: string;
  description: string;
  requirements: string | null;
  official_link: string;
};

const DEGREES = ['Undergraduate', 'Graduate', 'Postgraduate'];
const FIELDS = [
  'Computer Science', 'Engineering', 'Business', 'Medicine', 'Law',
  'Education', 'Sciences', 'Arts', 'Social Sciences', 'Environmental Science',
  'Public Health', 'Data Science', 'AI and Machine Learning', 'Any field',
];
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Germany', 'Australia',
  'France', 'Netherlands', 'Japan', 'South Korea', 'Singapore',
  'Switzerland', 'Sweden', 'China', 'India', 'International',
];

export function ScholarshipFinder({ session, onAdded }: { session?: { access_token?: string } | null; onAdded?: () => void }) {
  const { toast } = useToast();
  const [field, setField] = useState('');
  const [country, setCountry] = useState('');
  const [degree, setDegree] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FoundScholarship[]>([]);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [addingId, setAddingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!field && !country && !degree) return;
    setSearching(true);
    setResults([]);
    setError(null);
    setAddedIds(new Set());
    try {
      const res = await fetch('/api/scholarship-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, country, degree, count: 8 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Search failed');
      setResults(data.scholarships ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(s: FoundScholarship, index: number) {
    setAddingId(index);
    try {
      const res = await fetch('/api/admin/scholarships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify(s),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to add');
      }
      setAddedIds((prev) => new Set(prev).add(index));
      onAdded?.();
      toast({ title: 'Scholarship added', description: s.title });
    } catch (err: unknown) {
      toast({
        title: 'Failed to add',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search form */}
      <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
        <p className="text-headline-md font-headline-md text-on-surface mb-lg flex items-center gap-2">
          <span className="p-2 bg-secondary-container rounded-lg">
            <span className="material-symbols-outlined text-on-secondary-container text-[20px]">auto_awesome</span>
          </span>
          AI Scholarship Finder
        </p>
        <p className="text-body-sm text-on-surface-variant/80 mb-lg">
          Describe what you&apos;re looking for and AI will find matching scholarships.
        </p>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-on-surface">
                <span className="material-symbols-outlined text-[14px]">menu_book</span>
                Field of study
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface ring-offset-background placeholder:text-on-surface-variant/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Any field</option>
                {FIELDS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-on-surface">
                <span className="material-symbols-outlined text-[14px]">public</span>
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface ring-offset-background placeholder:text-on-surface-variant/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Any country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-on-surface">
                <span className="material-symbols-outlined text-[14px]">school</span>
                Degree level
              </label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface ring-offset-background placeholder:text-on-surface-variant/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Any level</option>
                {DEGREES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || (!field && !country && !degree)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm transition-all hover:opacity-90 shadow-sm active:scale-95 disabled:opacity-50"
          >
            {searching ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">search</span>
            )}
            {searching ? 'Searching...' : 'Find scholarships'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {searching && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30 space-y-3">
              <div className="h-5 w-48 bg-surface-container-high rounded animate-pulse" />
              <div className="h-4 w-32 bg-surface-container-high rounded animate-pulse" />
              <div className="h-10 w-full bg-surface-container-high rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-surface-container-high rounded animate-pulse" />
                <div className="h-8 w-20 bg-surface-container-high rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-error-container/20 border border-error/10 p-xl rounded-2xl">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] mt-0.5 shrink-0 text-error">error</span>
            <div>
              <p className="text-sm font-medium text-error">Search failed</p>
              <p className="mt-1 text-xs text-on-surface-variant">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-on-surface-variant">
            Found <span className="font-medium text-on-surface">{results.length}</span> scholarships.
            Review and add them to your database.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((s, i) => {
              const isAdded = addedIds.has(i);
              return (
                <div
                  key={i}
                  className={`bg-surface-container-lowest p-xl rounded-2xl shadow-sm border ${isAdded ? 'border-success/30 bg-success/10' : 'border-outline-variant/30'}`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight text-on-surface">{s.title}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {s.university} · {s.country}
                        </p>
                      </div>
                      {isAdded ? (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 px-2.5 py-1 text-xs font-medium">
                          <span className="material-symbols-outlined text-[12px]">check</span>
                          Added
                        </span>
                      ) : (
                        <div className="flex shrink-0 gap-1.5">
                          {s.degree && (
                            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-medium text-on-surface-variant">{s.degree}</span>
                          )}
                          <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-medium text-on-secondary-container">{s.funding}</span>
                        </div>
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs text-on-surface-variant">{s.description}</p>
                    {s.requirements && (
                      <p className="line-clamp-1 text-[11px] text-on-surface-variant/70 italic">
                        Req: {s.requirements}
                      </p>
                    )}
                    <p className="text-[11px] text-on-surface-variant">
                      Deadline: <span className="font-medium">{s.deadline}</span>
                    </p>
                    <div className="flex gap-2 pt-1">
                      {!isAdded && (
                        <button
                          disabled={addingId === i}
                          onClick={() => handleAdd(s, i)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                        >
                          {addingId === i ? (
                            <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-[14px]">add</span>
                          )}
                          Add to database
                        </button>
                      )}
                      {s.official_link && (
                        <a
                          href={s.official_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-on-surface-variant hover:text-primary rounded-xl transition-colors"
                        >
                          Visit
                          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
