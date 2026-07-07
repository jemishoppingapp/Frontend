import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Optimizer ON: Cloudinary photos get resized + served as WebP/AVIF.
    // Matters a lot on 3G phones.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Old seed products (hidden from buyers) still reference this host
      // and can render inside the admin product list. Keep until those
      // rows are deleted for good.
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // No site may embed JEMI in an iframe (clickjacking).
          { key: 'X-Frame-Options', value: 'DENY' },
          // Browsers must not second-guess content types.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Don't leak full URLs to other sites.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // JEMI never needs these device APIs.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // NOTE: a full Content-Security-Policy is deferred on purpose —
          // a strict CSP can break Paystack's inline checkout. Add it
          // together with the Paystack live switch.
        ],
      },
    ];
  },
};

export default nextConfig;