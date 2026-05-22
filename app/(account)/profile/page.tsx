import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Container } from '@/components/Container';
import { requireAuth } from '@/lib/session';
import { ProfileForm } from './ProfileForm';

export const metadata: Metadata = {
  title: 'My Profile',
  robots: { index: false },
};

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <Container className="py-6 sm:py-10 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your account and pickup details.</p>

      {!user.profile_completed && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-700 shrink-0 mt-0.5" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-900">Complete your profile</p>
            <p className="text-xs text-yellow-800 mt-0.5">
              Add your phone, address, department and level before you can checkout.
            </p>
          </div>
          <Link
            href="/profile/complete"
            className="text-xs font-medium text-primary hover:text-primary-hover"
          >
            Complete →
          </Link>
        </div>
      )}

      <ProfileForm user={user} />
    </Container>
  );
}