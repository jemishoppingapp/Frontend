/**
 * JWT sign/verify using jose.
 *
 * Why jose, not jsonwebtoken: jose is built on Web Crypto APIs and runs
 * in the Edge runtime (middleware.ts). jsonwebtoken depends on Node's
 * `crypto` module and would force middleware into the Node runtime,
 * which is slower and has higher cold-start cost.
 *
 * Token shape:
 *   { sub: userId, email, role }
 * Signed HS256, 7-day expiry. No refresh tokens — when the cookie
 * expires the user logs in again.
 */
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export interface JemiTokenPayload extends JWTPayload {
  sub: string;        // user._id as string
  email: string;
  role: 'buyer' | 'admin';
}

// Resolve the secret lazily so missing env doesn't crash the build
// (Next.js evaluates module top-level during `next build` even for
// routes that will never run statically).
function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not defined in environment variables.');
  return new TextEncoder().encode(s);
}

export async function signToken(payload: Omit<JemiTokenPayload, 'iat' | 'exp'>): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JemiTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ['HS256'],
    });
    // Narrow & validate the shape we care about.
    if (
      typeof payload.sub === 'string' &&
      typeof payload.email === 'string' &&
      (payload.role === 'buyer' || payload.role === 'admin')
    ) {
      return payload as JemiTokenPayload;
    }
    return null;
  } catch {
    // expired, malformed, bad signature, etc.
    return null;
  }
}