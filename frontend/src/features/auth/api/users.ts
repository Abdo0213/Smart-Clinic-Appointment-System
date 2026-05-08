import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import { API_ROUTES } from "@/shared/api/apiRoutes";
import type { User } from "@/entities/user/model/types";
import type { CreateUserRequest, UpdateUserRequest } from "@/features/auth/model/types";
import type { PaginatedResponse } from "@/shared/types/api";

interface UserFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
}

export function useGetUsers(filters: UserFilters = {}) {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: ["users", filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.pageSize = filters.pageSize;
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      const response = await apiClient.get<PaginatedResponse<User>>(API_ROUTES.USERS.LIST, { params });
      return response.data;
    },
  });
}

export function useGetUser(id: string) {
  return useQuery<User, Error>({
    queryKey: ["users", id],
    queryFn: async () => {
      const response = await apiClient.get<User>(API_ROUTES.USERS.DETAIL(id));
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation<User, Error, CreateUserRequest>({
    mutationFn: async (data: CreateUserRequest) => {
      const response = await apiClient.post<User>(API_ROUTES.USERS.CREATE, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string; data: UpdateUserRequest }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put<User>(API_ROUTES.USERS.DETAIL(id), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await apiClient.delete(API_ROUTES.USERS.DETAIL(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
