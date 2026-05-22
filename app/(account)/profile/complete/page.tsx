import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Container } from '@/components/Container';
import { requireAuth } from '@/lib/session';
import { ProfileCompleteForm } from './ProfileCompleteForm';

export const metadata: Metadata = {
  title: 'Complete your profile',
  robots: { index: false },
};

export default async function ProfileCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const user = await requireAuth();
  const sp = await searchParams;

  // If profile is already complete and they came here directly (no
  // `from` param indicating a redirect), bounce to /profile.
  if (user.profile_completed && !sp.from) {
    redirect('/profile');
  }

  return (
    <Container className="py-6 sm:py-10 max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Complete your profile
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        We need a bit more information so sellers can reach you and deliver to the right place on campus.
      </p>

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