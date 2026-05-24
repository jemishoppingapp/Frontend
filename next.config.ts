import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Skip Next.js image optimizer entirely — placehold.co returns SVG,
    // which has rendering quirks on mobile through the optimizer.
    // Remove this line when you switch to real Cloudinary photos.
    unoptimized: true,

    // Allow SVG from known placeholder/CDN sources (we don't accept
    // user-uploaded SVGs anywhere, so this is safe).
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // next/image will auto-serve WebP/AVIF for these hosts when
    // optimizer is enabled. Currently unused since unoptimized:true above.
    formats: ['image/avif', 'image/webp'],

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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },

  // Don't fail prod build on lint warnings — TS errors will still fail.
  eslint: {
    ignoreDuringBuilds: false,
  },

  // We use route groups like (account), (auth), (public) and force-dynamic
  // on DB-touching routes, so we intentionally avoid static optimization
  // for any user/checkout pages.
  experimental: {
    // Keep server actions on default; we may add typedRoutes later.
  },
};

export default nextConfig;