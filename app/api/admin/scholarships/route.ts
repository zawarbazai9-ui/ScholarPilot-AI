import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdminAuth } from '@/lib/admin';
import type { Scholarship } from '@/lib/types';

export async function GET(request: Request) {
  const { user, error } = await verifyAdminAuth(request);
  if (error) {
    return NextResponse.json({ error }, { status: error === 'Not authorized as admin' ? 403 : 401 });
  }

  const { data, error: dbErr } = await supabaseAdmin
    .from('scholarships')
    .select('*')
    .order('created_at', { ascending: false });

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ scholarships: data ?? [] });
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

  const input = body as Partial<Omit<Scholarship, 'id' | 'created_at'>>;

  if (!input.title || !input.university || !input.country || !input.deadline || !input.description || !input.official_link) {
    return NextResponse.json(
      { error: 'Missing required fields: title, university, country, deadline, description, official_link' },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    title: input.title,
    university: input.university,
    country: input.country,
    degree: input.degree ?? null,
    funding: input.funding ?? 'Not specified',
    deadline: input.deadline,
    description: input.description,
    requirements: input.requirements ?? null,
    official_link: input.official_link,
  };

  const { data, error: dbErr } = await supabaseAdmin
    .from('scholarships')
    .insert(payload)
    .select('*')
    .maybeSingle();

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ scholarship: data }, { status: 201 });
}
