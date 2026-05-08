import type { UserRole } from "@/shared/types/enums";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  doctorId?: string | null;
  patientId?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  specialization?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  specialization?: string;
}

export interface AuthResponse {
  token: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setToken: (token: string) => void;
}
