-- Migrate existing scholarships table from old schema to new schema
-- Run this in Supabase SQL Editor

-- 1. Add new columns
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS university text;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS degree text;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS funding text DEFAULT 'Not specified';
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS requirements text;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS official_link text;

-- 2. Populate new columns from old data
UPDATE scholarships SET
  university = provider,
  degree = education_level,
  requirements = eligibility_criteria,
  official_link = application_url,
  funding = CASE
    WHEN amount_type = 'full' THEN 'Full funding'
    WHEN amount_type = 'stipend' THEN 'Stipend'
    WHEN amount IS NOT NULL THEN '$' || amount::text
    ELSE 'Not specified'
  END;

-- 3. Make required columns NOT NULL after populating
ALTER TABLE scholarships ALTER COLUMN university SET NOT NULL;
ALTER TABLE scholarships ALTER COLUMN funding SET NOT NULL;
ALTER TABLE scholarships ALTER COLUMN official_link SET NOT NULL;

-- 4. Drop old columns
ALTER TABLE scholarships DROP COLUMN IF EXISTS amount;
ALTER TABLE scholarships DROP COLUMN IF EXISTS amount_type;
ALTER TABLE scholarships DROP COLUMN IF EXISTS provider;
ALTER TABLE scholarships DROP COLUMN IF EXISTS field_of_study;
ALTER TABLE scholarships DROP COLUMN IF EXISTS education_level;
ALTER TABLE scholarships DROP COLUMN IF EXISTS min_gpa;
ALTER TABLE scholarships DROP COLUMN IF EXISTS tags;
ALTER TABLE scholarships DROP COLUMN IF EXISTS eligibility_criteria;
ALTER TABLE scholarships DROP COLUMN IF EXISTS application_url;
