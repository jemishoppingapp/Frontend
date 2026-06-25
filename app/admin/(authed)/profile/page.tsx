import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireAdmin } from '@/lib/session';
import { AdminProfileForm } from './AdminProfileForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My Profile', robots: { index: false } };

export default async function AdminProfilePage() {
  const admin = await requireAdmin();

  const rows = await db().select().from(schema.users).where(eq(schema.users.id, admin.id)).limit(1);
  const me = rows[0];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-2xl">
      <div className="mb-7">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">My Profile</h1>
        <p className="text-sm text-fg-2">Your admin account details and password.</p>
      </div>

      <AdminProfileForm
        me={{
          id: me.id,
          email: me.email,
          name: me.name,
          phone: me.phone,
        }}
      />
    </div>
  );
}