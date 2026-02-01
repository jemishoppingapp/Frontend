import { Link, useParams } from 'react-router-dom';
import { MOCK_ORDERS } from '@/data/mockData';

export default function OrderDetailPage() {
  const { id } = useParams();
  const order = MOCK_ORDERS.find(o => o.id === id);

  if (!order) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <Link to="/orders" className="mt-4 inline-block text-indigo-600">← Back to Orders</Link>
        </div>
    );
  }

  return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link to="/orders" className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block">← Back to Orders</Link>
        <h1 className="text-2xl font-bold mt-4 mb-4">Order #{order.orderNumber}</h1>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-gray-600">Status: <span className="font-medium capitalize">{order.status}</span></p>
          <p className="text-gray-600">Placed: {order.datePlaced}</p>
          {order.dateDelivered && <p className="text-gray-600">Delivered: {order.dateDelivered}</p>}
        </div>
        <div className="space-y-4">
          {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                <img src={item.imageSrc} alt={item.imageAlt} className="h-16 w-16 rounded object-cover" />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-600">{item.price} × {item.quantity}</p>
                </div>
              </div>
          ))}
        </div>
        <p className="mt-8 text-xl font-bold">Total: {order.totalAmount}</p>
      </div>
  );
}