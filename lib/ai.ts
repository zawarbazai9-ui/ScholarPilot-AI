import Groq from 'groq-sdk';
import type { Profile, Scholarship } from '@/lib/types';

// ── Client singleton ────────────────────────────────────────

let _groq: Groq | null = null;

function getGroq(): Groq {
  if (!_groq) {
    const key = process.env.GROQ_API_KEY;
    if (!key) {
      throw new Error(
        'Missing GROQ_API_KEY env var. Add it to your .env file.'
      );
    }
    _groq = new Groq({ apiKey: key });
  }
  return _groq;
}

async function callAI(prompt: string): Promise<string> {
  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.4,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = (completion.choices[0]?.message?.content ?? '').trim();
  if (!text) throw new Error('AI returned an empty response. Please try again.');
  return text;
}

function stripCodeFences(text: string): string {
  let cleaned = text;
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '');
  }
  return cleaned.trim();
}

function parseJSON<T>(text: string): T {
  const cleaned = stripCodeFences(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error('AI returned an invalid response. Please try again.');
  }
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

// ── Eligibility ─────────────────────────────────────────────

export function buildEligibilityPrompt(
  scholarship: Scholarship,
  profile: Profile
): string {
  const profileBlock = [
    `Full name: ${profile.full_name ?? 'Not provided'}`,
    `Country: ${profile.country ?? 'Not provided'}`,
    `Degree level: ${profile.degree ?? 'Not provided'}`,
    `Major / field: ${profile.major ?? 'Not provided'}`,
    `CGPA: ${profile.cgpa ?? 'Not provided'}`,
    `Preferred country: ${profile.preferred_country ?? 'Not provided'}`,
  ].join('\n');

  const scholarshipBlock = [
    `Title: ${scholarship.title}`,
    `University: ${scholarship.university}`,
    `Country: ${scholarship.country}`,
    `Degree level: ${scholarship.degree ?? 'Open'}`,
    `Funding: ${scholarship.funding}`,
    `Deadline: ${scholarship.deadline}`,
    `Description: ${scholarship.description}`,
    `Requirements: ${scholarship.requirements ?? 'Not specified'}`,
  ].join('\n');

  return `You are an expert scholarship advisor. Analyze the following student profile against the scholarship and provide a detailed eligibility assessment.

STUDENT PROFILE:
${profileBlock}

SCHOLARSHIP:
${scholarshipBlock}

Return your analysis as valid JSON matching this exact structure (no markdown, no code fences, just raw JSON):
{
  "eligibilityScore": <number 0-100>,
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "missingRequirements": [<string>, ...],
  "recommendations": [<string>, ...],
  "overallSummary": "<1-2 sentence summary>"
}

Rules:
- eligibilityScore must be an integer between 0 and 100.
- strengths: 2-5 specific reasons the student is a good fit.
- weaknesses: 2-4 specific concerns or gaps.
- missingRequirements: list any requirements the student doesn't clearly meet or that cannot be determined from the profile.
- recommendations: 3-5 actionable next steps to improve their chances.
- overallSummary: a concise 1-2 sentence verdict.
- Be honest and specific, not generic. Reference actual profile data.`;
}

export type EligibilityResult = {
  eligibilityScore: number;
  strengths: string[];
  weaknesses: string[];
  missingRequirements: string[];
  recommendations: string[];
  overallSummary: string;
};

export async function checkEligibility(
  scholarship: Scholarship,
  profile: Profile
): Promise<EligibilityResult> {
  const text = await callAI(buildEligibilityPrompt(scholarship, profile));
  const parsed = parseJSON<Record<string, unknown>>(text);

  if (typeof parsed.eligibilityScore !== 'number') {
    throw new Error('AI response missing eligibilityScore.');
  }

  return {
    eligibilityScore: clamp(parsed.eligibilityScore),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    missingRequirements: Array.isArray(parsed.missingRequirements)
      ? parsed.missingRequirements
      : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : [],
    overallSummary:
      typeof parsed.overallSummary === 'string' ? parsed.overallSummary : '',
  };
}

// ── SOP Review ──────────────────────────────────────────────

export type SOPResult = {
  overallScore: number;
  grammar: number;
  structure: number;
  clarity: number;
  motivation: number;
  academicTone: number;
  suggestions: string[];
  summary: string;
};

export function buildSOPPrompt(sop: string): string {
  return `You are an expert admissions essay reviewer. Analyze the following Statement of Purpose (SOP) and provide a detailed, constructive review.

STATEMENT OF PURPOSE:
${sop}

Return your review as valid JSON matching this exact structure (no markdown, no code fences, just raw JSON):
{
  "overallScore": <number 0-100>,
  "grammar": <number 0-100>,
  "structure": <number 0-100>,
  "clarity": <number 0-100>,
  "motivation": <number 0-100>,
  "academicTone": <number 0-100>,
  "suggestions": [<string>, ...],
  "summary": "<2-3 sentence overall assessment>"
}

Rules:
- All scores must be integers between 0 and 100.
- grammar: accuracy of grammar, spelling, punctuation, sentence construction.
- structure: logical flow, paragraph organization, introduction-body-conclusion coherence.
- clarity: how clearly ideas are expressed, absence of ambiguity or jargon overload.
- motivation: strength of demonstrated passion, goals, and why this field/programme.
- academicTone: formality, precision, objectivity, and scholarly voice.
- suggestions: 5-8 specific, actionable improvement suggestions. Be concrete — reference patterns in the text, not generic advice.
- summary: honest overall assessment with key strengths and areas for improvement.`;
}

export async function reviewSOP(sop: string): Promise<SOPResult> {
  const text = await callAI(buildSOPPrompt(sop));
  const parsed = parseJSON<Record<string, unknown>>(text);

  if (typeof parsed.overallScore !== 'number') {
    throw new Error('AI response missing overallScore.');
  }

  return {
    overallScore: clamp(parsed.overallScore),
    grammar: clamp(typeof parsed.grammar === 'number' ? parsed.grammar : 0),
    structure: clamp(typeof parsed.structure === 'number' ? parsed.structure : 0),
    clarity: clamp(typeof parsed.clarity === 'number' ? parsed.clarity : 0),
    motivation: clamp(typeof parsed.motivation === 'number' ? parsed.motivation : 0),
    academicTone: clamp(typeof parsed.academicTone === 'number' ? parsed.academicTone : 0),
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
  };
}
