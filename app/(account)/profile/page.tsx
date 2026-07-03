import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, Store, ChevronRight } from 'lucide-react';
import { Container } from '@/components/Container';
import { UserAvatar } from '@/components/UserAvatar';
import { requireAuth } from '@/lib/session';
import { ProfileForm } from './ProfileForm';

export const metadata: Metadata = { title: 'My Profile', robots: { index: false } };

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div>
      {/* Spotify-style gradient header */}
      <div className="bg-gradient-to-b from-primary/25 via-primary/10 to-transparent">
        <Container className="pt-10 sm:pt-14 pb-8 max-w-3xl">
          <div className="flex items-center gap-5">
            <UserAvatar name={user.name} src={user.avatar} size="xl" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.2em] text-fg-2 font-medium mb-1">
                {user.role === 'seller' ? 'Seller account' : user.role === 'admin' ? 'Admin account' : 'Profile'}
              </p>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-fg leading-tight truncate">
                {user.nickname || user.name}
              </h1>
              <p className="text-sm text-fg-2 mt-1 truncate">{user.email}</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="pb-12 max-w-3xl">
        {user.role === 'seller' && (
          <Link
            href="/seller"
            className="mb-5 rounded-2xl border-2 border-primary-soft bg-primary-soft/20 p-4 flex items-center gap-3 hover:bg-primary-soft/30 transition-colors"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
              <Store className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-fg">Seller dashboard</span>
              <span className="block text-xs text-fg-2 mt-0.5">Your products, orders, and payouts.</span>
            </span>
            <ChevronRight className="h-5 w-5 text-fg-3 shrink-0" />
          </Link>
        )}

        {!user.profile_completed && (
          <div className="mb-5 rounded-2xl border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-semibold text-fg">Complete your profile</p>
              <p className="text-xs text-fg-2 mt-0.5">
                Add your phone, address, department and level before you can checkout.
              </p>
            </div>
            <Link href="/profile/complete" className="text-xs font-medium text-primary hover:text-primary-hover">
              Complete →
            </Link>
          </div>
        )}

        <ProfileForm user={user} />
      </Container>
    </div>
  );
}