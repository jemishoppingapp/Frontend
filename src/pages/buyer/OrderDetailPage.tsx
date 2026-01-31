import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import OrderDetail from '@/components/buyer/order/OrderDetail';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import type { Order, OrderTimeline } from '@/reusable/types';

// Mock order data (same as in OrdersPage)
const mockOrder: Order = {
  id: 'order-1',
  orderNumber: 'JEM-2024-001',
  buyerId: 'user-1',
  status: 'processing',
  total: 23500,
  subtotal: 23000,
  deliveryFee: 500,
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      product: {
        id: 'prod-1',
        name: 'Wireless Bluetooth Earbuds Pro',
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'],
        price: 15000,
      },
      quantity: 1,
      price: 15000,
      total: 15000,
    },
    {
      id: 'item-2',
      productId: 'prod-2',
      product: {
        id: 'prod-2',
        name: 'Phone Case Premium',
        images: ['https://images.unsplash.com/photo-1601593346740-925612772716?w=400'],
        price: 8000,
      },
      quantity: 1,
      price: 8000,
      total: 8000,
    },
  ],
  shippingAddress: {
    id: 'addr-1',
    userId: 'user-1',
    fullName: 'John Doe',
    phone: '08012345678',
    address: '123 Main Street, Ojo',
    city: 'Ojo',
    state: 'Lagos',
    country: 'Nigeria',
    isDefault: true,
  },
  paymentStatus: 'paid',
  paymentMethod: 'paystack',
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
};

const mockTimeline: OrderTimeline[] = [
  {
    status: 'pending',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Order placed successfully',
  },
  {
    status: 'confirmed',
    timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Order confirmed by seller',
  },
  {
    status: 'processing',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Order is being prepared for shipping',
  },
];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<OrderTimeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      // In production, fetch from API using id
      setOrder(mockOrder);
      setTimeline(mockTimeline);
      setIsLoading(false);
    };

    loadOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel this order? This action cannot be undone.'
    );

    if (!confirmed) return;

    setIsCancelling(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Order cancelled successfully');
      navigate('/orders');
    } catch {
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton variant="text" className="h-8 w-48 mb-8" />
          <div className="space-y-6">
            <Skeleton variant="card" className="h-32" />
            <Skeleton variant="card" className="h-64" />
            <Skeleton variant="card" className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">
            The order you're looking for doesn't exist.
          </p>
          <Link to="/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>

        {/* Order Detail */}
        <OrderDetail
          order={order}
          timeline={timeline}
          onCancel={handleCancelOrder}
          isCancelling={isCancelling}
        />
      </div>
    </div>
  );
}

export default OrderDetailPage;
