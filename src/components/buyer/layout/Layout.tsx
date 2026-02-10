import { type ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ToastContainer } from '@/components/ui/Toast';

export function Layout({ children, showFooter = true }: { children: ReactNode; showFooter?: boolean }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>{children}</main>
      {showFooter && <Footer />}
      <ToastContainer />
    </div>
  );
}

export default Layout;