import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkEligibility } from '@/lib/ai';
import type { Profile, Scholarship } from '@/lib/types';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { scholarshipId, userId } = await req.json();

    if (!scholarshipId || !userId) {
      return NextResponse.json(
        { error: 'scholarshipId and userId are required.' },
        { status: 400 }
      );
    }

    const [{ data: scholarship }, { data: profile }] = await Promise.all([
      supabaseAdmin
        .from('scholarships')
        .select('*')
        .eq('id', scholarshipId)
        .single(),
      supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
    ]);

    if (!scholarship) {
      return NextResponse.json(
        { error: 'Scholarship not found.' },
        { status: 404 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found. Complete your profile first.' },
        { status: 404 }
      );
    }

    const result = await checkEligibility(
      scholarship as Scholarship,
      profile as Profile
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unexpected error occurred.';
    console.error('[eligibility] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
