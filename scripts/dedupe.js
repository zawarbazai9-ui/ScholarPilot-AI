require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function dedupe() {
  const { data } = await supabase.from('scholarships').select('id, title').order('created_at', { ascending: true });
  
  const seen = new Set();
  const toDelete = [];
  for (const row of data) {
    if (seen.has(row.title)) {
      toDelete.push(row.id);
    } else {
      seen.add(row.title);
    }
  }
  
  console.log('Duplicates to delete:', toDelete.length);
  for (const id of toDelete) {
    const { error } = await supabase.from('scholarships').delete().eq('id', id);
    if (error) console.log('Error deleting', id, error.message);
  }
  
  const { count } = await supabase.from('scholarships').select('*', { count: 'exact', head: true });
  console.log('Final count:', count);
}

dedupe();
