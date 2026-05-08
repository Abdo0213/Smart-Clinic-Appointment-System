import { create } from "zustand";
import { apiClient } from "@/shared/api/client";
import { API_ROUTES } from "@/shared/api/apiRoutes";
import { decodeJwt } from "@/shared/lib/decodeJwt";
import type { UserRole } from "@/shared/types/enums";
import type { AuthUser, RegisterRequest } from "@/features/auth/model/types";
import { isTokenExpired } from "@/features/auth/lib/token";

interface AuthState {
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

function hydrateFromStorage(): { token: string | null; user: AuthUser | null; isAuthenticated: boolean } {
  if (typeof window === "undefined") {
    return { token: null, user: null, isAuthenticated: false };
  }
  const token = localStorage.getItem("auth_token");
  if (!token || isTokenExpired(token)) {
    if (token) localStorage.removeItem("auth_token");
    return { token: null, user: null, isAuthenticated: false };
  }
  const payload = decodeJwt(token);
  if (!payload) {
    localStorage.removeItem("auth_token");
    return { token: null, user: null, isAuthenticated: false };
  }
  const user: AuthUser = {
    id: payload.sub || "",
    email: payload.email || "",
    firstName: payload.firstName || "",
    lastName: payload.lastName || "",
    role: (payload.role as UserRole) || "Patient",
    doctorId: payload.doctorId || null,
    patientId: payload.patientId || null,
  };
  return { token, user, isAuthenticated: true };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.post(API_ROUTES.AUTH.LOGIN, { email, password });
      const token = data.token;
      const payload = decodeJwt(token);
      const user: AuthUser = {
        id: payload?.sub || "",
        email: payload?.email || email,
        firstName: payload?.firstName || "",
        lastName: payload?.lastName || "",
        role: (payload?.role as UserRole) || "Patient",
        doctorId: payload?.doctorId || null,
        patientId: payload?.patientId || null,
      };
      localStorage.setItem("auth_token", token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (registerData: RegisterRequest) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.post(API_ROUTES.AUTH.REGISTER, registerData);
      const token = data.token;
      const payload = decodeJwt(token);
      const user: AuthUser = {
        id: payload?.sub || "",
        email: payload?.email || registerData.email,
        firstName: payload?.firstName || registerData.firstName,
        lastName: payload?.lastName || registerData.lastName,
        role: (payload?.role as UserRole) || "Patient",
        doctorId: payload?.doctorId || null,
        patientId: payload?.patientId || null,
      };
      localStorage.setItem("auth_token", token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user: AuthUser) => set({ user, isAuthenticated: true }),

  setToken: (token: string) => {
    localStorage.setItem("auth_token", token);
    set({ token });
  },
}));

if (typeof window !== "undefined") {
  const hydrated = hydrateFromStorage();
  if (hydrated.isAuthenticated) {
    useAuthStore.setState(hydrated);
  }
}
