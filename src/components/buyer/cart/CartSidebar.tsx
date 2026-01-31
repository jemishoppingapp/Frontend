import { Link } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/reusable/utils/formatters';

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);

  return (
      <Dialog open={isOpen} onClose={closeCart} className="relative z-50">
        <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0" />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <DialogPanel transition className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full">
                <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-lg font-medium text-gray-900">Shopping cart</DialogTitle>
                      <button onClick={closeCart} className="-m-2 p-2 text-gray-400 hover:text-gray-500"><XMarkIcon className="size-6" /></button>
                    </div>
                    <div className="mt-8">
                      {items.length === 0 ? (
                          <div className="py-12 text-center"><p className="text-gray-500">Your cart is empty</p><Link to="/products" onClick={closeCart} className="mt-4 inline-block text-sm font-medium text-indigo-600">Continue Shopping →</Link></div>
                      ) : (
                          <ul className="-my-6 divide-y divide-gray-200">
                            {items.map((p) => (
                                <li key={p.id} className="flex py-6">
                                  <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200"><img src={p.imageSrc} alt={p.imageAlt} className="size-full object-cover" /></div>
                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div><div className="flex justify-between text-base font-medium text-gray-900"><h3><Link to={p.href} onClick={closeCart}>{p.name}</Link></h3><p className="ml-4">{p.price}</p></div><p className="mt-1 text-sm text-gray-500">{p.color}</p></div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center gap-2"><span className="text-gray-500">Qty</span><select value={p.quantity} onChange={(e) => updateQuantity(p.id, +e.target.value)} className="rounded border-gray-300 py-1 text-sm">{[1,2,3,4,5,6,7,8,9,10].map((n) => (<option key={n} value={n}>{n}</option>))}</select></div>
                                      <button onClick={() => removeItem(p.id)} className="font-medium text-indigo-600 hover:text-indigo-500">Remove</button>
                                    </div>
                                  </div>
                                </li>
                            ))}
                          </ul>
                      )}
                    </div>
                  </div>
                  {items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900"><p>Subtotal</p><p>{formatCurrency(subtotal)}</p></div>
                        <p className="mt-0.5 text-sm text-gray-500">Shipping calculated at checkout.</p>
                        <div className="mt-6"><Link to="/checkout" onClick={closeCart} className="flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700">Checkout</Link></div>
                        <div className="mt-6 flex justify-center text-sm text-gray-500"><button onClick={closeCart} className="font-medium text-indigo-600">Continue Shopping →</button></div>
                      </div>
                  )}
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
  );
}
