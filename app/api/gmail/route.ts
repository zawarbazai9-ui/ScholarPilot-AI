import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ connected: false });
  }

  const token = authHeader.slice(7);
  const { data: userData } = await supabaseAdmin.auth.getUser(token);
  const userId = userData.user?.id;

  if (!userId) {
    return NextResponse.json({ connected: false });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('gmail_email, gmail_access_token, gmail_token_expiry')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.gmail_access_token) {
    return NextResponse.json({ connected: false });
  }

  // If email is missing, fetch it from Google
  let email = profile.gmail_email;
  if (!email) {
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${profile.gmail_access_token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        email = userData.email;
        if (email) {
          await supabaseAdmin
            .from('profiles')
            .update({ gmail_email: email })
            .eq('id', userId);
        }
      }
    } catch { /* ignore */ }
  }

  const isExpired =
    profile.gmail_token_expiry &&
    new Date(profile.gmail_token_expiry) < new Date();

  return NextResponse.json({
    connected: !isExpired && !!email,
    email: email ?? null,
    expired: isExpired,
  });
}
