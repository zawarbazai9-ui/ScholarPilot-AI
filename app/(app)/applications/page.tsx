'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { notifyApplicationStatusChanged } from '@/lib/notify';

type AppWithScholarship = Application & { scholarship: Scholarship };

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  not_started: 'Not Started',
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

const KANBAN_COLUMNS = [
  { label: 'Not Started', dotColor: 'bg-on-surface-variant', statuses: ['not_started'] as ApplicationStatus[] },
  { label: 'Preparing', dotColor: 'bg-secondary-container', statuses: ['researching', 'drafting'] as ApplicationStatus[] },
  { label: 'Submitted', dotColor: 'bg-tertiary-container', statuses: ['submitted'] as ApplicationStatus[] },
  { label: 'Accepted', dotColor: 'bg-success', statuses: ['awarded'] as ApplicationStatus[] },
  { label: 'Rejected', dotColor: 'bg-error', statuses: ['rejected'] as ApplicationStatus[] },
];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<AppWithScholarship[]>([]);
  const [editing, setEditing] = useState<AppWithScholarship | null>(null);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.toLowerCase();
    return applications.filter(
      (a) =>
        a.scholarship.title.toLowerCase().includes(q) ||
        a.scholarship.university?.toLowerCase().includes(q) ||
        a.scholarship.funding?.toLowerCase().includes(q)
    );
  }, [applications, searchQuery]);

  const grouped = useMemo(() => {
    const map: Record<ApplicationStatus, AppWithScholarship[]> = {
      not_started: [],
      researching: [],
      drafting: [],
      submitted: [],
      awarded: [],
      rejected: [],
    };
    filtered.forEach((a) => {
      map[a.status as ApplicationStatus]?.push(a);
    });
    return map;
  }, [filtered]);

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
      const oldApp = applications.find((a) => a.id === id);
      const updated = await updateApplication(id, patch);
      if (updated) {
        const u = updated as AppWithScholarship;
        setApplications((prev) => prev.map((a) => (a.id === id ? u : a)));
        setEditing(u);
        if (user && oldApp && patch.status && patch.status !== oldApp.status) {
          notifyApplicationStatusChanged(
            user.id,
            oldApp.scholarship.title,
            oldApp.status,
            patch.status,
            oldApp.scholarship_id
          ).catch(() => {});
        }
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
    <>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-headline-md text-on-surface">Application Tracker</h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Track every application from research to award in one pipeline.
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <div className="flex rounded-full bg-surface-container-high p-0.5">
              <button
                onClick={() => setView('board')}
                className={`flex items-center gap-xs rounded-full px-md py-xs text-label-sm transition-colors ${
                  view === 'board'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">view_kanban</span>
                Board
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-xs rounded-full px-md py-xs text-label-sm transition-colors ${
                  view === 'list'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">view_list</span>
                List
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface-container-low border border-outline-variant rounded-full pl-xl pr-md py-xs text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
              />
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-xs bg-primary text-on-primary rounded-full px-md py-xs text-label-md font-medium transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              New
            </button>
          </div>
        </div>

        <GmailTracker onScanComplete={load} />

        <div className="grid gap-md grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Tracked" value={String(stats.total)} icon="folder" />
          <StatCard label="Active" value={String(stats.active)} icon="pending" tone="text-secondary" />
          <StatCard label="Submitted" value={String(stats.submitted)} icon="send" tone="text-on-tertiary-container" />
          <StatCard label="Awards Won" value={String(stats.awarded)} icon="emoji_events" tone="text-success" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin mr-sm text-xl">
              progress_activity
            </span>
            Loading applications…
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface-container-low py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">
              clipboard
            </span>
            <p className="text-body-md font-medium text-on-surface mt-3">
              No applications tracked yet
            </p>
            <p className="text-body-sm text-on-surface-variant mt-1 max-w-sm">
              Start tracking from a saved scholarship, or add one here to begin
              managing your application pipeline.
            </p>
            <div className="flex gap-sm mt-4">
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-xs bg-primary text-on-primary rounded-full px-md py-xs text-label-md font-medium transition-opacity hover:opacity-90"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Track a scholarship
              </button>
              <Link
                href="/scholarships"
                className="flex items-center gap-xs border border-outline-variant text-on-surface rounded-full px-md py-xs text-label-md font-medium transition-colors hover:bg-surface-container-high"
              >
                Browse scholarships
              </Link>
            </div>
          </div>
        ) : view === 'board' ? (
          <div className="overflow-x-auto">
            <div className="flex gap-md min-h-[600px] pb-md">
              {KANBAN_COLUMNS.map((col) => {
                const colApps = col.statuses.flatMap((s) => grouped[s]);
                return (
                  <div
                    key={col.label}
                    className="kanban-column flex flex-col bg-surface-container-low rounded-xl p-md min-h-0"
                  >
                    <div className="flex items-center gap-sm mb-md">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                      <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                        {col.label}
                      </span>
                      <span className="text-label-sm text-on-surface-variant bg-surface-container-high px-sm py-0.5 rounded-full">
                        {colApps.length}
                      </span>
                      <button
                        onClick={() => setAddOpen(true)}
                        className="ml-auto text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-sm min-h-0">
                      {colApps.map((a) => (
                        <KanbanCard
                          key={a.id}
                          app={a}
                          onOpen={() => setEditing(a)}
                          onQuickStatus={(s) =>
                            handleUpdate(a.id, { status: s, progress: STATUS_PROGRESS[s] })
                          }
                        />
                      ))}
                      {colApps.length === 0 && (
                        <div className="text-center py-8 text-on-surface-variant/40">
                          <span className="material-symbols-outlined text-3xl">inbox</span>
                          <p className="text-body-sm mt-1">No applications</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="divide-y divide-outline-variant/30">
              {filtered.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setEditing(a)}
                  className="flex w-full items-center gap-md px-md py-sm text-left transition-colors hover:bg-surface-container-low"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-md font-medium text-on-surface">
                      {a.scholarship.title}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {a.scholarship.university} · {a.scholarship.funding}
                    </p>
                  </div>
                  <DeadlinePill dateStr={a.scholarship.deadline} />
                  <ApplicationStatusBadge status={a.status} />
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-lg right-lg bg-primary text-on-primary rounded-full p-lg shadow-elevated hover:shadow-xl transition-all z-50 flex items-center gap-sm"
      >
        <span className="material-symbols-outlined text-xl">add</span>
        <span className="text-label-md font-medium hidden sm:inline">New Application</span>
      </button>

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
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: string;
  tone?: string;
}) {
  return (
    <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant/30">
      <div className="flex items-center gap-sm">
        <span className="material-symbols-outlined text-on-surface-variant text-xl">
          {icon}
        </span>
        <p className="text-body-sm text-on-surface-variant">{label}</p>
      </div>
      <p className={`text-headline-md text-on-surface mt-sm ${tone ?? ''}`}>{value}</p>
    </div>
  );
}

function KanbanCard({
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
    <div
      className="kanban-card bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant/30 transition-all cursor-grab active:cursor-grabbing"
      onClick={onOpen}
    >
      <div className="flex items-center justify-between mb-sm">
        <span className="text-label-sm bg-secondary-container text-on-secondary-container px-sm py-0.5 rounded-full">
          {app.scholarship.funding}
        </span>
        <DeadlinePill dateStr={app.scholarship.deadline} />
      </div>

      <p className="text-body-md font-semibold text-on-surface line-clamp-2 mb-xs leading-snug">
        {app.scholarship.title}
      </p>
      <p className="text-body-sm text-on-surface-variant mb-sm">{app.scholarship.university}</p>

      <div className="flex items-center justify-between text-label-sm text-on-surface-variant mb-xs">
        <span>Progress</span>
        <span>{app.progress}%</span>
      </div>
      <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-sm">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${app.progress}%` }}
        />
      </div>

      {days >= 0 && days <= 14 && (
        <p className="text-label-sm text-warning mb-sm">
          {days === 0 ? 'Due today' : `${days}d left`}
        </p>
      )}

      <div className="flex items-center justify-between pt-sm border-t border-outline-variant/20">
        <Select
          value={app.status}
          onValueChange={(v) => onQuickStatus(v as ApplicationStatus)}
        >
          <SelectTrigger
            className="h-7 text-xs bg-surface-container-low border-outline-variant/50 text-on-surface-variant"
            onClick={(e) => e.stopPropagation()}
          >
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="text-label-sm text-primary hover:text-on-surface flex items-center gap-xs transition-colors"
        >
          Details
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
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
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl bg-surface-container-lowest border-outline-variant/30">
      <DialogHeader>
        <div className="flex items-center gap-sm text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-base">school</span>
          {app.scholarship.university}
        </div>
        <DialogTitle className="text-headline-sm text-on-surface">
          {app.scholarship.title}
        </DialogTitle>
        <DialogDescription className="text-body-sm text-on-surface-variant">
          {app.scholarship.funding} · Due {formatDate(app.scholarship.deadline)}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 space-y-5">
        <div className="space-y-2">
          <Label className="text-label-md text-on-surface-variant">Status</Label>
          <Select
            value={app.status}
            onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}
          >
            <SelectTrigger className="w-full border-outline-variant">
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
            <Label className="text-label-md text-on-surface-variant">Progress</Label>
            <span className="text-body-sm font-medium text-on-surface">{progress}%</span>
          </div>
          <div className="relative pt-1 pb-2">
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-150 ease-out"
                style={{
                  width: `${progress}%`,
                  background: progress >= 100
                    ? 'linear-gradient(90deg, var(--color-success), var(--color-secondary))'
                    : progress >= 50
                    ? 'linear-gradient(90deg, var(--color-primary), var(--color-tertiary))'
                    : 'linear-gradient(90deg, var(--color-primary-container), var(--color-primary))',
                }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-surface-container-lowest shadow-md pointer-events-none transition-all duration-150 ease-out"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between px-0.5">
            {[
              { value: 0, label: 'Start' },
              { value: 15, label: 'Research' },
              { value: 50, label: 'Draft' },
              { value: 85, label: 'Submit' },
              { value: 100, label: 'Done' },
            ].map((step) => (
              <button
                key={step.value}
                type="button"
                onClick={() => {
                  setProgress(step.value);
                }}
                className={`text-center transition-colors ${
                  progress >= step.value
                    ? 'text-primary font-medium'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full mx-auto mb-1 transition-colors ${
                  progress >= step.value ? 'bg-primary' : 'bg-outline-variant'
                }`} />
                <span className="text-[10px] leading-none">{step.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-label-md text-on-surface-variant">Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add requirements, essay ideas, deadlines, or contacts…"
            rows={5}
            className="border-outline-variant bg-surface-container-low text-on-surface placeholder:text-on-surface-variant"
          />
        </div>

        <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-3 text-body-sm text-on-surface-variant">
          <p>
            <span className="font-medium text-on-surface">Created:</span>{' '}
            {formatDate(app.created_at)}
          </p>
          {app.updated_at && app.updated_at !== app.created_at && (
            <p className="mt-1">
              <span className="font-medium text-on-surface">Updated:</span>{' '}
              {formatDate(app.updated_at)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            {confirmDelete ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  className="bg-error text-on-error hover:bg-error/90"
                >
                  Confirm delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  className="text-on-surface-variant"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-error hover:bg-error-container hover:text-on-error-container"
                onClick={() => setConfirmDelete(true)}
              >
                <span className="material-symbols-outlined text-sm mr-1">delete</span>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="border-outline-variant text-on-surface hover:bg-surface-container-high">
              <a href={app.scholarship.official_link} target="_blank" rel="noopener noreferrer">
                Open application
                <span className="material-symbols-outlined text-sm ml-1.5">open_in_new</span>
              </a>
            </Button>
            <Button
              size="sm"
              onClick={saveNotes}
              className="bg-primary text-on-primary hover:opacity-90"
            >
              <span className="material-symbols-outlined text-sm mr-1">save</span>
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
      <SheetContent className="w-full overflow-y-auto sm:max-w-md bg-surface-container-lowest border-outline-variant/30">
        <SheetHeader>
          <SheetTitle className="text-headline-sm text-on-surface">
            Track a new application
          </SheetTitle>
          <SheetDescription className="text-body-sm text-on-surface-variant">
            Pick a scholarship from your saved list to start tracking.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="material-symbols-outlined animate-spin text-on-surface-variant text-xl">
                progress_activity
              </span>
            </div>
          ) : saved.length === 0 ? (
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6 text-center">
              <p className="text-body-md font-medium text-on-surface">No saved scholarships</p>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                Save scholarships first, then track them here.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3 border-outline-variant text-on-surface hover:bg-surface-container-high">
                <Link href="/scholarships">Browse scholarships</Link>
              </Button>
            </div>
          ) : (
            saved.map((s) => {
              const tracked = trackedIds.has(s.scholarship.id);
              return (
                <div
                  key={s.id}
                  className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-sm"
                >
                  <p className="text-body-md font-medium text-on-surface">{s.scholarship.title}</p>
                  <p className="mt-0.5 text-body-sm text-on-surface-variant">
                    {s.scholarship.funding}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <DeadlinePill dateStr={s.scholarship.deadline} />
                    {tracked ? (
                      <Badge
                        variant="secondary"
                        className="bg-surface-container-high text-on-surface-variant"
                      >
                        Tracking
                      </Badge>
                    ) : (
                      <button
                        onClick={() => startTracking(s.scholarship.id)}
                        className="flex items-center gap-xs bg-secondary-container text-on-secondary-container rounded-full px-md py-xs text-label-sm font-medium transition-opacity hover:opacity-90"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                        Track
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {saved.length > 0 && (
            <button
              onClick={onAdded}
              className="w-full bg-primary text-on-primary rounded-full px-md py-xs text-label-md font-medium transition-opacity hover:opacity-90"
            >
              Done
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
