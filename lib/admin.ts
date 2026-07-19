import { supabaseAdmin } from '@/lib/supabase-admin';

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email || adminEmails.length === 0) return false;
  return adminEmails.includes(email.toLowerCase());
}

export async function verifyAdminAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Missing authorization header' };
  }

  const token = authHeader.slice(7);
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: 'Invalid or expired token' };
  }

  if (!isAdminEmail(user.email)) {
    return { user, error: 'Not authorized as admin' };
  }

  return { user, error: null };
}
