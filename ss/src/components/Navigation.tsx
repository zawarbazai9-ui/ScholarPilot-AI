import { Icon } from './Icon';
import type { ViewName } from '../types';

type SidebarProps = {
  current: ViewName;
  onNavigate: (view: ViewName) => void;
};

const NAV_ITEMS: { id: ViewName; label: string; icon: string }[] = [
  { id: 'list', label: 'Scholarships', icon: 'school' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

const SECONDARY_ITEMS: { id: string; label: string; icon: string }[] = [
  { id: 'universities', label: 'Universities', icon: 'account_balance' },
  { id: 'ai-advisor', label: 'AI Advisor', icon: 'auto_awesome' },
  { id: 'applications', label: 'Applications', icon: 'description' },
];

export function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col h-screen p-md gap-sm bg-surface-container-low w-64 fixed left-0 top-0 z-50">
      <div className="flex flex-col gap-xs mb-lg px-2">
        <h1 className="font-headline-sm text-headline-sm font-bold text-primary">ScholarMatch</h1>
        <p className="font-label-md text-label-md text-on-surface-variant opacity-70">
          AI Admissions Copilot
        </p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                active
                  ? 'bg-tertiary-container text-on-tertiary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Icon name={item.icon} className="text-[22px]" fill={active} />
              <span className="font-label-md text-label-md">{item.label}</span>
            </button>
          );
        })}
        {SECONDARY_ITEMS.map((item) => (
          <button
            key={item.id}
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
          >
            <Icon name={item.icon} className="text-[22px]" />
            <span className="font-label-md text-label-md">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant/20 pt-md">
        <div className="mb-md p-md rounded-xl bg-primary-container text-white">
          <p className="font-label-md text-label-md font-bold mb-xs">Upgrade to Pro</p>
          <p className="text-[12px] opacity-80 mb-sm">Get priority AI review for your essays.</p>
          <button className="w-full bg-secondary-container text-on-secondary-container py-xs rounded-lg font-bold text-label-sm hover:brightness-110 active:scale-95 transition-all">
            Upgrade
          </button>
        </div>
        <button className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
          <Icon name="help" className="text-[22px]" />
          <span className="font-label-md text-label-md">Help Center</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
          <Icon name="logout" className="text-[22px]" />
          <span className="font-label-md text-label-md">Log Out</span>
        </button>
      </div>
    </aside>
  );
}

const MOBILE_NAV: { id: ViewName; label: string; icon: string }[] = [
  { id: 'list', label: 'Scholarships', icon: 'school' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

export function MobileNav({ current, onNavigate }: SidebarProps) {
  return (
    <div className="md:hidden sticky bottom-0 left-0 right-0 bg-surface-container-lowest shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-margin-mobile py-3 flex justify-around items-center z-50">
      {MOBILE_NAV.map((item) => {
        const active = current === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 ${
              active ? 'text-secondary' : 'text-on-surface-variant'
            }`}
            aria-label={item.label}
          >
            <Icon name={item.icon} className="text-[24px]" fill={active} />
            <span className={`text-[10px] font-label-sm ${active ? 'font-bold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
