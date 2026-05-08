# Auth Feature — Research

| Field          | Value                          |
|----------------|--------------------------------|
| Feature Branch | `001-auth`                     |
| Created        | 2026-05-07                     |
| Updated        | 2026-05-07                     |

---

## R-01: JWT Handling in Next.js

### Decoding JWT Client-Side

JWTs consist of three base64url-encoded segments: `header.payload.signature`. On the client side, we only need to decode the payload segment to extract user information. The `jose` library provides a lightweight `decodeJwt()` function that does this without verifying the signature (signature verification is the server's responsibility).

```typescript
import { decodeJwt } from "jose";

const payload = decodeJwt(token);
// payload.sub    → user id
// payload.email  → user email
// payload.userName → display name
// payload.role   → user role
// payload.exp    → expiration timestamp (epoch seconds)
```

**Security note:** Client-side JWT decoding is for display and routing purposes only. The server validates the token on every request. A tampered token will be rejected by the server with a 401 response.

### Checking Token Expiry

```typescript
function isTokenExpired(token: string): boolean {
  try {
    const { exp } = decodeJwt(token);
    if (!exp) return true;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

function isTokenExpiringSoon(token: string, thresholdMs: number = 5 * 60 * 1000): boolean {
  try {
    const { exp } = decodeJwt(token);
    if (!exp) return true;
    return Date.now() >= (exp * 1000 - thresholdMs);
  } catch {
    return true;
  }
}
```

### Token Storage: localStorage vs Cookie

| Aspect              | localStorage                          | HttpOnly Cookie                        |
|---------------------|---------------------------------------|----------------------------------------|
| XSS access          | Vulnerable                            | Protected (JS cannot read)             |
| CSRF protection     | Immune (no auto-attach)               | Vulnerable (auto-attached)             |
| Server-side read    | No (client-only)                      | Yes (auto-sent with requests)          |
| Cross-origin        | Same-origin only                      | Configurable with SameSite             |
| Logout              | Easy (delete key)                     | Requires server to clear               |

**Decision:** Use localStorage for the JWT token because:
1. Our API is REST-based and the frontend explicitly attaches the Bearer header (no auto-attach CSRF risk).
2. The backend does not set HttpOnly cookies, so localStorage is the only option.
3. CSRF is not a concern since we use Bearer tokens in the Authorization header, not cookies.
4. Mitigate XSS risk by: sanitizing all rendered content, using CSP headers, and keeping dependencies audited.

---

## R-02: Refine Auth Provider Setup

### AuthProvider Interface

Refine's `AuthProvider` interface provides hooks for the authentication lifecycle:

```typescript
import type { AuthProvider } from "@refinedev/core";

const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const response = await api.post("/auth/login", { email, password });
    const { token } = response.data;
    useAuthStore.getState().login(token);
    return { success: true };
  },

  logout: async () => {
    useAuthStore.getState().logout();
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const { token } = useAuthStore.getState();
    if (token && !isTokenExpired(token)) {
      return { authenticated: true };
    }
    return { authenticated: false, redirectTo: "/login" };
  },

  getIdentity: async () => {
    const { user } = useAuthStore.getState();
    return user;
  },

  onError: async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Attempt token refresh
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        return { retry: true };
      }
      useAuthStore.getState().logout();
      return { logout: true, redirectTo: "/login" };
    }
    if (status === 423) {
      return { logout: true, redirectTo: "/login", error: { message: "Account locked" } };
    }
    return { error };
  },
};
```

### Integration with Next.js App Router

Refine is wired into the app at the root layout level:

```typescript
// src/app/layout.tsx
import { Refine } from "@refinedev/core";
import { authProvider } from "@/features/auth/lib/auth-provider";
import { dataProvider } from "@/providers/refine-provider";

export default function RootLayout({ children }) {
  return (
    <Refine
      authProvider={authProvider}
      dataProvider={dataProvider}
      resources={[
        { name: "users", list: "/users", create: "/users/create", edit: "/users/[id]/edit" },
      ]}
    >
      {children}
    </Refine>
  );
}
```

### Key Findings

1. Refine's `check` method is called on every navigation to determine if the user is authenticated.
2. The `onError` callback handles API errors globally, including 401 responses.
3. Returning `{ retry: true }` from `onError` causes Refine to retry the failed request after refreshing the token.
4. The `getIdentity` method is used by Refine to display user information in the UI.

---

## R-03: Refine Data Provider for REST CRUD

### DataProvider Interface

Refine's `DataProvider` standardizes CRUD operations:

```typescript
import type { DataProvider } from "@refinedev/core";
import axios from "axios";

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    const params = {
      page: pagination?.current || 1,
      pageSize: pagination?.pageSize || 10,
      ...buildFilterParams(filters),
      ...buildSortParams(sorters),
    };
    const { data } = await axios.get(`${API_URL}/${resource}`, { params });
    return {
      data: data.data,
      total: data.total,
    };
  },

  getOne: async ({ resource, id }) => {
    const { data } = await axios.get(`${API_URL}/${resource}/${id}`);
    return { data };
  },

  create: async ({ resource, variables }) => {
    const { data } = await axios.post(`${API_URL}/${resource}`, variables);
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const { data } = await axios.put(`${API_URL}/${resource}/${id}`, variables);
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    await axios.delete(`${API_URL}/${resource}/${id}`);
    return { data: { id } };
  },
};
```

### Key Findings

1. Refine's `getList` expects `{ data, total }` return shape — our backend's `PaginatedResponse` maps directly.
2. The `pagination` parameter provides `current` (1-based page) and `pageSize`.
3. Filters and sorters can be mapped to query parameters.
4. The `resource` name (e.g., "users") maps to the URL path segment.
5. Refine's `useTable` hook integrates with `getList` for automatic pagination.

---

## R-04: Token Refresh Strategy

### Approach: 401 Interceptor with Refresh

The most robust pattern for token refresh in SPAs:

1. **Interceptor detects 401:** The Axios response interceptor catches any 401 response.
2. **Attempt refresh:** Call a refresh endpoint (or re-authenticate) to obtain a new token.
3. **Queue pending requests:** While refresh is in-flight, queue any other 401 responses.
4. **On refresh success:** Update the stored token, replay all queued requests with the new token.
5. **On refresh failure:** Clear auth state, redirect to login.

```typescript
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(token: string | null, error: unknown = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { token } = await refreshToken();
        useAuthStore.getState().setToken(token);
        processQueue(token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(null, refreshError);
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

### Refresh Endpoint Options

| Option                     | Pros                                         | Cons                                     |
|----------------------------|----------------------------------------------|------------------------------------------|
| Dedicated `/auth/refresh`  | Clean separation; can issue new token without credentials | Requires backend implementation          |
| Re-use `/auth/login`       | No new endpoint needed                       | Requires storing credentials (insecure)  |
| Refresh token (cookie)     | More secure; rotation possible               | Requires backend cookie support          |

**Decision:** Assume a dedicated `/auth/refresh` endpoint that accepts the current (non-expired) token and returns a new one. If the backend does not implement this, fall back to silent re-authentication is NOT an option (would require storing passwords). Instead, the user will be prompted to re-login on token expiry.

### Proactive Refresh

In addition to the reactive 401 interceptor, a `useTokenRefresh` hook will check the token every 60 seconds and proactively refresh if the token expires within 5 minutes:

```typescript
function useTokenRefresh() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const { token } = useAuthStore.getState();
      if (token && isTokenExpiringSoon(token)) {
        try {
          const { token: newToken } = await refreshToken();
          useAuthStore.getState().setToken(newToken);
        } catch {
          useAuthStore.getState().logout();
        }
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, []);
}
```

---

## R-05: RBAC Patterns with Refine

### Access Control Provider

Refine supports an `accessControlProvider` that can implement role-based checks:

```typescript
import type { AccessControlProvider } from "@refinedev/core";

