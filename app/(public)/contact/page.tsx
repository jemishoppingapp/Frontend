import type { Metadata } from 'next';
import { Mail, MessageCircle } from 'lucide-react';
import { Container } from '@/components/Container';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <Container className="py-12 sm:py-16 max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Contact</p>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-fg leading-tight mb-4">
        Talk to us.
      </h1>
      <p className="text-sm sm:text-base text-fg-2 leading-relaxed mb-10 max-w-md">
        Problem with an order, question about selling, or anything else — we
        answer fastest on WhatsApp.
      </p>

      <div className="space-y-4">
        <a
          href={SITE.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-2xl border border-border-soft bg-surface-1 p-5 hover:border-border transition-colors"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft shrink-0">
            <MessageCircle className="h-5 w-5 text-primary-text" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-fg">WhatsApp</span>
            <span className="block text-sm text-fg-2 mt-0.5">{SITE.whatsapp}</span>
          </span>
        </a>

        <a
          href={`mailto:${SITE.supportEmail}`}
          className="flex items-center gap-4 rounded-2xl border border-border-soft bg-surface-1 p-5 hover:border-border transition-colors"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft shrink-0">
            <Mail className="h-5 w-5 text-primary-text" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-fg">Email</span>
            <span className="block text-sm text-fg-2 mt-0.5">{SITE.supportEmail}</span>
          </span>
        </a>
      </div>

      <p className="text-xs text-fg-3 mt-8">
        For order issues, include your order number — it starts with JEMI-.
      </p>
    </Container>
  );
}