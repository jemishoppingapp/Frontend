import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Button from '@/components/ui/Button';

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <ShoppingCart className="w-12 h-12 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Your cart is empty
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-sm">
        Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
      </p>
      
      <Link to="/products">
        <Button size="lg">Start Shopping</Button>
      </Link>
    </div>
  );
}

export default EmptyCart;