const accessControlProvider: AccessControlProvider = {
  can: async ({ action, resource, params }) => {
    const { user } = useAuthStore.getState();
    const role = user?.role;

    if (role === "Admin") {
      return { can: true };
    }

    const restrictedResources = ["users"];
    if (restrictedResources.includes(resource) && role !== "Admin") {
      return { can: false, reason: "Only administrators can manage users" };
    }

    return { can: true };
  },
};
```

### Route-Level Protection

Combine Refine's `can` check with Next.js middleware for route protection:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authStorage = request.cookies.get("auth-storage");
  // Or read from localStorage via a client-side guard component

  // For App Router, route protection is best done client-side
  // since localStorage is not available in middleware
  return NextResponse.next();
}
```

Since localStorage is not accessible in Next.js middleware, route protection will be implemented client-side using an `AuthGuard` component that wraps protected routes:

```typescript
// src/features/auth/components/auth-guard.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function AuthGuard({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.replace("/");
    }
  }, [isAuthenticated, user, requiredRole, router]);

  if (!isAuthenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}
```

### Key Findings

1. Refine's `accessControlProvider.can` is called by `useCan` hook and `<CanAccess>` component.
2. For page-level protection, the `AuthGuard` component is simpler and more explicit.
3. Both approaches can be combined: `AuthGuard` for route-level, Refine's `can` for UI element-level (e.g., hiding the Users nav item for non-admins).
4. Next.js middleware cannot access localStorage, so JWT validation in middleware requires cookie-based storage or a different approach.

---

## R-06: Zustand Persistence

### Persist Middleware

Zustand's `persist` middleware automatically syncs store state to a storage backend (default: localStorage):

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      // ... actions
    }),
    {
      name: "auth-storage",             // localStorage key
      partialize: (state) => ({          // only persist these fields
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### Hydration Considerations

1. **Initial render mismatch:** On SSR, localStorage is not available. Zustand's persist middleware handles this by using `skipHydration` or detecting the client environment. The store initially uses default values and hydrates on the client after mount.

2. **Hydration callback:** Use `onRehydrateStorage` to perform actions after hydration:
   ```typescript
   persist(
     (set) => ({ /* ... */ }),
     {
       name: "auth-storage",
       onRehydrateStorage: () => {
         return (state, error) => {
           if (error) {
             console.error("Failed to rehydrate auth state:", error);
           }
           if (state?.token && isTokenExpired(state.token)) {
             state.logout();
           }
         };
       },
     }
   );
   ```

3. **Checking hydration status:** Use `useAuthStore.persist.hasHydrated()` to determine if the store has finished hydrating from localStorage. This is useful for showing a loading state on the initial app render.

### Key Findings

1. `partialize` prevents `isLoading` from being persisted (it should always start as `false`).
2. Token expiry should be checked after hydration to auto-logout users with expired tokens.
3. The `persist` middleware stores the state as JSON under the key `auth-storage` in localStorage.
4. On SSR (Next.js App Router), Zustand stores work correctly in client components marked with `"use client"`.
