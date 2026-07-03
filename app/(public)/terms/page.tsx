import type { Metadata } from 'next';
import { Container } from '@/components/Container';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <Container className="py-12 sm:py-16 max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Legal</p>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-fg leading-tight mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-fg-2 mb-10">Last updated: July 2026</p>

      <div className="space-y-8 text-sm text-fg-1 leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">1. What JEMI is</h2>
          <p>
            JEMI is a campus marketplace for Lagos State University. Buyers order
            online and collect their items at a campus gate. Sellers list products
            and hand them to JEMI for delivery. By creating an account or placing
            an order, you agree to these terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">2. Accounts</h2>
          <p>
            You must give accurate details when you register, keep your password
            private, and use one account per person. We can suspend accounts that
            break these terms, abuse other users, or attempt fraud.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">3. Buying and paying</h2>
          <p>
            Orders are currently pay on delivery. You pay the amount shown at
            checkout, in cash or by bank transfer, when you collect your order at
            the gate. Check your items before you pay. If what you're handed is
            wrong or damaged, don't pay — the order is simply not completed and
            you owe nothing. Once you pay and take your items, the sale is final
            except where an item turns out to be faulty in a way you couldn't see
            at handover; contact us within 48 hours in that case.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">4. Pickup</h2>
          <p>
            Delivery to a gate costs a flat ₦500 per order. Pickup is at LASU Iba
            Gate or Iyana Iba Gate — you choose at checkout. You'll get a pickup
            code; show it to our rep at handover. If nobody collects an order
            within 7 days it is cancelled automatically.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">5. Selling</h2>
          <p>
            Sellers apply and are approved before listing. You set the price
            buyers pay; JEMI keeps 5% of each sale as its platform fee and you
            receive 95%, shown to you on every listing before you publish.
            Payouts go to your registered bank account on the schedule you choose
            (weekly or monthly). You are responsible for the accuracy of your
            listings and the quality of what you hand over. Repeated failed
            handovers, misleading listings, or prohibited items can lead to
            suspension.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">6. What you can't sell</h2>
          <p>
            No illegal goods, weapons, drugs, stolen property, counterfeit items,
            or anything that breaks Nigerian law or LASU rules. We remove such
            listings and may report them.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">7. Online payments (coming soon)</h2>
          <p>
            Card and transfer payments through Paystack are coming. When they
            launch, paid orders will be protected: money is held by JEMI and only
            released to the seller after you confirm you received your items.
            These terms will be updated before that launch.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">8. Liability</h2>
          <p>
            JEMI connects buyers and sellers and handles gate delivery. We work to
            keep the platform safe and accurate, but items are sold by their
            sellers, and to the extent Nigerian law allows, JEMI's liability on
            any order is limited to the amount you paid on that order.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">9. Changes and contact</h2>
          <p>
            We may update these terms as JEMI grows; the date above shows the
            latest version. Questions or problems: {SITE.supportEmail} or WhatsApp{' '}
            {SITE.whatsapp}.
          </p>
        </section>
      </div>
    </Container>
  );
}