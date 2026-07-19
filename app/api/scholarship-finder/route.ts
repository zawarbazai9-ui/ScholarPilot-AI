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

type ScholarshipResult = {
  title: string;
  university: string;
  country: string;
  degree: string | null;
  funding: string;
  deadline: string;
  description: string;
  requirements: string | null;
  official_link: string;
};

async function fetchPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
      redirect: 'follow',
    });
    if (!res.ok) return '';
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000);
  } catch {
    return '';
  }
}

function extractJSON(text: string): ScholarshipResult[] | null {
  // Try direct parse
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* continue */ }

  // Try extracting from markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim());
      if (Array.isArray(parsed)) return parsed;
    } catch { /* continue */ }
  }

  // Try finding JSON array in text
  const bracketMatch = text.match(/\[[\s\S]*\]/);
  if (bracketMatch) {
    try {
      const parsed = JSON.parse(bracketMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* continue */ }
  }

  return null;
}

function isValidResult(s: unknown): s is ScholarshipResult {
  if (!s || typeof s !== 'object') return false;
  const obj = s as Record<string, unknown>;
  return (
    typeof obj.title === 'string' &&
    typeof obj.university === 'string' &&
    typeof obj.country === 'string' &&
    typeof obj.deadline === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.official_link === 'string'
  );
}

export async function POST(req: Request) {
  try {
    const { field, country, degree, count = 8 } = await req.json();

    if (!field && !country && !degree) {
      return NextResponse.json(
        { error: 'Provide at least one search criterion (field, country, or degree).' },
        { status: 400 }
      );
    }

    // Fetch existing scholarships to avoid duplicates
    const { data: existing } = await supabaseAdmin
      .from('scholarships')
      .select('title');
    const existingTitles = new Set(
      (existing ?? []).map((s: { title: string }) => s.title.toLowerCase().trim())
    );

    // Try scraping known scholarship sites for real data
    const searchTerms: string[] = [];
    if (field) searchTerms.push(field);
    if (degree) searchTerms.push(degree);
    if (country) searchTerms.push(country);

    const scrapeUrls = [
      'https://www.scholarshipsads.com/',
      'https://scholarshipplanet.info/',
      'https://www.opportunitiescorners.info/',
    ];

    const pages = await Promise.all(scrapeUrls.map(fetchPage));
    const scrapedContent = pages.filter(Boolean).join('\n\n').slice(0, 15000);

    // Build the prompt — instruct AI to use its own knowledge + any scraped data
    const filterDesc = [
      field ? `Field: ${field}` : null,
      degree ? `Degree level: ${degree}` : null,
      country ? `Country: ${country}` : null,
    ]
      .filter(Boolean)
      .join(', ');

    const groq = getGroq();
    const prompt = `You are a scholarship research assistant. Find ${count} real, well-known scholarships matching these criteria: ${filterDesc}.

${scrapedContent ? `Here is some web data you may use as reference:\n${scrapedContent}\n` : ''}
${existingTitles.size > 0 ? `Do NOT include these scholarships (they already exist in our database):\n${Array.from(existingTitles).map((t) => `- ${t}`).join('\n')}\n` : ''}
Use your knowledge of real, existing scholarships (Fulbright, Chevening, Erasmus Mundus, DAAD, Commonwealth, Gates Cambridge, etc.) plus any data from the web content above. Only suggest scholarships you are confident actually exist.

Return ONLY valid JSON — no markdown, no code fences, no extra text. Return an array of objects:
[
  {
    "title": "Full official scholarship name",
    "university": "Host university or organizing body",
    "country": "Country",
    "degree": "Undergraduate" or "Graduate" or "Postgraduate" or null,
    "funding": "Full funding" or "Partial funding" or "Tuition" or "Stipend",
    "deadline": "YYYY-MM-DD" or "Rolling",
    "description": "2-3 sentence description",
    "requirements": "Key requirements in one sentence",
    "official_link": "Official URL"
  }
]

Important:
- Return exactly ${count} scholarships.
- official_link must be a real, working URL (e.g. https://fulbright.org, https://www.chevening.org).
- deadline should be a real date or "Rolling".
- Return ONLY the JSON array, nothing else.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: 'You are a helpful assistant. You respond only with valid JSON arrays.' },
        { role: 'user', content: prompt },
      ],
    });

    const raw = (completion.choices[0]?.message?.content ?? '').trim();
    if (!raw) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Try again.' },
        { status: 500 }
      );
    }

    // Robust JSON extraction
    const results = extractJSON(raw);

    if (!results || !Array.isArray(results)) {
      console.error('[scholarship-finder] Could not parse AI response:', raw.slice(0, 500));
      return NextResponse.json(
        { error: 'AI returned invalid data. Try again.' },
        { status: 500 }
      );
    }

    // Validate each result
    const valid = results.filter(isValidResult);

    // Filter out duplicates against existing DB
    const unique = valid.filter(
      (s) => !existingTitles.has(s.title.toLowerCase().trim())
    );

    if (unique.length === 0) {
      console.error('[scholarship-finder] No valid/new results');
      return NextResponse.json(
        { error: 'All found scholarships already exist in the database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ scholarships: unique });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unexpected error occurred.';
    console.error('[scholarship-finder] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
