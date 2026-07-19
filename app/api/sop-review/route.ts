import { NextResponse } from 'next/server';
import { reviewSOP } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { sop } = await req.json();

    if (!sop || typeof sop !== 'string' || sop.trim().length < 50) {
      return NextResponse.json(
        { error: 'Please provide a Statement of Purpose with at least 50 characters.' },
        { status: 400 }
      );
    }

    if (sop.length > 10000) {
      return NextResponse.json(
        { error: 'Statement of Purpose must be under 10,000 characters.' },
        { status: 400 }
      );
    }

    const result = await reviewSOP(sop);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unexpected error occurred.';
    console.error('[sop-review] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
