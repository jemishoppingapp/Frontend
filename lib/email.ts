/** Zero-dependency Resend client. Skips (logs) when no API key so dev
 *  without email still works. */
const RESEND_API = 'https://api.resend.com/emails';

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'JEMI <no-reply@example.com>';
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — skipping send to', opts.to);
    return { ok: false as const, skipped: true as const };
  }
  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html, text: opts.text }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      console.error('[email] send failed', res.status, body?.message ?? '');
      return { ok: false as const, skipped: false as const };
    }
    return { ok: true as const, skipped: false as const };
  } catch (e) {
    console.error('[email] send error', e);
    return { ok: false as const, skipped: false as const };
  }
}

export function otpEmailHtml(name: string, code: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <div style="background:#16a34a;border-radius:12px 12px 0 0;padding:20px 24px">
    <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">JEMI</span>
  </div>
  <div style="border:1px solid #e5e5e2;border-top:0;border-radius:0 0 12px 12px;padding:28px 24px">
    <p style="margin:0 0 8px;font-size:15px;color:#111">Hi ${name.split(' ')[0] || 'there'},</p>
    <p style="margin:0 0 20px;font-size:14px;color:#555">Your JEMI verification code:</p>
    <p style="margin:0 0 20px;font-size:34px;font-weight:800;letter-spacing:8px;color:#111">${code}</p>
    <p style="margin:0;font-size:12px;color:#888">Expires in 10 minutes. If you didn't request this, ignore this email.</p>
  </div>
</div>`;
}
export function orderConfirmationHtml(opts: {
  name: string; orderNumber: string; totalNaira: string;
  gate: string; where: string; codes: string; orderUrl: string;
}) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <div style="background:#16a34a;border-radius:12px 12px 0 0;padding:20px 24px">
    <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">JEMI</span>
  </div>
  <div style="border:1px solid #e5e5e2;border-top:0;border-radius:0 0 12px 12px;padding:28px 24px">
    <p style="margin:0 0 8px;font-size:15px;color:#111">Hi ${opts.name.split(' ')[0] || 'there'}, your order is in.</p>
    <p style="margin:0 0 16px;font-size:14px;color:#555">Order <strong>${opts.orderNumber}</strong></p>
    <p style="margin:0 0 4px;font-size:13px;color:#555">Pay at pickup (cash or transfer)</p>
    <p style="margin:0 0 16px;font-size:26px;font-weight:800;color:#111">NGN ${opts.totalNaira}</p>
    <p style="margin:0 0 4px;font-size:13px;color:#555">Pickup code — show this to our rep</p>
    <p style="margin:0 0 16px;font-size:26px;font-weight:800;letter-spacing:6px;color:#16a34a">${opts.codes}</p>
    <p style="margin:0 0 16px;font-size:13px;color:#555">Gate: <strong>${opts.gate}</strong><br/>Where: ${opts.where}</p>
    <p style="margin:0 0 4px;font-size:12px;color:#888">Check your items before you pay. Track it anytime:</p>
    <p style="margin:0;font-size:13px"><a href="${opts.orderUrl}" style="color:#16a34a">${opts.orderUrl}</a></p>
  </div>
</div>`;
}

export function sellerApprovedHtml(opts: { name: string; businessName: string; dashboardUrl: string }) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <div style="background:#16a34a;border-radius:12px 12px 0 0;padding:20px 24px">
    <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">JEMI</span>
  </div>
  <div style="border:1px solid #e5e5e2;border-top:0;border-radius:0 0 12px 12px;padding:28px 24px">
    <p style="margin:0 0 8px;font-size:15px;color:#111">Hi ${opts.name.split(' ')[0] || 'there'},</p>
    <p style="margin:0 0 16px;font-size:14px;color:#555"><strong>${opts.businessName}</strong> is approved on JEMI. You can start listing products now — you'll see exactly what you earn on every listing before you publish.</p>
    <p style="margin:0"><a href="${opts.dashboardUrl}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:8px">Open your seller dashboard</a></p>
  </div>
</div>`;
}
