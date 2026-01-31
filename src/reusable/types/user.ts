export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  avatar?: string;
}