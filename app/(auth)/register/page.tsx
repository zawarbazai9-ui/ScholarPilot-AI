'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RedirectIfAuthed } from '@/components/redirect-if-authed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const passwordChecks = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValid = passwordChecks.every((c) => c.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordValid) {
      setError('Please meet all password requirements.');
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    if (signUpError) {
      setLoading(false);
      const message =
        signUpError.message.toLowerCase().includes('already')
          ? 'An account with this email already exists. Try signing in.'
          : signUpError.message;
      setError(message);
      return;
    }

    if (data.session) {
      toast({
        title: 'Account created!',
        description: 'Welcome to ScholarPilot AI.',
      });
      router.push('/dashboard');
      router.refresh();
    } else {
      setLoading(false);
      toast({
        title: 'Check your email',
        description:
          'We sent a confirmation link. Verify your email to finish signing up.',
      });
      setError(
        'Confirmation required: check your email to verify your account, then sign in.'
      );
    }
  };

  return (
    <RedirectIfAuthed>
      <div className="animate-fade-up">
        <div className="mb-8">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">
            Create your free account
          </h1>
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
            Start discovering scholarships in minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-label-md text-label-md text-on-surface-variant">Full name</Label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">person</span>
              <Input
                id="name"
                type="text"
                placeholder="Alex Johnson"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 rounded-lg border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-secondary focus:ring-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-label-md text-label-md text-on-surface-variant">Email</Label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">mail</span>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-lg border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-secondary focus:ring-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-label-md text-label-md text-on-surface-variant">Password</Label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">lock</span>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 rounded-lg border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-secondary focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {password.length > 0 && (
              <ul className="mt-2 space-y-1">
                {passwordChecks.map((c) => {
                  const ok = c.test(password);
                  return (
                    <li
                      key={c.label}
                      className={`flex items-center gap-1.5 font-label-sm text-label-sm ${
                        ok ? 'text-success' : 'text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {ok ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      {c.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-error/30 bg-error-container/30 px-3 py-2 font-body-sm text-body-sm text-on-error-container">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold font-label-md text-label-md hover:bg-primary-container active:scale-[0.98] transition-all"
            disabled={loading}
          >
            {loading && <span className="material-symbols-outlined text-[18px] mr-2 animate-spin">progress_activity</span>}
            {loading ? 'Creating account…' : 'Create free account'}
          </Button>
        </form>

        <p className="mt-6 text-center font-body-sm text-body-sm text-on-surface-variant">
          By creating an account, you agree to our{' '}
          <Link href="/" className="underline hover:text-primary">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>

        <p className="mt-4 text-center font-body-sm text-body-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-secondary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </RedirectIfAuthed>
  );
}
