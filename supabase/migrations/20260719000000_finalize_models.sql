/*
# Final ScholarPilot schema alignment

This migration adds the requested production models for Supabase and secures
all user-owned tables with Row Level Security. It is idempotent: it uses
IF NOT EXISTS and DO blocks so it can be applied safely on top of the
existing migration history.
*/

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  country text,
  degree text,
  major text,
  cgpa numeric(4,2) CHECK (cgpa IS NULL OR (cgpa >= 0 AND cgpa <= 10)),
  preferred_country text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_own_profile ON profiles;
CREATE POLICY select_own_profile
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS update_own_profile ON profiles;
CREATE POLICY update_own_profile
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- scholarships
-- ============================================================
CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  university text NOT NULL,
  country text NOT NULL,
  degree text,
  funding text NOT NULL DEFAULT 'Not specified',
  deadline date NOT NULL,
  description text NOT NULL,
  requirements text,
  official_link text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS read_scholarships ON scholarships;
CREATE POLICY read_scholarships
  ON scholarships FOR SELECT TO anon, authenticated
  USING (true);

-- ============================================================
-- saved_scholarships
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, scholarship_id)
);

ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_own_saved ON saved_scholarships;
CREATE POLICY select_own_saved
  ON saved_scholarships FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS insert_own_saved ON saved_scholarships;
CREATE POLICY insert_own_saved
  ON saved_scholarships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS delete_own_saved ON saved_scholarships;
CREATE POLICY delete_own_saved
  ON saved_scholarships FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- applications
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','researching','drafting','submitted','awarded','rejected')),
  progress int NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, scholarship_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_own_applications ON applications;
CREATE POLICY select_own_applications
  ON applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS insert_own_applications ON applications;
CREATE POLICY insert_own_applications
  ON applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS update_own_applications ON applications;
CREATE POLICY update_own_applications
  ON applications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS delete_own_applications ON applications;
CREATE POLICY delete_own_applications
  ON applications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- trigger helpers
-- ============================================================
DROP TRIGGER IF EXISTS touch_applications_updated_at ON applications;
DROP FUNCTION IF EXISTS touch_applications_updated_at CASCADE;
CREATE OR REPLACE FUNCTION touch_applications_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER touch_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION touch_applications_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
