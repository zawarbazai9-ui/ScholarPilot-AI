const { createClient } = require('@supabase/supabase-js');
const url = 'https://hwzsohenfaiehxebstwx.supabase.co';
const key = 'REDACTED_SERVICE_ROLE_KEY';
const supabase = createClient(url, key);

async function fix() {
  const { data, error } = await supabase.from('scholarships').select('id, title, funding');
  if (error) { console.log('Error:', error.message); return; }

  const total = data.length;
  const bad = data.filter(r => r.funding === 'Not specified' || r.funding.startsWith(','));
  console.log('Total rows:', total, 'need fixing:', bad.length);

  const fixes = {
    'Future Leaders Merit Scholarship': '$15,000',
    'Women in STEM Excellence Award': '$12,000',
    'Global Innovators Graduate Fellowship': '$25,000',
    'Community Changemaker Grant': '$5,000',
    'Excellence in Computer Science Award': '$10,000',
    'First-Generation Achievement Scholarship': '$8,000',
    'Healthcare Heroes Scholarship': '$18,000',
    'International Student Excellence Award': '$20,000',
    'Creative Arts Visionary Grant': '$7,000',
    'Veterans Education Support Fund': '$14,000',
    'Data Science Pioneers Fellowship': '$22,000 stipend',
    'Sustainability & Climate Action Scholarship': '$9,000',
  };

  for (const row of bad) {
    const funding = fixes[row.title];
    if (funding) {
      const { error: e } = await supabase.from('scholarships').update({ funding }).eq('id', row.id);
      if (e) console.log('Error updating', row.title, e.message);
      else console.log('Fixed:', row.title, '->', funding);
    }
  }

  // Check final state
  const { data: final } = await supabase.from('scholarships').select('title, funding').order('title');
  console.log('\nFinal state:');
  final.forEach(r => console.log(`  ${r.title}: ${r.funding}`));
}

fix();
