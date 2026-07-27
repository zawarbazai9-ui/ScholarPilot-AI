require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  // Get handle_new_user function source
  const r = await s.rpc('exec_sql_text', {
    q: `SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'handle_new_user'`
  });
  console.log('=== handle_new_user ===');
  console.log(r.data);

  // Get all policies on profiles
  const r2 = await s.rpc('exec_sql_text', {
    q: `SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'profiles'`
  });
  console.log('\n=== All policies ===');
  console.log(r2.data);

  // Check if there are existing profiles
  const r3 = await s.rpc('exec_sql_text', {
    q: `SELECT count(*)::text FROM profiles`
  });
  console.log('\n=== Profile count ===');
  console.log(r3.data);

  // Check existing profile data
  const r4 = await s.rpc('exec_sql_text', {
    q: `SELECT id::text, full_name, education_level, field_of_study, gpa, country, institution FROM profiles LIMIT 5`
  });
  console.log('\n=== Existing profiles ===');
  console.log(r4.data);
})();
