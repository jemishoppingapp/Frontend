import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/reusable/utils/formatters';
import { ORDER_STATUSES } from '@/reusable/utils/constants';
import { cn } from '@/reusable/utils/helpers';
import Badge from '@/components/ui/Badge';
import type { Order } from '@/reusable/types';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const { orderNumber, status, total, items, createdAt } = order;
  const statusConfig = ORDER_STATUSES[status];
  const previewItems = items.slice(0, 3);
  const remainingCount = items.length - 3;

  return (
    <Link
      to={`/orders/${order.id}`}
      className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">Order #{orderNumber}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(createdAt)}</p>
        </div>
        <Badge variant={statusConfig.color as 'success' | 'warning' | 'error' | 'info' | 'primary'}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* Items Preview */}
      <div className="flex items-center gap-2 mb-4">
        {previewItems.map((item) => (
          <div
            key={item.id}
            className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0"
          >
            <img
              src={item.product.images[0] || '/placeholder-product.jpg'}
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-gray-500">
              +{remainingCount}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
          <p className="text-base font-semibold text-gray-900">
            {formatCurrency(total)}
          </p>
        </div>
        <div className="flex items-center gap-1 text-indigo-600 text-sm font-medium">
          <span>View Details</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

export default OrderCard;
