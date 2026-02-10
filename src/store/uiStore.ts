import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface UIStore {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  isCartSidebarOpen: boolean;
  toggleCartSidebar: () => void;
  openCartSidebar: () => void;
  closeCartSidebar: () => void;
  isFilterSidebarOpen: boolean;
  toggleFilterSidebar: () => void;
  openFilterSidebar: () => void;
  closeFilterSidebar: () => void;
  isSearchModalOpen: boolean;
  toggleSearchModal: () => void;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  closeAll: () => void;
  toasts: Toast[];
  showToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  isCartSidebarOpen: false,
  toggleCartSidebar: () => set((state) => ({ isCartSidebarOpen: !state.isCartSidebarOpen })),
  openCartSidebar: () => set({ isCartSidebarOpen: true }),
  closeCartSidebar: () => set({ isCartSidebarOpen: false }),

  isFilterSidebarOpen: false,
  toggleFilterSidebar: () => set((state) => ({ isFilterSidebarOpen: !state.isFilterSidebarOpen })),
  openFilterSidebar: () => set({ isFilterSidebarOpen: true }),
  closeFilterSidebar: () => set({ isFilterSidebarOpen: false }),

  isSearchModalOpen: false,
  toggleSearchModal: () => set((state) => ({ isSearchModalOpen: !state.isSearchModalOpen })),
  openSearchModal: () => set({ isSearchModalOpen: true }),
  closeSearchModal: () => set({ isSearchModalOpen: false }),

  isGlobalLoading: false,
  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

  closeAll: () => set({
    isMobileMenuOpen: false,
    isCartSidebarOpen: false,
    isFilterSidebarOpen: false,
    isSearchModalOpen: false,
  }),

  toasts: [],
  showToast: (type, message) => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export default useUIStore;