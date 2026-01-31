import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchUser,
    clearError,
    setUser,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchUser,
    clearError,
    setUser,
  };
};

export default useAuth;
