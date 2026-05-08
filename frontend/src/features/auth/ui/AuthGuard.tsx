"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/model/authStore";
import type { UserRole } from "@/shared/types/enums";
import { ROUTE_PATHS, ROLE_DEFAULT_REDIRECTS } from "@/shared/config/appConfig";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTE_PATHS.LOGIN);
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      const redirectPath = user
        ? ROLE_DEFAULT_REDIRECTS[user.role]
        : ROUTE_PATHS.LOGIN;
      router.replace(redirectPath);
    }
  }, [isAuthenticated, user, requiredRole, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
