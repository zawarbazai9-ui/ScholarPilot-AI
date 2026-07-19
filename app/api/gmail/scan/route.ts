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

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    const data = await res.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

async function getAccessToken(userId: string): Promise<string | null> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('gmail_access_token, gmail_refresh_token, gmail_token_expiry')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.gmail_access_token) return null;

  // Check if token is expired
  if (
    profile.gmail_token_expiry &&
    new Date(profile.gmail_token_expiry) < new Date()
  ) {
    if (!profile.gmail_refresh_token) return null;
    const newToken = await refreshAccessToken(profile.gmail_refresh_token);
    if (!newToken) return null;

    // Update token
    await supabaseAdmin
      .from('profiles')
      .update({ gmail_access_token: newToken })
      .eq('id', userId);

    return newToken;
  }

  return profile.gmail_access_token;
}

async function searchGmail(
  accessToken: string,
  query: string,
  maxResults: number = 20
): Promise<{ id: string; snippet: string; subject: string; from: string; date: string }[]> {
  // Search Gmail
  const searchRes = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!searchRes.ok) return [];
  const searchData = await searchRes.json();
  const messages = searchData.messages ?? [];

  // Fetch details for each message
  const results = await Promise.all(
    messages.slice(0, 15).map(async (msg: { id: string }) => {
      try {
        const detailRes = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!detailRes.ok) return null;
        const detail = await detailRes.json();
        const headers = detail.payload?.headers ?? [];
        const get = (name: string) =>
          headers.find((h: { name: string }) => h.name === name)?.value ?? '';
        return {
          id: msg.id,
          snippet: detail.snippet ?? '',
          subject: get('Subject'),
          from: get('From'),
          date: get('Date'),
        };
      } catch {
        return null;
      }
    })
  );

  return results.filter(Boolean) as Awaited<ReturnType<typeof searchGmail>>;
}

