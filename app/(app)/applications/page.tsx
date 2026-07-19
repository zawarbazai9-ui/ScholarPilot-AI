'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  ClipboardList,
  ArrowRight,
  Plus,
  Trash2,
  ExternalLink,
  Save,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ApplicationStatusBadge } from '@/components/application-status-badge';
import { DeadlinePill, formatDate, daysUntil } from '@/components/scholarship-utils';
import { GmailTracker } from '@/components/gmail-tracker';
import {
  listApplications,
  listSavedScholarships,
  listApplicationScholarshipIds,
  updateApplication,
  deleteApplication,
  createApplication,
} from '@/lib/db';
import { APPLICATION_STATUSES, type ApplicationStatus, type ApplicationUpdate } from '@/lib/types';
import type { Application, Scholarship, SavedScholarship } from '@/lib/types';

type AppWithScholarship = Application & { scholarship: Scholarship };

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  not_started: 'Not started',
  researching: 'Researching',
  drafting: 'Drafting',
  submitted: 'Submitted',
  awarded: 'Awarded',
  rejected: 'Rejected',
};

const STATUS_PROGRESS: Record<ApplicationStatus, number> = {
  not_started: 0,
  researching: 15,
  drafting: 50,
  submitted: 85,
  awarded: 100,
  rejected: 100,
};

