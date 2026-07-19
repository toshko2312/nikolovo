import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE = 'nikolovo-admin';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Cookie value is `<expiry>.<signature>`. ADMIN_API_TOKEN doubles as the signing key —
 * it is already a high-entropy server-only secret, so the session needs no extra env var.
 * Without the key the signature cannot be forged, so a tampered cookie never verifies.
 */
function sign(payload: string, key: string): string {
  return createHmac('sha256', key).update(payload).digest('hex');
}

function signingKey(): string | null {
  return process.env.ADMIN_API_TOKEN || null;
}

export function createSessionValue(now = Date.now()): string | null {
  const key = signingKey();
  if (!key) return null;

  const expiry = String(now + SESSION_MAX_AGE_SECONDS * 1000);
  return `${expiry}.${sign(expiry, key)}`;
}

export function verifySessionValue(value: string | undefined, now = Date.now()): boolean {
  const key = signingKey();
  if (!key || !value) return false;

  const separator = value.lastIndexOf('.');
  if (separator < 1) return false;

  const expiry = value.slice(0, separator);
  const signature = value.slice(separator + 1);

  const expiresAt = Number(expiry);
  if (!Number.isFinite(expiresAt) || expiresAt < now) return false;

  const given = Buffer.from(signature, 'hex');
  const want = Buffer.from(sign(expiry, key), 'hex');
  return given.length === want.length && timingSafeEqual(given, want);
}
