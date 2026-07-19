const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://hwzsohenfaiehxebstwx.supabase.co',
  'REDACTED_SERVICE_ROLE_KEY'
);

async function sql(query) {
  const { data, error } = await s.rpc('exec_sql', { query });
  if (error) {
    console.error('SQL ERROR:', error.message, '\nQuery:', query);
    throw error;
  }
  return data;
}

(async () => {
  console.log('1. Adding missing columns...');

  await sql(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS degree text`);
  console.log('  + degree');

  await sql(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS major text`);
  console.log('  + major');

  await sql(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cgpa numeric`);
  console.log('  + cgpa');

  await sql(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_country text`);
  console.log('  + preferred_country');

  console.log('\n2. Migrating data from old columns to new...');

  await sql(`UPDATE profiles SET degree = education_level WHERE degree IS NULL AND education_level IS NOT NULL`);
  console.log('  education_level -> degree');

  await sql(`UPDATE profiles SET major = field_of_study WHERE major IS NULL AND field_of_study IS NOT NULL`);
  console.log('  field_of_study -> major');

  await sql(`UPDATE profiles SET cgpa = gpa WHERE cgpa IS NULL AND gpa IS NOT NULL`);
  console.log('  gpa -> cgpa');

  console.log('\n3. Creating profiles for users without one...');

  await sql(`INSERT INTO profiles (id, full_name, degree, major, cgpa, country, preferred_country)
    SELECT u.id,
      COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
      NULL, NULL, NULL, NULL, NULL
    FROM auth.users u
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)
    ON CONFLICT (id) DO NOTHING`);
  console.log('  Created missing profiles');

  console.log('\n4. Adding RLS policies...');

  // Insert own profile
  await sql(`DROP POLICY IF EXISTS insert_own_profile ON profiles`);
  await sql(`CREATE POLICY insert_own_profile ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id)`);
  console.log('  + INSERT policy');

  // Update own profile
  await sql(`DROP POLICY IF EXISTS update_own_profile ON profiles`);
  await sql(`CREATE POLICY update_own_profile ON profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`);
  console.log('  + UPDATE policy');

  // Select own profile
  await sql(`DROP POLICY IF EXISTS select_own_profile ON profiles`);
  await sql(`CREATE POLICY select_own_profile ON profiles
    FOR SELECT USING (auth.uid() = id)`);
  console.log('  + SELECT policy');

  console.log('\n5. Verifying...');

  const r = await s.rpc('exec_sql_text', {
    q: `SELECT string_agg(column_name || ' ' || data_type, ', ' ORDER BY ordinal_position) FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public'`
  });
  console.log('  Columns:', r.data);

  const r2 = await s.rpc('exec_sql_text', {
    q: `SELECT string_agg(policyname || ' (' || cmd || ')', ', ') FROM pg_policies WHERE tablename = 'profiles'`
  });
  console.log('  Policies:', r2.data);

  const { data: profiles } = await s.from('profiles').select('id, full_name, degree, major, cgpa');
  console.log('  Profile count:', profiles?.length);
  if (profiles?.length) {
    profiles.forEach(p => console.log(`    ${p.id}: ${p.full_name} | degree=${p.degree} major=${p.major} cgpa=${p.cgpa}`));
  }

  console.log('\nDone!');
})();
