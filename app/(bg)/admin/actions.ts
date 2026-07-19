'use server';

import { timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionValue } from '@/lib/session';

/** Slows down brute-force attempts against the single password. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function matchesPassword(given: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get('password') ?? '');
  const sessionValue = matchesPassword(password) ? createSessionValue() : null;

  if (!sessionValue) {
    await delay(500);
    redirect('/admin?error=1');
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect('/');
}
