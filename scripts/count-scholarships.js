require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data } = await s.from('scholarships').select('id, title, degree, country, deadline');
  console.log('Existing scholarships:', data?.length ?? 0);
  data?.forEach(d => console.log(`  ${d.title} | ${d.degree} | ${d.country} | ${d.deadline}`));
})();
