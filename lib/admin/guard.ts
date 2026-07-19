import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifySessionValue } from '@/lib/session';

/**
 * Not a 'use server' file: every top-level export from a 'use server' module becomes a
 * public Server Action, so this shared check lives separately from lib/admin/actions.ts
 * and lib/admin/posts.ts rather than being exported alongside them.
 */
export async function requireSession(): Promise<void> {
  const store = await cookies();
  if (!verifySessionValue(store.get(ADMIN_COOKIE)?.value)) {
    throw new Error('Unauthorized');
  }
  if (process.env.USE_SUPABASE !== 'true') {
    throw new Error('Supabase is not enabled. Set USE_SUPABASE=true to manage content.');
  }
}
