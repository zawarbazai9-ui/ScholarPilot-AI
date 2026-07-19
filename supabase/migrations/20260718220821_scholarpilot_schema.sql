/*
# ScholarPilot AI — Core schema

## Overview
Creates the foundational tables for ScholarPilot AI: user profiles, a catalog
of scholarships, saved scholarships (bookmarks), and application tracking.
All user-owned tables are scoped to the authenticated owner via RLS.

## New Tables
1. `profiles` — one row per auth user. Extended academic context used by the
   AI eligibility engine. Linked 1:1 to `auth.users`.
   - id (uuid, PK, references auth.users, ON DELETE CASCADE)
   - full_name, avatar_url, bio (text)
   - education_level, field_of_study, country, institution (text)
   - gpa (numeric, 0–4 scale, nullable)
   - created_at, updated_at (timestamptz)

2. `scholarships` — public catalog of scholarship opportunities. Readable by
   anon + authenticated so the landing/marketing surfaces can show examples.
   - id (uuid, PK)
   - title, provider, description (text)
   - amount (numeric), amount_type (text: 'fixed' | 'full' | 'partial' | 'stipend')
   - deadline (date), country (text)
   - field_of_study, education_level (text, nullable)
   - min_gpa (numeric, nullable)
   - eligibility_criteria (text, nullable)
   - application_url (text)
   - tags (text[], nullable)
   - created_at (timestamptz)

3. `saved_scholarships` — bookmarks owned by a user.
   - id (uuid, PK)
   - user_id (uuid, NOT NULL, DEFAULT auth.uid(), references auth.users CASCADE)
   - scholarship_id (uuid, references scholarships CASCADE)
   - created_at (timestamptz)
   - UNIQUE(user_id, scholarship_id) — one save per scholarship per user

4. `applications` — tracked applications owned by a user.
   - id (uuid, PK)
   - user_id (uuid, NOT NULL, DEFAULT auth.uid(), references auth.users CASCADE)
   - scholarship_id (uuid, references scholarships CASCADE)
   - status (text, default 'not_started')
   - progress (int, 0–100, default 0)
   - notes (text, nullable)
   - submitted_at (timestamptz, nullable)
   - created_at, updated_at (timestamptz)
   - UNIQUE(user_id, scholarship_id)

## Triggers
- `handle_new_user` — on insert into auth.users, create a matching `profiles`
  row so every signed-up user has a profile without the client needing to
  insert one. Full name is pulled from the OAuth/sign-up metadata.
- `touch_updated_at` — keep `applications.updated_at` fresh on UPDATE.

## Security (RLS)
- `profiles`: authenticated users read/update ONLY their own row. No inserts
  through the client (the trigger owns creation).
- `scholarships`: public read for anon + authenticated (catalog). Writes are
  NOT exposed to the client — managed server-side. (No INSERT/UPDATE/DELETE
  policies = only the service role can mutate, which is what we want.)
- `saved_scholarships`: full owner-scoped CRUD (select/insert/update/delete),
  scoped via auth.uid() = user_id. user_id defaults to auth.uid() so client
  inserts omitting user_id still satisfy WITH CHECK.
- `applications`: full owner-scoped CRUD, same pattern.

## Notes
1. `user_id` columns default to `auth.uid()` so `.insert({ scholarship_id })`
   works from the client without threading the owner id manually.
2. Scholarship catalog is read-only from the anon-key client by design.
3. This migration is idempotent — safe to re-apply.
*/

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  bio text,
  education_level text,
  field_of_study text,
  gpa numeric(3,2) CHECK (gpa >= 0 AND gpa <= 4),
  country text,
  institution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- scholarships (public catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  provider text NOT NULL,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  amount_type text NOT NULL DEFAULT 'fixed' CHECK (amount_type IN ('fixed','full','partial','stipend')),
  deadline date NOT NULL,
  country text NOT NULL DEFAULT 'United States',
  field_of_study text,
  education_level text,
  min_gpa numeric(3,2) CHECK (min_gpa IS NULL OR (min_gpa >= 0 AND min_gpa <= 4)),
  eligibility_criteria text,
  application_url text NOT NULL,
  tags text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scholarships_deadline_idx ON scholarships(deadline);
CREATE INDEX IF NOT EXISTS scholarships_country_idx ON scholarships(country);
CREATE INDEX IF NOT EXISTS scholarships_field_idx ON scholarships(field_of_study);

ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_scholarships" ON scholarships;
CREATE POLICY "read_scholarships"
  ON scholarships FOR SELECT TO anon, authenticated
  USING (true);

-- ============================================================
-- saved_scholarships (user bookmarks)
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, scholarship_id)
);

CREATE INDEX IF NOT EXISTS saved_scholarships_user_idx ON saved_scholarships(user_id);

ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved" ON saved_scholarships;
CREATE POLICY "select_own_saved"
  ON saved_scholarships FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saved" ON saved_scholarships;
CREATE POLICY "insert_own_saved"
  ON saved_scholarships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saved" ON saved_scholarships;
CREATE POLICY "delete_own_saved"
  ON saved_scholarships FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- applications (tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','researching','drafting','submitted','awarded','rejected')),
  progress int NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes text,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, scholarship_id)
);

CREATE INDEX IF NOT EXISTS applications_user_idx ON applications(user_id);
CREATE INDEX IF NOT EXISTS applications_status_idx ON applications(status);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications"
  ON applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications"
  ON applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications"
  ON applications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_applications" ON applications;
CREATE POLICY "delete_own_applications"
  ON applications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- updated_at trigger for applications
-- ============================================================
DROP TRIGGER IF EXISTS touch_applications_updated_at ON applications;
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER touch_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
