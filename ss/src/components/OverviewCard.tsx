import { Icon } from './Icon';
import type { Scholarship } from '../types';

type OverviewCardProps = {
  scholarship: Scholarship;
};

export function OverviewCard({ scholarship }: OverviewCardProps) {
  return (
    <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30 card-hover animate-fade-in-up">
      <h3 className="font-headline-md text-headline-md mb-md text-primary flex items-center gap-3">
        <Icon name="info" className="text-[24px]" />
        Scholarship Overview
      </h3>
      <p className="font-body-lg text-on-surface-variant leading-relaxed">
        {scholarship.overview}
      </p>

      <div className="mt-lg grid grid-cols-1 sm:grid-cols-3 gap-md">
        <div className="p-md bg-surface-container-low rounded-xl">
          <span className="text-label-sm uppercase text-on-primary-container block mb-1">
            Total Award
          </span>
          <p className="text-headline-sm font-bold text-primary">{scholarship.total_award}</p>
        </div>
        <div className="p-md bg-surface-container-low rounded-xl">
          <span className="text-label-sm uppercase text-on-primary-container block mb-1">
            Slots
          </span>
          <p className="text-headline-sm font-bold text-primary">{scholarship.slots}</p>
        </div>
        <div className="p-md bg-surface-container-low rounded-xl">
          <span className="text-label-sm uppercase text-on-primary-container block mb-1">
            Next Deadline
          </span>
          <p className="text-headline-sm font-bold text-secondary">{scholarship.next_deadline}</p>
        </div>
      </div>
    </div>
  );
}
