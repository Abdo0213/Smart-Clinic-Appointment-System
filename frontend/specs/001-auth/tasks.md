# Auth Feature — Task Breakdown

| Field          | Value                          |
|----------------|--------------------------------|
| Feature Branch | `001-auth`                     |
| Status         | In Progress                    |
| Owner          | Frontend Team                  |
| Created        | 2026-05-07                     |
| Updated        | 2026-05-08                     |

---

## Legend

- **P1** = Critical path, must complete first
- **P2** = High priority
- **P3** = Medium priority
- **P4** = Low priority / nice-to-have
- **US#** = User Story reference (US1–US4)

---

## Phase 1: Setup

- [x] T001 [P1] Initialize Next.js 16 project with TypeScript, Tailwind CSS, and App Router `npx create-next-app@latest`
- [x] T002 [P1] Install dependencies: refine, @refinedev/core, @refinedev/react-hook-form, @tanstack/react-query, zustand, zod, react-hook-form, @hookform/resolvers, axios `package.json`
- [x] T003 [P1] Install Shadcn UI and add base components (Button, Input, Label, Card, Dialog, Table, Form, Select, Toast, DropdownMenu) `src/components/ui/`
- [x] T004 [P1] Set up FSD directory structure: `src/features/auth/`, `src/entities/user/`, `src/shared/`, `src/app/providers/` `src/`

---

## Phase 2: Foundation

- [x] T005 [P1] Create shared Axios client with base URL `http://localhost:8080/api` and request interceptor for Bearer token `src/shared/api/client.ts`
- [x] T006 [P1] Create Zustand auth store with localStorage hydration (user, token, isAuthenticated, isLoading, login, logout, setUser, setToken actions) `src/features/auth/model/authStore.ts`
- [x] T007 [P1] Implement Refine auth provider using Zustand store (login, logout, check, onError, getPermissions, getIdentity) `src/app/providers/refine-provider.tsx`
- [x] T008 [P1] Create Refine access control provider with role-based resource path mapping `src/app/providers/refine-provider.tsx`
- [x] T009 [P1] Implement JWT decode utility (extract user info and expiry from token payload) `src/shared/lib/decodeJwt.ts` `src/features/auth/lib/token.ts`
- [x] T010 [P1] Create localStorage token management integrated directly in Zustand auth store `src/features/auth/model/authStore.ts`

---

## Phase 3: US1 — Login (P1)

- [x] T011 [P1] [US1] Define Zod schema for LoginRequest {email, password} `src/features/auth/model/schemas.ts`
- [x] T012 [P1] [US1] Create API function: POST /auth/login → AuthResponse (TanStack Query mutation) `src/features/auth/api/login.ts`
- [x] T013 [P1] [US1] Build LoginForm component with React Hook Form + Zod resolver, email and password fields, loading state, error display, 423 lockout handling `src/features/auth/ui/LoginForm.tsx`
- [x] T014 [P1] [US1] Create Login page composing LoginForm inside Card layout `src/app/(auth)/login/page.tsx` `src/pages/login/ui/LoginPage.tsx`
- [x] T015 [P1] [US1] Implement AuthGuard component that redirects unauthenticated users to /login with role-based redirect support `src/features/auth/ui/AuthGuard.tsx`

---

## Phase 4: US2 — Register (P2)

- [x] T016 [P2] [US2] Define Zod schema for RegisterRequest {email, password, firstName, lastName} with password confirmation `src/features/auth/model/schemas.ts`
- [x] T017 [P2] [US2] Create API function: POST /auth/register → AuthResponse (TanStack Query mutation) `src/features/auth/api/register.ts`
- [x] T018 [P2] [US2] Build RegisterForm component with React Hook Form + Zod resolver, all required fields, password confirmation, loading state, error display `src/features/auth/ui/RegisterForm.tsx`
- [x] T019 [P2] [US2] Create Register page composing RegisterForm inside Card layout `src/app/(auth)/register/page.tsx` `src/pages/register/ui/RegisterPage.tsx`
- [x] T020 [P2] [US2] Add "Already have an account? Log in" and "Don't have an account? Register" navigation links between Login and Register pages `src/features/auth/ui/LoginForm.tsx` `src/features/auth/ui/RegisterForm.tsx`

---

## Phase 5: US3 — Admin User Management (P3)

