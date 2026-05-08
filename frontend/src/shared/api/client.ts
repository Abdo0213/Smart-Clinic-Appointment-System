import axios from "axios";
import { useAuthStore } from "@/features/auth/model/authStore";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
