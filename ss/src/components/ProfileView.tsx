import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile, DocumentItem, ViewName } from '../types';
import { MobileNav } from './Navigation';
import { TopBar } from './TopBar';
import { Icon } from './Icon';

type ProfileViewProps = {
  profile: UserProfile | null;
  onNavigate: (view: ViewName) => void;
};

export function ProfileView({ profile, onNavigate }: ProfileViewProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(profile?.email_notifications ?? true);
  const [publicProfile, setPublicProfile] = useState(profile?.public_profile ?? false);
  const [interests, setInterests] = useState<string[]>(profile?.research_interests ?? []);
  const [newInterest, setNewInterest] = useState('');
  const [adding, setAdding] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    supabase
      .from('documents')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setDocuments((data as DocumentItem[]) ?? []));
  }, []);

  useEffect(() => {
    if (profile) {
      setEmailNotifications(profile.email_notifications);
      setPublicProfile(profile.public_profile);
      setInterests(profile.research_interests);
    }
  }, [profile]);

  const persistToggle = async (
    field: 'email_notifications' | 'public_profile',
    value: boolean
  ) => {
    setSavingSettings(true);
    const { error } = await supabase
      .from('user_profile')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('singleton', true);
    if (error) {
      if (field === 'email_notifications') setEmailNotifications(!value);
      else setPublicProfile(!value);
    }
    setSavingSettings(false);
  };

  const removeInterest = async (interest: string) => {
    const next = interests.filter((i) => i !== interest);
    setInterests(next);
    await supabase
      .from('user_profile')
      .update({ research_interests: next, updated_at: new Date().toISOString() })
      .eq('singleton', true);
  };

  const addInterest = async () => {
    const trimmed = newInterest.trim();
    if (!trimmed || interests.includes(trimmed)) return;
    const next = [...interests, trimmed];
    setInterests(next);
    setNewInterest('');
    setAdding(false);
    await supabase
      .from('user_profile')
      .update({ research_interests: next, updated_at: new Date().toISOString() })
      .eq('singleton', true);
  };

  const completion = profile?.completion_percent ?? 85;
  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AC';

  const navigate = onNavigate;

  return (
    <main className="flex-1 md:ml-64 min-h-screen flex flex-col relative overflow-x-hidden">
      <TopBar profile={profile} variant="detail" onBack={() => navigate('list')} />

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop space-y-gutter pb-xl">
          {/* Profile + Completion */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-stretch">
            <div className="lg:col-span-2 bg-white rounded-xl p-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col md:flex-row gap-lg items-center animate-fade-in-up">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shadow-lg border-4 border-white shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-container flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                  </div>
                )}
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="font-headline-lg text-headline-lg text-primary mb-1">
                  {profile?.name ?? 'Student'}
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-sm text-on-surface-variant">
                  <Icon name="account_balance" className="text-secondary-container text-[18px]" />
                  <span className="font-body-md text-body-md">{profile?.university}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                  <span className="font-body-md text-body-md">{profile?.class_year}</span>
                </div>
                <div className="mt-md flex gap-sm flex-wrap justify-center md:justify-start">
                  <span className="px-3 py-1 bg-secondary-container/10 text-on-secondary-container rounded-full font-label-sm text-label-sm">
                    {profile?.major}
                  </span>
                  <span className="px-3 py-1 bg-tertiary-container/10 text-on-tertiary-container rounded-full font-label-sm text-label-sm">
                    Honors Program
                  </span>
                </div>
              </div>
              <div className="hidden md:block">
                <button className="flex items-center gap-2 px-4 py-2 border border-outline text-on-surface-variant rounded-lg hover:bg-surface-container transition-all">
                  <Icon name="edit" className="text-[20px]" />
                  <span className="font-label-md text-label-md">Edit Profile</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col justify-between animate-fade-in-up">
              <div>
                <div className="flex justify-between items-end mb-sm">
                  <h3 className="font-headline-sm text-headline-sm text-primary">Completion</h3>
                  <span className="font-headline-md text-headline-md text-secondary">
                    {completion}%
                  </span>
                </div>
                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary-container rounded-full shadow-[0_0_8px_rgba(57,184,253,0.4)] transition-all duration-700"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
              <div className="mt-lg p-md bg-surface-container-low rounded-lg border border-secondary-container/20">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  <span className="font-semibold text-secondary">Tip:</span> Add a secondary major to
                  reach 100% and unlock personalized AI recommendations.
                </p>
                <button className="mt-2 text-secondary font-label-md text-label-md hover:underline flex items-center gap-1">
                  Add Major <Icon name="chevron_right" className="text-[16px]" />
                </button>
              </div>
            </div>
          </section>

          {/* Academic Identity + Document Vault */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <div className="lg:col-span-7 bg-white rounded-xl p-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-outline-variant/30 animate-fade-in-up">
              <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2 mb-xl">
                <Icon name="menu_book" className="text-secondary" />
                Academic Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                <div className="space-y-sm">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Major
                  </label>
                  <input
                    type="text"
                    defaultValue={profile?.major}
                    className="w-full bg-surface-container border-none rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-secondary-container outline-none transition-all"
                  />
                </div>
                <div className="space-y-sm">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Cumulative GPA
                  </label>
                  <input
                    type="text"
                    defaultValue={profile?.gpa}
                    className="w-full bg-surface-container border-none rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-secondary-container outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2 space-y-sm">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Research Interests
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 bg-surface-container-low rounded-lg min-h-[80px]">
                    {interests.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-body-sm flex items-center gap-2 shadow-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeInterest(tag)}
                          className="hover:text-error transition-colors"
                          aria-label={`Remove ${tag}`}
                        >
                          <Icon name="close" className="text-[14px]" />
                        </button>
                      </span>
                    ))}
                    {adding ? (
                      <span className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addInterest();
                            if (e.key === 'Escape') {
                              setAdding(false);
                              setNewInterest('');
                            }
                          }}
                          placeholder="Interest"
                          className="px-3 py-1.5 bg-white border border-secondary rounded-lg text-body-sm outline-none w-32"
                        />
                        <button
                          onClick={addInterest}
                          className="text-secondary hover:bg-secondary-container/10 p-1 rounded"
                        >
                          <Icon name="check" className="text-[16px]" />
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setAdding(true)}
                        className="px-3 py-1.5 border border-dashed border-outline text-on-surface-variant rounded-lg text-body-sm hover:bg-white transition-colors"
                      >
                        + Add Interest
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-xl p-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-outline-variant/30 animate-fade-in-up">
              <div className="flex justify-between items-center mb-xl">
                <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
                  <Icon name="folder_zip" className="text-secondary" />
                  Document Vault
                </h3>
                <button className="text-secondary font-label-md text-label-md flex items-center gap-1 hover:bg-secondary-container/10 px-2 py-1 rounded transition-colors">
                  <Icon name="upload" className="text-[20px]" />
                  Upload New
                </button>
              </div>
              <div className="space-y-md">
                {documents.length === 0 ? (
                  <p className="text-on-surface-variant text-body-sm text-center py-xl">
                    No documents uploaded yet.
                  </p>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="group flex items-center justify-between p-3 rounded-lg border border-outline-variant/50 hover:bg-surface-container-low hover:border-secondary-container transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-container/20 flex items-center justify-center rounded-lg">
                          <Icon name={doc.icon} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="font-label-md text-label-md text-primary">{doc.name}</h4>
                          <p className="font-body-sm text-[12px] text-on-surface-variant">
                            Last updated: {new Date(doc.updated_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <Icon
                        name="more_vert"
                        className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Account Settings + AI Insight */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <div className="bg-white rounded-xl p-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-outline-variant/30 animate-fade-in-up">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-xl flex items-center gap-2">
                <Icon name="shield" className="text-secondary" />
                Account Settings
              </h3>
              <div className="space-y-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-label-md text-label-md text-primary">Email Notifications</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Receive scholarship deadlines
                    </p>
                  </div>
                  <Toggle
                    checked={emailNotifications}
                    onChange={(v) => {
                      setEmailNotifications(v);
                      persistToggle('email_notifications', v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-label-md text-label-md text-primary">Public Profile</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Visible to university recruiters
                    </p>
                  </div>
                  <Toggle
                    checked={publicProfile}
                    onChange={(v) => {
                      setPublicProfile(v);
                      persistToggle('public_profile', v);
                    }}
                  />
                </div>
              </div>
              {savingSettings && (
                <p className="mt-md text-[12px] text-on-surface-variant flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-surface-container border-t-secondary rounded-full animate-spin inline-block" />
                  Saving…
                </p>
              )}
            </div>

            <div className="lg:col-span-2 relative bg-primary text-white rounded-xl p-xl shadow-lg overflow-hidden group animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-br from-tertiary-container/30 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-lg">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary-container rounded-full text-on-tertiary-container font-label-sm text-label-sm mb-md">
                    <Icon name="auto_awesome" className="text-[16px]" />
                    AI CO-PILOT ANALYSIS
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-md leading-tight">
                    Based on your GPA and Research interests, you have a 82% match for the Google
                    Research Fellowship.
                  </h3>
                  <div className="flex gap-md flex-wrap">
                    <button className="px-6 py-2.5 bg-secondary-container text-on-secondary-container font-bold rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all">
                      View Requirements
                    </button>
                    <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/20 transition-all">
                      Explore Similar
                    </button>
                  </div>
                </div>
                <div className="hidden md:block w-48 h-48 opacity-40">
                  <Icon name="model_training" className="!text-[180px] text-white" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <MobileNav current="profile" onNavigate={navigate} />
      </div>
    </main>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
    </label>
  );
}
