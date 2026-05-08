import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import { API_ROUTES } from "@/shared/api/apiRoutes";
import type { AuthResponse, RegisterRequest } from "@/features/auth/model/types";

export function useRegister() {
  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, data);
      return response.data;
    },
  });
}
