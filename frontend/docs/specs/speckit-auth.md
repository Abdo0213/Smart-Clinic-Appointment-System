# SpecKit: Authentication & Authorization

## Feature Name
Auth — Registration, Login, JWT, Role-Based Access Control

## Description
Handles user registration (patients), login, JWT token management, and four-role RBAC (PATIENT / DOCTOR / RECEPTIONIST / ADMIN). Integrates with Refine's auth provider for dashboard access control and route protection.

## User Stories

- **US-AUTH-01**: As a patient, I can register an account with my email, password, first name, and last name so that I can access the clinic portal.
- **US-AUTH-02**: As any user, I can log in with my email and password to receive a JWT token and access role-appropriate features.
- **US-AUTH-03**: As an admin, I can create user accounts with any role (Doctor, Receptionist, Admin) so that staff members can access the system.
- **US-AUTH-04**: As an admin, I can view all user accounts in the system.
- **US-AUTH-05**: As an admin, I can update or delete user accounts.
- **US-AUTH-06**: As any user, I can log out to invalidate my session.
- **US-AUTH-07**: As the system, I enforce role-based access control so that users only see features and routes appropriate to their role.
- **US-AUTH-08**: As the system, I lock an account after 5 failed login attempts.

## UI States

| State | Description |
|---|---|
| **Loading** | Spinner on login/register form submission; skeleton on user list |
| **Empty** | "No users found" message on admin user list |
| **Error** | Inline validation errors (Zod); toast for 401/403/server errors; account locked message |
| **Success** | Redirect to role-based dashboard after login; success toast after registration |

## Components (Atomic Breakdown)

| Component | Type | Description |
|---|---|---|
| `LoginForm` | Organism | Email/password form with validation, submit handler |
| `RegisterForm` | Organism | Patient registration form (firstName, lastName, email, password) |
| `CreateUserForm` | Organism | Admin-only: create user with role selection |
| `UserListTable` | Organism | DataTable (DiceUI) showing all users with actions |
| `UserCard` | Molecule | Summary card for a single user |
| `RoleBadge` | Atom | Colored badge showing user role |
| `AuthGuard` | Molecule | Wrapper that checks role and redirects if unauthorized |
| `LogoutButton` | Atom | Button triggering logout + token clear |

## Data Models

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "Patient" | "Doctor" | "Receptionist" | "Admin";
  specialization?: string; // only when role === "Doctor"
}

interface AuthResponse {
  token: string;
}

interface User {
  id: string;
  email: string;
  userName: string;
  role: "Patient" | "Doctor" | "Receptionist" | "Admin";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

## API Integration

| Action | Method | Endpoint | Auth | Request | Response |
|---|---|---|---|---|---|
| Login | POST | `/auth/login` | No | `LoginRequest` | `AuthResponse` |
| Register Patient | POST | `/auth/register` | No | `RegisterRequest` | `AuthResponse` |
| Create User (Admin) | POST | `/users` | Admin | `CreateUserRequest` | `User` |
| Get All Users | GET | `/users` | Admin | — | `User[]` (paginated) |
| Get User by ID | GET | `/users/{id}` | Admin | — | `User` |
| Update User | PUT | `/users/{id}` | Admin | `Partial<User>` | `User` |
| Delete User | DELETE | `/users/{id}` | Admin | — | `void` |

## State Management

- **Zustand** store: `useAuthStore` — holds `user`, `token`, `isAuthenticated`, `isLoading`, actions (`login`, `register`, `logout`, `setUser`)
- **Refine Auth Provider**: Wraps Zustand store; provides `login`, `logout`, `checkError`, `checkAuth`, `getPermissions` to Refine's `<Authenticated>` component
- **React Query**: Used for user list CRUD (`useGetUsers`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`)
- **Token persistence**: JWT stored in `localStorage` (or httpOnly cookie if backend supports — currently NOT supported, see missing endpoints)

## Validation Rules (Zod)

```typescript
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[!@#$%^&*]/, "Must contain a special character"),
});

const createUserSchema = registerSchema.extend({
  role: z.enum(["Patient", "Doctor", "Receptionist", "Admin"]),
  specialization: z.string().optional(),
});
```

## Edge Cases

1. **Account lockout**: After 5 failed login attempts, show "Account locked" message. No unlock mechanism exists in API — backend should auto-unlock after time period (unclear, needs backend confirmation).
2. **Token expiry**: JWT expires mid-session — intercept 401 in Axios, redirect to login.
3. **Duplicate email registration**: API returns error — show user-friendly message.
4. **Admin creating doctor**: Two-step process — create user via `POST /users`, then create doctor profile via `POST /doctors` (separate feature).
5. **Role mismatch**: User with Patient role trying to access admin routes — AuthGuard redirects to patient dashboard.
6. **Token not returned on register**: API returns `{ token }` on register but unclear if user profile is auto-created. Need to check if `POST /auth/register` also creates patient profile.

## FSD Placement

```
src/
  features/
    auth/
      ui/
        LoginForm.tsx
        RegisterForm.tsx
        LogoutButton.tsx
        AuthGuard.tsx
      api/
        login.ts
        register.ts
        users.ts          # admin user CRUD
      model/
        authStore.ts      # Zustand store
        schemas.ts         # Zod schemas
        types.ts
      lib/
        token.ts           # JWT decode, expiry check
      index.ts
  entities/
    user/
      model/
        types.ts
      ui/
        UserCard.tsx
        RoleBadge.tsx
      index.ts
```
