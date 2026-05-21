import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { NetworkStatus } from '@/components/NetworkStatus';
import { ServiceWorkerCleanup } from '@/components/ServiceWorkerCleanup';
import './globals.css';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

/**
 * Build an OG image URL from a Cloudinary logo public_id.
 * Falls back to a 1×1 transparent PNG if Cloudinary isn't configured
 * — we still need an absolute URL or Twitter/OG will silently drop the card.
 */
function buildOgImage(): string {
  if (!CLOUD_NAME) {
    return `${SITE_URL}/jemi.webp`;  // local fallback
  }
  // The logo asset gets uploaded to Cloudinary under jemi/brand/logo
  // (or whatever you choose). Two-stage transform: fit inside 400×400,
  // then pad to 1200×630 white background.
  return (
    `https://res.cloudinary.com/${CLOUD_NAME}/image/upload` +
    `/w_400,h_400,c_fit/w_1200,h_630,c_pad,b_white,f_auto,q_auto/jemi/brand/logo`
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'JEMI — LASU Campus Marketplace',
    template: '%s | JEMI',
  },
  description:
    'Quality products at student-friendly prices. Order online, pick up on campus at LASU.',
  applicationName: 'JEMI',
  keywords: [
    'LASU',
    'Lagos State University',
    'campus marketplace',
    'student shopping',
    'Nigeria',
    'Lagos',
  ],
  authors: [{ name: 'JEMI' }],
  creator: 'JEMI',
  publisher: 'JEMI',
  // Robots & canonical handled by app/robots.ts + per-page metadata.
  openGraph: {
    type: 'website',
    siteName: 'JEMI',
    title: 'JEMI — LASU Campus Marketplace',
    description:
      'Quality products at student-friendly prices. Order online, pick up on campus at LASU.',
    url: SITE_URL,
    locale: 'en_NG',
    images: [
      {
        url: buildOgImage(),
        width: 1200,
        height: 630,
        alt: 'JEMI — LASU Campus Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JEMI — LASU Campus Marketplace',
    description:
      'Quality products at student-friendly prices. Order online, pick up on campus at LASU.',
    images: [buildOgImage()],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  // Don't lock zoom — accessibility. Users may need to pinch-zoom on
  // small product images even if our design is mobile-optimized.
  maximumScale: 5,
  userScalable: true,
};

/**
 * JSON-LD: OnlineStore. The structured data Google uses for richer
 * search results. Per-product schema is added on detail pages
 * (install-4b).
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: 'JEMI',
  url: SITE_URL,
  logo: buildOgImage(),
  description:
    'LASU campus marketplace — quality products at student-friendly prices, with on-campus pickup.',
  areaServed: {
    '@type': 'EducationalOrganization',
    name: 'Lagos State University',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ojo',
      addressRegion: 'Lagos',
      addressCountry: 'NG',
    },
  },
  currenciesAccepted: 'NGN',
  paymentAccepted: 'Cash, Credit Card, Bank Transfer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD must be inside <head>. dangerouslySetInnerHTML is the
            standard pattern here — JSON content is safe to inject as
            long as we build the object ourselves (no user content). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <NetworkStatus />
        {children}
        <ServiceWorkerCleanup />
        <Toaster
          position="top-center"
          richColors
          closeButton
          /* Pull below the safe-area on iOS */
          offset={48}
        />
      </body>
    </html>
  );
}