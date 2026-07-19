import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdminAuth } from '@/lib/admin';

export async function GET(request: Request) {
  const { user, error } = await verifyAdminAuth(request);
  if (error) {
    return NextResponse.json({ error }, { status: error === 'Not authorized as admin' ? 403 : 401 });
  }

  const { data, error: dbErr } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 100,
  });

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ users: data.users ?? [] });
}

export async function POST(request: Request) {
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

  const { email, password, full_name } = body as {
    email?: string;
    password?: string;
    full_name?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  const { data, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: full_name ? { full_name } : undefined,
  });

  if (createErr) {
    return NextResponse.json({ error: createErr.message }, { status: 400 });
  }

  return NextResponse.json({ user: data.user }, { status: 201 });
}

export async function DELETE(request: Request) {
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

  const { user_id } = body as { user_id?: string };

  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(user_id);

  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
