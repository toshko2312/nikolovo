import { timingSafeEqual } from 'node:crypto';

/**
 * Checks the Authorization bearer token against ADMIN_API_TOKEN.
 * Returns null when authorised, or the Response to send back when not.
 */
export function requireAdmin(request: Request): Response | null {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    return Response.json({ error: 'ADMIN_API_TOKEN is not configured' }, { status: 503 });
  }

  const header = request.headers.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const given = Buffer.from(token);
  const want = Buffer.from(expected);
  const ok = given.length === want.length && timingSafeEqual(given, want);
  return ok ? null : Response.json({ error: 'Unauthorized' }, { status: 401 });
}

/** Writes are only meaningful once the data actually lives in Supabase. */
export function requireSupabase(): Response | null {
  if (process.env.USE_SUPABASE === 'true') return null;
  return Response.json(
    { error: 'Supabase is not enabled. Set USE_SUPABASE=true after running the migration.' },
    { status: 503 },
  );
}
