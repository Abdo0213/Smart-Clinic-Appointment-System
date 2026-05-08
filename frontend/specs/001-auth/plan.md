# Auth Feature — Implementation Plan

| Field          | Value                          |
|----------------|--------------------------------|
| Feature Branch | `001-auth`                     |
| Status         | Draft                          |
| Owner          | Frontend Team                  |
| Created        | 2026-05-07                     |
| Updated        | 2026-05-07                     |

---

## 1. Technical Context

| Technology         | Version / Notes                                |
|--------------------|-------------------------------------------------|
| Next.js            | 16 (App Router, RSC where applicable)           |
| Shadcn UI          | Latest — component library (Button, Input, Dialog, Table, etc.) |
| Refine             | Latest — data provider, auth provider, resource definitions |
| React Hook Form    | Latest — form state management                  |
| Zustand            | Latest — client-side auth state store           |
| Zod                | Latest — schema validation for forms & API      |
| TypeScript         | Strict mode enabled                             |
| Tailwind CSS       | Utility-first styling                           |
| Base URL           | `http://localhost:8080/api`                     |

---

## 2. Project Structure (Feature-Sliced Design)

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Route group: unauthenticated
│   │   ├── login/page.tsx            # Login page
│   │   └── register/page.tsx         # Register page
│   ├── (dashboard)/                  # Route group: authenticated
│   │   ├── layout.tsx                # Dashboard layout with sidebar
│   │   ├── page.tsx                  # Dashboard home
│   │   └── users/                    # Admin User Management
│   │       ├── page.tsx              # User list
│   │       ├── create/page.tsx       # Create user
│   │       └── [id]/edit/page.tsx    # Edit user
│   ├── layout.tsx                    # Root layout (Refine provider)
│   └── globals.css
├── features/
│   └── auth/
│       ├── api/                      # API layer
│       │   ├── login.ts              # POST /auth/login
│       │   ├── register.ts           # POST /auth/register
│       │   └── token-refresh.ts      # Token refresh logic
│       ├── components/               # Auth-specific UI components
│       │   ├── login-form.tsx        # Login form with RHF + Zod
│       │   ├── register-form.tsx     # Register form with RHF + Zod
│       │   └── auth-guard.tsx        # Route protection component
│       ├── hooks/                    # Custom hooks
│       │   ├── use-auth.ts           # Convenience hook for auth state
│       │   └── use-token-refresh.ts  # Auto-refresh hook
│       ├── model/                    # Types & schemas
│       │   ├── auth.types.ts         # TS interfaces
│       │   └── auth.schema.ts        # Zod schemas
│       ├── store/                    # Zustand store
│       │   └── auth-store.ts         # Auth state management
│       └── lib/                      # Utilities
│           ├── jwt.ts                # JWT decode & expiry helpers
│           └── auth-provider.ts      # Refine auth provider impl
├── entities/
│   └── user/
│       ├── api/                      # User API layer
│       │   └── user-api.ts           # CRUD: /users endpoints
│       ├── components/               # User-specific UI components
│       │   ├── user-form.tsx         # Create/Edit user form
│       │   └── user-table.tsx        # User data table
│       ├── model/                    # Types & schemas
│       │   ├── user.types.ts         # TS interfaces
│       │   └── user.schema.ts        # Zod schemas
│       └── hooks/
│           └── use-users.ts          # TanStack Query / Refine hooks
├── shared/
│   ├── api/
│   │   └── client.ts                # Axios/fetch instance with interceptors
│   ├── lib/
│   │   └── storage.ts               # localStorage wrapper
│   └── ui/
│       └── ...                       # Shadcn UI components
└── providers/
    └── refine-provider.tsx           # Refine + data/auth provider wiring
