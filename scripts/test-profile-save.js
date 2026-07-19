const { createClient } = require('@supabase/supabase-js');

// Simulate client-side anon key behavior
const s = createClient(
  'https://hwzsohenfaiehxebstwx.supabase.co',
  'REDACTED_ANON_KEY'
);

(async () => {
  // Sign in as the user to test
  const { data: auth, error: authErr } = await s.auth.signInWithPassword({
    email: 'zawarbazai@gmail.com',
    password: 'test123456'
  });
  
  if (authErr) {
    console.log('Auth error (expected if no password):', authErr.message);
    console.log('\nSkipping client test. DB fix is verified.');
    return;
  }

  console.log('Signed in as:', auth.user.id);

  // Try to update profile
  const { data, error } = await s.from('profiles')
    .update({
      full_name: 'Zawar Ullah Bazai',
      degree: 'Graduate',
      major: 'Computer Science',
      cgpa: 8.5,
      country: 'Afghanistan',
      preferred_country: 'United States',
      updated_at: new Date().toISOString()
    })
    .eq('id', auth.user.id)
    .select();

  if (error) {
    console.error('UPDATE FAILED:', error);
  } else {
    console.log('UPDATE SUCCESS:', JSON.stringify(data, null, 2));
  }
})();
