'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  LogOut,
  Moon,
  Sun,
  Bell,
  Shield,
  Trash2,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage appearance, notifications, and your account.
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
          <CardDescription>
            Choose how ScholarPilot looks to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {mounted && theme === 'dark' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </div>
              <div>
                <Label>Dark mode</Label>
                <p className="text-xs text-muted-foreground">
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
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>
            Control how and when we contact you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingRow
            label="Email notifications"
            description="Receive important account and product emails."
            checked={notifications}
            onChange={setNotifications}
          />
          <Separator className="my-3" />
          <SettingRow
            label="Deadline alerts"
            description="Get reminded 7 days and 1 day before a scholarship deadline."
            checked={deadlineAlerts}
            onChange={setDeadlineAlerts}
          />
          <Separator className="my-3" />
          <SettingRow
            label="Weekly digest"
            description="A Sunday summary of new scholarships matching your profile."
            checked={weeklyDigest}
            onChange={setWeeklyDigest}
          />
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-4 w-4 text-primary" />
            Security
          </CardTitle>
          <CardDescription>
            Keep your account safe and your data private.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
            <div>
              <p className="text-sm font-medium">Signed in as</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href="/forgot-password">Reset password</a>
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
            <div>
              <p className="text-sm font-medium">Data export</p>
              <p className="text-xs text-muted-foreground">
                Download a copy of your ScholarPilot data.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              Request export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Account
          </CardTitle>
          <CardDescription>
            Sign out or close your ScholarPilot account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
            <div>
              <p className="text-sm font-medium">Sign out</p>
              <p className="text-xs text-muted-foreground">
                End your session on this device.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Sign out
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-muted-foreground">
                Permanently remove your account and all associated data.
              </p>
            </div>
            <Button variant="destructive" size="sm" disabled>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="h-3 w-3 text-success" />
            Account deletion is disabled in this demo environment.
          </p>
        </CardContent>
      </Card>
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
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
