# Auth Feature — Data Models

| Field          | Value                          |
|----------------|--------------------------------|
| Feature Branch | `001-auth`                     |
| Created        | 2026-05-07                     |
| Updated        | 2026-05-07                     |

---

## 1. User

Represents a system user. Returned by the API in responses and embedded in the JWT payload.

```typescript
interface User {
  id: string;
  email: string;
  userName: string;
  role: "Patient" | "Doctor" | "Receptionist" | "Admin";
}
```

| Field    | Type   | Required | Constraints                                      |
|----------|--------|----------|--------------------------------------------------|
| id       | string | Yes      | UUID format, server-generated                     |
| email    | string | Yes      | Valid email, max 254 chars, lowercase normalized  |
| userName | string | Yes      | Display name (concatenation of firstName + lastName) |
| role     | string | Yes      | Enum: Patient, Doctor, Receptionist, Admin        |

---

## 2. LoginRequest

Payload for `POST /auth/login`.

```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

| Field    | Type   | Required | Constraints                         |
|----------|--------|----------|-------------------------------------|
| email    | string | Yes      | Valid email format                  |
| password | string | Yes      | Min 1 character (server validates)  |

**Zod Schema:**

```typescript
import { z } from "zod";

const loginRequestSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address").max(254, "Email must not exceed 254 characters"),
  password: z.string().min(1, "Password is required"),
});

type LoginRequest = z.infer<typeof loginRequestSchema>;
```

---

## 3. RegisterRequest

Payload for `POST /auth/register`.

```typescript
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
```

| Field     | Type   | Required | Constraints                                            |
|-----------|--------|----------|--------------------------------------------------------|
| email     | string | Yes      | Valid email format, max 254 chars                      |
| password  | string | Yes      | Min 8 chars, at least 1 non-space character            |
| firstName | string | Yes      | Min 1 char, max 100 chars                              |
| lastName  | string | Yes      | Min 1 char, max 100 chars                              |

**Zod Schema:**

```typescript
const registerRequestSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email address").max(254, "Email must not exceed 254 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/\S/, "Password must contain at least one non-space character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    firstName: z.string().min(1, "First name is required").max(100, "First name must not exceed 100 characters"),
    lastName: z.string().min(1, "Last name is required").max(100, "Last name must not exceed 100 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterRequest = z.infer<typeof registerRequestSchema>;
```

---

## 4. CreateUserRequest

Payload for `POST /users` (Admin only).

```typescript
interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "Patient" | "Doctor" | "Receptionist" | "Admin";
  specialization?: string;
}
```

| Field           | Type   | Required | Constraints                                                    |
|-----------------|--------|----------|----------------------------------------------------------------|
| firstName       | string | Yes      | Min 1 char, max 100 chars                                      |
| lastName        | string | Yes      | Min 1 char, max 100 chars                                      |
| email           | string | Yes      | Valid email format, max 254 chars                               |
| password        | string | Yes      | Min 8 chars, at least 1 non-space character                     |
| role            | string | Yes      | Enum: Patient, Doctor, Receptionist, Admin                      |
| specialization  | string | No       | Required when role is "Doctor"; min 1 char, max 200 chars       |

**Zod Schema:**

```typescript
const createUserRequestSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(100, "First name must not exceed 100 characters"),
    lastName: z.string().min(1, "Last name is required").max(100, "Last name must not exceed 100 characters"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address").max(254, "Email must not exceed 254 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/\S/, "Password must contain at least one non-space character"),
    role: z.enum(["Patient", "Doctor", "Receptionist", "Admin"], {
      required_error: "Role is required",
    }),
    specialization: z.string().optional(),
  })
  .refine((data) => data.role !== "Doctor" || (data.specialization && data.specialization.trim().length > 0), {
    message: "Specialization is required for Doctor role",
    path: ["specialization"],
  });

type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
```

---

## 5. UpdateUserRequest

Payload for `PUT /users/{id}` (Admin only).

```typescript
interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "Patient" | "Doctor" | "Receptionist" | "Admin";
  specialization?: string;
}
```

All fields are optional; only provided fields are updated. The same Zod refinement for Doctor + specialization applies.

---

## 6. AuthResponse

Response from `POST /auth/login` and `POST /auth/register`.

```typescript
interface AuthResponse {
  token: string;
}
```

| Field | Type   | Description                |
|-------|--------|----------------------------|
| token | string | JWT token for Bearer auth  |

The JWT payload (decoded) contains:

```typescript
interface JwtPayload {
  sub: string;        // user id
  email: string;
  userName: string;
  role: "Patient" | "Doctor" | "Receptionist" | "Admin";
  iat: number;        // issued at (epoch seconds)
  exp: number;        // expiration (epoch seconds)
}
```

---

## 7. AuthState (Zustand Store)

Client-side authentication state managed by Zustand with `persist` middleware.

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
}
```

| Field           | Type            | Default  | Description                                        |
|-----------------|-----------------|----------|----------------------------------------------------|
| user            | User \| null    | null     | Currently authenticated user, decoded from JWT      |
| token           | string \| null  | null     | Raw JWT token string                                |
| isAuthenticated | boolean         | false    | Derived: true when token is non-null and not expired|
| isLoading       | boolean         | false    | True while login/register/refresh is in-flight      |

**Store Implementation Outline:**

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

      login: (token: string) => {
        const decoded = decodeJwt(token);
        set({
          token,
          user: {
            id: decoded.sub,
            email: decoded.email,
            userName: decoded.userName,
            role: decoded.role,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user: User) => set({ user }),
      setToken: (token: string) => set({ token }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

## 8. PaginatedResponse<T>

Generic wrapper for paginated list endpoints (e.g., `GET /users`).

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

| Field      | Type     | Description                        |
|------------|----------|------------------------------------|
| data       | T[]      | Array of items for current page    |
| total      | number   | Total number of items              |
| page       | number   | Current page number (1-based)      |
| pageSize   | number   | Number of items per page           |
| totalPages | number   | Total number of pages              |

**Usage for Users:**

```typescript
type UserListResponse = PaginatedResponse<User>;
```
