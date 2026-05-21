/**
 * Auth cookie helpers. Server-side only (uses next/headers).
 *
 * Cookie name: jm_token (different from Tenderville's tv_token to avoid
 * collisions if both apps are ever hosted on the same domain).
 */
import { cookies } from 'next/headers';

const COOKIE_NAME = 'jm_token';
const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SEVEN_DAYS_SECONDS,
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;