import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('Missing GROQ_API_KEY');
    _groq = new Groq({ apiKey: key });
  }
  return _groq;
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
    const { transcriptText, requirements } = await req.json();

    if (!transcriptText || typeof transcriptText !== 'string') {
      return NextResponse.json({ error: 'No transcript text provided.' }, { status: 400 });
    }

    if (transcriptText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Transcript text is too short. Please provide a complete transcript.' },
        { status: 400 }
      );
    }

    // Use AI to analyze the transcript
    const groq = getGroq();
    const reqSection = requirements
      ? `\nPROGRAM REQUIREMENTS to check against:\n${requirements}\n`
      : '';

    const prompt = `You are an academic advisor. Analyze the following student transcript and provide a detailed assessment.

TRANSCRIPT TEXT:
${transcriptText.slice(0, 15000)}
${reqSection}
Return ONLY valid JSON — no markdown, no code fences — with this structure:
{
  "student_info": {
    "name": "Student name or null",
    "institution": "University/college name or null",
    "degree": "Degree program or null",
    "graduation_date": "Expected/actual graduation date or null"
  },
  "academic_record": {
    "gpa": "X.XX / 4.0 scale (or equivalent scale noted)",
    "total_credits": "Number or null",
    "courses": [
      {
        "name": "Course name",
        "grade": "Grade received",
        "credits": "Credit hours",
        "category": "Core/Elective/General/Prerequisite"
      }
    ]
  },
  "strengths": [
    "Specific strength based on transcript (e.g. strong GPA in relevant courses)"
  ],
  "weaknesses": [
    "Specific weakness or gap (e.g. missing prerequisite, low grade in key course)"
  ],
  "gpa_trend": "Improving/Stable/Declining with brief explanation",
  "program_fit": {
    "score": "Percentage 0-100 representing fit to program requirements",
    "meets_requirements": ["List of requirements that are met"],
    "missing_requirements": ["List of requirements not met or unclear"],
    "recommendations": ["Specific suggestions to improve candidacy"]
  },
  "course_analysis": {
    "relevant_courses": ["Courses most relevant to the target program"],
    "grade_summary": "Brief summary of grades in relevant courses",
    "prerequisite_check": "Whether prerequisites appear to be satisfied"
  }
}

Rules:
- If program requirements are not provided, assess generally and note "No specific program requirements provided."
- Be specific — reference actual course names and grades from the transcript.
- gpa should reflect the actual GPA from the transcript.
- Be honest about weaknesses — this helps the student prepare.
- Return ONLY the JSON object.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: 'You are an academic advisor. Respond only with valid JSON.' },
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

    const result = extractJSON(raw);
    if (!result || typeof result !== 'object') {
      console.error('[transcript-analyzer] Could not parse AI response:', raw.slice(0, 500));
      return NextResponse.json(
        { error: 'AI returned invalid data. Try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis: result });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unexpected error occurred.';
    console.error('[transcript-analyzer] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
