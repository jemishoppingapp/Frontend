import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppRoutes } from './routes';
import { CartSidebar } from './components/buyer/cart/CartSidebar';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 300000, retry: 1 } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <CartSidebar />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;