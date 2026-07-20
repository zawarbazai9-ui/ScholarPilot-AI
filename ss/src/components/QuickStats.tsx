import { Icon } from './Icon';
import type { Scholarship } from '../types';

type QuickStatsProps = {
  scholarship: Scholarship;
};

export function QuickStats({ scholarship }: QuickStatsProps) {
  const stats = [
    {
      icon: 'person_search',
      label: 'Competition',
      value: scholarship.competition ?? '—',
    },
    {
      icon: 'history_edu',
      label: 'Acceptance',
      value: scholarship.acceptance ?? '—',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-sm animate-fade-in-up">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-surface-container-high p-md rounded-xl text-center card-hover"
        >
          <Icon name={stat.icon} className="text-secondary block mb-1 text-[24px]" />
          <p className="text-xs text-on-primary-container">{stat.label}</p>
          <p className="font-bold text-primary">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
