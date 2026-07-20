'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/login` }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h1 className="mt-5 font-headline-md text-headline-md font-bold text-primary">
          Check your inbox
        </h1>
        <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">
          We sent a password reset link to{' '}
          <span className="font-medium text-on-surface">{email}</span>. The
          link expires in a few hours.
        </p>
        <Button
          asChild
          className="mt-6 w-full bg-primary text-on-primary py-3 rounded-xl font-bold font-label-md text-label-md hover:bg-primary-container active:scale-[0.98] transition-all"
        >
          <Link href="/login">
            <span className="material-symbols-outlined text-[18px] mr-2">arrow_back</span>
            Back to sign in
          </Link>
        </Button>
        <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
          Didn&apos;t get an email? Check spam, or{' '}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-secondary hover:underline"
          >
            try a different address
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="font-headline-md text-headline-md font-bold text-primary">
          Reset your password
        </h1>
        <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
          Enter your email and we&apos;ll send you a secure reset link.
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
          {loading ? 'Sending reset link…' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-6 text-center font-body-sm text-body-sm text-on-surface-variant">
        Remembered your password?{' '}
        <Link
          href="/login"
          className="font-medium text-secondary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
