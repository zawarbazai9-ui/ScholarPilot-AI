require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function sql(q) {
  const { error } = await s.rpc('exec_sql', { query: q });
  if (error) { console.error('ERR:', error.message); throw error; }
}

(async () => {
  console.log('Adding columns...');
  await sql(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university text`);
  console.log('  + university');
  await sql(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS research_experience text`);
  console.log('  + research_experience');
  await sql(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ielts numeric`);
  console.log('  + ielts');
  await sql(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gre numeric`);
  console.log('  + gre');
  await sql(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_countries text[]`);
  console.log('  + preferred_countries (text[])');
  await sql(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS budget text`);
  console.log('  + budget');

  // Migrate preferred_country (single) to preferred_countries (array)
  await sql(`UPDATE profiles SET preferred_countries = ARRAY[preferred_country] WHERE preferred_country IS NOT NULL AND preferred_countries IS NULL`);
  console.log('  Migrated preferred_country -> preferred_countries');

  // Verify
  const r = await s.rpc('exec_sql_text', {
    q: `SELECT string_agg(column_name || ' ' || data_type, ', ' ORDER BY ordinal_position) FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public'`
  });
  console.log('\nColumns:', r.data);
})();
