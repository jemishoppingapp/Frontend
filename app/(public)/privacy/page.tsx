import type { Metadata } from 'next';
import { Container } from '@/components/Container';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <Container className="py-12 sm:py-16 max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Legal</p>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-fg leading-tight mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-fg-2 mb-10">Last updated: July 2026</p>

      <div className="space-y-8 text-sm text-fg-1 leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">What we collect</h2>
          <p>
            When you create an account: your name, email, phone number, campus
            address, department and level. When you order: what you bought and
            your chosen pickup gate. If you sell on JEMI: your business details
            and the bank account we pay you into. Product photos are uploaded by
            sellers.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">How we use it</h2>
          <p>
            To run your account, process and deliver orders, pay sellers, respond
            to support requests, and keep the platform safe. We don't sell your
            personal information, and we don't send marketing you didn't ask for.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">Who we share it with</h2>
          <p>
            Service providers that make JEMI work: our hosting and database
            providers, and Cloudinary, which stores product images. When online
            card payments launch, payment details will be handled by Paystack —
            JEMI never sees or stores your card number. Sellers see the name and
            order details of buyers who bought from them, and our delivery rep
            sees what's needed to hand over your order. Beyond that, we only
            disclose information where Nigerian law requires it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">Cookies</h2>
          <p>
            We use one essential cookie that keeps you signed in. No advertising
            or tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">Security</h2>
          <p>
            Passwords are stored hashed — we can't read them. Connections to JEMI
            are encrypted. Sellers' bank details can only be changed through
            admin, which protects payouts if an account is ever compromised.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">Your choices</h2>
          <p>
            You can view and edit your profile details in the app at any time. To
            delete your account and its data, contact us and we'll handle it,
            keeping only what the law requires us to keep (like records of
            completed transactions). We handle personal data in line with the
            Nigeria Data Protection Act.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-fg mb-2">Contact</h2>
          <p>
            Privacy questions: {SITE.supportEmail} or WhatsApp {SITE.whatsapp}.
          </p>
        </section>
      </div>
    </Container>
  );
}