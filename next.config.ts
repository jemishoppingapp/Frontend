import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // next/image will auto-serve WebP/AVIF for these hosts.
remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tailwindcss.com',
        pathname: '/plus-assets/img/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
    ],
    // Reasonable for our product cards / hero on 3G phones.
    formats: ['image/avif', 'image/webp'],
  },

  // Don't fail prod build on lint warnings — TS errors will still fail.
  eslint: {
    ignoreDuringBuilds: false,
  },

  // We use route group `(authed)` and force-dynamic on user pages, so we
  // intentionally avoid static optimization for any DB-touching route.
  experimental: {
    // Keep server actions on default; we may add typedRoutes later.
  },
};

export default nextConfig;