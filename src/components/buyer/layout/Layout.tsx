import { type ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout({ children, showFooter = true }: { children: ReactNode; showFooter?: boolean }) {
    return (<div className="min-h-screen bg-white"><Header /><main>{children}</main>{showFooter && <Footer />}</div>);
}
export default Layout;
