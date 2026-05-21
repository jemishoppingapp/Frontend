import { Header } from './Header';
import { Footer } from './Footer';

/**
 * MainLayout — wraps every public page with Header + Footer.
 * Auth pages (login/register) and admin pages opt out by living in
 * their own route group.
 */
export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}