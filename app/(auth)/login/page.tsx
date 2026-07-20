'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { RedirectIfAuthed } from '@/components/redirect-if-authed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setLoading(false);
      const message =
        signInError.message.toLowerCase().includes('invalid login')
          ? 'Incorrect email or password.'
          : signInError.message;
      setError(message);
      return;
    }

    if (data.session) {
      toast({
        title: 'Welcome back!',
        description: 'You are now signed in.',
      });
      const redirect = params.get('redirect') ?? '/dashboard';
      router.push(redirect);
      router.refresh();
    } else {
      setLoading(false);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="font-headline-md text-headline-md font-bold text-primary">
          Welcome back
        </h1>
        <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
          Sign in to continue your scholarship journey.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-label-md text-label-md text-on-surface-variant">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-label-sm text-secondary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">lock</span>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
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
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center font-body-sm text-body-sm text-on-surface-variant">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-secondary hover:underline"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <RedirectIfAuthed>
      <Suspense>
        <LoginForm />
      </Suspense>
    </RedirectIfAuthed>
  );
}
