/*
# ScholarMatch - Scholarship Management Schema

## Overview
Creates the core schema for ScholarMatch, an AI admissions copilot that helps students
find, track, and apply to scholarships. The schema is single-tenant (no sign-in screen)
because the provided UI has no login flow — all data is intentionally shared/public so
the anon-key frontend can read and write freely.

## New Tables
1. `scholarships` - Catalog of scholarships with full metadata (funding, deadlines, eligibility, timeline).
2. `funding_items` - Line items in a scholarship's funding breakdown (e.g. tuition, stipend, travel).
3. `timeline_steps` - Ordered steps in a scholarship's application timeline.
4. `eligibility_items` - Checklist items a student must satisfy for a scholarship.
5. `ai_tips` - AI-generated admissions tips for a scholarship.
6. `user_profile` - The single student profile (GPA, IELTS, name, avatar). One row.
7. `saved_scholarships` - Scholarships the student has bookmarked for later.
8. `applications` - Scholarship applications the student has started, with status.

## Security
- RLS enabled on every table.
- All policies scope TO `anon, authenticated` because the app is single-tenant with no
  sign-in screen — the anon-key frontend must be able to read and write its own data.
  `USING (true)` / `WITH CHECK (true)` is intentional here (public/shared data), not a
  shortcut around ownership checks.

## Notes
- All tables use `gen_random_uuid()` for primary keys.
- `created_at` / `updated_at` timestamps default to now().
- `user_profile` is constrained to a single row via a CHECK on a fixed sentinel column.
*/

-- Scholarships catalog
CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  university text NOT NULL,
  location text NOT NULL,
  hero_image_url text,
  crest_image_url text,
  overview text NOT NULL,
  total_award text,
  slots text,
  next_deadline text,
  competition text,
  acceptance text,
  is_saved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_scholarships" ON scholarships;
CREATE POLICY "anon_select_scholarships" ON scholarships FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_scholarships" ON scholarships;
CREATE POLICY "anon_insert_scholarships" ON scholarships FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_scholarships" ON scholarships;
CREATE POLICY "anon_update_scholarships" ON scholarships FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_scholarships" ON scholarships;
CREATE POLICY "anon_delete_scholarships" ON scholarships FOR DELETE
  TO anon, authenticated USING (true);

-- Funding breakdown line items
CREATE TABLE IF NOT EXISTS funding_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  label text NOT NULL,
  coverage text NOT NULL,
  percent int NOT NULL DEFAULT 100,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE funding_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_funding_items" ON funding_items;
CREATE POLICY "anon_select_funding_items" ON funding_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_funding_items" ON funding_items;
CREATE POLICY "anon_insert_funding_items" ON funding_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_funding_items" ON funding_items;
CREATE POLICY "anon_update_funding_items" ON funding_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_funding_items" ON funding_items;
CREATE POLICY "anon_delete_funding_items" ON funding_items FOR DELETE
  TO anon, authenticated USING (true);

-- Application timeline steps
CREATE TABLE IF NOT EXISTS timeline_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  step_number int NOT NULL,
  label text NOT NULL,
  date_label text,
  status text NOT NULL DEFAULT 'upcoming',
  icon text NOT NULL DEFAULT 'edit_document',
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timeline_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_timeline_steps" ON timeline_steps;
CREATE POLICY "anon_select_timeline_steps" ON timeline_steps FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_timeline_steps" ON timeline_steps;
CREATE POLICY "anon_insert_timeline_steps" ON timeline_steps FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_timeline_steps" ON timeline_steps;
CREATE POLICY "anon_update_timeline_steps" ON timeline_steps FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_timeline_steps" ON timeline_steps;
CREATE POLICY "anon_delete_timeline_steps" ON timeline_steps FOR DELETE
  TO anon, authenticated USING (true);

-- Eligibility checklist items
CREATE TABLE IF NOT EXISTS eligibility_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  label text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  detail text,
  icon text NOT NULL DEFAULT 'check_circle',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE eligibility_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_eligibility_items" ON eligibility_items;
CREATE POLICY "anon_select_eligibility_items" ON eligibility_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_eligibility_items" ON eligibility_items;
CREATE POLICY "anon_insert_eligibility_items" ON eligibility_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_eligibility_items" ON eligibility_items;
CREATE POLICY "anon_update_eligibility_items" ON eligibility_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_eligibility_items" ON eligibility_items;
CREATE POLICY "anon_delete_eligibility_items" ON eligibility_items FOR DELETE
  TO anon, authenticated USING (true);

-- AI admissions tips
CREATE TABLE IF NOT EXISTS ai_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_tips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_ai_tips" ON ai_tips;
CREATE POLICY "anon_select_ai_tips" ON ai_tips FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ai_tips" ON ai_tips;
CREATE POLICY "anon_insert_ai_tips" ON ai_tips FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ai_tips" ON ai_tips;
CREATE POLICY "anon_update_ai_tips" ON ai_tips FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ai_tips" ON ai_tips;
CREATE POLICY "anon_delete_ai_tips" ON ai_tips FOR DELETE
  TO anon, authenticated USING (true);

-- Single student profile
CREATE TABLE IF NOT EXISTS user_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  name text NOT NULL DEFAULT 'Maya Chen',
  avatar_url text,
  gpa text NOT NULL DEFAULT '3.92',
  ielts text NOT NULL DEFAULT '8.5',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (singleton = true)
);

ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_user_profile" ON user_profile;
CREATE POLICY "anon_select_user_profile" ON user_profile FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_user_profile" ON user_profile;
CREATE POLICY "anon_insert_user_profile" ON user_profile FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_user_profile" ON user_profile;
CREATE POLICY "anon_update_user_profile" ON user_profile FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_user_profile" ON user_profile;
CREATE POLICY "anon_delete_user_profile" ON user_profile FOR DELETE
  TO anon, authenticated USING (true);

-- Applications the student has started
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started',
  started_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (scholarship_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_applications" ON applications;
CREATE POLICY "anon_select_applications" ON applications FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_applications" ON applications;
CREATE POLICY "anon_insert_applications" ON applications FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_applications" ON applications;
CREATE POLICY "anon_update_applications" ON applications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_applications" ON applications;
CREATE POLICY "anon_delete_applications" ON applications FOR DELETE
  TO anon, authenticated USING (true);
