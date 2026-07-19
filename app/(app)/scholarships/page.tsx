'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  GraduationCap,
  DollarSign,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScholarshipCard } from '@/components/scholarship-card';
import {
  listScholarships,
  listSavedScholarshipIds,
  eligibilityScore,
} from '@/lib/db';
import type { Scholarship } from '@/lib/types';

const DEGREES = ['Undergraduate', 'Graduate', 'Postgraduate'];
const SORTS = [
  { value: 'deadline', label: 'Deadline (soonest)' },
  { value: 'recent', label: 'Recently added' },
  { value: 'match', label: 'AI match (highest)' },
];

export default function ScholarshipsPage() {
  const params = useSearchParams();
  const { profile } = useAuth();

  const [all, setAll] = useState<Scholarship[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('all');
  const [degree, setDegree] = useState('all');
  const [fundingType, setFundingType] = useState('all');
  const [sort, setSort] = useState('deadline');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [scholarships, ids] = await Promise.all([
          listScholarships(),
          profile ? listSavedScholarshipIds(profile.id) : Promise.resolve(new Set<string>()),
        ]);
        setAll(scholarships);
        setSavedIds(ids);
      } catch (err) {
        console.error('Failed to load scholarships', err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countries = React.useMemo(
    () => ['all', ...Array.from(new Set(all.map((s) => s.country))).sort()],
    [all]
  );

  const fundingTypes = React.useMemo(() => {
    const types = new Set<string>();
    all.forEach((s) => {
      const f = s.funding.toLowerCase();
      if (f.includes('stipend')) types.add('Stipend');
      else if (f.includes('full')) types.add('Full funding');
      else if (f.includes('tuition')) types.add('Tuition');
      else types.add('Monetary');
    });
    return ['all', ...Array.from(types).sort()];
  }, [all]);

  const filtered = React.useMemo(() => {
    let list = all.filter((s) => {
      if (query) {
        const q = query.toLowerCase();
        const hay = `${s.title} ${s.university}`.toLowerCase();
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
            if (f.includes('stipend') || f.includes('full') || f.includes('tuition')) return false;
            break;
        }
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'recent':
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case 'match':
          return (
            eligibilityScore(b, profile).score -
            eligibilityScore(a, profile).score
          );
        case 'deadline':
        default:
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
      }
    });
    return list;
  }, [all, query, country, degree, fundingType, sort, profile]);

  const activeFilterCount =
    (country !== 'all' ? 1 : 0) +
    (degree !== 'all' ? 1 : 0) +
    (fundingType !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setCountry('all');
    setDegree('all');
    setFundingType('all');
  };

  const FiltersBody = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5" />
          Country
        </Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {c === 'all' ? 'All countries' : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5" />
          Degree level
        </Label>
        <Select value={degree} onValueChange={setDegree}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {DEGREES.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <DollarSign className="h-3.5 w-3.5" />
          Funding type
        </Label>
        <Select value={fundingType} onValueChange={setFundingType}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fundingTypes.map((ft) => (
              <SelectItem key={ft} value={ft}>
                {ft === 'all' ? 'All types' : ft}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={resetFilters}
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Scholarship Explorer
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse {all.length} opportunities. Save the ones that fit — AI scores
          your eligibility instantly.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by scholarship name or university…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 justify-center bg-primary px-1.5 text-xs text-primary-foreground">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80 overflow-y-auto sm:w-96">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{FiltersBody}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading scholarships…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 py-16 text-center">
          <Search className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No scholarships match your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try widening your search or clearing filters.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">{filtered.length}</span>{' '}
            scholarship{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
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
        </>
      )}
    </div>
  );
}
