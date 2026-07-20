import { Icon } from './Icon';
import type { Scholarship } from '../types';

type ScholarshipCardProps = {
  scholarship: Scholarship;
  onSelect: (id: string) => void;
  onToggleSave: (id: string) => void;
};

const FUNDING_TYPE_LABEL: Record<string, string> = {
  'Full Tuition + Stipend': 'Full Tuition + Stipend',
  'Full Funding': 'Full Funding',
  'Tuition Only': 'Tuition Only',
  'Partial Funding': 'Partial Funding',
};

export function ScholarshipCard({ scholarship, onSelect, onToggleSave }: ScholarshipCardProps) {
  const isImminent = scholarship.deadline_date
    ? new Date(scholarship.deadline_date).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 45
    : false;
  const deadlineColor = isImminent ? 'text-error' : 'text-on-surface';
  const fundingLabel = FUNDING_TYPE_LABEL[scholarship.funding_type] ?? scholarship.funding_type;

  return (
    <div
      className="glass-card p-xl rounded-2xl flex flex-col gap-lg card-hover relative overflow-hidden animate-fade-in-up"
      onClick={() => onSelect(scholarship.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(scholarship.id);
        }
      }}
    >
      <div className="flex justify-between items-start gap-md">
        <div className="flex gap-md min-w-0">
          <div className="w-14 h-14 rounded-xl bg-surface-dim flex items-center justify-center p-xs overflow-hidden shrink-0">
            {scholarship.crest_image_url ? (
              <img
                src={scholarship.crest_image_url}
                alt=""
                className="w-full h-full object-contain"
              />
            ) : (
              <Icon name="school" className="text-primary text-[24px]" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-headline-sm text-headline-sm group-hover:text-secondary transition-colors truncate">
              {scholarship.name}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              {scholarship.university} • {scholarship.region}
            </p>
          </div>
        </div>
        <div className="ai-inner-glow px-md py-xs rounded-full bg-tertiary-container/10 flex items-center gap-xs shrink-0">
          <Icon name="auto_awesome" className="text-[16px] text-on-tertiary-container" fill />
          <span className="font-label-sm text-label-sm text-on-tertiary-container font-bold">
            {scholarship.match_score}% Match
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-md py-md border-y border-outline-variant/30">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Amount</p>
          <p className="font-body-md text-body-md font-semibold text-on-surface">
            {scholarship.amount_label ?? fundingLabel}
          </p>
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Deadline</p>
          <p className={`font-body-md text-body-md font-semibold ${deadlineColor}`}>
            {scholarship.next_deadline}
          </p>
        </div>
      </div>

      <div className="flex gap-md mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(scholarship.id);
          }}
          className="flex-1 bg-primary text-on-primary py-md rounded-xl font-bold text-label-md hover:bg-primary-container active:scale-95 transition-all"
        >
          Apply Now
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(scholarship.id);
          }}
          className={`w-12 h-12 flex items-center justify-center border rounded-xl hover:bg-surface-container transition-colors ${
            scholarship.is_saved
              ? 'border-secondary text-secondary bg-secondary/5'
              : 'border-outline-variant'
          }`}
          aria-label={scholarship.is_saved ? 'Unsave' : 'Save'}
        >
          <Icon name="bookmark" className="text-[22px]" fill={scholarship.is_saved} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(scholarship.id);
          }}
          className="w-12 h-12 flex items-center justify-center border border-outline-variant rounded-xl hover:bg-surface-container transition-colors"
          aria-label="View details"
        >
          <Icon name="visibility" className="text-[22px]" />
        </button>
      </div>
    </div>
  );
}
