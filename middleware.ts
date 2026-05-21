/**
 * Edge-runtime middleware. Verifies the auth cookie on protected routes
 * and redirects to /login otherwise.
 *
 * Runs on every request matched by the `matcher` config below — keep
 * the matcher tight to avoid running on static assets, _next, etc.
 *
 * Note: this is a coarse gate. Individual pages/route handlers still
 * call requireAuth() for fine-grained checks (e.g. requireAdmin).
 * Middleware existing just stops unauthenticated users from even seeing
 * the page-loading flash before the redirect.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { AUTH_COOKIE_NAME } from '@/lib/cookies';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = req.nextUrl;

  // Verify token if present. Invalid tokens get treated the same as no token.
  const payload = token ? await verifyToken(token) : null;

  // --- Admin gate (excludes /admin/login itself, so we don't loop) ---
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!payload || payload.role !== 'admin') {
      const url = new URL('/admin/login', req.url);
      return NextResponse.redirect(url);
    }
  }

  // --- Buyer-protected routes ---
  const protectedBuyerPaths = ['/checkout', '/orders', '/profile'];
  const isProtected = protectedBuyerPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  if (isProtected && !payload) {
    const url = new URL('/login', req.url);
    url.searchParams.set('from', pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Match only the routes we care about. Avoid running on _next assets,
  // public files, favicon, etc.
  matcher: [
    '/admin/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/profile/:path*',
  ],
};