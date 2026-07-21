'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateProfile } from '@/lib/db';

// ── PDF text extraction ─────────────────────────────────────

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist') as any;
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item: any) => item.str ?? '').join(' '));
  }
  return pages.join('\n\n');
}

// ── Zod schema ──────────────────────────────────────────────

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters'),
  university: z
    .string()
    .min(2, 'University must be at least 2 characters')
    .max(200, 'University must be under 200 characters')
    .optional()
    .or(z.literal('')),
  country: z.string().min(1, 'Select your country'),
  degree: z.string().min(1, 'Select your degree level'),
  major: z
    .string()
    .min(2, 'Major must be at least 2 characters')
    .max(100, 'Major must be under 100 characters'),
  cgpa: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const n = Number(val);
      return !isNaN(n) && n >= 0 && n <= 10;
    }, 'CGPA must be between 0 and 10'),
  research_experience: z
    .string()
    .max(1000, 'Research experience must be under 1,000 characters')
    .optional()
    .or(z.literal('')),
  ielts: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const n = Number(val);
      return !isNaN(n) && n >= 0 && n <= 9;
    }, 'IELTS score must be between 0 and 9'),
  gre: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const n = Number(val);
      return !isNaN(n) && n >= 260 && n <= 340;
    }, 'GRE score must be between 260 and 340'),
  preferred_countries: z.string().min(1, 'Select at least one preferred country'),
  budget: z.string().min(1, 'Select your budget range'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ── Constants ───────────────────────────────────────────────

const DEGREES = ['High School', 'Undergraduate', 'Graduate', 'Postgraduate'];
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'China', 'Colombia',
  'Denmark', 'Egypt', 'Ethiopia', 'Finland', 'France', 'Germany',
  'Ghana', 'Greece', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Japan', 'Jordan', 'Kenya', 'Korea, South',
  'Lebanon', 'Malaysia', 'Mexico', 'Morocco', 'Nepal', 'Netherlands',
  'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia',
  'Singapore', 'South Africa', 'Spain', 'Sri Lanka', 'Sweden',
  'Switzerland', 'Taiwan', 'Thailand', 'Tunisia', 'Turkey',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam', 'Zimbabwe',
];
const BUDGETS = [
  'Fully funded only',
  'Partial funding acceptable',
  'Self-funded (with some aid)',
  'Self-funded (no aid needed)',
  'Flexible',
];

// ── Toggle ─────────────────────────────────────────────────

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

