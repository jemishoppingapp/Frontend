/**
 * Session helpers for Server Components and Route Handlers.
 * Postgres + Drizzle version.
 */
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getAuthCookie } from '@/lib/cookies';
import { verifyToken } from '@/lib/auth';
import { db, schema } from '@/db';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'buyer' | 'admin' | 'seller';
  profile_completed: boolean;
  nickname?: string;
  alt_phone?: string;
  address?: string;
  department?: string;
  level?: string;
  avatar?: string;
}

/**
 * Returns the current user or null if not logged in / invalid token /
 * deleted user. Does not redirect.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getAuthCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const rows = await db()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, payload.sub))
    .limit(1);

  const user = rows[0];
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    profile_completed: user.profileCompleted,
    nickname: user.nickname,
    alt_phone: user.altPhone,
    address: user.address,
    department: user.department,
    level: user.level,
    avatar: user.avatar,
  };
}

/**
 * Server-component / server-action guard. Redirects to /login with a
 * `from` param if not authenticated.
 */
export async function requireAuth(fromPath?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    const qs = fromPath ? `?from=${encodeURIComponent(fromPath)}` : '';
    redirect(`/login${qs}`);
  }
  return user;
}

/**
 * Server-component / server-action guard for admin-only pages.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }
  return user;
}