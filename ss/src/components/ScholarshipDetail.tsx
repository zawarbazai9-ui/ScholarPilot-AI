import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type {
  Scholarship,
  FundingItem,
  TimelineStep,
  EligibilityItem,
  AiTip,
  UserProfile,
  Application,
  ViewName,
} from '../types';
import { TopBar } from './TopBar';
import { Hero } from './Hero';
import { OverviewCard } from './OverviewCard';
import { FundingBreakdown } from './FundingBreakdown';
import { Timeline } from './Timeline';
import { EligibilityChecklist } from './EligibilityChecklist';
import { AiTips } from './AiTips';
import { QuickStats } from './QuickStats';
import { AiDrawer } from './AiDrawer';
import { MobileNav } from './Navigation';
import { Icon } from './Icon';

type ScholarshipDetailProps = {
  scholarshipId: string;
  profile: UserProfile | null;
  onBack: () => void;
  onToggleSave: (id: string, next: boolean) => void;
  onNavigate: (view: ViewName) => void;
};

type LoadState = 'loading' | 'ready' | 'error';

export function ScholarshipDetail({
  scholarshipId,
  profile,
  onBack,
  onToggleSave,
  onNavigate,
}: ScholarshipDetailProps) {
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [fundingItems, setFundingItems] = useState<FundingItem[]>([]);
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([]);
  const [eligibilityItems, setEligibilityItems] = useState<EligibilityItem[]>([]);
  const [aiTips, setAiTips] = useState<AiTip[]>([]);
  const [application, setApplication] = useState<Application | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState('loading');
      const { data: s, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', scholarshipId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !s) {
        setState('error');
        return;
      }
      const [funding, timeline, eligibility, tips, appRes] = await Promise.all([
        supabase.from('funding_items').select('*').eq('scholarship_id', scholarshipId).order('sort_order'),
        supabase.from('timeline_steps').select('*').eq('scholarship_id', scholarshipId).order('sort_order'),
        supabase.from('eligibility_items').select('*').eq('scholarship_id', scholarshipId).order('sort_order'),
        supabase.from('ai_tips').select('*').eq('scholarship_id', scholarshipId).order('sort_order'),
        supabase.from('applications').select('*').eq('scholarship_id', scholarshipId).maybeSingle(),
      ]);
      if (cancelled) return;
      setScholarship(s as Scholarship);
      setFundingItems((funding.data as FundingItem[]) ?? []);
      setTimelineSteps((timeline.data as TimelineStep[]) ?? []);
      setEligibilityItems((eligibility.data as EligibilityItem[]) ?? []);
      setAiTips((tips.data as AiTip[]) ?? []);
      setApplication((appRes.data as Application) ?? null);
      setState('ready');
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [scholarshipId]);

  const handleToggleSave = async () => {
    if (!scholarship) return;
    const next = !scholarship.is_saved;
    setSaving(true);
    setScholarship({ ...scholarship, is_saved: next });
    onToggleSave(scholarship.id, next);
    const { error } = await supabase
      .from('scholarships')
      .update({ is_saved: next, updated_at: new Date().toISOString() })
      .eq('id', scholarship.id);
    if (error) {
      setScholarship({ ...scholarship, is_saved: !next });
    }
    setSaving(false);
  };

  const handleStartApplication = async () => {
    if (!scholarship) return;
    setStarting(true);
    if (application) {
      setStarting(false);
      return;
    }
    const { data, error } = await supabase
      .from('applications')
      .insert({
        scholarship_id: scholarship.id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select('*')
      .maybeSingle();
    if (!error && data) {
      setApplication(data as Application);
    }
    setStarting(false);
  };

  if (state === 'loading') {
    return (
      <div className="flex flex-1 bg-background items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-surface-container border-t-secondary rounded-full animate-spin" />
          <p className="text-on-surface-variant font-label-md">Loading scholarship…</p>
        </div>
      </div>
    );
  }

  if (state === 'error' || !scholarship) {
    return (
      <div className="flex flex-1 bg-background items-center justify-center min-h-screen">
        <div className="text-center max-w-sm p-xl">
          <Icon name="error" className="text-error text-[40px] mb-md" />
          <h2 className="font-headline-md text-headline-md text-primary mb-sm">
            Couldn't load scholarship
          </h2>
          <p className="text-on-surface-variant text-body-sm mb-md">
            Please check your connection and try again.
          </p>
          <button
            onClick={onBack}
            className="text-secondary font-label-md text-label-md hover:underline"
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 md:ml-64 min-h-screen flex flex-col relative overflow-x-hidden">
      <TopBar profile={profile} variant="detail" onBack={onBack} />

      <div className="flex-1 overflow-y-auto">
        <Hero
          scholarship={scholarship}
          application={application}
          onToggleSave={handleToggleSave}
          onStartApplication={handleStartApplication}
          saving={saving}
          starting={starting}
        />

        <div className="p-margin-desktop grid grid-cols-12 gap-gutter max-w-7xl mx-auto">
          <div className="col-span-12 lg:col-span-8 space-y-gutter">
            <OverviewCard scholarship={scholarship} />
            <FundingBreakdown items={fundingItems} />
            <Timeline steps={timelineSteps} />
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-gutter">
            <EligibilityChecklist items={eligibilityItems} />
            <AiTips tips={aiTips} onAskAi={() => setAiOpen(true)} />
            <QuickStats scholarship={scholarship} />
          </div>
        </div>
      </div>

      <MobileNav current="list" onNavigate={onNavigate} />

      <AiDrawer
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        scholarshipName={scholarship.name}
      />
    </main>
  );
}
