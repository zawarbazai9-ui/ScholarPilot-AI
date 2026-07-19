import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Profile, ProfileInput, Scholarship } from '@/lib/types';

export async function createScholarship(
  input: Omit<Scholarship, 'id' | 'created_at'>
) {
  const { data, error } = await supabaseAdmin
    .from('scholarships')
    .insert(input)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as Scholarship;
}

export async function updateScholarship(
  id: string,
  patch: Partial<Omit<Scholarship, 'id' | 'created_at'>>
) {
  const { data, error } = await supabaseAdmin
    .from('scholarships')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as Scholarship | null;
}

export async function deleteScholarship(id: string) {
  const { error } = await supabaseAdmin.from('scholarships').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function upsertProfile(userId: string, input: ProfileInput) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: userId,
        ...input,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}