// ── Page ────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [researchItems, setResearchItems] = useState<{ name: string; content: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      university: '',
      country: '',
      degree: '',
      major: '',
      cgpa: '',
      research_experience: '',
      ielts: '',
      gre: '',
      preferred_countries: '',
      budget: '',
    },
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      full_name: profile.full_name ?? '',
      university: profile.university ?? '',
      country: profile.country ?? '',
      degree: profile.degree ?? '',
      major: profile.major ?? '',
      cgpa: profile.cgpa != null ? String(profile.cgpa) : '',
      research_experience: profile.research_experience ?? '',
      ielts: profile.ielts != null ? String(profile.ielts) : '',
      gre: profile.gre != null ? String(profile.gre) : '',
      preferred_countries: profile.preferred_countries?.join(', ') ?? profile.preferred_country ?? '',
      budget: profile.budget ?? '',
    });
  }, [profile, reset]);

  const completeness = [
    !!profile?.full_name,
    !!profile?.university,
    !!profile?.country,
    !!profile?.degree,
    !!profile?.major,
    !!profile?.cgpa,
    !!profile?.research_experience,
    !!profile?.ielts,
    !!profile?.gre,
    !!profile?.preferred_countries?.length || !!profile?.preferred_country,
    !!profile?.budget,
  ].filter(Boolean).length;
  const completenessPct = Math.round((completeness / 11) * 100);

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U';

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    setSaving(true);

    try {
      const preferredCountriesArr = values.preferred_countries
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateProfile(user.id, {
        full_name: values.full_name || null,
        university: values.university || null,
        country: values.country || null,
        degree: values.degree || null,
        major: values.major || null,
        cgpa: values.cgpa ? Number(values.cgpa) : null,
        research_experience: buildResearchExperience(values.research_experience || ''),
        ielts: values.ielts ? Number(values.ielts) : null,
        gre: values.gre ? Number(values.gre) : null,
        preferred_countries: preferredCountriesArr.length ? preferredCountriesArr : null,
        preferred_country: preferredCountriesArr[0] ?? null,
        budget: values.budget || null,
      });
      await refreshProfile();
      toast({
        title: 'Profile saved',
        description: 'Your eligibility scores have been updated.',
      });
    } catch (err) {
      toast({
        title: 'Could not save profile',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ title: 'Invalid file type', description: 'Please upload a PDF file.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'PDF must be under 5 MB.', variant: 'destructive' });
      return;
    }

    setUploadingPdf(true);
    try {
      const text = await extractPdfText(file);
      if (!text.trim()) {
        toast({ title: 'No text found', description: 'The PDF appears to be empty or image-based.', variant: 'destructive' });
        return;
      }
      setResearchItems((prev) => [...prev, { name: file.name, content: text }]);
      toast({ title: 'PDF extracted', description: `Added experience from ${file.name}. Remove anytime.` });
    } catch {
      toast({ title: 'Extraction failed', description: 'Could not read the PDF. Try a different file.', variant: 'destructive' });
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const removeResearchItem = (index: number) => {
    setResearchItems((prev) => prev.filter((_, i) => i !== index));
  };

  const buildResearchExperience = (typedText: string) => {
    const parts = [typedText];
    for (const item of researchItems) {
      parts.push(`[${item.name}] ${item.content}`);
    }
    return parts.filter(Boolean).join('\n\n');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-on-surface-variant">
        <span className="material-symbols-outlined text-[20px] animate-spin mr-2">progress_activity</span>
        Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Profile + Completion ─────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-fade-in-up">
        {/* Profile card */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shadow-lg border-4 border-white shrink-0">
            <div className="w-full h-full bg-primary-container flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-1">
              {profile?.full_name ?? 'Student'}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-secondary-container text-[18px]">account_balance</span>
              <span className="font-body-md text-body-md">{profile?.university || 'No university set'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <span className="font-body-md text-body-md">{profile?.degree || 'No degree set'}</span>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap justify-center md:justify-start">
              {profile?.major && (
                <span className="px-3 py-1 bg-secondary-container/10 text-on-secondary-container rounded-full font-label-sm text-label-sm">
                  {profile.major}
                </span>
              )}
              {profile?.country && (
                <span className="px-3 py-1 bg-tertiary-container/10 text-on-tertiary-container rounded-full font-label-sm text-label-sm">
                  {profile.country}
                </span>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <button
              onClick={() => document.getElementById('profile-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-4 py-2 border border-outline text-on-surface-variant rounded-lg hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
              <span className="font-label-md text-label-md">Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Completion card */}
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col justify-between animate-fade-in-up">
          <div>
            <div className="flex justify-between items-end mb-2">
              <h3 className="font-headline-sm text-headline-sm text-primary">Completion</h3>
              <span className="font-headline-md text-headline-md text-secondary">
                {completenessPct}%
              </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary-container rounded-full shadow-[0_0_8px_rgba(57,184,253,0.4)] transition-all duration-700"
                style={{ width: `${completenessPct}%` }}
              />
            </div>
          </div>
          <div className="mt-6 p-3 bg-surface-container-low rounded-lg border border-secondary-container/20">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              <span className="font-semibold text-secondary">Tip:</span>{' '}
              {completenessPct < 100
                ? 'Complete more fields to reach 100% and unlock personalized AI recommendations.'
                : 'Your profile is complete! AI will use this data for accurate eligibility scoring.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Academic Identity + Test Scores ──────────────── */}
      <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Academic Identity */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-outline-variant/30 animate-fade-in-up">
            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-secondary">menu_book</span>
              Academic Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email (read-only) */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant">mail</span>
                  <input
                    type="text"
                    value={user?.email ?? ''}
                    disabled
                    className="w-full bg-surface-container border-none rounded-lg pl-9 pr-4 py-2 text-body-md text-on-surface-variant focus:ring-2 focus:ring-secondary-container outline-none transition-all"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  {...register('full_name')}
                  placeholder="Alex Johnson"
                  className="w-full bg-surface-container border-none rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-secondary-container outline-none transition-all"
                />
                {errors.full_name && (
                  <p className="text-xs text-error">{errors.full_name.message}</p>
                )}
              </div>

              {/* University */}
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  University / Institution
                </label>
                <input
                  type="text"
                  {...register('university')}
                  placeholder="MIT, Oxford, etc."
                  className="w-full bg-surface-container border-none rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-secondary-container outline-none transition-all"
                />
                {errors.university && (
                  <p className="text-xs text-error">{errors.university.message}</p>
                )}
              </div>

              {/* Major */}
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Major <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  {...register('major')}
                  placeholder="Computer Science"
                  className="w-full bg-surface-container border-none rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-secondary-container outline-none transition-all"
                />
                {errors.major && (
                  <p className="text-xs text-error">{errors.major.message}</p>
                )}
              </div>

              {/* Degree */}
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Degree Level <span className="text-error">*</span>
                </label>
                <Controller
                  control={control}
                  name="degree"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-surface-container border-none focus:ring-2 focus:ring-secondary-container">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEGREES.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.degree && (
                  <p className="text-xs text-error">{errors.degree.message}</p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Country <span className="text-error">*</span>
                </label>
                <Controller
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-surface-container border-none focus:ring-2 focus:ring-secondary-container">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.country && (
                  <p className="text-xs text-error">{errors.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Test Scores */}
          <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-outline-variant/30 animate-fade-in-up">
            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-secondary">science</span>
              Test Scores
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-5">
              Optional but strengthens your eligibility assessment.
            </p>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  CGPA (0.0–10.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  {...register('cgpa')}
                  placeholder="8.5"
                  className="w-full bg-surface-container border-none rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-secondary-container outline-none transition-all"
                />
                {errors.cgpa && (
                  <p className="text-xs text-error">{errors.cgpa.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  IELTS (0.0–9.0)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  {...register('ielts')}
                  placeholder="7.5"
                  className="w-full bg-surface-container border-none rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-secondary-container outline-none transition-all"
                />
                {errors.ielts && (
                  <p className="text-xs text-error">{errors.ielts.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  GRE (260–340)
                </label>
                <input
                  type="number"
                  min="260"
                  max="340"
                  {...register('gre')}
                  placeholder="320"
                  className="w-full bg-surface-container border-none rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-secondary-container outline-none transition-all"
                />
                {errors.gre && (
                  <p className="text-xs text-error">{errors.gre.message}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Research & Preferences + AI Insight ────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Research & Preferences */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-outline-variant/30 animate-fade-in-up">
            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-secondary">school</span>
              Research & Preferences
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-5">
              Helps AI find the best scholarship matches.
            </p>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Research Experience
                  </label>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingPdf}
                    onClick={() => pdfInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-secondary/80 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {uploadingPdf ? 'progress_activity' : 'upload_file'}
                    </span>
                    {uploadingPdf ? 'Extracting…' : 'Upload CV / PDF'}
                  </button>
                </div>
                <textarea
                  {...register('research_experience')}
                  rows={4}
                  placeholder="Describe your research background, publications, conference presentations, lab experience…"
                  className="w-full bg-surface-container border-none rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-secondary-container outline-none transition-all resize-y"
                />
                {errors.research_experience && (
                  <p className="text-xs text-error">{errors.research_experience.message}</p>
                )}
                {researchItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {researchItems.map((item, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary-container/15 text-on-secondary-container rounded-full text-xs font-medium max-w-[220px]"
                      >
                        <span className="material-symbols-outlined text-[14px]">description</span>
                        <span className="truncate">{item.name}</span>
                        <button
                          type="button"
                          onClick={() => removeResearchItem(i)}
                          className="ml-0.5 hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Preferred Countries <span className="text-error">*</span>
                </label>
                <Controller
                  control={control}
                  name="preferred_countries"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-surface-container border-none focus:ring-2 focus:ring-secondary-container">
                        <SelectValue placeholder="Select preferred study destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.preferred_countries && (
                  <p className="text-xs text-error">{errors.preferred_countries.message}</p>
                )}
                <p className="text-[11px] text-on-surface-variant/60">
                  Comma-separated for multiple: "United States, United Kingdom, Canada"
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Budget <span className="text-error">*</span>
                </label>
                <Controller
                  control={control}
                  name="budget"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-surface-container border-none focus:ring-2 focus:ring-secondary-container">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUDGETS.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.budget && (
                  <p className="text-xs text-error">{errors.budget.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="lg:col-span-5 relative bg-primary text-white rounded-xl p-8 shadow-lg overflow-hidden group animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary-container/30 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary-container rounded-full text-on-tertiary-container font-label-sm text-label-sm mb-4">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  AI CO-PILOT ANALYSIS
                </div>
                <h3 className="font-headline-md text-headline-md mb-4 leading-tight">
                  {completenessPct >= 80
                    ? `Based on your profile, you have strong eligibility for several scholarships. Our AI has identified matching opportunities.`
                    : `Complete your profile to unlock AI-powered scholarship matching. The more we know, the better we can match you.`}
                </h3>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => router.push('/scholarships')}
                  className="px-6 py-2.5 bg-secondary-container text-on-secondary-container font-bold rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  View Scholarships
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/assistant')}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/20 transition-all"
                >
                  Ask AI Advisor
                </button>
              </div>
            </div>
            <div className="hidden md:block absolute bottom-4 right-4 opacity-40">
              <span className="material-symbols-outlined text-[140px] text-white">model_training</span>
            </div>
          </div>
        </section>

        {/* ── Actions ────────────────────────────────────── */}
        <div className="flex justify-end gap-3 mt-6 animate-fade-in-up">
          <Button
            type="button"
            variant="outline"
            className="bg-surface-container-lowest border border-outline-variant text-on-surface-variant rounded-lg font-bold hover:bg-surface-container transition-all"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving || !isDirty}
            className="bg-primary text-on-primary rounded-lg font-bold shadow-sm hover:brightness-110 transition-all"
          >
            {saving ? (
              <span className="material-symbols-outlined text-[20px] animate-spin mr-2">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[20px] mr-2">save</span>
            )}
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
