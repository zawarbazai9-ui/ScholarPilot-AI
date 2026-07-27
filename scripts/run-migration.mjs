import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const sql = readFileSync('supabase/migrations/20260720100000_create_notifications.sql', 'utf8');

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Split by semicolons and execute each statement
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

let success = 0;
let failed = 0;

for (const stmt of statements) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
    if (error) {
      // Try using raw query via REST
      console.log(`Statement may need direct execution: ${stmt.substring(0, 80)}...`);
      failed++;
    } else {
      success++;
    }
  } catch (e) {
    console.error(`Failed: ${stmt.substring(0, 60)}... => ${e.message}`);
    failed++;
  }
}

console.log(`\nResults: ${success} succeeded, ${failed} need manual execution`);
