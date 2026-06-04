import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ChevronLeft } from 'lucide-react';
import { db, schema } from '@/db';
import { requireAdmin } from '@/lib/session';
import { AdminUserEditForm } from './AdminUserEditForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Edit User', robots: { index: false } };

export default async function AdminUserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;

  const rows = await db().select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  const user = rows[0];
  if (!user) notFound();

  const isSelf = user.id === admin.id;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-3xl">
      <Link href={`/admin/users/${user.id}`} className="inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg mb-5">
        <ChevronLeft className="h-4 w-4" /> Back to user
      </Link>

      <div className="mb-7">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg mb-1">Edit user</h1>
        <p className="text-sm text-fg-2 font-mono">{user.email}</p>
      </div>

      <AdminUserEditForm
        user={{
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          altPhone: user.altPhone,
          address: user.address,
          department: user.department,
          level: user.level,
          role: user.role,
          isDisabled: user.isDisabled,
          profileCompleted: user.profileCompleted,
        }}
        isSelf={isSelf}
      />
    </div>
  );
}