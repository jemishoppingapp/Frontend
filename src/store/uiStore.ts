import { create } from 'zustand';

interface UIStore {
  // Mobile menu
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;

  // Cart sidebar
  isCartSidebarOpen: boolean;
  toggleCartSidebar: () => void;
  openCartSidebar: () => void;
  closeCartSidebar: () => void;

  // Filter sidebar (mobile)
  isFilterSidebarOpen: boolean;
  toggleFilterSidebar: () => void;
  openFilterSidebar: () => void;
  closeFilterSidebar: () => void;

  // Search modal
  isSearchModalOpen: boolean;
  toggleSearchModal: () => void;
  openSearchModal: () => void;
  closeSearchModal: () => void;

  // Global loading
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Close all modals/sidebars
  closeAll: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Mobile menu
  isMobileMenuOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  // Cart sidebar
  isCartSidebarOpen: false,
  toggleCartSidebar: () =>
    set((state) => ({ isCartSidebarOpen: !state.isCartSidebarOpen })),
  openCartSidebar: () => set({ isCartSidebarOpen: true }),
  closeCartSidebar: () => set({ isCartSidebarOpen: false }),

  // Filter sidebar
  isFilterSidebarOpen: false,
  toggleFilterSidebar: () =>
    set((state) => ({ isFilterSidebarOpen: !state.isFilterSidebarOpen })),
  openFilterSidebar: () => set({ isFilterSidebarOpen: true }),
  closeFilterSidebar: () => set({ isFilterSidebarOpen: false }),

  // Search modal
  isSearchModalOpen: false,
  toggleSearchModal: () =>
    set((state) => ({ isSearchModalOpen: !state.isSearchModalOpen })),
  openSearchModal: () => set({ isSearchModalOpen: true }),
  closeSearchModal: () => set({ isSearchModalOpen: false }),

  // Global loading
  isGlobalLoading: false,
  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

  // Close all
  closeAll: () =>
    set({
      isMobileMenuOpen: false,
      isCartSidebarOpen: false,
      isFilterSidebarOpen: false,
      isSearchModalOpen: false,
    }),
}));

export default useUIStore;
