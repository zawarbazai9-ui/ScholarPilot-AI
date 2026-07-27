require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const steps = [
  'ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS university text',
  'ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS degree text',
  "ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS funding text DEFAULT 'Not specified'",
  'ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS requirements text',
  'ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS official_link text',
  `UPDATE scholarships SET
    university = COALESCE(university, provider),
    degree = COALESCE(degree, education_level),
    requirements = COALESCE(requirements, eligibility_criteria),
    official_link = COALESCE(official_link, application_url),
    funding = COALESCE(funding, CASE
      WHEN amount_type = 'full' THEN 'Full funding'
      WHEN amount_type = 'stipend' THEN 'Stipend'
      WHEN amount IS NOT NULL THEN '$' || amount::text
      ELSE 'Not specified'
    END)
  WHERE university IS NULL OR funding IS NULL OR official_link IS NULL OR degree IS NULL OR requirements IS NULL`,
  'ALTER TABLE scholarships ALTER COLUMN university SET NOT NULL',
  'ALTER TABLE scholarships ALTER COLUMN funding SET NOT NULL',
  'ALTER TABLE scholarships ALTER COLUMN official_link SET NOT NULL',
  'ALTER TABLE scholarships DROP COLUMN IF EXISTS amount',
  'ALTER TABLE scholarships DROP COLUMN IF EXISTS amount_type',
  'ALTER TABLE scholarships DROP COLUMN IF EXISTS provider',
  'ALTER TABLE scholarships DROP COLUMN IF EXISTS field_of_study',
  'ALTER TABLE scholarships DROP COLUMN IF EXISTS education_level',
  'ALTER TABLE scholarships DROP COLUMN IF EXISTS min_gpa',
  'ALTER TABLE scholarships DROP COLUMN IF EXISTS tags',
  'ALTER TABLE scholarships DROP COLUMN IF EXISTS eligibility_criteria',
  'ALTER TABLE scholarships DROP COLUMN IF EXISTS application_url',
];

async function run() {
  for (const sql of steps) {
    const label = sql.substring(0, 60).replace(/\n/g, ' ');
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) {
      console.error('FAIL:', label, '->', error.message);
      return;
    }
    console.log('OK:', label);
  }
  console.log('\nMigration complete!');
}

run();
