import { Icon } from './Icon';
import type { EligibilityItem } from '../types';

type EligibilityChecklistProps = {
  items: EligibilityItem[];
};

const STATUS_STYLES = {
  qualified: {
    container: 'bg-surface-bright border-outline-variant/10',
    icon: 'text-green-600',
    iconFill: true,
    titleColor: 'text-primary',
    detailColor: 'text-green-600',
    iconName: 'check_circle',
  },
  missing: {
    container: 'bg-error-container/30 border-error/20',
    icon: 'text-error',
    iconFill: true,
    titleColor: 'text-on-error-container',
    detailColor: 'text-error',
    iconName: 'warning',
  },
  pending: {
    container: 'bg-surface-bright border-outline-variant/10',
    icon: 'text-on-primary-container',
    iconFill: false,
    titleColor: 'text-on-primary-container',
    detailColor: 'text-on-surface-variant',
    iconName: 'pending',
  },
};

export function EligibilityChecklist({ items }: EligibilityChecklistProps) {
  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
  const qualifiedCount = items.filter((i) => i.status === 'qualified').length;
  const totalCount = items.length;
  const progressPercent = Math.round((qualifiedCount / totalCount) * 100);

  return (
    <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30 card-hover animate-fade-in-up">
      <div className="flex items-center justify-between mb-lg">
        <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
          <Icon name="fact_check" className="text-[22px]" />
          Eligibility Checklist
        </h3>
        <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">
          {qualifiedCount}/{totalCount}
        </span>
      </div>

      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden mb-lg">
        <div
          className="h-full bg-green-500 bar-fill rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-md">
        {sorted.map((item) => {
          const style = STATUS_STYLES[item.status];
          return (
            <div
              key={item.id}
              className={`flex items-center gap-md p-md rounded-xl border ${style.container} transition-colors`}
            >
              <Icon
                name={style.iconName}
                className={`${style.icon} text-[24px] shrink-0`}
                fill={style.iconFill}
              />
              <div className="flex-1 min-w-0">
                <p className={`font-label-md ${style.titleColor}`}>{item.label}</p>
                {item.detail && <p className={`text-xs ${style.detailColor}`}>{item.detail}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
