import { Check, Clock, Package, Truck, MapPin, X } from 'lucide-react';
import { formatDateTime } from '@/reusable/utils/formatters';
import { cn } from '@/reusable/utils/helpers';
import type { OrderStatus as OrderStatusType, OrderTimeline } from '@/reusable/types';

interface OrderStatusProps {
  currentStatus: OrderStatusType;
  timeline?: OrderTimeline[];
}

const statusSteps = [
  { status: 'pending', label: 'Order Placed', icon: Clock },
  { status: 'confirmed', label: 'Confirmed', icon: Check },
  { status: 'processing', label: 'Processing', icon: Package },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: MapPin },
] as const;

const statusOrder: Record<OrderStatusType, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

export function OrderStatus({ currentStatus, timeline }: OrderStatusProps) {
  if (currentStatus === 'cancelled') {
    return (
      <div className="bg-red-50 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="font-semibold text-red-700">Order Cancelled</h4>
            <p className="text-sm text-red-600">
              This order has been cancelled
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = statusOrder[currentStatus];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h3>

      <div className="relative">
        {statusSteps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const Icon = step.icon;

          // Find timeline entry for this status
          const timelineEntry = timeline?.find((t) => t.status === step.status);

          return (
            <div key={step.status} className="relative flex items-start pb-8 last:pb-0">
              {/* Connector Line */}
              {index < statusSteps.length - 1 && (
                <div
                  className={cn(
                    'absolute left-5 top-10 w-0.5 h-full -translate-x-1/2',
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
              )}

              {/* Status Icon */}
              <div
                className={cn(
                  'relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  isCompleted && 'bg-green-500 text-white',
                  isCurrent && 'bg-indigo-500 text-white',
                  isPending && 'bg-gray-200 text-gray-400'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Status Info */}
              <div className="ml-4 flex-1">
                <h4
                  className={cn(
                    'font-medium',
                    isCompleted && 'text-green-700',
                    isCurrent && 'text-indigo-700',
                    isPending && 'text-gray-400'
                  )}
                >
                  {step.label}
                </h4>
                {timelineEntry && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDateTime(timelineEntry.timestamp)}
                  </p>
                )}
                {timelineEntry?.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {timelineEntry.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderStatus;