function extractJSON(text: string): unknown {
  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch { /* continue */ }

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch { /* continue */ }
  }

  const bracketMatch = text.match(/[\[{][\s\S]*[\]}]/);
  if (bracketMatch) {
    try {
      return JSON.parse(bracketMatch[0]);
    } catch { /* continue */ }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required.' }, { status: 400 });
    }

    // Get access token
    const accessToken = await getAccessToken(userId);
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Gmail not connected. Please connect your Gmail first.' },
        { status: 401 }
      );
    }

    // Search for scholarship-related emails
    const queries = [
      'subject:(scholarship OR scholarship OR award OR fellowship OR grant OR financial aid)',
      'from:(scholarship OR financialaid OR admissions OR fellowship)',
      'subject:(application received OR application status OR congratulations OR regret OR inform you)',
      'subject:(accepted OR denied OR awarded OR shortlisted OR waitlist)',
    ];

    const allEmails: Awaited<ReturnType<typeof searchGmail>> = [];
    const seenIds = new Set<string>();

    for (const q of queries) {
      const emails = await searchGmail(accessToken, q, 10);
      for (const e of emails) {
        if (!seenIds.has(e.id)) {
          seenIds.add(e.id);
          allEmails.push(e);
        }
      }
    }

    if (allEmails.length === 0) {
      return NextResponse.json({
        found: 0,
        message: 'No scholarship-related emails found in your inbox.',
        created: [],
        updated: [],
      });
    }

    // Get existing applications for this user
    const { data: existingApps } = await supabaseAdmin
      .from('applications')
      .select('id, scholarship_id, status, notes, scholarship:scholarships(id, title)')
      .eq('user_id', userId);

    // Get all scholarships for matching
    const { data: allScholarships } = await supabaseAdmin
      .from('scholarships')
      .select('id, title');

    const scholarshipMap = new Map(
      (allScholarships ?? []).map((s: { id: string; title: string }) => [
        s.title.toLowerCase(),
        s,
      ])
    );

    // Build context for AI
    const emailSummaries = allEmails.map(
      (e) =>
        `Subject: ${e.subject}\nFrom: ${e.from}\nDate: ${e.date}\nSnippet: ${e.snippet}`
    );

    const existingContext = (existingApps ?? []).map((a: Record<string, unknown>) => {
      const scholarship = a.scholarship as Record<string, unknown> | null;
      return `- ${scholarship?.title ?? 'Unknown'} (status: ${a.status})`;
    });

    const scholarshipTitles = Array.from(scholarshipMap.keys()).slice(0, 50);

    const groq = getGroq();
    const prompt = `You are a scholarship email analyzer. Given these emails from a student's inbox, determine which ones are scholarship-related and what action to take.

EMAILS:
${emailSummaries.join('\n---\n')}

EXISTING TRACKED APPLICATIONS:
${existingContext.length > 0 ? existingContext.join('\n') : 'None'}

KNOWN SCHOLARSHIP TITLES IN DATABASE:
${scholarshipTitles.join('\n')}

Analyze each email and return ONLY valid JSON (no markdown, no code fences) as:
{
  "results": [
    {
      "email_subject": "Original email subject",
      "email_from": "Sender",
      "email_date": "Date",
      "is_scholarship": true/false,
      "scholarship_title": "Best matching scholarship title from database, or a new title if not found",
      "action": "create" or "update" or "ignore",
      "status": "researching" or "drafting" or "submitted" or "awarded" or "rejected",
      "summary": "Brief summary of what the email says about the application"
    }
  ]
}

Rules:
- Only mark is_scholarship=true for genuine scholarship-related emails.
- For acceptance/congratulations emails: status="awarded"
- For rejection/regret emails: status="rejected"
- For application received/confirmation: status="submitted"
- For status update requests or general info: status="researching"
- If the scholarship already exists in the database, match it by title (action="update")
- If it's a new scholarship not in the database, create it (action="create")
- Ignore emails that are clearly spam, newsletters, or unrelated.
- Return ONLY the JSON object.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 4096,
      messages: [
        {
          role: 'system',
          content: 'You are a scholarship email analyzer. Respond only with valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const raw = (completion.choices[0]?.message?.content ?? '').trim();
    if (!raw) {
      return NextResponse.json(
        { error: 'AI returned empty response.' },
        { status: 500 }
      );
    }

    const parsed = extractJSON(raw) as {
      results?: {
        email_subject: string;
        email_from: string;
        email_date: string;
        is_scholarship: boolean;
        scholarship_title: string;
        action: string;
        status: string;
        summary: string;
      }[];
    } | null;

    if (!parsed?.results || !Array.isArray(parsed.results)) {
      return NextResponse.json(
        { error: 'AI returned invalid data.' },
        { status: 500 }
      );
    }

    const created: string[] = [];
    const updated: string[] = [];

    for (const result of parsed.results) {
      if (!result.is_scholarship) continue;

      const title = result.scholarship_title?.trim();
      if (!title) continue;

      if (result.action === 'update') {
        // Find matching application
        const existing = (existingApps ?? []).find((a: Record<string, unknown>) => {
          const s = a.scholarship as Record<string, unknown> | null;
          return s?.title?.toString().toLowerCase() === title.toLowerCase();
        });

        if (existing) {
          const statusUpdate = result.status as
            | 'researching'
            | 'drafting'
            | 'submitted'
            | 'awarded'
            | 'rejected';

          const statusProgress: Record<string, number> = {
            researching: 15,
            drafting: 50,
            submitted: 85,
            awarded: 100,
            rejected: 100,
          };

          await supabaseAdmin
            .from('applications')
            .update({
              status: statusUpdate,
              progress: statusProgress[statusUpdate] ?? 50,
              notes: `Auto-updated from email: ${result.summary}\n\nOriginal: ${result.email_subject} (from ${result.email_from})`,
            })
            .eq('id', existing.id as string);

          updated.push(title);
        }
      } else if (result.action === 'create') {
        // Find or create scholarship
        let scholarshipId: string | null = null;

        // Try to find in DB
        const match = (allScholarships ?? []).find(
          (s: { title: string }) => s.title.toLowerCase() === title.toLowerCase()
        );
        if (match) {
          scholarshipId = (match as { id: string }).id;
        } else {
          // Create new scholarship
          const { data: newScholarship } = await supabaseAdmin
            .from('scholarships')
            .insert({
              title,
              university: result.email_from || 'Unknown',
              country: 'Unknown',
              deadline: '2026-12-31',
              description: result.summary || `Found via Gmail scan.`,
              official_link: '',
              funding: 'Not specified',
            })
            .select('id')
            .maybeSingle();

          scholarshipId = newScholarship?.id ?? null;
        }

        if (scholarshipId) {
          const statusUpdate = result.status as
            | 'researching'
            | 'drafting'
            | 'submitted'
            | 'awarded'
            | 'rejected';

          const statusProgress: Record<string, number> = {
            researching: 15,
            drafting: 50,
            submitted: 85,
            awarded: 100,
            rejected: 100,
          };

          // Check if already tracking this scholarship
          const alreadyTracked = (existingApps ?? []).some(
            (a: Record<string, unknown>) => a.scholarship_id === scholarshipId
          );

          if (!alreadyTracked) {
            await supabaseAdmin.from('applications').insert({
              user_id: userId,
              scholarship_id: scholarshipId,
              status: statusUpdate,
              progress: statusProgress[statusUpdate] ?? 15,
              notes: `Auto-created from email: ${result.summary}\n\nOriginal: ${result.email_subject} (from ${result.email_from})`,
            });
            created.push(title);
          }
        }
      }
    }

    return NextResponse.json({
      found: allEmails.length,
      created,
      updated,
      scanned: parsed.results.length,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unexpected error occurred.';
    console.error('[gmail-scan] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
