'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

type GmailStatus = {
  connected: boolean;
  email?: string;
  expired?: boolean;
};

type ScanResult = {
  found: number;
  created: string[];
  updated: string[];
  scanned: number;
};

export function GmailTracker({ onScanComplete }: { onScanComplete?: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    if (!user) return;
    checkStatus();
    // Check URL params for connection result
    const params = new URLSearchParams(window.location.search);
    if (params.get('gmail_connected') === '1') {
      toast({ title: 'Gmail connected successfully!' });
      window.history.replaceState({}, '', '/applications');
    }
    if (params.get('gmail_error')) {
      toast({
        title: 'Gmail connection failed',
        description: params.get('gmail_error'),
        variant: 'destructive',
      });
      window.history.replaceState({}, '', '/applications');
    }
  }, [user]);

  async function checkStatus() {
    if (!user) return;
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const res = await fetch('/api/gmail', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }

  function handleConnect() {
    if (!user) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${user.id}`;
    window.location.href = url;
  }

  async function handleScan() {
    if (!user) return;
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/gmail/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Scan failed');
      setScanResult(data);
      if (data.created.length > 0 || data.updated.length > 0) {
        onScanComplete?.();
        toast({
          title: 'Scan complete',
          description: `${data.created.length} new, ${data.updated.length} updated`,
        });
      } else {
        toast({
          title: 'Scan complete',
          description: data.message ?? `Checked ${data.scanned} emails. No new updates found.`,
        });
      }
    } catch (err: unknown) {
      toast({
        title: 'Scan failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  }

  async function handleDisconnect() {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          gmail_access_token: null,
          gmail_refresh_token: null,
          gmail_token_expiry: null,
          gmail_email: null,
        })
        .eq('id', user.id);
      if (error) throw error;
      setStatus({ connected: false });
      setScanResult(null);
      toast({ title: 'Gmail disconnected' });
    } catch (err: unknown) {
      toast({
        title: 'Disconnect failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-3 py-4">
          <span className="material-symbols-outlined text-[16px] animate-spin text-on-surface-variant">progress_activity</span>
          <span className="text-sm text-on-surface-variant">Checking Gmail status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-sm border border-outline-variant/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg p-2 ${
              status?.connected
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">mail</span>
          </div>
          <div>
            <p className="text-sm font-medium">Gmail Auto-Tracker</p>
            {status?.connected ? (
              <p className="mt-0.5 text-xs text-on-surface-variant">
                Connected as <span className="font-medium">{status.email}</span>
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-on-surface-variant">
                Connect Gmail to auto-detect scholarship emails
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status?.connected ? (
            <>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <span className="material-symbols-outlined text-[20px] mr-1">check_circle</span>
                Connected
              </Badge>
              <Button
                size="sm"
                onClick={handleScan}
                disabled={scanning}
                className="bg-primary text-on-primary rounded-xl font-bold text-xs"
              >
                {scanning ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin mr-1.5">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px] mr-1.5">scan</span>
                )}
                {scanning ? 'Scanning...' : 'Scan inbox'}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDisconnect} className="text-xs">
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={handleConnect} className="bg-primary text-on-primary rounded-xl font-bold text-xs">
              <span className="material-symbols-outlined text-[16px] mr-1.5">mail</span>
              Connect Gmail
            </Button>
          )}
        </div>
      </div>

      {/* Scan results */}
      {scanResult && (
        <div className="mt-4 rounded-lg border bg-surface-container-high/50 p-3 text-xs">
          <p className="font-medium">Last scan results:</p>
          <ul className="mt-1 space-y-0.5 text-on-surface-variant">
            <li>Checked {scanResult.scanned} emails</li>
            {scanResult.created.length > 0 && (
              <li className="text-emerald-600 dark:text-emerald-400">
                + {scanResult.created.length} new: {scanResult.created.join(', ')}
              </li>
            )}
            {scanResult.updated.length > 0 && (
              <li className="text-sky-600 dark:text-sky-400">
                ~ {scanResult.updated.length} updated: {scanResult.updated.join(', ')}
              </li>
            )}
            {scanResult.created.length === 0 && scanResult.updated.length === 0 && (
              <li>No new scholarship updates found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
