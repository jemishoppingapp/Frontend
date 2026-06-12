import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { NetworkStatus } from '@/components/NetworkStatus';
import { ServiceWorkerCleanup } from '@/components/ServiceWorkerCleanup';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { inter, bricolage } from '@/lib/fonts';
import './globals.css';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

function buildOgImage(): string {
  if (!CLOUD_NAME) return `${SITE_URL}/jemi.webp`;
  return (
    `https://res.cloudinary.com/${CLOUD_NAME}/image/upload` +
    `/w_400,h_400,c_fit/w_1200,h_630,c_pad,b_white,f_auto,q_auto/jemi/brand/logo`
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'JEMI — LASU Campus Marketplace', template: '%s | JEMI' },
  description: 'Quality products at student-friendly prices. Order online, pick up on campus at LASU.',
  applicationName: 'JEMI',
  keywords: ['LASU', 'Lagos State University', 'campus marketplace', 'student shopping', 'Nigeria', 'Lagos'],
  authors: [{ name: 'JEMI' }],
  openGraph: {
    type: 'website',
    siteName: 'JEMI',
    title: 'JEMI — LASU Campus Marketplace',
    description: 'Quality products at student-friendly prices. Order online, pick up on campus at LASU.',
    url: SITE_URL,
    locale: 'en_NG',
    images: [{ url: buildOgImage(), width: 1200, height: 630, alt: 'JEMI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JEMI — LASU Campus Marketplace',
    description: 'Quality products at student-friendly prices.',
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0d0b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// Inline script that sets the theme class BEFORE first paint, so we
// never see a flash of light theme. Dark is the default; only switch
// to light if the user has explicitly saved 'light' to localStorage.
const NO_FOWT_SCRIPT = `(function(){try{var t=localStorage.getItem('jemi-theme');var d=t==='light'?false:true;if(d)document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: 'JEMI',
  url: SITE_URL,
  logo: buildOgImage(),
  description: 'LASU campus marketplace — quality products at student-friendly prices, with on-campus pickup.',
  areaServed: {
    '@type': 'EducationalOrganization',
    name: 'Lagos State University',
    address: { '@type': 'PostalAddress', addressLocality: 'Ojo', addressRegion: 'Lagos', addressCountry: 'NG' },
  },
  currenciesAccepted: 'NGN',
  paymentAccepted: 'Cash, Credit Card, Bank Transfer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bricolage.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FOWT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <NetworkStatus />
          {children}
          <ThemeToggle />
          <ServiceWorkerCleanup />
          <Toaster
            position="top-center"
            richColors
            closeButton
            offset={48}
            theme="system"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}