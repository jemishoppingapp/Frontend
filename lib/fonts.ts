import { Inter, Bricolage_Grotesque } from 'next/font/google';

/**
 * Inter — body text. Variable weight, broad coverage, very readable
 * on small phone screens.
 *
 * Bricolage Grotesque — display headings. Slight wedges and character
 * give it personality without sacrificing legibility. Variable font,
 * widths and weights both available — we use the standard width.
 *
 * Both load via next/font/google: self-hosted, no FOIT, no CLS, no
 * runtime fetch. Free.
 */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});