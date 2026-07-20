/*
# Seed Gates Cambridge Scholarship data

## Overview
Populates the ScholarMatch database with:
1. The Gates Cambridge Scholarship (matching the provided HTML reference) and all its
   related funding items, timeline steps, eligibility items, and AI tips.
2. The single student profile row (Maya Chen) so the sidebar/header avatar resolves.

## Notes
- Uses `ON CONFLICT DO NOTHING` via a sentinel check so re-running is safe.
- Inserts the scholarship first, then child rows that reference its id via a CTE.
- All child inserts are guarded so re-running does not create duplicates.
*/

-- Seed the single user profile if it does not exist
INSERT INTO user_profile (singleton, name, avatar_url, gpa, ielts)
SELECT true, 'Maya Chen',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDQX-z7xFAU0hrkwqxsIQoQhUKkUIEdyqnOD3mZFv3BvFIjj8p4OJmzta7D1kwDOe4H2_EE621Kkjpb3r8RF5HcSZGkRO0VRUUPsXvHwQx0Gcoy-oIb9n-Wspdtn__ZFVrQN2LXWMx-IJ0uWH9pJM90eJfj_rHAOVhFVIL8q-krgeLbiMAdWy91u3dUBkHTXxXUlRu5feHNaYHvGMsrZLs_r0UyDqr4IoUcROiErg9xsd3r0hN5VLHJ52VC2YZo-lIJvlapk6Qvug',
  '3.92', '8.5'
WHERE NOT EXISTS (SELECT 1 FROM user_profile);

-- Seed the Gates Cambridge Scholarship if it does not exist
INSERT INTO scholarships (
  name, university, location, hero_image_url, crest_image_url, overview,
  total_award, slots, next_deadline, competition, acceptance, is_saved
)
SELECT
  'Gates Cambridge Scholarship',
  'University of Cambridge',
  'Cambridge, UK',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBKitI0vLdz6muMKkVUvZNIKg1BH0aI2jXC3HlYXSEgHb_vxn417q8kKcdFZq77Thjuk3QlgzZCxk9c-BMmRMvvMneQGyW4tAZKNnltyiAbFcrrvy3AiAj2tjs35ODeCY10_0AB4S2Md4rMLUfQmykRCW_Ah_dkFnWglpycUW3JcijLS4YoGoOWnTzi3DdmEe_MHd6TTekP-bUdxlwjoNLuqL_VVf18y8GtROeJOXWuAfrl8umnwNAPmzPMMnq7Gl3LaLJFMDwiqA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB_0R-W52fv-w7AvQt46-bSPPtgqPM9DcPshtiryRQPYsP3w7TL3hLP2SNxWIC-km6T_rUmqN8i33rik2GeERBlCr-w0qtKf8d1q73rdHetJRzR1-zMrNfvsCRyWy65xWZFCZ1vQZM5A95bx4_rg3mKnkA2ZKBLIgwPH0qkhYJY2Ci-Jq0nZ6zq-fW_m48OkmAggXq5AEfJfsot9XEV7JqpXr4ps86RZaJAM5ErdJ7eewFrZpp3dSnpf0ZfmuTvCiP9mHZRAv4wrg',
  'The Gates Cambridge Scholarship program was established in October 2000 by a donation of US$210m from the Bill and Melinda Gates Foundation to the University of Cambridge. Each year Gates Cambridge offers approximately 80 full-cost scholarships to outstanding applicants from countries outside the UK to pursue a full-time postgraduate degree in any subject available at the University of Cambridge.',
  'Full Funding', '80 Awards', 'Oct 11, 2024', 'High', '0.3%', false
WHERE NOT EXISTS (SELECT 1 FROM scholarships WHERE name = 'Gates Cambridge Scholarship');

-- Fund the child rows off the seeded scholarship id
WITH s AS (
  SELECT id FROM scholarships WHERE name = 'Gates Cambridge Scholarship' LIMIT 1
)
INSERT INTO funding_items (scholarship_id, label, coverage, percent, sort_order)
SELECT s.id, x.label, x.coverage, x.percent, x.ordinality
FROM s
JOIN (VALUES
  ('University Composition Fee', '100% Covered', 100, 0),
  ('Maintenance Allowance (£18,744/yr)', 'Fully Funded', 100, 1),
  ('Airfare & Travel Costs', 'Included', 100, 2)
) AS x(label, coverage, percent, ordinality) ON true
WHERE NOT EXISTS (SELECT 1 FROM funding_items WHERE scholarship_id = s.id);

WITH s AS (
  SELECT id FROM scholarships WHERE name = 'Gates Cambridge Scholarship' LIMIT 1
)
INSERT INTO timeline_steps (scholarship_id, step_number, label, date_label, status, icon, description, sort_order)
SELECT s.id, x.step_number, x.label, x.date_label, x.status, x.icon, x.description, x.ordinality
FROM s
JOIN (VALUES
  (1, 'Prepare Materials', 'Current', 'current', 'edit_document', 'Update CV, prepare your 500-word Gates statement, and identify three referees.', 0),
  (2, 'Application Submission', 'Oct 2024', 'upcoming', 'send', 'Submit the common application for admission to the University of Cambridge.', 1),
  (3, 'Interview Selection', 'Feb 2025', 'upcoming', 'groups', 'Shortlisted candidates are invited for high-intensity panel interviews.', 2)
) AS x(step_number, label, date_label, status, icon, description, ordinality) ON true
WHERE NOT EXISTS (SELECT 1 FROM timeline_steps WHERE scholarship_id = s.id);

WITH s AS (
  SELECT id FROM scholarships WHERE name = 'Gates Cambridge Scholarship' LIMIT 1
)
INSERT INTO eligibility_items (scholarship_id, label, status, detail, icon, sort_order)
SELECT s.id, x.label, x.status, x.detail, x.icon, x.ordinality
FROM s
JOIN (VALUES
  ('GPA (3.8+ Required)', 'qualified', 'You: 3.92 (Qualified)', 'check_circle', 0),
  ('English Proficiency', 'qualified', 'IELTS 8.5 (Verified)', 'check_circle', 1),
  ('Reference Letters', 'missing', 'Missing: 3 Academic References', 'warning', 2),
  ('Citizenship Status', 'pending', 'Requires review of passports', 'pending', 3)
) AS x(label, status, detail, icon, ordinality) ON true
WHERE NOT EXISTS (SELECT 1 FROM eligibility_items WHERE scholarship_id = s.id);

WITH s AS (
  SELECT id FROM scholarships WHERE name = 'Gates Cambridge Scholarship' LIMIT 1
)
INSERT INTO ai_tips (scholarship_id, title, body, sort_order)
SELECT s.id, x.title, x.body, x.ordinality
FROM s
JOIN (VALUES
  ('Community Service', 'Highlight your volunteer work specifically in the Gates 500-word statement. They prioritize "leadership and commitment to improving the lives of others."', 0),
  ('Professor Alignment', 'Mention Dr. Sarah Thompson''s recent paper on sustainable urbanism—it aligns perfectly with your thesis proposal.', 1)
) AS x(title, body, ordinality) ON true
WHERE NOT EXISTS (SELECT 1 FROM ai_tips WHERE scholarship_id = s.id);
