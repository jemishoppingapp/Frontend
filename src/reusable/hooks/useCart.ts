import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { toast } from 'sonner';
import type { CartItem } from '@/reusable/types';

export const useCart = () => {
  const {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    getItemCount,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    getAmountToFreeDelivery,
    isFreeDelivery,
    getItemByProductId,
  } = useCartStore();

  const { openCartSidebar, closeCartSidebar, isCartSidebarOpen } = useUIStore();

  const handleAddItem = (item: Omit<CartItem, 'id'>) => {
    const existingItem = getItemByProductId(item.productId);
    
    if (existingItem && existingItem.quantity >= item.stock) {
      toast.error('Maximum quantity reached');
      return;
    }

    addItem(item);
    toast.success(`${item.name} added to cart`);
    openCartSidebar();
  };

  const handleRemoveItem = (productId: string, productName?: string) => {
    removeItem(productId);
    toast.success(`${productName || 'Item'} removed from cart`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  return {
    items,
    isOpen: isOpen || isCartSidebarOpen,
    addItem: handleAddItem,
    removeItem: handleRemoveItem,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    toggleCart,
    openCart: openCartSidebar,
    closeCart: closeCartSidebar,
    itemCount: getItemCount(),
    subtotal: getSubtotal(),
    deliveryFee: getDeliveryFee(),
    total: getTotal(),
    amountToFreeDelivery: getAmountToFreeDelivery(),
    isFreeDelivery: isFreeDelivery(),
    getItemByProductId,
    isEmpty: items.length === 0,
  };
};

export default useCart;