const STATUS_ORDER: ApplicationStatus[] = [
  'researching',
  'drafting',
  'submitted',
  'awarded',
  'rejected',
];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<AppWithScholarship[]>([]);
  const [editing, setEditing] = useState<AppWithScholarship | null>(null);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [addOpen, setAddOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    try {
      const data = await listApplications(user.id);
      setApplications(data as AppWithScholarship[]);
    } catch (err) {
      toast({
        title: 'Could not load applications',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const grouped = useMemo(() => {
    const map: Record<ApplicationStatus, AppWithScholarship[]> = {
      not_started: [],
      researching: [],
      drafting: [],
      submitted: [],
      awarded: [],
      rejected: [],
    };
    applications.forEach((a) => {
      map[a.status as ApplicationStatus]?.push(a);
    });
    return map;
  }, [applications]);

  const stats = useMemo(
    () => ({
      total: applications.length,
      active: applications.filter(
        (a) =>
          a.status !== 'awarded' && a.status !== 'rejected' && a.status !== 'not_started'
      ).length,
      submitted: applications.filter((a) => a.status === 'submitted').length,
      awarded: applications.filter((a) => a.status === 'awarded').length,
    }),
    [applications]
  );

  const handleUpdate = async (id: string, patch: ApplicationUpdate) => {
    try {
      const updated = await updateApplication(id, patch);
      if (updated) {
        const u = updated as AppWithScholarship;
        setApplications((prev) => prev.map((a) => (a.id === id ? u : a)));
        setEditing(u);
      }
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      setEditing(null);
      toast({ title: 'Application removed' });
    } catch (err) {
      toast({
        title: 'Could not delete',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track every application from research to award in one pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border p-0.5">
            <button
              onClick={() => setView('board')}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                view === 'board'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setView('list')}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                view === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              List
            </button>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Track new
          </Button>
        </div>
      </div>

      <GmailTracker onScanComplete={load} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total tracked" value={String(stats.total)} />
        <StatCard label="Active" value={String(stats.active)} tone="text-accent" />
        <StatCard label="Submitted" value={String(stats.submitted)} tone="text-primary" />
        <StatCard label="Awards won" value={String(stats.awarded)} tone="text-success" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading applications…
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 py-16 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No applications tracked yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Start tracking from a saved scholarship, or add one here to begin
            managing your application pipeline.
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Track a scholarship
            </Button>
            <Button asChild variant="outline">
              <Link href="/scholarships">Browse scholarships</Link>
            </Button>
          </div>
        </div>
      ) : view === 'board' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STATUS_ORDER.filter((s) => grouped[s].length > 0).map((status) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <ApplicationStatusBadge status={status} />
                <span className="text-xs text-muted-foreground">
                  {grouped[status].length}
                </span>
              </div>
              <div className="space-y-3">
                {grouped[status].map((a) => (
                  <ApplicationCard
                    key={a.id}
                    app={a}
                    onOpen={() => setEditing(a)}
                    onQuickStatus={(s) => handleUpdate(a.id, { status: s, progress: STATUS_PROGRESS[s] })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {applications.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setEditing(a)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.scholarship.title}</p>
                    <p className="text-xs text-muted-foreground">
                       {a.scholarship.university} · {a.scholarship.funding}
                    </p>
                  </div>
                  <DeadlinePill dateStr={a.scholarship.deadline} />
                  <ApplicationStatusBadge status={a.status} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && (
          <ApplicationEditor
            app={editing}
            onChange={(patch) => handleUpdate(editing.id, patch)}
            onDelete={() => handleDelete(editing.id)}
          />
        )}
      </Dialog>

      <AddApplicationSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={() => {
          setAddOpen(false);
          load();
        }}
      />
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-1 font-display text-2xl font-bold ${tone ?? ''}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function ApplicationCard({
  app,
  onOpen,
  onQuickStatus,
}: {
  app: AppWithScholarship;
  onOpen: () => void;
  onQuickStatus: (status: ApplicationStatus) => void;
}) {
  const days = daysUntil(app.scholarship.deadline);
  return (
    <Card className="cursor-pointer transition-all hover:shadow-md" onClick={onOpen}>
      <CardContent className="space-y-3 py-4">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">
          {app.scholarship.title}
        </p>
        <div className="flex flex-wrap items-center gap-2">
           <Badge className="bg-primary/10 text-primary">{app.scholarship.funding}</Badge>
          <DeadlinePill dateStr={app.scholarship.deadline} />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{app.progress}%</span>
          </div>
          <Progress value={app.progress} className="mt-1 h-1.5" />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Select
            value={app.status}
            onValueChange={(v) => onQuickStatus(v as ApplicationStatus)}
          >
            <SelectTrigger className="h-8 text-xs" onClick={(e) => e.stopPropagation()}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {days >= 0 && days <= 14 && (
            <span className="ml-auto text-xs font-medium text-warning">
              {days === 0 ? 'Due today' : `${days}d left`}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationEditor({
  app,
  onChange,
  onDelete,
}: {
  app: AppWithScholarship;
  onChange: (patch: ApplicationUpdate) => void;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(app.notes ?? '');
  const [progress, setProgress] = useState(app.progress);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveNotes = () => {
    onChange({ notes, progress });
  };

  const handleStatusChange = (status: ApplicationStatus) => {
    setProgress(STATUS_PROGRESS[status]);
    onChange({ status, progress: STATUS_PROGRESS[status] });
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
           {app.scholarship.university}
        </div>
        <DialogTitle className="font-display text-xl">
          {app.scholarship.title}
        </DialogTitle>
        <DialogDescription>
           {app.scholarship.funding} · Due {formatDate(app.scholarship.deadline)}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 space-y-5">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={app.status}
            onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Progress</Label>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add requirements, essay ideas, deadlines, or contacts…"
            rows={5}
          />
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Created:</span>{' '}
            {formatDate(app.created_at)}
          </p>
          {app.updated_at && app.updated_at !== app.created_at && (
            <p className="mt-1">
              <span className="font-medium text-foreground">Updated:</span>{' '}
              {formatDate(app.updated_at)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            {confirmDelete ? (
              <>
                <Button variant="destructive" size="sm" onClick={onDelete}>
                  Confirm delete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
               <a href={app.scholarship.official_link} target="_blank" rel="noopener noreferrer">
                Open application
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
            <Button size="sm" onClick={saveNotes}>
              <Save className="mr-1 h-3.5 w-3.5" />
              Save notes
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

function AddApplicationSheet({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<
    (SavedScholarship & { scholarship: Scholarship })[]
  >([]);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    (async () => {
      try {
        const [savedData, trackedSet] = await Promise.all([
          listSavedScholarships(user.id),
          listApplicationScholarshipIds(user.id),
        ]);
        setSaved(savedData as (SavedScholarship & { scholarship: Scholarship })[]);
        setTrackedIds(trackedSet);
      } catch (err) {
        toast({
          title: 'Could not load saved scholarships',
          description: err instanceof Error ? err.message : 'Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [open, user, toast]);

  const startTracking = async (scholarshipId: string) => {
    try {
      await createApplication({
        scholarship_id: scholarshipId,
        status: 'researching',
        progress: 5,
      });
      setTrackedIds((prev) => new Set(prev).add(scholarshipId));
      toast({ title: 'Now tracking this application' });
    } catch (err) {
      toast({
        title: 'Could not start tracking',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Track a new application</SheetTitle>
          <SheetDescription>
            Pick a scholarship from your saved list to start tracking.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : saved.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm font-medium">No saved scholarships</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Save scholarships first, then track them here.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link href="/scholarships">Browse scholarships</Link>
              </Button>
            </div>
          ) : (
            saved.map((s) => {
              const tracked = trackedIds.has(s.scholarship.id);
              return (
                <div key={s.id} className="rounded-lg border bg-card p-3">
                  <p className="text-sm font-medium">{s.scholarship.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                     {s.scholarship.funding}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <DeadlinePill dateStr={s.scholarship.deadline} />
                    {tracked ? (
                      <Badge variant="secondary">Tracking</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startTracking(s.scholarship.id)}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Track
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {saved.length > 0 && (
            <Button className="w-full" onClick={onAdded}>
              Done
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
