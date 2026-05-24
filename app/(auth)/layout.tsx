import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/session';
import { Container } from '@/components/Container';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) {
    if (!user.profile_completed) redirect('/profile/complete');
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="border-b border-border-soft">
        <Container className="h-14 sm:h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/jemi.webp"
              alt="JEMI"
              width={32}
              height={32}
              priority
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
            />
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-fg">
              JEMI
            </span>
          </Link>
        </Container>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
