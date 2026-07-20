import { useMemo, useState } from 'react';
import type { Scholarship, Filters, SortMode, ViewName } from '../types';
import { TopBar } from './TopBar';
import { FiltersPanel } from './FiltersPanel';
import { ScholarshipCard } from './ScholarshipCard';
import { MobileNav } from './Navigation';
import { Icon } from './Icon';
import type { UserProfile } from '../types';

type ScholarshipListProps = {
  scholarships: Scholarship[];
  profile: UserProfile | null;
  onSelect: (id: string) => void;
  onToggleSave: (id: string, next: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onNavigate: (view: ViewName) => void;
};

const EMPTY_FILTERS: Filters = {
  country: 'All Countries',
  degreeLevels: [],
  field: '',
  fundingTypes: [],
  deadlineFrom: '',
  deadlineTo: '',
  search: '',
};

const SORT_LABELS: Record<SortMode, string> = {
  match: 'Match Score',
  amount: 'Amount',
  deadline: 'Deadline',
};

export function ScholarshipList({
  scholarships,
  profile,
  onSelect,
  onToggleSave,
  search,
  onSearchChange,
  onNavigate,
}: ScholarshipListProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortMode>('match');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fieldQ = filters.field.trim().toLowerCase();
    let rows = scholarships.filter((s) => {
      if (q) {
        const hay = `${s.name} ${s.university} ${s.location} ${s.country}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.country !== 'All Countries' && s.country !== filters.country) return false;
      if (filters.degreeLevels.length > 0 && !filters.degreeLevels.includes(s.degree_level)) return false;
      if (fieldQ && !s.field_of_study.toLowerCase().includes(fieldQ) && s.field_of_study !== 'Any') return false;
      if (filters.fundingTypes.length > 0 && !filters.fundingTypes.includes(s.funding_type)) return false;
      if (filters.deadlineFrom && s.deadline_date && s.deadline_date < filters.deadlineFrom) return false;
      if (filters.deadlineTo && s.deadline_date && s.deadline_date > filters.deadlineTo) return false;
      return true;
    });

    rows = [...rows].sort((a, b) => {
      if (sort === 'match') return b.match_score - a.match_score;
      if (sort === 'deadline') {
        const ad = a.deadline_date ?? '9999';
        const bd = b.deadline_date ?? '9999';
        return ad.localeCompare(bd);
      }
      return (a.amount_label ?? '').localeCompare(b.amount_label ?? '');
    });
    return rows;
  }, [scholarships, search, filters, sort]);

  const handleToggleSave = (id: string) => {
    const s = scholarships.find((x) => x.id === id);
    if (!s) return;
    onToggleSave(id, !s.is_saved);
  };

  return (
    <main className="flex-1 md:ml-64 min-h-screen flex flex-col relative overflow-x-hidden">
      <TopBar
        profile={profile}
        variant="list"
        search={search}
        onSearchChange={onSearchChange}
      />

      <div className="flex-1 flex flex-col md:flex-row p-margin-mobile md:p-margin-desktop gap-gutter">
        <aside className="w-full md:w-80 shrink-0">
          <FiltersPanel
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters(EMPTY_FILTERS)}
          />
        </aside>

        <div className="flex-1 flex flex-col gap-lg">
          <div className="flex items-center justify-between flex-wrap gap-sm">
            <h1 className="font-headline-md text-headline-md">
              Found {filtered.length} Scholarship{filtered.length !== 1 ? 's' : ''}
              <span className="font-normal text-on-surface-variant"> for your profile</span>
            </h1>
            <div className="flex items-center gap-sm">
              <span className="text-label-sm font-label-sm text-on-surface-variant">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className="border-none bg-transparent font-label-md text-label-md text-primary focus:ring-0 cursor-pointer outline-none"
              >
                {(Object.keys(SORT_LABELS) as SortMode[]).map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass-card p-xl rounded-2xl text-center flex flex-col items-center gap-md py-xl">
              <Icon name="search_off" className="text-on-primary-container text-[40px]" />
              <h3 className="font-headline-sm text-headline-sm text-primary">No matches found</h3>
              <p className="text-on-surface-variant text-body-sm max-w-sm">
                Try adjusting your filters or search terms to find more scholarships.
              </p>
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="text-secondary font-label-md text-label-md hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg pb-xl">
              {filtered.map((s) => (
                <ScholarshipCard
                  key={s.id}
                  scholarship={s}
                  onSelect={onSelect}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <MobileNav current="list" onNavigate={onNavigate} />
    </main>
  );
}
