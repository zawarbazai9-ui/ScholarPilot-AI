import { Icon } from './Icon';
import type { Scholarship, Application } from '../types';

type HeroProps = {
  scholarship: Scholarship;
  application: Application | null;
  onToggleSave: () => void;
  onStartApplication: () => void;
  saving: boolean;
  starting: boolean;
};

export function Hero({
  scholarship,
  application,
  onToggleSave,
  onStartApplication,
  saving,
  starting,
}: HeroProps) {
  const isSaved = scholarship.is_saved;
  const hasStarted = Boolean(application && application.status !== 'not_started');

  return (
    <section className="relative h-80 w-full overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center animate-fade-in">
        {scholarship.hero_image_url && (
          <img
            src={scholarship.hero_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-transparent" />

      <div className="absolute bottom-0 left-0 w-full p-margin-desktop flex items-end justify-between gap-gutter flex-wrap">
        <div className="flex items-center gap-lg animate-fade-in-up">
          <div className="w-24 h-24 bg-white p-2 rounded-2xl shadow-xl shrink-0 hidden sm:block">
            {scholarship.crest_image_url && (
              <img
                src={scholarship.crest_image_url}
                alt=""
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="text-white">
            <h2 className="font-headline-lg text-headline-lg mb-1 drop-shadow-sm">
              {scholarship.name}
            </h2>
            <p className="font-body-lg text-body-lg opacity-90 flex items-center gap-2">
              <Icon name="location_on" className="text-[20px]" />
              {scholarship.university}, {scholarship.location}
            </p>
          </div>
        </div>

        <div className="flex gap-md">
          <button
            onClick={onToggleSave}
            disabled={saving}
            className={`px-6 py-3 backdrop-blur-md border font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-60 ${
              isSaved
                ? 'bg-white/20 border-white/30 text-white'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
          >
            <Icon
              name={isSaved ? 'bookmark' : 'bookmark'}
              className="text-[20px]"
              fill={isSaved}
            />
            {isSaved ? 'Saved' : 'Save for Later'}
          </button>
          <button
            onClick={onStartApplication}
            disabled={starting || hasStarted}
            className="px-6 py-3 bg-secondary text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-80 disabled:hover:brightness-100"
          >
            <Icon
              name={hasStarted ? 'task_alt' : 'rocket_launch'}
              className="text-[20px]"
              fill={!!hasStarted}
            />
            {hasStarted ? 'Application Started' : 'Start Application'}
          </button>
        </div>
      </div>
    </section>
  );
}
