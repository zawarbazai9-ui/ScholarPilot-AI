import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const userId = user.id;

  // Delete user data from all related tables
  const tables = ['profiles', 'saved_scholarships', 'applications', 'context_files', 'notifications'];
  for (const table of tables) {
    await supabaseAdmin.from(table).delete().eq('user_id', userId);
  }
  // profiles uses 'id' as FK, not 'user_id'
  await supabaseAdmin.from('profiles').delete().eq('id', userId);

  // Delete the auth user
  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
