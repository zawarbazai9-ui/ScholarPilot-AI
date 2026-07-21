'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.push('/login');
  };

  const handleExport = () => {
    toast({
      title: 'Export queued',
      description: 'Your data export will be emailed to you shortly.',
    });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to delete account');

      toast({ title: 'Account deleted' });
      await signOut();
      router.push('/login');
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-lg">
      <div className="space-y-lg">
        <h1 className="font-headline-lg text-headline-lg text-primary">
          Settings
        </h1>
        <p className="text-body-lg text-on-surface-variant/80">
          Manage appearance, notifications, and your account.
        </p>
      </div>

      {/* Appearance */}
      <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
        <p className="text-headline-md font-headline-md text-on-surface mb-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">palette</span>
          Appearance
        </p>
        <p className="text-body-sm text-on-surface-variant/80 mb-lg">
          Choose how ScholarPilot looks to you.
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant p-2">
              {mounted && theme === 'dark' ? (
                <span className="material-symbols-outlined text-[20px]">dark_mode</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">light_mode</span>
              )}
            </div>
            <div>
              <Label>Dark mode</Label>
              <p className="text-xs text-on-surface-variant">
                Toggle between light and dark themes.
              </p>
            </div>
          </div>
          <Switch
            checked={mounted ? theme === 'dark' : false}
            onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
            aria-label="Toggle dark mode"
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
        <p className="text-headline-md font-headline-md text-on-surface mb-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          Notifications
        </p>
        <p className="text-body-sm text-on-surface-variant/80 mb-lg">
          Control how and when we contact you.
        </p>
        <div className="space-y-1">
          <SettingRow
            label="Email notifications"
            description="Receive important account and product emails."
            checked={notifications}
            onChange={setNotifications}
          />
          <Separator className="my-3 border-outline-variant/20" />
          <SettingRow
            label="Deadline alerts"
            description="Get reminded 7 days and 1 day before a scholarship deadline."
            checked={deadlineAlerts}
            onChange={setDeadlineAlerts}
          />
          <Separator className="my-3 border-outline-variant/20" />
          <SettingRow
            label="Weekly digest"
            description="A Sunday summary of new scholarships matching your profile."
            checked={weeklyDigest}
            onChange={setWeeklyDigest}
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
        <p className="text-headline-md font-headline-md text-on-surface mb-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">shield</span>
          Security
        </p>
        <p className="text-body-sm text-on-surface-variant/80 mb-lg">
          Keep your account safe and your data private.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-surface-container-high/50 p-4 border border-outline-variant/20">
            <div>
              <p className="text-sm font-medium">Signed in as</p>
              <p className="text-xs text-on-surface-variant">{user?.email}</p>
            </div>
            <Button asChild variant="outline" size="sm" className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-xl font-bold">
              <a href="/forgot-password">Reset password</a>
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface-container-high/50 p-4 border border-outline-variant/20">
            <div>
              <p className="text-sm font-medium">Data export</p>
              <p className="text-xs text-on-surface-variant">
                Download a copy of your ScholarPilot data.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-xl font-bold">
              Request export
            </Button>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-error/10 bg-error-container/20">
        <p className="text-headline-md font-headline-md text-error mb-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">warning</span>
          Account
        </p>
        <p className="text-body-sm text-on-surface-variant/80 mb-lg">
          Sign out or close your ScholarPilot account.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-surface-container-high/50 p-4 border border-outline-variant/20">
            <div>
              <p className="text-sm font-medium">Sign out</p>
              <p className="text-xs text-on-surface-variant">
                End your session on this device.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={signingOut}
              className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-xl font-bold"
            >
              {signingOut ? (
                <span className="material-symbols-outlined text-[20px] animate-spin mr-2">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[20px] mr-2">logout</span>
              )}
              Sign out
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-error-container/10 p-4 border border-error/20">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-on-surface-variant">
                Permanently remove your account and all associated data.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} disabled={deleting}>
              {deleting ? (
                <span className="material-symbols-outlined text-[20px] animate-spin mr-2">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[20px] mr-2">delete</span>
              )}
              Delete
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting && <span className="material-symbols-outlined text-[20px] animate-spin mr-2">progress_activity</span>}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label>{label}</Label>
        <p className="text-xs text-on-surface-variant">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
