'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, User as UserIcon, Eye, EyeOff, Check } from 'lucide-react';
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
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Create your free account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start discovering scholarships in minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Alex Johnson"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {password.length > 0 && (
              <ul className="mt-2 space-y-1">
                {passwordChecks.map((c) => {
                  const ok = c.test(password);
                  return (
                    <li
                      key={c.label}
                      className={`flex items-center gap-1.5 text-xs ${
                        ok ? 'text-success' : 'text-muted-foreground'
                      }`}
                    >
                      <Check
                        className={`h-3 w-3 ${ok ? 'opacity-100' : 'opacity-30'}`}
                      />
                      {c.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Creating account…' : 'Create free account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link href="/" className="underline hover:text-foreground">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </RedirectIfAuthed>
  );
}
