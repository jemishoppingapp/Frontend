import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { Container } from '@/components/Container';

/**
 * Layout for /login and /register. If the user is ALREADY logged in,
 * redirect them away — no point showing the login form to a logged-in
 * user. Renders a minimal shell (no full header/footer) since these
 * pages don't need them.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) {
    // If they're not done with profile setup, send them there.
    if (!user.profile_completed) {
      redirect('/profile/complete');
    }
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <header className="bg-gray-900 text-white">
        <Container className="h-14 flex items-center">
          <Link href="/" className="text-lg font-bold tracking-tight text-primary">
            JEMI
          </Link>
        </Container>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}