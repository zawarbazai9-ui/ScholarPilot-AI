import { supabase } from '@/lib/supabase';
import type {
  Application,
  ApplicationInput,
  ApplicationUpdate,
  ContextFile,
  Notification,
  NotificationInput,
  Profile,
  ProfileInput,
  SavedScholarship,
  Scholarship,
} from '@/lib/types';

// ============================================================
// Profiles
// ============================================================

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(userId: string, input: ProfileInput) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

// ============================================================
// Scholarships (public catalog — read-only from the client)
// ============================================================

export type ScholarshipQuery = {
  search?: string;
  country?: string;
  degree?: string;
  sort?: 'deadline' | 'recent';
};

export async function listScholarships(query?: ScholarshipQuery) {
  let q = supabase.from('scholarships').select('*');

  if (query?.country && query.country !== 'all') {
    q = q.eq('country', query.country);
  }
  if (query?.degree && query.degree !== 'all') {
    q = q.eq('degree', query.degree);
  }
  if (query?.search) {
    q = q.or(
      `title.ilike.%${query.search}%,university.ilike.%${query.search}%,description.ilike.%${query.search}%`
    );
  }

  const sort = query?.sort ?? 'deadline';
  if (sort === 'deadline') {
    q = q.order('deadline', { ascending: true });
  } else {
    q = q.order('created_at', { ascending: false });
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Scholarship[];
}

export async function getScholarship(id: string) {
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Scholarship | null;
}

export async function listScholarshipCountries() {
  const { data, error } = await supabase
    .from('scholarships')
    .select('country')
    .order('country');
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((r) => r.country))).sort();
}

export async function listScholarshipDegrees() {
  const { data, error } = await supabase
    .from('scholarships')
    .select('degree');
  if (error) throw error;
  return Array.from(
    new Set((data ?? []).map((r) => r.degree).filter(Boolean) as string[])
  ).sort();
}

// ============================================================
// Saved Scholarships (owner-scoped CRUD)
// ============================================================

export async function listSavedScholarships(userId: string) {
  const { data, error } = await supabase
    .from('saved_scholarships')
    .select('*, scholarship:scholarships(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedScholarship[];
}

export async function listSavedScholarshipIds(userId: string) {
  const { data, error } = await supabase
    .from('saved_scholarships')
    .select('scholarship_id')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.scholarship_id));
}

export async function saveScholarship(scholarshipId: string) {
  const { error } = await supabase
    .from('saved_scholarships')
    .insert({ scholarship_id: scholarshipId });
  if (error) throw error;
  return true;
}

export async function unsaveScholarship(scholarshipId: string) {
  const { error } = await supabase
    .from('saved_scholarships')
    .delete()
    .eq('scholarship_id', scholarshipId);
  if (error) throw error;
  return true;
}

// ============================================================
// Applications (owner-scoped CRUD)
// ============================================================

export async function listApplications(userId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, scholarship:scholarships(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Application[];
}

export async function listApplicationScholarshipIds(userId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('scholarship_id')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.scholarship_id));
}

export async function getApplicationByScholarship(
  userId: string,
  scholarshipId: string
) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, scholarship:scholarships(*)')
    .eq('user_id', userId)
    .eq('scholarship_id', scholarshipId)
    .maybeSingle();
  if (error) throw error;
  return data as Application | null;
}

export async function createApplication(input: ApplicationInput) {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      scholarship_id: input.scholarship_id,
      status: input.status ?? 'not_started',
      notes: input.notes ?? null,
      progress: input.progress ?? 0,
    })
    .select('*, scholarship:scholarships(*)')
    .maybeSingle();
  if (error) throw error;
  return data as Application | null;
}

export async function updateApplication(
  id: string,
  patch: ApplicationUpdate
) {
  const { data, error } = await supabase
    .from('applications')
    .update(patch)
    .eq('id', id)
    .select('*, scholarship:scholarships(*)')
    .maybeSingle();
  if (error) throw error;
  return data as Application | null;
}

