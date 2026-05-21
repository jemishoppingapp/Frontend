import { MainLayout } from '@/components/layout/MainLayout';

/**
 * (public) route group layout. Applies MainLayout (Header + Footer)
 * to homepage, products, categories, product detail, etc. — every
 * page a non-authed visitor can browse.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}