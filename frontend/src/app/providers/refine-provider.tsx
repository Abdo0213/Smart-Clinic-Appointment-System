"use client";

import { Refine } from "@refinedev/core";
import { useAuthStore } from "@/features/auth/model/authStore";
import { ROLE_ALLOWED_PATHS } from "@/shared/config/appConfig";

const authProvider = {
  login: async ({ email, password }: { email: string; password: string }) => {
    await useAuthStore.getState().login(email, password);
    return { success: true } as const;
  },
  logout: async () => {
    useAuthStore.getState().logout();
    return { success: true, redirectTo: "/login" } as const;
  },
  check: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) return { authenticated: true } as const;
    return { authenticated: false, redirectTo: "/login", logout: true } as const;
  },
  onError: async (error: { status?: number }) => {
    if (error?.status === 401) {
      useAuthStore.getState().logout();
      return { redirectTo: "/login", logout: true } as const;
    }
    return {} as const;
  },
  getPermissions: async () => {
    const { user } = useAuthStore.getState();
    return user?.role || null;
  },
  getIdentity: async () => {
    const { user } = useAuthStore.getState();
    return user;
  },
};

const accessControlProvider = {
  can: async ({
    resource,
    action,
  }: {
    resource?: string;
    action: string;
  }) => {
    const { user } = useAuthStore.getState();
    if (!user) return { can: false } as const;
    if (user.role === "Admin") return { can: true } as const;

    const allowedPaths = ROLE_ALLOWED_PATHS[user.role] || [];
    const resourcePathMap: Record<string, string[]> = {
      patients: ["/patient", "/reception/patients", "/admin/patients"],
      doctors: ["/doctor", "/admin/doctors"],
      appointments: [
        "/patient/appointments",
        "/reception/appointments",
        "/admin/appointments",
      ],
      visits: ["/doctor/visits", "/doctor/queue"],
      invoices: [
        "/patient/invoices",
        "/reception/billing",
        "/admin/billing",
      ],
      users: ["/admin/users"],
      reports: ["/admin/reports"],
      "audit-log": ["/admin/audit-log"],
    };
    const resourcePaths = resourcePathMap[resource || ""] || [];
    const canAccess = resourcePaths.some((p) =>
      allowedPaths.some((ap) => ap.startsWith(p) || p.startsWith(ap))
    );
    return { can: canAccess } as const;
  },
};

const resources = [
  { name: "patients", list: "/admin/patients", show: "/patient/profile" },
  { name: "doctors", list: "/admin/doctors", show: "/doctor/profile" },
  { name: "appointments", list: "/admin/appointments" },
  { name: "visits", list: "/doctor/queue" },
  { name: "invoices", list: "/admin/billing" },
  { name: "users", list: "/admin/users" },
  { name: "reports", list: "/admin/reports" },
  { name: "audit-log", list: "/admin/audit-log" },
];

export function RefineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Refine
      authProvider={authProvider}
      accessControlProvider={accessControlProvider}
      resources={resources}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      }}
    >
      {children}
    </Refine>
  );
}
