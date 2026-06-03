/**
 * Fetches the Nigerian bank list from Paystack with a 1-hour cache.
 * Falls back to a hardcoded list of common NG banks if Paystack is
 * unreachable.
 *
 * Each bank has:
 *   - name: 'Access Bank'
 *   - code: '044' (Paystack bank code, needed for subaccount creation)
 */
export interface Bank {
  name: string;
  code: string;
}

const FALLBACK_BANKS: Bank[] = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank Nigeria', code: '023' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank', code: '214' },
  { name: 'Guaranty Trust Bank', code: '058' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'Opay', code: '999992' },
  { name: 'Palmpay', code: '999991' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Standard Chartered', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Union Bank', code: '032' },
  { name: 'United Bank for Africa', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
];

interface CacheEntry { banks: Bank[]; expires: number; }
let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function getBanks(): Promise<Bank[]> {
  if (cache && cache.expires > Date.now()) {
    return cache.banks;
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    // eslint-disable-next-line no-console
    console.warn('[banks] PAYSTACK_SECRET_KEY not set, using fallback list');
    return FALLBACK_BANKS;
  }

  try {
    const res = await fetch('https://api.paystack.co/bank?country=nigeria&perPage=100', {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Paystack returned ${res.status}`);
    const data = await res.json();
    if (!data.status || !Array.isArray(data.data)) {
      throw new Error('Unexpected Paystack response shape');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const banks: Bank[] = data.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((b: any) => b.name && b.code && b.active !== false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((b: any) => ({ name: String(b.name), code: String(b.code) }))
      .sort((a: Bank, b: Bank) => a.name.localeCompare(b.name));

    cache = { banks, expires: Date.now() + CACHE_TTL_MS };
    return banks;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[banks] Paystack fetch failed, using fallback:', err);
    return FALLBACK_BANKS;
  }
}