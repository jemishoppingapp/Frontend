/** llms.txt — a plain-text description of JEMI for AI crawlers.
 *  Convention: https://llmstxt.org — served at /llms.txt */
export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jemi.com.ng';

export async function GET() {
  const body = `# JEMI

> JEMI is a campus marketplace for Lagos State University (LASU) students
> in Lagos, Nigeria. Students buy from campus sellers online and pick up
> their orders at a campus gate the same day, paying on delivery (cash or
> bank transfer) to JEMI's delivery rep. Sellers list products, JEMI
> handles the gate handover, and sellers are paid to their bank accounts.

## How it works

- Buyers order at ${SITE_URL}/products and choose a pickup gate
  (LASU Iba Gate or Iyana Iba Gate). Flat NGN 500 delivery per order.
- Payment is on delivery. Buyers check their items before paying.
- Sellers apply at ${SITE_URL}/sellers/apply, set their own prices, and
  receive 95% of each sale (JEMI keeps a 5% platform fee, disclosed on
  every listing).
- Online card payment via Paystack is planned; when live, paid orders
  will be escrow-protected.

## Key pages

- Products: ${SITE_URL}/products
- Become a seller: ${SITE_URL}/become-a-seller
- About: ${SITE_URL}/about
- Contact: ${SITE_URL}/contact
- Terms of Service: ${SITE_URL}/terms
- Privacy Policy: ${SITE_URL}/privacy
- Sitemap: ${SITE_URL}/sitemap.xml

## Notes for crawlers

Public product and category pages may be indexed. Account, checkout,
admin, and seller dashboard areas are private and excluded via robots.txt.
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}