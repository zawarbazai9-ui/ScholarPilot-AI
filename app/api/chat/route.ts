import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { supabaseAdmin } from '@/lib/supabase-admin';

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('Missing GROQ_API_KEY');
    _groq = new Groq({ apiKey: key });
  }
  return _groq;
}

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required.' }, { status: 400 });
    }

    // Fetch user context from DB
    const [profileRes, savedRes, appsRes, allRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabaseAdmin
        .from('saved_scholarships')
        .select('*, scholarship:scholarships(*)')
        .eq('user_id', userId),
      supabaseAdmin
        .from('applications')
        .select('*, scholarship:scholarships(*)')
        .eq('user_id', userId),
      supabaseAdmin.from('scholarships').select('*'),
    ]);

    const profile = profileRes.data;
    const saved = (savedRes.data ?? []).map((s: Record<string, unknown>) => ({
      title: (s.scholarship as Record<string, unknown>)?.title ?? 'Unknown',
      country: (s.scholarship as Record<string, unknown>)?.country ?? '',
      deadline: (s.scholarship as Record<string, unknown>)?.deadline ?? '',
      funding: (s.scholarship as Record<string, unknown>)?.funding ?? '',
      degree: (s.scholarship as Record<string, unknown>)?.degree ?? '',
    }));
    const applications = (appsRes.data ?? []).map((a: Record<string, unknown>) => ({
      title: (a.scholarship as Record<string, unknown>)?.title ?? 'Unknown',
      status: a.status ?? 'unknown',
      updated_at: a.updated_at ?? '',
    }));
    const allScholarships = allRes.data ?? [];

    // Build context summary for the AI
    const contextParts: string[] = [];

    if (profile) {
      contextParts.push(
        `USER PROFILE:\n` +
          `Name: ${profile.full_name ?? 'Not set'}\n` +
          `Country: ${profile.country ?? 'Not set'}\n` +
          `Degree: ${profile.degree ?? 'Not set'}\n` +
          `Major/Field: ${profile.major ?? profile.field_of_study ?? 'Not set'}\n` +
          `CGPA: ${profile.cgpa ?? profile.gpa ?? 'Not set'}\n` +
          `University: ${profile.university ?? profile.institution ?? 'Not set'}\n` +
          `Research experience: ${profile.research_experience ?? 'Not set'}\n` +
          `IELTS: ${profile.ielts ?? 'Not set'}\n` +
          `GRE: ${profile.gre ?? 'Not set'}\n` +
          `Preferred countries: ${Array.isArray(profile.preferred_countries) ? profile.preferred_countries.join(', ') : (profile.preferred_country ?? 'Not set')}\n` +
          `Budget: ${profile.budget ?? 'Not set'}`
      );
    }

    if (saved.length > 0) {
      const savedList = saved.slice(0, 10).map(
        (s) => `- ${s.title} (${s.country}, ${s.funding}, deadline: ${s.deadline})`
      );
      contextParts.push(
        `SAVED SCHOLARSHIPS (${saved.length} total):\n${savedList.join('\n')}`
      );
    } else {
      contextParts.push('SAVED SCHOLARSHIPS: None saved yet.');
    }

    if (applications.length > 0) {
      const appsList = applications.map(
        (a) => `- ${a.title} — status: ${a.status}`
      );
      contextParts.push(
        `APPLICATIONS IN PROGRESS (${applications.length}):\n${appsList.join('\n')}`
      );
    } else {
      contextParts.push('APPLICATIONS: None tracked yet.');
    }

    contextParts.push(
      `CATALOG: ${allScholarships.length} scholarships available in the database.`
    );

    const contextBlock = contextParts.join('\n\n');

    // Format conversation history
    const chatHistory = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }));

    const systemPrompt = `You are ScholarPilot AI, a helpful scholarship advisor and academic career coach. You help students find scholarships, plan applications, improve eligibility, write essays, and navigate the scholarship process.

You have access to the student's profile, saved scholarships, applications, and the full scholarship catalog. Use this data to give personalized, specific advice. Reference actual scholarship names, deadlines, and requirements when relevant.

Guidelines:
- Be conversational, warm, and encouraging.
- Give specific, actionable advice — not generic platitudes.
- Reference the student's actual data (profile, saved scholarships, applications) in your responses.
- When recommending scholarships, mention specific names and deadlines from the catalog.
- Keep responses concise but thorough. Use bullet points or numbered lists when helpful.
- If you don't know something, say so honestly.
- You can help with: scholarship search, eligibility assessment, essay review, deadline planning, application strategy, interview prep, visa guidance, and general academic advice.

STUDENT DATA:
${contextBlock}`;

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
      ],
    });

    const reply = (completion.choices[0]?.message?.content ?? '').trim();

    if (!reply) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unexpected error occurred.';
    console.error('[chat] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
