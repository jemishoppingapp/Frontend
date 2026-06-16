/**
 * Nunito, self-hosted via @fontsource/nunito (woff2 bundled in the npm
 * package). The font face CSS is imported in app/layout.tsx. We expose
 * a className that sets the --font-nunito variable the theme reads.
 *
 * No next/font/google here on purpose: that fetches from Google at build
 * time, which breaks builds on a flaky connection. Self-hosting reads the
 * files from node_modules instead.
 */
export const nunito = {
  variable: 'font-nunito-var',
};