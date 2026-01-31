import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  ProfileUpdateData 
} from '@/reusable/types';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/reusable/utils/constants';

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    return response.data;
  },

  // Register
  async register(data: Omit<RegisterData, 'confirmPassword'>): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.REGISTER,
      data
    );
    
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(ENDPOINTS.USER.PROFILE);
    return response.data;
  },

  // Update profile
  async updateProfile(data: ProfileUpdateData): Promise<User> {
    const response = await apiClient.put<User>(ENDPOINTS.USER.PROFILE, data);
    return response.data;
  },

  // Check if logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  // Reset password
  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
  },
};

export default authService;
