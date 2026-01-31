import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/buyer/layout/Layout';
import Spinner from '@/components/ui/Spinner';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/buyer/HomePage'));
const ProductsPage = lazy(() => import('@/pages/buyer/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/buyer/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/buyer/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/buyer/CheckoutPage'));
const OrdersPage = lazy(() => import('@/pages/buyer/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/buyer/OrderDetailPage'));
const ProfilePage = lazy(() => import('@/pages/buyer/ProfilePage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export function BuyerRoutes() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default BuyerRoutes;
