export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  nickname?: string;
  alt_phone?: string;
  address?: string;
  department?: string;
  level?: string;
  profile_completed: boolean;
  createdAt?: string;
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

export interface ProfileCompleteData {
  nickname: string;
  alt_phone: string;
  address: string;
  department: string;
  level: string;
}
