import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import { API_ROUTES } from "@/shared/api/apiRoutes";
import { useAuthStore } from "@/features/auth/model/authStore";
import type { UpdateUserRequest, AuthUser } from "@/features/auth/model/types";
import { toast } from "sonner";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation<AuthUser, Error, UpdateUserRequest>({
    mutationFn: async (data: UpdateUserRequest) => {
      const response = await apiClient.put<AuthUser>(API_ROUTES.AUTH.ME, data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update profile";
      toast.error(message);
    },
  });
}
