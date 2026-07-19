/*
# Restructure schema to match final spec

## Overview
Renames and adds columns across `profiles` and `scholarships` to align with the
requested data model. No data is lost — columns are renamed in-place (data
preserved) and new columns are added with backfills where possible.

## Changes by table

### profiles
- `education_level` renamed to `degree` (text, preserved)
- `field_of_study` renamed to `major` (text, preserved)
- `gpa` renamed to `cgpa` (numeric, preserved; old 0–4 check dropped, new 0–10 check added)
- New column: `preferred_country` (text, nullable)
- Old columns `avatar_url`, `bio`, `institution`, `updated_at` remain but are
  no longer used by the frontend (left in place to avoid data loss).
- Updated `handle_new_user` trigger to only insert `full_name` (no avatar_url).

### scholarships
- `provider` renamed to `university` (text, preserved)
- `education_level` renamed to `degree` (text, preserved)
- `eligibility_criteria` renamed to `requirements` (text, preserved)
- `application_url` renamed to `official_link` (text, preserved)
- New column: `funding` (text, NOT NULL, default 'Not specified')
  - Backfilled from existing `amount` + `amount_type` columns
- New unique constraint on `title` (enables ON CONFLICT re-seed)
- Old columns `amount`, `amount_type`, `field_of_study`, `min_gpa`, `tags`
  remain but are no longer used by the frontend.
- Re-seeded all 12 scholarships via ON CONFLICT (title) DO UPDATE to populate
  `funding` with clean text values.

### saved_scholarships
- No changes (already matches spec: user_id, scholarship_id).

### applications
- No changes needed (user_id, scholarship_id, status, notes, created_at
  already present). Old columns `progress`, `submitted_at`, `updated_at`
  remain but are unused.

## Security
- RLS policies unchanged — all existing owner-scoped policies remain in force.
- No new policies needed.

## Notes
1. All renames use DO $$ blocks to check column existence first (idempotent).
2. `cgpa` CHECK constraint relaxed to 0–10 to accommodate international scales.
3. Unique constraint on scholarships.title enables clean re-seeding.
4. This migration is safe to re-run.
*/

-- ============================================================
-- profiles: rename columns + add preferred_country + cgpa constraint
-- ============================================================
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'education_level'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN education_level TO degree;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'field_of_study'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN field_of_study TO major;
  END IF;
END $$;

-- Drop old gpa check before renaming, then rename and add new check
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_gpa_check;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'gpa'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN gpa TO cgpa;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_cgpa_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_cgpa_check
      CHECK (cgpa IS NULL OR (cgpa >= 0 AND cgpa <= 10));
  END IF;
END $$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_country text;

-- ============================================================
-- scholarships: rename columns + add funding + backfill
-- ============================================================
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scholarships' AND column_name = 'provider'
  ) THEN
    ALTER TABLE scholarships RENAME COLUMN provider TO university;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scholarships' AND column_name = 'education_level'
  ) THEN
    ALTER TABLE scholarships RENAME COLUMN education_level TO degree;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scholarships' AND column_name = 'eligibility_criteria'
  ) THEN
    ALTER TABLE scholarships RENAME COLUMN eligibility_criteria TO requirements;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scholarships' AND column_name = 'application_url'
  ) THEN
    ALTER TABLE scholarships RENAME COLUMN application_url TO official_link;
  END IF;
END $$;

ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS funding text NOT NULL DEFAULT 'Not specified';

-- Backfill funding from amount + amount_type for any existing rows
UPDATE scholarships
SET funding = CASE
  WHEN amount_type = 'full' THEN 'Full tuition'
  WHEN amount_type = 'stipend' THEN '$' || amount::text || ' stipend'
  WHEN amount_type = 'partial' THEN 'Up to $' || amount::text
  ELSE '$' || amount::text
END
WHERE funding = 'Not specified' AND amount IS NOT NULL;

-- Unique constraint on title for clean re-seeding
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'scholarships_title_key'
  ) THEN
    ALTER TABLE scholarships ADD CONSTRAINT scholarships_title_key UNIQUE (title);
  END IF;
END $$;

