'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2,
  Save,
  Mail,
  Sparkles,
  GraduationCap,
  Globe,
  BookOpen,
  Beaker,
  Banknote,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateProfile } from '@/lib/db';

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

// ── Page ────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

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
        research_experience: values.research_experience || null,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading profile…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The more we know, the better we can match you to scholarships.
        </p>
      </div>

      {/* Profile strength */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Profile strength</p>
                <p className="text-xs text-muted-foreground">
                  Complete your profile for accurate AI eligibility scoring.
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold">{completenessPct}%</p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${completenessPct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-4 w-4 text-primary" />
              Basic information
            </CardTitle>
            <CardDescription>Visible to you only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  value={user?.email ?? ''}
                  disabled
                  className="bg-muted/40 pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">
                Full name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                {...register('full_name')}
                placeholder="Alex Johnson"
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">University / Institution</Label>
              <Input
                id="university"
                {...register('university')}
                placeholder="MIT, Oxford, etc."
              />
              {errors.university && (
                <p className="text-xs text-destructive">{errors.university.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Academic Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-4 w-4 text-primary" />
              Academic details
            </CardTitle>
            <CardDescription>
              Used by AI to score your eligibility for every scholarship.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Degree level <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="degree"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
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
                  <p className="text-xs text-destructive">{errors.degree.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cgpa">CGPA (0.0–10.0)</Label>
                <Input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  {...register('cgpa')}
                  placeholder="8.5"
                />
                {errors.cgpa && (
                  <p className="text-xs text-destructive">{errors.cgpa.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">
                  Major <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="major"
                  {...register('major')}
                  placeholder="Computer Science"
                />
                {errors.major && (
                  <p className="text-xs text-destructive">{errors.major.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Country <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
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
                  <p className="text-xs text-destructive">{errors.country.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Beaker className="h-4 w-4 text-primary" />
              Test scores
            </CardTitle>
            <CardDescription>
              Optional but strengthens your eligibility assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ielts">IELTS (0.0–9.0)</Label>
                <Input
                  id="ielts"
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  {...register('ielts')}
                  placeholder="7.5"
                />
                {errors.ielts && (
                  <p className="text-xs text-destructive">{errors.ielts.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gre">GRE (260–340)</Label>
                <Input
                  id="gre"
                  type="number"
                  min="260"
                  max="340"
                  {...register('gre')}
                  placeholder="320"
                />
                {errors.gre && (
                  <p className="text-xs text-destructive">{errors.gre.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research & Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-4 w-4 text-primary" />
              Research & preferences
            </CardTitle>
            <CardDescription>
              Helps AI find the best scholarship matches.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="research_experience">Research experience</Label>
              <Textarea
                id="research_experience"
                {...register('research_experience')}
                rows={4}
                placeholder="Describe your research background, publications, conference presentations, lab experience..."
                className="resize-y text-sm"
              />
              {errors.research_experience && (
                <p className="text-xs text-destructive">{errors.research_experience.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Preferred countries <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="preferred_countries"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
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
                <p className="text-xs text-destructive">{errors.preferred_countries.message}</p>
              )}
              <p className="text-[11px] text-muted-foreground">
                Comma-separated for multiple: "United States, United Kingdom, Canada"
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Budget <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="budget"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
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
                <p className="text-xs text-destructive">{errors.budget.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !isDirty}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
