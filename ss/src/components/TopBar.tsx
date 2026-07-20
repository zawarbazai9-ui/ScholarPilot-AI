import { Icon } from './Icon';
import type { UserProfile } from '../types';

type TopBarProps = {
  profile: UserProfile | null;
  variant: 'list' | 'detail';
  onBack?: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
};

export function TopBar({ profile, variant, onBack, search, onSearchChange }: TopBarProps) {
  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'MC';

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-sm shadow-sm px-margin-desktop py-4 flex justify-between items-center w-full gap-gutter">
      <div className="flex items-center gap-xl flex-1 min-w-0">
        {variant === 'list' ? (
          <div className="relative w-full max-w-md">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]"
            />
            <input
              type="text"
              value={search ?? ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search scholarships, universities..."
              className="w-full pl-10 pr-4 py-2 rounded-full border-none bg-surface-container font-body-md text-body-md focus:ring-2 focus:ring-secondary transition-all outline-none"
            />
          </div>
        ) : (
          <button
            onClick={onBack}
            className="flex items-center gap-2 group transition-colors shrink-0"
          >
            <Icon
              name="arrow_back"
              className="text-primary group-hover:-translate-x-[2px] transition-transform"
            />
            <span className="text-on-surface-variant font-label-md hidden sm:inline">
              Back to Scholarships
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-lg shrink-0">
        <div className="flex items-center gap-sm">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative">
            <Icon name="notifications" className="text-[22px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full ring-2 ring-surface-container-lowest" />
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
            <Icon name="settings" className="text-[22px]" />
          </button>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-container bg-primary-container flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </div>
    </header>
  );
}
