import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import { API_ROUTES } from "@/shared/api/apiRoutes";
import type { AuthResponse } from "@/features/auth/model/types";
import type { LoginRequest } from "@/features/auth/model/types";

export function useLogin() {
  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiClient.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, data);
      return response.data;
    },
  });
}
