import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import type { FundingItem } from '../types';

type FundingBreakdownProps = {
  items: FundingItem[];
};

export function FundingBreakdown({ items }: FundingBreakdownProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30 card-hover animate-fade-in-up">
      <h3 className="font-headline-md text-headline-md mb-md text-primary flex items-center gap-3">
        <Icon name="payments" className="text-[24px]" />
        Funding Breakdown
      </h3>
      <div className="space-y-lg">
        {sorted.map((item) => (
          <div key={item.id} className="flex items-center gap-lg">
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="font-label-md text-on-surface">{item.label}</span>
                <span className="font-bold text-primary">{item.coverage}</span>
              </div>
              <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-secondary-container bar-fill rounded-full"
                  style={{ width: animated ? `${item.percent}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-xl p-md border-l-4 border-secondary bg-surface-container-low italic text-on-surface-variant rounded-r-lg flex items-start gap-2">
        <Icon name="format_quote" className="text-secondary text-[20px] shrink-0 mt-0.5" />
        <span>
          Scholarships also cover visa costs and health insurance for the duration of the degree.
        </span>
      </div>
    </div>
  );
}