-- ============================================================
-- Re-seed scholarships with clean funding values
-- ============================================================
INSERT INTO scholarships (title, university, description, funding, deadline, country, degree, requirements, official_link) VALUES
('Future Leaders Merit Scholarship', 'National Scholars Foundation', 'A prestigious merit-based award recognizing undergraduate students who demonstrate exceptional academic achievement and leadership potential.', '$15,000', '2026-03-15', 'United States', 'Undergraduate', 'US citizen or permanent resident; enrolled full-time at an accredited US institution; minimum 3.5 GPA; demonstrated leadership.', 'https://example.com/apply/future-leaders'),
('Women in STEM Excellence Award', 'TechForward Foundation', 'Empowering women pursuing degrees in science, technology, engineering, or mathematics with funding and mentorship.', '$12,000', '2026-04-30', 'United States', 'Undergraduate', 'Identify as a woman; enrolled in an accredited STEM program; minimum 3.2 GPA; US-based institution.', 'https://example.com/apply/women-stem'),
('Global Innovators Graduate Fellowship', 'World Education Trust', 'A competitive fellowship for international graduate students conducting research with real-world impact.', '$25,000', '2026-02-28', 'International', 'Graduate', 'Enrolled in a graduate program; research proposal required; open to international students studying anywhere.', 'https://example.com/apply/global-innovators'),
('Community Changemaker Grant', 'Local Impact Fund', 'Supporting students who lead meaningful community service initiatives while pursuing their education.', '$5,000', '2026-05-20', 'United States', 'Undergraduate', 'Documented community service history; enrolled or accepted at an accredited institution; personal statement required.', 'https://example.com/apply/changemaker'),
('Excellence in Computer Science Award', 'CodeTheFuture Inc.', 'Recognizing outstanding computer science students with a passion for building software that matters.', '$10,000', '2026-06-10', 'United States', 'Undergraduate', 'CS or related major; portfolio of projects; enrolled full-time; US institution.', 'https://example.com/apply/cs-excellence'),
('First-Generation Achievement Scholarship', 'Pathway Scholars', 'Dedicated to students who are the first in their family to attend college, easing the financial path to a degree.', '$8,000', '2026-03-30', 'United States', 'Undergraduate', 'First-generation college student; US resident; enrolled or accepted at an accredited institution.', 'https://example.com/apply/first-gen'),
('Healthcare Heroes Scholarship', 'MedCare Foundation', 'For students committed to a career in healthcare, nursing, or public health.', '$18,000', '2026-07-15', 'United States', 'Graduate', 'Enrolled in a healthcare-related program; intent to practice in the US; two recommendation letters.', 'https://example.com/apply/healthcare-heroes'),
('International Student Excellence Award', 'Global Reach Education', 'Helping outstanding international students fund their US education.', '$20,000', '2026-04-15', 'United States', 'Undergraduate', 'Holds a valid international student visa; enrolled full-time at a US institution; minimum 3.5 GPA.', 'https://example.com/apply/intl-excellence'),
('Creative Arts Visionary Grant', 'Artistic Futures', 'Funding for students in visual arts, design, music, and performing arts to develop a portfolio project.', '$7,000', '2026-05-05', 'United States', 'Undergraduate', 'Arts major; portfolio submission required; enrolled at an accredited institution.', 'https://example.com/apply/arts-visionary'),
('Veterans Education Support Fund', 'Honor Foundation', 'Honoring military veterans and active-duty service members pursuing higher education.', '$14,000', '2026-08-01', 'United States', 'Undergraduate', 'Veteran or active-duty service member; enrolled or accepted at an accredited US institution.', 'https://example.com/apply/veterans-fund'),
('Data Science Pioneers Fellowship', 'DataMinds Lab', 'A fellowship for graduate students pushing the boundaries of data science and machine learning research.', '$22,000 stipend', '2026-06-25', 'United States', 'Graduate', 'Enrolled in a data science / ML graduate program; research statement; faculty endorsement.', 'https://example.com/apply/data-pioneers'),
('Sustainability & Climate Action Scholarship', 'Green Future Trust', 'For students whose studies or projects advance environmental sustainability and climate solutions.', '$9,000', '2026-04-22', 'International', 'Undergraduate', 'Enrolled in a sustainability-related program or with a relevant project; open to international applicants.', 'https://example.com/apply/climate-action')
ON CONFLICT (title) DO UPDATE SET
  university = EXCLUDED.university,
  description = EXCLUDED.description,
  funding = EXCLUDED.funding,
  deadline = EXCLUDED.deadline,
  country = EXCLUDED.country,
  degree = EXCLUDED.degree,
  requirements = EXCLUDED.requirements,
  official_link = EXCLUDED.official_link;

-- ============================================================
-- Update handle_new_user trigger (no more avatar_url)
-- ============================================================
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
