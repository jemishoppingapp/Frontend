/**
 * Paystack helpers.
 *
 * Three pieces:
 *   - initializeTransaction: server → Paystack init, returns auth URL
 *   - verifyTransaction: server → Paystack verify, returns canonical status
 *   - verifyWebhookSignature: Edge-safe HMAC-SHA512 check on raw body
 *
 * We don't use any Paystack SDK — three fetch calls and an HMAC. Less
 * surface area, no extra dependency.
 *
 * Money: Paystack works in kobo. We store and display naira. Conversion
 * happens at this boundary only.
 */
import { nairaToKobo } from '@/lib/utils';

const PAYSTACK_BASE = 'https://api.paystack.co';

function requireSecret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is not defined.');
  }
  return key;
}

export interface PaystackInitInput {
  email: string;
  amountNaira: number;
  reference: string;       // we generate, Paystack must accept
  callback_url: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackInitResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializeTransaction(input: PaystackInitInput): Promise<PaystackInitResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${requireSecret()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      amount: nairaToKobo(input.amountNaira),
      reference: input.reference,
      callback_url: input.callback_url,
      currency: 'NGN',
      metadata: input.metadata ?? {},
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(`Paystack init failed: ${data.message || res.statusText}`);
  }
  return data.data as PaystackInitResult;
}

export interface PaystackVerifyResult {
  status: 'success' | 'failed' | 'abandoned' | 'pending' | string;
  reference: string;
  amount: number;          // in kobo
  paid_at: string | null;
  channel: string;
  customer: { email: string };
  metadata: Record<string, unknown>;
}

export async function verifyTransaction(reference: string): Promise<PaystackVerifyResult> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${requireSecret()}`,
      },
      // Disable Next's fetch cache — payment status must not be cached.
      cache: 'no-store',
    }
  );

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(`Paystack verify failed: ${data.message || res.statusText}`);
  }
  return data.data as PaystackVerifyResult;
}

/**
 * Verify the X-Paystack-Signature header against the raw request body.
 * Paystack signs with HMAC-SHA512 of the body using your SECRET key.
 *
 * IMPORTANT: must hash the raw body, not the parsed JSON. Next.js route
 * handlers expose req.text() before any parsing — use that.
 */
export async function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) return false;
  const secret = requireSecret();

  // Web Crypto HMAC-SHA512 — works in both Node and Edge runtimes.
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const computed = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time compare. The lengths should match (128 hex chars for
  // SHA-512); if not, fail without a timing leak.
  if (computed.length !== signatureHeader.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  }
  return diff === 0;
}