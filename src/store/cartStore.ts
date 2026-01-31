import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/data/mockData';

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: CartItem) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            addItem: (item) => set((s) => {
                const existing = s.items.find((i) => i.id === item.id);
                if (existing) return { items: s.items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) };
                return { items: [...s.items, { ...item, quantity: 1 }] };
            }),
            removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
            updateQuantity: (id, qty) => { if (qty < 1) get().removeItem(id); else set((s) => ({ items: s.items.map((i) => i.id === id ? { ...i, quantity: qty } : i) })); },
            clearCart: () => set({ items: [] }),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
        }),
        { name: 'jemi-cart', partialize: (s) => ({ items: s.items }) }
    )
);
