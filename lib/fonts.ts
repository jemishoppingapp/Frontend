import { Nunito } from 'next/font/google';

/**
 * Nunito — the only font on JEMI. Headings use heavier weights of the
 * same family instead of a second display face. Loaded through
 * next/font/google: self-hosted, swap display, no layout shift.
 */
export const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});