import { Icon } from './Icon';
import type { Filters } from '../types';

type FiltersPanelProps = {
  filters: Filters;
  onChange: (next: Filters) => void;
  onClear: () => void;
};

const COUNTRIES = ['All Countries', 'United Kingdom', 'United States', 'Canada', 'Germany', 'European Union'];
const DEGREES = ['Postgraduate', 'Undergraduate', 'PhD', 'Research'];
const FUNDING_TYPES = ['Full Tuition + Stipend', 'Tuition Only', 'Partial Funding', 'Full Funding'];

export function FiltersPanel({ filters, onChange, onClear }: FiltersPanelProps) {
  const toggleDegree = (d: string) => {
    const has = filters.degreeLevels.includes(d);
    onChange({
      ...filters,
      degreeLevels: has ? filters.degreeLevels.filter((x) => x !== d) : [...filters.degreeLevels, d],
    });
  };

  const toggleFunding = (f: string) => {
    const has = filters.fundingTypes.includes(f);
    onChange({
      ...filters,
      fundingTypes: has ? filters.fundingTypes.filter((x) => x !== f) : [...filters.fundingTypes, f],
    });
  };

  const activeCount =
    (filters.country !== 'All Countries' ? 1 : 0) +
    filters.degreeLevels.length +
    (filters.field ? 1 : 0) +
    filters.fundingTypes.length +
    (filters.deadlineFrom ? 1 : 0) +
    (filters.deadlineTo ? 1 : 0);

  return (
    <div className="space-y-lg">
      <div className="glass-card p-lg rounded-xl flex flex-col gap-lg animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm flex items-center gap-2">
            <Icon name="tune" className="text-[20px]" />
            Filters
            {activeCount > 0 && (
              <span className="text-xs font-semibold text-on-tertiary-container bg-tertiary-container/20 px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </h2>
          <button
            onClick={onClear}
            className="text-secondary font-label-md text-label-md hover:underline disabled:opacity-40 disabled:no-underline"
            disabled={activeCount === 0}
          >
            Clear all
          </button>
        </div>

        <div className="space-y-sm">
          <label className="font-label-md text-label-md text-on-surface-variant">Country</label>
          <select
            value={filters.country}
            onChange={(e) => onChange({ ...filters, country: e.target.value })}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-md font-body-sm text-body-sm focus:border-secondary focus:ring-0 outline-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-sm">
          <label className="font-label-md text-label-md text-on-surface-variant">Degree Level</label>
          <div className="flex flex-wrap gap-xs">
            {DEGREES.map((d) => {
              const active = filters.degreeLevels.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDegree(d)}
                  className={`px-md py-1 rounded-full font-label-sm text-label-sm transition-colors ${
                    active
                      ? 'bg-primary text-on-primary'
                      : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-sm">
          <label className="font-label-md text-label-md text-on-surface-variant">Field of Study</label>
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
            />
            <input
              type="text"
              value={filters.field}
              onChange={(e) => onChange({ ...filters, field: e.target.value })}
              placeholder="e.g. Physics"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-secondary focus:ring-0 outline-none"
            />
          </div>
        </div>

        <div className="space-y-sm">
          <label className="font-label-md text-label-md text-on-surface-variant">Funding Type</label>
          <div className="space-y-xs">
            {FUNDING_TYPES.map((f) => {
              const checked = filters.fundingTypes.includes(f);
              return (
                <label key={f} className="flex items-center gap-md cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFunding(f)}
                    className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-0 focus:ring-offset-0"
                  />
                  <span
                    className={`font-body-sm text-body-sm transition-colors ${
                      checked ? 'text-primary font-medium' : 'text-on-surface group-hover:text-primary'
                    }`}
                  >
                    {f}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-sm">
          <label className="font-label-md text-label-md text-on-surface-variant">Deadline Range</label>
          <div className="flex items-center gap-xs">
            <input
              type="date"
              value={filters.deadlineFrom}
              onChange={(e) => onChange({ ...filters, deadlineFrom: e.target.value })}
              className="w-full p-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-[12px] focus:ring-0 outline-none"
            />
            <span className="text-outline-variant">-</span>
            <input
              type="date"
              value={filters.deadlineTo}
              onChange={(e) => onChange({ ...filters, deadlineTo: e.target.value })}
              className="w-full p-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-[12px] focus:ring-0 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="p-lg rounded-xl bg-gradient-to-br from-primary to-primary-container text-white relative overflow-hidden group animate-fade-in-up">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-on-tertiary-container/20 blur-3xl rounded-full" />
        <div className="relative z-10">
          <h3 className="font-headline-sm text-headline-sm mb-xs">Optimize Application</h3>
          <p className="font-body-sm text-body-sm opacity-80 mb-md">
            Our AI analysis found 3 areas where your profile could be stronger.
          </p>
          <button className="bg-on-tertiary-container text-tertiary-container px-lg py-sm rounded-lg font-bold text-label-md group-hover:scale-105 transition-transform">
            Get AI Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
