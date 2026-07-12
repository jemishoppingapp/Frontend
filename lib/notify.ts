import { sendEmail } from '@/lib/email';

/** Telegram push to the ops chat. Plain text (no parse mode) so user
 *  content can never break the message. Skips + logs when unconfigured.
 *  NEVER throws. */
export async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn('[telegram] not configured — skipping');
    return { ok: false as const, skipped: true as const };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!res.ok) {
      console.error('[telegram] send failed', res.status, await res.text().catch(() => ''));
      return { ok: false as const, skipped: false as const };
    }
    return { ok: true as const, skipped: false as const };
  } catch (e) {
    console.error('[telegram] error', e);
    return { ok: false as const, skipped: false as const };
  }
}

/** Ops alert on BOTH channels (telegram + email backup). Never throws. */
export async function notifyOps(opts: { subject: string; text: string; html?: string }) {
  const to = process.env.ORDER_ALERT_EMAIL || process.env.SEED_ADMIN_EMAIL;
  await Promise.allSettled([
    sendTelegram(opts.text),
    to
      ? sendEmail({ to, subject: opts.subject, text: opts.text, html: opts.html ?? `<pre style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${opts.text}</pre>` })
      : Promise.resolve(),
  ]);
}