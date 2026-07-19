import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifySessionValue } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Lets the client decide whether to show admin controls without making the
 * events pages themselves dynamic — they stay prerendered for everyone.
 */
export async function GET() {
  const store = await cookies();
  const admin = verifySessionValue(store.get(ADMIN_COOKIE)?.value);

  return Response.json(
    { admin },
    { headers: { 'cache-control': 'no-store' } },
  );
}
