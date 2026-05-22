import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/cookies';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}