```

---

## 3. Phases

### Phase 0: Research

| ID   | Topic                                             | Questions to Answer                                                                 | Output                              |
|------|---------------------------------------------------|-------------------------------------------------------------------------------------|-------------------------------------|
| R-01 | JWT handling in Next.js                           | How to decode JWT client-side? How to check expiry? Best storage (localStorage vs cookie)? | `research.md` findings              |
| R-02 | Refine auth provider setup                        | How does Refine's `AuthProvider` interface work? How to integrate with custom JWT flow? | `research.md` findings              |
| R-03 | Refine data provider for REST CRUD                | How to configure Refine's `DataProvider` for our `/users` CRUD endpoints?           | `research.md` findings              |
| R-04 | Token refresh strategy                            | Should we use a dedicated `/auth/refresh` endpoint or re-login? How to intercept 401s? | `research.md` findings              |
| R-05 | RBAC patterns with Refine                         | How does Refine handle `accessControl`? Can we use role-based `can` checks?         | `research.md` findings              |
| R-06 | Zustand persistence                               | Best way to hydrate Zustand store from localStorage on app init?                    | `research.md` findings              |

### Phase 1: Design

| ID   | Artifact                | Description                                                                 | Status |
|------|-------------------------|-----------------------------------------------------------------------------|--------|
| D-01 | Data Models             | Define TypeScript interfaces and Zod schemas for User, LoginRequest, RegisterRequest, CreateUserRequest, AuthResponse, AuthState | Done   |
| D-02 | API Contracts           | Define request/response shapes for all 7 auth & user endpoints              | Done   |
| D-03 | Component Inventory     | List all UI components needed: LoginForm, RegisterForm, AuthGuard, UserForm, UserTable | Done   |
| D-04 | State Flow Diagram      | Map auth state transitions: unauthenticated → loading → authenticated; token refresh flow | Done   |
| D-05 | Route Map               | Define route-to-component mapping with guard requirements                   | Done   |

### Phase 2: Implementation

See `tasks.md` for the full task breakdown.

### Phase 3: Verification

| ID   | Activity                     | Description                                                                 |
|------|------------------------------|-----------------------------------------------------------------------------|
| V-01 | Manual walkthrough           | Follow `quickstart.md` to verify all user stories end-to-end                |
| V-02 | Requirements checklist       | Verify all FR-001 through FR-008 using `checklists/requirements.md`         |
| V-03 | Cross-browser test           | Verify in Chrome, Firefox, Safari                                           |
| V-04 | Mobile responsiveness        | Verify login/register forms render correctly on mobile viewports            |
| V-05 | Error scenario testing       | Test all edge cases EC-01 through EC-10                                     |

---

## 4. Architecture Decisions

### AD-01: Zustand over Context for Auth State
Zustand is chosen over React Context because:
- No provider nesting required
- Built-in `persist` middleware for localStorage hydration
- Selector-based re-renders prevent unnecessary re-renders
- Simpler API for synchronous state updates

### AD-02: Refine as Framework Layer
Refine provides:
- `AuthProvider` interface that standardizes login/logout/checkError flows
- `DataProvider` for REST CRUD with pagination support
- Access control via `accessControlProvider`
- Resource-based routing configuration

### AD-03: Client-Side JWT Decoding
The frontend will decode the JWT payload (base64) to extract user info (`id`, `email`, `userName`, `role`) without a separate `/me` endpoint. This avoids an extra network call on app init. Token validity is verified server-side on each request.

### AD-04: Axios Instance with Interceptors
A shared Axios instance (`src/shared/api/client.ts`) will:
- Attach the Bearer token from Zustand store to every request
- Intercept 401 responses and attempt token refresh
- Queue concurrent requests during refresh and replay them after success
- Redirect to login on refresh failure

### AD-05: Form Validation Strategy
- Zod schemas define the validation rules (shared between client and potential future server use)
- React Hook Form consumes Zod schemas via `@hookform/resolvers/zod`
- Server-side validation errors (400 responses) are mapped to form fields

---

## 5. Dependency Map

```
Phase 0 (Research)
  └── Phase 1 (Design)
        └── Phase 2 (Implementation)
              ├── T001-T004: Project Setup & FSD Structure
              ├── T005-T007: Foundation (API client, Auth store, Refine provider)
              ├── T008-T011: US1 Login (depends on T005-T007)
              ├── T012-T015: US2 Register (depends on T005-T007)
              ├── T016-T020: US3 Admin User CRUD (depends on T008)
              ├── T021-T024: US4 Account Lockout & Token Refresh (depends on T008)
              └── T025-T027: Polish (depends on all above)
                    └── Phase 3 (Verification)
```
