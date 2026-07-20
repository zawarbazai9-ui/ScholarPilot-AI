'use client';

import * as React from 'react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScholarshipCard } from '@/components/scholarship-card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  listScholarships,
  listSavedScholarshipIds,
  saveScholarship,
  unsaveScholarship,
  eligibilityScore,
} from '@/lib/db';
import type { Scholarship } from '@/lib/types';

const SORTS = [
  { value: 'match', label: 'Match Score' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'recent', label: 'Recently added' },
];

type SortMode = 'match' | 'deadline' | 'recent';

const ITEMS_PER_PAGE = 10;

function ScholarshipsContent() {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [all, setAll] = useState<Scholarship[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('all');
  const [degree, setDegree] = useState('all');
  const [fundingType, setFundingType] = useState('all');
  const [sort, setSort] = useState<SortMode>('match');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deadlineFrom, setDeadlineFrom] = useState('');
  const [deadlineTo, setDeadlineTo] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, country, degree, fundingType, sort, deadlineFrom, deadlineTo]);

  useEffect(() => {
    (async () => {
      try {
        const [scholarships, ids] = await Promise.all([
          listScholarships(),
          profile
            ? listSavedScholarshipIds(profile.id)
            : Promise.resolve(new Set<string>()),
        ]);
        setAll(scholarships);
        setSavedIds(ids);
      } catch (err) {
        console.error('Failed to load scholarships', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const countries = useMemo(
    () => ['all', ...Array.from(new Set(all.map((s) => s.country))).sort()],
    [all]
  );

  const filtered = useMemo(() => {
    let list = all.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        const hay = `${s.title} ${s.university} ${s.country}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (country !== 'all' && s.country !== country) return false;
      if (degree !== 'all' && s.degree && s.degree !== degree) return false;
      if (fundingType !== 'all') {
        const f = s.funding.toLowerCase();
        switch (fundingType) {
          case 'Stipend':
            if (!f.includes('stipend')) return false;
            break;
          case 'Full funding':
            if (!f.includes('full')) return false;
            break;
          case 'Tuition':
            if (!f.includes('tuition')) return false;
            break;
          case 'Monetary':
            if (f.includes('stipend') || f.includes('full') || f.includes('tuition'))
              return false;
            break;
        }
      }
      if (deadlineFrom) {
        if (new Date(s.deadline).getTime() < new Date(deadlineFrom).getTime()) return false;
      }
      if (deadlineTo) {
        if (new Date(s.deadline).getTime() > new Date(deadlineTo).getTime()) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'match':
          return (
            eligibilityScore(b, profile).score - eligibilityScore(a, profile).score
          );
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'recent':
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });
    return list;
  }, [all, search, country, degree, fundingType, sort, profile, deadlineFrom, deadlineTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const activeFilterCount =
    (country !== 'all' ? 1 : 0) +
    (degree !== 'all' ? 1 : 0) +
    (fundingType !== 'all' ? 1 : 0) +
    (deadlineFrom ? 1 : 0) +
    (deadlineTo ? 1 : 0);

  const resetFilters = () => {
    setCountry('all');
    setDegree('all');
    setFundingType('all');
    setDeadlineFrom('');
    setDeadlineTo('');
    setSearch('');
    setPage(1);
  };

  const toggleSave = async (id: string) => {
    if (!profile) return;
    const isSaved = savedIds.has(id);
    setSavingId(id);
    try {
      if (isSaved) {
        await unsaveScholarship(id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast({ title: 'Removed from saved' });
      } else {
        await saveScholarship(id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        toast({ title: 'Saved to your workspace' });
      }
    } catch (err) {
      toast({
        title: 'Could not update',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  const FiltersBody = (
    <div className="space-y-4">
      {/* Country */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-on-surface-variant">Country</label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-[14px] text-on-surface focus:border-secondary focus:ring-0 outline-none transition-all duration-200"
        >
          <option value="all">All Countries</option>
          {countries.filter((c) => c !== 'all').map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Degree Level */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-on-surface-variant">Degree Level</label>
        <div className="flex flex-wrap gap-1">
          {['Undergraduate', 'Graduate', 'Postgraduate'].map((d) => {
            const active = degree === d;
            return (
              <button
                key={d}
                onClick={() => setDegree(active ? 'all' : d)}
                className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-primary text-white'
                    : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Field of Study */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-on-surface-variant">Field of Study</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <Input
            placeholder="e.g. Physics"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-container-lowest border border-outline-variant rounded-lg py-2 text-[14px] text-on-surface placeholder:text-outline focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
          />
        </div>
      </div>

      {/* Funding Type */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-on-surface-variant">Funding Type</label>
        <div className="space-y-2">
          {['Full funding', 'Stipend', 'Tuition', 'Monetary'].map((f) => {
            const checked = fundingType === f;
            return (
              <label key={f} className="flex items-center gap-2.5 cursor-pointer group">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => setFundingType(checked ? 'all' : f)}
                  className={`w-5 h-5 rounded border transition-all duration-200 shrink-0 ${
                    checked
                      ? 'bg-primary border-primary'
                      : 'bg-surface-container-lowest border-outline-variant group-hover:border-primary'
                  }`}
                >
                  {checked && (
                    <svg className="w-3 h-3 text-white mx-auto" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  )}
                </button>
                <span
                  className={`text-[14px] transition-colors duration-200 ${
                    checked ? 'text-on-surface font-medium' : 'text-on-surface group-hover:text-primary'
                  }`}
                >
                  {f}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Deadline Range */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-on-surface-variant">Deadline Range</label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={deadlineFrom}
            onChange={(e) => setDeadlineFrom(e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-[12px] text-on-surface focus:ring-0 outline-none transition-all duration-200"
          />
          <span className="text-outline-variant text-[12px]">-</span>
          <input
            type="date"
            value={deadlineTo}
            onChange={(e) => setDeadlineTo(e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-[12px] text-on-surface focus:ring-0 outline-none transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full min-h-screen">
      {/* Filters sidebar */}
      <aside className="w-full md:w-80 shrink-0">
        <div className="space-y-6 animate-fade-in-up">
          <div className="glass-card p-5 rounded-xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-on-surface">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-secondary text-[14px] font-medium hover:underline disabled:opacity-40 disabled:no-underline transition-colors duration-200"
                disabled={activeFilterCount === 0}
              >
                Clear all
              </button>
            </div>
            {FiltersBody}
          </div>

          {/* AI CTA */}
          <div className="p-5 rounded-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-primary to-primary-container">
            <div className="relative z-10">
              <h3 className="text-[20px] font-semibold mb-1 text-white">Optimize Application</h3>
              <p className="text-[14px] text-white/80 mb-4 leading-relaxed">
                Our AI analysis found areas where your profile could be stronger.
              </p>
              <Link href="/assistant">
                <button className="bg-on-tertiary-container text-tertiary-container px-5 py-2 rounded-lg font-bold text-[14px] group-hover:scale-105 transition-transform">
                  Get AI Feedback
                </button>
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-[24px] font-bold text-on-surface tracking-tight">
            Found {filtered.length} Scholarship{filtered.length !== 1 ? 's' : ''}
            <span className="font-normal text-on-surface-variant"> for your profile</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-on-surface-variant">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="border-none bg-transparent text-[14px] font-medium text-primary focus:ring-0 cursor-pointer outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {/* Mobile filter toggle */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-[14px] text-on-surface-variant hover:bg-surface-container transition-all duration-200">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-primary text-white text-[11px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent className="w-72 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-[20px] font-semibold text-on-surface">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-5 space-y-5">
                  {FiltersBody}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-secondary text-[14px] font-semibold hover:underline w-full text-center"
                    >
                      Clear all ({activeFilterCount})
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-5 rounded-2xl animate-pulse">
                <div className="flex gap-2.5 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-surface-dim" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-container rounded w-3/4" />
                    <div className="h-3 bg-surface-container rounded w-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-10 bg-surface-container rounded-lg" />
                  <div className="h-10 bg-surface-container rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-6 text-center flex flex-col items-center gap-2 py-12 rounded-2xl animate-fade-in-up">
            <span className="material-symbols-outlined text-outline-variant text-[32px]">search_off</span>
            <h3 className="text-[20px] font-semibold text-on-surface">No matches found</h3>
            <p className="text-on-surface-variant text-[14px] max-w-xs leading-relaxed">
              Try adjusting your filters or search terms to find more scholarships.
            </p>
            <button
              onClick={resetFilters}
              className="text-secondary text-[14px] font-semibold hover:underline transition-colors duration-200"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginated.map((s) => (
                <ScholarshipCard
                  key={s.id}
                  scholarship={s}
                  saved={savedIds.has(s.id)}
                  onSavedChange={(isSaved) => {
                    setSavedIds((prev) => {
                      const next = new Set(prev);
                      if (isSaved) next.add(s.id);
                      else next.delete(s.id);
                      return next;
                    });
                  }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={page <= 1 ? 'pointer-events-none opacity-40' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === 'ellipsis' ? (
                        <PaginationItem key={`e-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href="#"
                            isActive={page === item}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(item);
                            }}
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      className={page >= totalPages ? 'pointer-events-none opacity-40' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* AI Advisor FAB */}
      <Link
        href="/assistant"
        className="fixed bottom-10 right-10 z-50 w-14 h-14 rounded-full bg-tertiary text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 group"
      >
        <span
          className="material-symbols-outlined text-[24px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
        <span className="absolute right-16 bg-primary text-white px-3 py-1 rounded-lg text-[12px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Ask AI Advisor
        </span>
      </Link>
    </div>
  );
}

export default function ScholarshipsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined text-[32px] text-outline animate-spin">
            progress_activity
          </span>
        </div>
      }
    >
      <ScholarshipsContent />
    </Suspense>
  );
}
