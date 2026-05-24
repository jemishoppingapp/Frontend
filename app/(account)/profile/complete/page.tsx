import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Container } from '@/components/Container';
import { requireAuth } from '@/lib/session';
import { ProfileCompleteForm } from './ProfileCompleteForm';

export const metadata: Metadata = { title: 'Complete your profile', robots: { index: false } };

export default async function ProfileCompletePage({ searchParams }: { searchParams: Promise<{ from?: string }>; }) {
  const user = await requireAuth();
  const sp = await searchParams;
  if (user.profile_completed && !sp.from) redirect('/profile');

  return (
    <Container className="py-8 sm:py-12 max-w-2xl">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Almost there</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-fg leading-tight">Complete your profile</h1>
        <p className="text-sm text-fg-2 mt-2">A bit more info so sellers can reach you and deliver to the right place.</p>
      </div>

      <ProfileCompleteForm
        defaults={{
          phone: user.phone || '',
          alt_phone: user.alt_phone || '',
          address: user.address || '',
          department: user.department || '',
          level: user.level || '',
        }}
        fromPath={sp.from}
      />
    </Container>
  );
}