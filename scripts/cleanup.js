require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanup() {
  const { data } = await supabase.from('scholarships').select('id, title, official_link');
  const fake = data.filter(r => r.official_link.includes('example.com'));
  console.log('Deleting', fake.length, 'rows with example.com links');
  for (const row of fake) {
    await supabase.from('scholarships').delete().eq('id', row.id);
    console.log('  Deleted:', row.title);
  }
  const { count } = await supabase.from('scholarships').select('*', { count: 'exact', head: true });
  console.log('Final count:', count);
}

cleanup();
