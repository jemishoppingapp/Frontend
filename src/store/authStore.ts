import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/services/api';

interface User {
  id: number;
  email: string;
  phone: string;
  name: string;
  avatar?: string;
  nickname?: string;
  alt_phone?: string;
  address?: string;
  department?: string;
  level?: string;
  profile_completed: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User, token?: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  loginWithCredentials: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (user, token) => set({ user, token: token || null, isAuthenticated: true, error: null }),
      logout: () => set({ user: null, token: null, isAuthenticated: false, error: null }),
      updateUser: (data) => set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),

      loginWithCredentials: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Login failed';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },
    }),
    { 
      name: 'jemi-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
