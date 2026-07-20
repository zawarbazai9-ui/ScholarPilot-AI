import { Icon } from './Icon';
import type { TimelineStep } from '../types';

type TimelineProps = {
  steps: TimelineStep[];
};

const STATUS_STYLES = {
  current: {
    badge: 'bg-secondary text-white shadow-lg',
    label: 'text-secondary',
    title: 'text-primary',
    badgeGlow: true,
  },
  upcoming: {
    badge: 'bg-surface-container text-on-primary-container border border-outline-variant',
    label: 'text-on-primary-container',
    title: 'text-on-surface-variant',
    badgeGlow: false,
  },
  complete: {
    badge: 'bg-green-600 text-white',
    label: 'text-green-600',
    title: 'text-primary',
    badgeGlow: false,
  },
};

export function Timeline({ steps }: TimelineProps) {
  const sorted = [...steps].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30 card-hover animate-fade-in-up">
      <h3 className="font-headline-md text-headline-md mb-xl text-primary flex items-center gap-3">
        <Icon name="route" className="text-[24px]" />
        Application Timeline
      </h3>
      <div className="relative">
        <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-outline-variant" />
        <div className="space-y-xl relative">
          {sorted.map((step) => {
            const style = STATUS_STYLES[step.status];
            return (
              <div key={step.id} className="flex items-start gap-lg">
                <div
                  className={`z-10 w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${style.badge} ${
                    style.badgeGlow ? 'ring-4 ring-secondary/20' : ''
                  }`}
                >
                  <Icon name={step.icon} className="text-[26px]" fill={step.status === 'current'} />
                </div>
                <div className="pt-2">
                  <p className={`font-label-sm uppercase ${style.label}`}>
                    Step {step.step_number} — {step.date_label}
                  </p>
                  <h4 className={`font-headline-sm ${style.title}`}>{step.label}</h4>
                  <p className="text-on-surface-variant">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
