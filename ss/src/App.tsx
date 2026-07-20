import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Scholarship, UserProfile, ViewName } from './types';
import { Sidebar } from './components/Navigation';
import { ScholarshipList } from './components/ScholarshipList';
import { ScholarshipDetail } from './components/ScholarshipDetail';
import { ProfileView } from './components/ProfileView';
import { AiDrawer } from './components/AiDrawer';
import { Icon } from './components/Icon';

type View = { name: 'list' } | { name: 'detail'; scholarshipId: string } | { name: 'profile' };

export default function App() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<View>({ name: 'list' });
  const [search, setSearch] = useState('');
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [listRes, profileRes] = await Promise.all([
        supabase.from('scholarships').select('*').order('match_score', { ascending: false }),
        supabase.from('user_profile').select('*').limit(1).maybeSingle(),
      ]);
      if (cancelled) return;
      setScholarships((listRes.data as Scholarship[]) ?? []);
      setProfile((profileRes.data as UserProfile) ?? null);
      setLoaded(true);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleSave = (id: string, next: boolean) => {
    setScholarships((prev) => prev.map((s) => (s.id === id ? { ...s, is_saved: next } : s)));
  };

  const openDetail = (id: string) => {
    setView({ name: 'detail', scholarshipId: id });
    window.scrollTo({ top: 0 });
  };

  const navigate = (target: ViewName) => {
    if (target === 'list') setView({ name: 'list' });
    else if (target === 'profile') setView({ name: 'profile' });
    window.scrollTo({ top: 0 });
  };

  const sidebarView: ViewName = view.name === 'detail' ? 'list' : view.name;

  if (!loaded) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-surface-container border-t-secondary rounded-full animate-spin" />
          <p className="text-on-surface-variant font-label-md">Loading ScholarMatch…</p>
        </div>
      </div>
    );
  }

  const detailName =
    view.name === 'detail'
      ? scholarships.find((s) => s.id === view.scholarshipId)?.name ?? 'Scholarship'
      : 'ScholarMatch';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar current={sidebarView} onNavigate={navigate} />

      {view.name === 'list' && (
        <ScholarshipList
          scholarships={scholarships}
          profile={profile}
          onSelect={openDetail}
          onToggleSave={handleToggleSave}
          search={search}
          onSearchChange={setSearch}
          onNavigate={navigate}
        />
      )}

      {view.name === 'detail' && (
        <ScholarshipDetail
          scholarshipId={view.scholarshipId}
          profile={profile}
          onBack={() => setView({ name: 'list' })}
          onToggleSave={handleToggleSave}
          onNavigate={navigate}
        />
      )}

      {view.name === 'profile' && <ProfileView profile={profile} onNavigate={navigate} />}

      <button
        onClick={() => setAiOpen(true)}
        className="fixed bottom-margin-desktop right-margin-desktop w-14 h-14 rounded-full bg-secondary text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
        aria-label="Ask AI Advisor"
      >
        <Icon name="chat" className="text-[28px]" />
        <span className="absolute right-16 bg-primary text-white px-md py-xs rounded-lg text-label-sm font-label-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Ask AI Advisor
        </span>
      </button>

      <AiDrawer
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        scholarshipName={detailName}
      />
    </div>
  );
}