- [x] T021 [P3] [US3] Define TypeScript interfaces and Zod schemas for User and CreateUserRequest {firstName, lastName, email, password, role, specialization?} `src/entities/user/model/types.ts` `src/features/auth/model/schemas.ts` `src/features/auth/model/types.ts`
- [x] T022 [P3] [US3] Create User API functions: GET /users (paginated), GET /users/{id}, POST /users, PUT /users/{id}, DELETE /users/{id} `src/features/auth/api/users.ts`
- [x] T023 [P3] [US3] Build UserTable with DataTable component, columns: Email, Name, Role (with colored Badge), Actions (Edit, Delete), pagination controls `src/pages/admin-users/ui/UserManagementPage.tsx`
- [x] T024 [P3] [US3] Build CreateUserForm and EditUserForm components with React Hook Form + Zod, conditional specialization field for Doctor role `src/pages/admin-users/ui/UserManagementPage.tsx`
- [x] T025 [P3] [US3] Create User List page with UserTable, SearchBar, and "Create User" button `src/pages/admin-users/ui/UserManagementPage.tsx`
- [x] T026 [P3] [US3] Create Create User dialog with UserForm in Dialog layout `src/pages/admin-users/ui/UserManagementPage.tsx`
- [x] T027 [P3] [US3] Create Edit User dialog with UserForm pre-populated with existing user data `src/pages/admin-users/ui/UserManagementPage.tsx`
- [x] T028 [P3] [US3] Implement delete confirmation dialog with ConfirmDialog component `src/pages/admin-users/ui/UserManagementPage.tsx`
- [x] T029 [P3] [US3] Add RBAC guard to /admin/users route: only Admin role can access; AuthGuard wraps the page `src/pages/admin-users/ui/UserManagementPage.tsx`

---

## Phase 6: US4 — Account Lockout & Token Refresh (P4)

- [x] T030 [P4] [US4] Add 401 response interceptor in shared Axios client: currently logs out and redirects to /login on 401 `src/shared/api/client.ts`
- [ ] T031 [P4] [US4] Implement token refresh API function with request queueing and retry logic `src/features/auth/api/token-refresh.ts`
- [ ] T032 [P4] [US4] Create useTokenRefresh hook that proactively refreshes tokens before expiry (check every minute) `src/features/auth/hooks/use-token-refresh.ts`
- [x] T033 [P4] [US4] Handle account lockout: detect 423 status from login API, display lockout message to user `src/features/auth/ui/LoginForm.tsx`
- [x] T034 [P4] [US4] Handle session expiry: on 401, clear auth state, redirect to /login `src/shared/api/client.ts`
- [x] T035 [P4] [US4] Add logout functionality: clear token from localStorage, reset Zustand store, redirect to /login `src/features/auth/ui/LogoutButton.tsx` `src/features/auth/model/authStore.ts`

---

## Phase 7: Polish

- [x] T036 [P3] Add loading spinners/skeletons to pages and data-fetching components (LoadingSpinner, Loader2Icon) `src/shared/ui/` `src/features/auth/ui/`
- [ ] T037 [P3] Add toast notifications for success/error on CRUD operations (user create, update, delete) using Sonner toast `src/pages/admin-users/ui/UserManagementPage.tsx`
- [x] T038 [P3] Ensure mobile responsiveness for Login, Register, and User Management pages `src/app/`
- [x] T039 [P2] Add user display in dashboard header with UserMenu dropdown (name, role, profile link, logout) `src/widgets/header/ui/Header.tsx` `src/widgets/header/ui/UserMenu.tsx`
- [ ] T040 [P4] Write unit tests for Zod schemas (LoginRequest, RegisterRequest, CreateUserRequest) `src/features/auth/model/` `src/entities/user/model/`
- [ ] T041 [P4] Write unit tests for Zustand auth store (login, logout, token refresh flows) `src/features/auth/model/`
- [ ] T042 [P4] Write integration tests for login and register page flows `src/app/(auth)/`

---

## Task Dependencies

```
T001 → T002 → T003 → T004 → T005-T010 (Foundation) ✅
                                    ↓
                         T011-T015 (Login) ✅
                         T016-T020 (Register, parallel with Login after Foundation) ✅
                                    ↓
                         T021-T029 (Admin CRUD, after Login) ✅
                                    ↓
                         T030-T035 (Lockout & Refresh, after Login) 🟡 Partial
                                    ↓
                         T036-T042 (Polish, after all above) 🟡 Partial
```

## Summary

| Phase | Status | Completed | Remaining |
|-------|--------|-----------|-----------|
| Phase 1: Setup | ✅ Done | 4/4 | 0 |
| Phase 2: Foundation | ✅ Done | 6/6 | 0 |
| Phase 3: Login | ✅ Done | 5/5 | 0 |
| Phase 4: Register | ✅ Done | 5/5 | 0 |
| Phase 5: Admin CRUD | ✅ Done | 9/9 | 0 |
| Phase 6: Token Refresh | 🟡 Partial | 4/6 | T031, T032 |
| Phase 7: Polish | 🟡 Partial | 3/7 | T037, T040, T041, T042 |
| **Total** | **~86%** | **36/42** | **6** |

### Remaining Tasks (P4 — Low Priority)

1. **T031** — Token refresh API with queue/retry (requires backend `/auth/refresh` endpoint)
2. **T032** — Proactive token refresh hook (depends on T031)
3. **T037** — Toast notifications on CRUD operations
4. **T040** — Unit tests for Zod schemas
5. **T041** — Unit tests for Zustand auth store
6. **T042** — Integration tests for auth pages