export async function deleteApplication(id: string) {
  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ============================================================
// Eligibility scoring (client-side heuristic over profile + scholarship)
// ============================================================

export type EligibilityProfile = {
  cgpa?: number | null;
  major?: string | null;
  degree?: string | null;
  country?: string | null;
  preferred_country?: string | null;
};

export function eligibilityScore(
  scholarship: Scholarship,
  profile: EligibilityProfile | null
): { score: number; reasons: string[] } {
  if (!profile) return { score: 0, reasons: [] };

  let score = 50;
  const reasons: string[] = [];

  // Major / field alignment
  if (scholarship.degree && profile.major) {
    const text = `${scholarship.title} ${scholarship.description} ${
      scholarship.requirements ?? ''
    }`.toLowerCase();
    if (text.includes(profile.major.toLowerCase())) {
      score += 18;
      reasons.push(`Major "${profile.major}" appears relevant to this award`);
    }
  }

  // Degree level match
  if (scholarship.degree && profile.degree) {
    if (scholarship.degree.toLowerCase() === profile.degree.toLowerCase()) {
      score += 15;
      reasons.push(`Degree level (${profile.degree}) matches`);
    } else {
      score -= 8;
      reasons.push(`Award targets ${scholarship.degree} students`);
    }
  }

  // Country alignment
  const userCountryPref = profile.preferred_country ?? profile.country;
  if (scholarship.country === 'International') {
    score += 8;
    reasons.push('Open to international applicants');
  } else if (
    userCountryPref &&
    scholarship.country.toLowerCase() === userCountryPref.toLowerCase()
  ) {
    score += 10;
    reasons.push(`Award is based in ${scholarship.country}`);
  }

  // CGPA strength — no explicit min in new schema, but higher CGPA boosts score
  if (profile.cgpa != null) {
    if (profile.cgpa >= 3.5) {
      score += 12;
      reasons.push(`Strong CGPA (${profile.cgpa})`);
    } else if (profile.cgpa >= 3.0) {
      score += 6;
      reasons.push(`CGPA ${profile.cgpa} meets typical merit thresholds`);
    } else {
      score -= 5;
      reasons.push(`CGPA ${profile.cgpa} may be below typical merit thresholds`);
    }
  }

  score = Math.max(0, Math.min(99, score));
  return { score, reasons };
}

export function scoreTone(score: number) {
  if (score >= 80)
    return {
      label: 'Strong match',
      className:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    };
  if (score >= 60)
    return {
      label: 'Good match',
      className:
        'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    };
  if (score >= 40)
    return {
      label: 'Possible',
      className:
        'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    };
  return {
    label: 'Reach',
    className: 'bg-muted text-muted-foreground',
  };
}

// ============================================================
// Context Files (owner-scoped CRUD)
// ============================================================

export async function listContextFiles(userId: string) {
  const { data, error } = await supabase
    .from('context_files')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContextFile[];
}

export async function uploadContextFile(
  file: { name: string; file_type: string; file_size: number; content: string },
  userId: string
) {
  const { data, error } = await supabase
    .from('context_files')
    .insert({
      user_id: userId,
      name: file.name,
      file_type: file.file_type,
      file_size: file.file_size,
      content: file.content,
    })
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as ContextFile;
}

export async function deleteContextFile(id: string) {
  const { error } = await supabase.from('context_files').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ============================================================
// Notifications (owner-scoped CRUD)
// ============================================================

export async function listNotifications(userId: string, unreadOnly = false) {
  let q = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId);

  if (unreadOnly) {
    q = q.eq('read', false);
  }

  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Notification[];
}

export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationAsRead(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as Notification | null;
}

export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
  return true;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function createNotification(
  userId: string,
  input: NotificationInput
) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: input.title,
      message: input.message,
      type: input.type ?? 'general',
      link: input.link ?? null,
    })
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as Notification;
}
