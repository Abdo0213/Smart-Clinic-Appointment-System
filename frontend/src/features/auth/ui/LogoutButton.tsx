"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/model/authStore";
import { Button } from "@/components/ui/button";
import { ROUTE_PATHS } from "@/shared/config/appConfig";
import { LogOutIcon } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push(ROUTE_PATHS.LOGIN);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      <LogOutIcon />
      Logout
    </Button>
  );
}
