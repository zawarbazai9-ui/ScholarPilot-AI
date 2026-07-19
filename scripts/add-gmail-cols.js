const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://hwzsohenfaiehxebstwx.supabase.co',
  'REDACTED_SERVICE_ROLE_KEY'
);

(async () => {
  const { error } = await s.rpc('exec_sql', {
    query: `ALTER TABLE profiles
      ADD COLUMN IF NOT EXISTS gmail_access_token text,
      ADD COLUMN IF NOT EXISTS gmail_refresh_token text,
      ADD COLUMN IF NOT EXISTS gmail_token_expiry timestamptz,
      ADD COLUMN IF NOT EXISTS gmail_email text`,
  });
  if (error) console.error('ERROR:', error.message);
  else console.log('Gmail columns added to profiles table.');
})();
