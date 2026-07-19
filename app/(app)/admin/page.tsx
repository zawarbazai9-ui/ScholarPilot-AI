'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Database,
  Search,
  Users,
  UserPlus,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/components/scholarship-utils';
import { ScholarshipFinder } from '@/components/scholarship-finder';
import type { Scholarship } from '@/lib/types';

// ──────────────────────────────────────────────────────────────
// Shared
// ──────────────────────────────────────────────────────────────

function adminHeaders(session: { access_token?: string } | null) {
  const token = session?.access_token ?? '';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

type Tab = 'scholarships' | 'users' | 'ai-finder';

// ──────────────────────────────────────────────────────────────
// Users types
// ──────────────────────────────────────────────────────────────

type AdminUser = {
  id: string;
  email?: string;
  created_at: string;
  user_metadata?: Record<string, unknown>;
  last_sign_in_at?: string;
};

type UserForm = {
  email: string;
  password: string;
  full_name: string;
};

const EMPTY_USER_FORM: UserForm = { email: '', password: '', full_name: '' };

// ──────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('scholarships');

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Admin
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage scholarships, users, and catalog data.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1 w-fit">
        {([
          { key: 'scholarships' as Tab, label: 'Scholarships', icon: Shield },
          { key: 'ai-finder' as Tab, label: 'AI Finder', icon: Sparkles },
          { key: 'users' as Tab, label: 'Users', icon: Users },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              tab === t.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'scholarships' && <ScholarshipsTab session={session} />}
      {tab === 'ai-finder' && <AIFinderTab session={session} />}
      {tab === 'users' && <UsersTab session={session} />}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// AI Finder Tab
// ──────────────────────────────────────────────────────────────

function AIFinderTab({ session }: { session: { access_token?: string } | null }) {
  const [, setRefreshKey] = useState(0);
  return (
    <div className="space-y-6">
      <ScholarshipFinder session={session} onAdded={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Scholarships Tab
// ──────────────────────────────────────────────────────────────

function ScholarshipsTab({ session }: { session: { access_token?: string } | null }) {
  const { toast } = useToast();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ScholarshipForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Scholarship | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchScholarships = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/scholarships', { headers: adminHeaders(session) });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load');
      const data = await res.json();
      setScholarships(data.scholarships ?? []);
    } catch (err) {
      toast({ title: 'Failed to load scholarships', description: err instanceof Error ? err.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [session, toast]);

  useEffect(() => { if (session) fetchScholarships(); }, [session, fetchScholarships]);

  const filtered = React.useMemo(() => {
    if (!search) return scholarships;
    const q = search.toLowerCase();
    return scholarships.filter((s) =>
      s.title.toLowerCase().includes(q) || s.university.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)
    );
  }, [scholarships, search]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setFormOpen(true); };
  const openEdit = (s: Scholarship) => {
    setEditingId(s.id);
    setForm({ title: s.title, university: s.university, country: s.country, degree: s.degree ?? '', funding: s.funding, deadline: s.deadline, description: s.description, requirements: s.requirements ?? '', official_link: s.official_link });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.university || !form.country || !form.deadline || !form.description || !form.official_link) {
      toast({ title: 'Missing fields', description: 'Title, university, country, deadline, description, and link are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, degree: form.degree || null, requirements: form.requirements || null };
      const url = editingId ? `/api/admin/scholarships/${editingId}` : '/api/admin/scholarships';
      const res = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: adminHeaders(session), body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed');
      toast({ title: editingId ? 'Scholarship updated' : 'Scholarship created' });
      setFormOpen(false);
      await fetchScholarships();
    } catch (err) {
      toast({ title: 'Save failed', description: err instanceof Error ? err.message : 'Please try again.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/scholarships/${deleteTarget.id}`, { method: 'DELETE', headers: adminHeaders(session) });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Delete failed');
      toast({ title: 'Scholarship deleted' });
      setDeleteTarget(null);
      await fetchScholarships();
    } catch (err) {
      toast({ title: 'Delete failed', description: err instanceof Error ? err.message : 'Please try again.', variant: 'destructive' });
    } finally { setDeleting(false); }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST', headers: adminHeaders(session) });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Seed failed');
      const data = await res.json();
      toast({ title: 'Catalog seeded', description: `${data.seeded} scholarship(s) upserted (${data.total} total in seed set).` });
      await fetchScholarships();
    } catch (err) {
      toast({ title: 'Seed failed', description: err instanceof Error ? err.message : 'Please try again.', variant: 'destructive' });
    } finally { setSeeding(false); }
  };

  const setField = (field: keyof ScholarshipForm, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{scholarships.length} scholarship(s) total.</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSeed} disabled={seeding}>
            {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Seed catalog
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add scholarship
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search scholarships…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading scholarships…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 py-16 text-center">
          <Search className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No scholarships found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {scholarships.length === 0 ? 'Click "Seed catalog" to load starter data, or "Add scholarship" to create one.' : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">University</TableHead>
                <TableHead className="hidden md:table-cell">Country</TableHead>
                <TableHead className="hidden md:table-cell">Degree</TableHead>
                <TableHead>Funding</TableHead>
                <TableHead className="hidden sm:table-cell">Deadline</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium max-w-[250px] truncate">{s.title}</TableCell>
                   <TableCell className="hidden sm:table-cell text-muted-foreground max-w-[180px] truncate">{s.university}</TableCell>
                   <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-xs">{s.country}</Badge></TableCell>
                   <TableCell className="hidden md:table-cell text-muted-foreground">{s.degree ?? '—'}</TableCell>
                   <TableCell><Badge className="bg-primary/10 text-primary text-xs">{s.funding}</Badge></TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{formatDate(s.deadline)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(s)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editingId ? 'Edit scholarship' : 'Add scholarship'}</DialogTitle>
            <DialogDescription>{editingId ? 'Update the scholarship details below.' : 'Fill in the details to add a new scholarship to the catalog.'}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="f-title">Title *</Label>
              <Input id="f-title" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="e.g. Future Leaders Merit Scholarship" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-university">University / Organization *</Label>
              <Input id="f-university" value={form.university} onChange={(e) => setField('university', e.target.value)} placeholder="e.g. National Scholars Foundation" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-country">Country *</Label>
              <Input id="f-country" value={form.country} onChange={(e) => setField('country', e.target.value)} placeholder="e.g. US or International" />
            </div>
            <div className="space-y-2">
              <Label>Degree level</Label>
              <Select value={form.degree} onValueChange={(v) => setField('degree', v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Graduate">Graduate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-funding">Funding</Label>
              <Input id="f-funding" value={form.funding} onChange={(e) => setField('funding', e.target.value)} placeholder="e.g. $15,000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-deadline">Deadline *</Label>
              <Input id="f-deadline" type="date" value={form.deadline} onChange={(e) => setField('deadline', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-link">Official link *</Label>
              <Input id="f-link" value={form.official_link} onChange={(e) => setField('official_link', e.target.value)} placeholder="https://example.com/apply" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="f-desc">Description *</Label>
              <textarea id="f-desc" value={form.description} onChange={(e) => setField('description', e.target.value)} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Brief description of the scholarship…" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="f-reqs">Requirements</Label>
              <textarea id="f-reqs" value={form.requirements} onChange={(e) => setField('requirements', e.target.value)} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Eligibility criteria…" />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete scholarship?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.title}</strong> from the catalog. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Users Tab
// ──────────────────────────────────────────────────────────────

function UsersTab({ session }: { session: { access_token?: string } | null }) {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(EMPTY_USER_FORM);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: adminHeaders(session) });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load');
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (err) {
      toast({ title: 'Failed to load users', description: err instanceof Error ? err.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [session, toast]);

  useEffect(() => { if (session) fetchUsers(); }, [session, fetchUsers]);

  const filtered = React.useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((u) => (u.email ?? '').toLowerCase().includes(q));
  }, [users, search]);

  const handleCreate = async () => {
    if (!form.email || !form.password) {
      toast({ title: 'Missing fields', description: 'Email and password are required.', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: adminHeaders(session),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to create user');
      toast({ title: 'User created', description: `${form.email} can now sign in.` });
      setCreateOpen(false);
      setForm(EMPTY_USER_FORM);
      await fetchUsers();
    } catch (err) {
      toast({ title: 'Create failed', description: err instanceof Error ? err.message : 'Please try again.', variant: 'destructive' });
    } finally { setCreating(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: adminHeaders(session),
        body: JSON.stringify({ user_id: deleteTarget.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to delete user');
      toast({ title: 'User deleted' });
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err) {
      toast({ title: 'Delete failed', description: err instanceof Error ? err.message : 'Please try again.', variant: 'destructive' });
    } finally { setDeleting(false); }
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{users.length} user(s) total.</p>
        <Button onClick={() => { setForm(EMPTY_USER_FORM); setCreateOpen(true); }}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create user
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading users…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 py-16 text-center">
          <Users className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No users found</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="hidden sm:table-cell">Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="hidden md:table-cell">Last sign-in</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => {
                const isAdmin = adminEmails.includes((u.email ?? '').toLowerCase());
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email ?? '—'}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {(u.user_metadata?.full_name as string) ?? '—'}
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Badge className="bg-primary/10 text-primary text-xs">Admin</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(u)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Create user</DialogTitle>
            <DialogDescription>
              Create a new account. The user can sign in immediately with the credentials below.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u-email">Email *</Label>
              <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-pass">Password *</Label>
              <Input id="u-pass" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-name">Full name</Label>
              <Input id="u-name" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Optional" />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.email}</strong> and all their data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Scholarship form type (shared)
// ──────────────────────────────────────────────────────────────

type ScholarshipForm = {
  title: string;
  university: string;
  country: string;
  degree: string;
  funding: string;
  deadline: string;
  description: string;
  requirements: string;
  official_link: string;
};

const EMPTY_FORM: ScholarshipForm = {
  title: '',
  university: '',
  country: '',
  degree: '',
  funding: '',
  deadline: '',
  description: '',
  requirements: '',
  official_link: '',
};
