import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
const REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback';

// Use a simpler approach: redirect to the app with tokens in URL fragment
// Actually, we need to use the standard OAuth flow with code exchange

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // userId
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/applications?gmail_error=${error}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/applications?gmail_error=missing_params', request.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[google-callback] Token exchange failed:', tokenData);
      return NextResponse.redirect(
        new URL('/applications?gmail_error=token_exchange_failed', request.url)
      );
    }

    // Get user info to verify
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    // Store tokens in the profiles table
    const { error: dbErr } = await supabaseAdmin
      .from('profiles')
      .update({
        gmail_access_token: tokenData.access_token,
        gmail_refresh_token: tokenData.refresh_token ?? null,
        gmail_token_expiry: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        gmail_email: userData.email ?? null,
      })
      .eq('id', state);

    if (dbErr) {
      console.error('[google-callback] DB update failed:', dbErr.message);
      return NextResponse.redirect(
        new URL('/applications?gmail_error=db_save_failed', request.url)
      );
    }

    return NextResponse.redirect(
      new URL('/applications?gmail_connected=1', request.url)
    );
  } catch (err) {
    console.error('[google-callback] Error:', err);
    return NextResponse.redirect(
      new URL('/applications?gmail_error=unexpected', request.url)
    );
  }
}
