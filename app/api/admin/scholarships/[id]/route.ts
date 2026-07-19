import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdminAuth } from '@/lib/admin';

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
  const { user, error } = await verifyAdminAuth(request);
  if (error) {
    return NextResponse.json({ error }, { status: error === 'Not authorized as admin' ? 403 : 401 });
  }

  const { data, error: dbErr } = await supabaseAdmin
    .from('scholarships')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ scholarship: data });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { user, error } = await verifyAdminAuth(request);
  if (error) {
    return NextResponse.json({ error }, { status: error === 'Not authorized as admin' ? 403 : 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const patch = body as Record<string, unknown>;
  const allowed = [
    'title', 'university', 'country', 'degree', 'funding',
    'deadline', 'description', 'requirements', 'official_link',
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in patch) updates[key] = patch[key] ?? null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error: dbErr } = await supabaseAdmin
    .from('scholarships')
    .update(updates)
    .eq('id', params.id)
    .select('*')
    .maybeSingle();

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ scholarship: data });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { user, error } = await verifyAdminAuth(request);
  if (error) {
    return NextResponse.json({ error }, { status: error === 'Not authorized as admin' ? 403 : 401 });
  }

  const { error: dbErr } = await supabaseAdmin
    .from('scholarships')
    .delete()
    .eq('id', params.id);

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
