import { MapPin, Phone, Mail, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate, formatPhoneNumber } from '@/reusable/utils/formatters';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/reusable/utils/constants';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import OrderStatus from './OrderStatus';
import type { Order, OrderTimeline } from '@/reusable/types';

interface OrderDetailProps {
  order: Order;
  timeline?: OrderTimeline[];
  onCancel?: () => void;
  isCancelling?: boolean;
}

export function OrderDetail({
  order,
  timeline,
  onCancel,
  isCancelling = false,
}: OrderDetailProps) {
  const {
    orderNumber,
    status,
    total,
    subtotal,
    deliveryFee,
    items,
    shippingAddress,
    paymentStatus,
    paymentMethod,
    createdAt,
  } = order;

  const statusConfig = ORDER_STATUSES[status];
  const paymentStatusConfig = PAYMENT_STATUSES[paymentStatus];
  const canCancel = status === 'pending' || status === 'confirmed';

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Order #{orderNumber}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {formatDate(createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.color as 'success' | 'warning' | 'error' | 'info'}>
              {statusConfig.label}
            </Badge>
            <Badge variant={paymentStatusConfig.color as 'success' | 'warning' | 'error' | 'info'}>
              {paymentStatusConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Order Status Timeline */}
      <OrderStatus currentStatus={status} timeline={timeline} />

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0"
            >
              <img
                src={item.product.images[0] || '/placeholder-product.jpg'}
                alt={item.product.name}
                className="w-16 h-16 rounded-lg object-cover bg-gray-100"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {item.product.name}
                </h4>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                {formatCurrency(item.total)}
              </p>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium">
              {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping & Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Shipping Address
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  {shippingAddress.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  {shippingAddress.address}
                </p>
                <p className="text-sm text-gray-600">
                  {shippingAddress.city}, {shippingAddress.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-600">
                {formatPhoneNumber(shippingAddress.phone)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 capitalize">
                  {paymentMethod || 'Paystack'}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {paymentStatusConfig.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {canCancel && onCancel && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          <Button
            variant="danger"
            onClick={onCancel}
            isLoading={isCancelling}
          >
            Cancel Order
          </Button>
        </div>
      )}
    </div>
  );
}

export default OrderDetail;
