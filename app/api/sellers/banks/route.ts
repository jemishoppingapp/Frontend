import { getBanks } from '@/lib/banks';
import { ok, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 3600; // 1 hour cache hint

export async function GET() {
  return withErrorHandling(async () => {
    const banks = await getBanks();
    return ok({ banks });
  });
}