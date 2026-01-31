import { Link } from 'react-router-dom';
import { CheckCircleIcon, TruckIcon, ClockIcon } from '@heroicons/react/20/solid';
import { MOCK_ORDERS } from '@/data/mockData';

const statusConfig = {
  processing: { icon: ClockIcon, text: 'Processing', color: 'text-yellow-500' },
  shipped: { icon: TruckIcon, text: 'Shipped', color: 'text-blue-500' },
  delivered: { icon: CheckCircleIcon, text: 'Delivered', color: 'text-green-500' },
  cancelled: { icon: ClockIcon, text: 'Cancelled', color: 'text-red-500' },
};

export default function OrdersPage() {
  const orders = MOCK_ORDERS;
  
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Order history</h1>
          <p className="mt-2 text-sm text-gray-500">Check the status of recent orders.</p>
        </div>
        <div className="mt-12 space-y-16 sm:mt-16">
          {orders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;
            return (
              <section key={order.id}>
                <div className="space-y-1 md:flex md:items-baseline md:space-x-4 md:space-y-0">
                  <h2 className="text-lg font-medium text-gray-900">Order #{order.orderNumber}</h2>
                  <div className="flex-1 flex justify-between text-sm">
                    <Link to={`/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-500">View invoice →</Link>
                    <span className="text-gray-500">Placed {order.datePlaced}</span>
                  </div>
                </div>
                <div className="mt-6 -mb-6 flow-root divide-y divide-gray-200 border-t border-gray-200">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-6 sm:flex">
                      <div className="flex space-x-4 sm:min-w-0 sm:flex-1 sm:space-x-6">
                        <img src={item.imageSrc} alt={item.imageAlt} className="size-20 flex-none rounded-md object-cover sm:size-48" />
                        <div className="min-w-0 flex-1 pt-1.5 sm:pt-0">
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                          <p className="mt-1 font-medium text-gray-900">{item.price}</p>
                        </div>
                      </div>
                      <div className="mt-6 sm:ml-6 sm:mt-0 sm:w-40">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`size-5 ${status.color}`} />
                          <span className="text-sm text-gray-500">
                            {order.status === 'delivered' ? `Delivered ${order.dateDelivered}` : status.text}
                          </span>
                        </div>
                        <div className="mt-4 flex space-x-4 text-sm font-medium">
                          <Link to={`/products/${item.id}`} className="text-indigo-600 hover:text-indigo-500">View</Link>
                          <button className="text-indigo-600 hover:text-indigo-500">Buy again</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
