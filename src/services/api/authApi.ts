import apiClient, { ApiResponse } from './client';
import { ENDPOINTS } from './endpoints';

interface BackendAuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    created_at: string;
    addresses: any[];
  };
  token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  token: string;
  refreshToken: string;
}

export const authApi = {
  async register(data: { name: string; email: string; phone: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<BackendAuthResponse>>(
      ENDPOINTS.AUTH.REGISTER,
      data
    );
    const result = response.data.data;
    if (result.refresh_token) {
      localStorage.setItem('jemi-refresh-token', result.refresh_token);
    }
    return {
      user: result.user,
      token: result.token,
      refreshToken: result.refresh_token,
    };
  },

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<BackendAuthResponse>>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    const result = response.data.data;
    if (result.refresh_token) {
      localStorage.setItem('jemi-refresh-token', result.refresh_token);
    }
    return {
      user: result.user,
      token: result.token,
      refreshToken: result.refresh_token,
    };
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem('jemi-refresh-token');
    }
  },
};

export default authApi;