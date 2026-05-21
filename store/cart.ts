'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Client cart. Persisted to localStorage as `jemi-cart`. Synced to the
 * server only at checkout (POST /api/cart/sync), per the
 * "client-cart-only" decision.
 *
 * Items reference products by Mongo _id (string). The display fields
 * (name, price, image) are snapshots — re-validated against the live
 * Product collection at checkout.
 */

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;        // naira (whole)
  imageUrl: string;
  quantity: number;
  seller: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                ),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'jemi-cart',
      // Only persist items — don't try to serialize the action functions.
      partialize: (state) => ({ items: state.items }),
    }
  )
);