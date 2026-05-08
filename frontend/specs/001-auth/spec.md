# Auth Feature Specification

| Field          | Value                          |
|----------------|--------------------------------|
| Feature Branch | `001-auth`                     |
| Status         | Draft                          |
| Owner          | Frontend Team                  |
| Created        | 2026-05-07                     |
| Updated        | 2026-05-07                     |

---

## 1. Overview

The Auth feature provides authentication and authorization for the Smart Clinic Appointment System. It covers user login, registration, admin user management (CRUD), and account lockout with token refresh. All protected API calls use Bearer JWT tokens. The system supports four roles: Patient, Doctor, Receptionist, and Admin.

## 2. User Stories

### US1 — Login (P1)

**As a** registered user (Patient, Doctor, Receptionist, or Admin),
**I want to** log in with my email and password,
**So that** I can access the system according to my role.

### US2 — Register (P2)

**As a** new user,
**I want to** register an account with my email, password, first name, and last name,
**So that** I can book appointments and use clinic services.

### US3 — Admin User Management (P3)

**As an** Admin,
**I want to** create, view, update, and delete user accounts,
**So that** I can manage clinic staff and patients.

### US4 — Account Lockout & Token Refresh (P4)

**As a** user,
**I want to** have my account locked after repeated failed login attempts and have my JWT token refreshed automatically,
**So that** the system remains secure and I am not logged out unexpectedly.

---

## 3. Acceptance Scenarios

### US1 — Login

**Scenario 1.1: Successful login**
- Given a user with email "john@example.com" exists and the password matches
- When the user submits the login form with valid credentials
- Then the system returns a JWT token
- And the user is redirected to the dashboard

**Scenario 1.2: Invalid credentials**
- Given no user exists with email "nobody@example.com" or the password is wrong
- When the user submits the login form
- Then the system displays an error message "Invalid email or password"
- And the login form remains on screen

**Scenario 1.3: Empty fields**
- Given the login form is displayed
- When the user submits with empty email or password
- Then inline validation errors appear under each empty field
- And no API call is made

**Scenario 1.4: Network error**
- Given the API server is unreachable
- When the user submits the login form
- Then the system displays a generic error "Unable to connect to the server. Please try again later."

### US2 — Register

**Scenario 2.1: Successful registration**
- Given no user exists with email "jane@example.com"
- When the user submits the registration form with valid data
- Then the system returns a JWT token
- And the user is redirected to the dashboard

**Scenario 2.2: Duplicate email**
- Given a user with email "john@example.com" already exists
- When the user submits the registration form with that email
- Then the system displays an error "A user with this email already exists"

**Scenario 2.3: Password too short**
- Given the registration form is displayed
- When the user enters a password shorter than 8 characters
- Then inline validation shows "Password must be at least 8 characters"

**Scenario 2.4: Invalid email format**
- Given the registration form is displayed
- When the user enters "not-an-email" in the email field
- Then inline validation shows "Please enter a valid email address"

**Scenario 2.5: Mismatched password confirmation**
- Given the registration form is displayed
- When the user enters two different passwords
- Then inline validation shows "Passwords do not match"

### US3 — Admin User Management

**Scenario 3.1: List users**
- Given the logged-in user has the Admin role
- When the user navigates to the User Management page
- Then a paginated table of users is displayed with columns: Name, Email, Role, Actions

**Scenario 3.2: Create user**
- Given the logged-in user has the Admin role
- When the user fills in the Create User form (firstName, lastName, email, password, role, optional specialization) and submits
- Then the new user appears in the user list
- And a success toast notification is shown

**Scenario 3.3: Edit user**
- Given the logged-in user has the Admin role
- When the user edits an existing user's details and submits
- Then the user list reflects the updated details
- And a success toast notification is shown

**Scenario 3.4: Delete user**
- Given the logged-in user has the Admin role
- When the user clicks delete on a user row and confirms
- Then the user is removed from the list
- And a success toast notification is shown

**Scenario 3.5: Non-admin access denied**
- Given the logged-in user has a non-Admin role
- When the user attempts to navigate to the User Management page
- Then the user is redirected to the dashboard or shown an access-denied message

**Scenario 3.6: Pagination**
- Given more than 10 users exist
- When the user navigates to the User Management page
- Then the table shows 10 users per page with pagination controls

### US4 — Account Lockout & Token Refresh

**Scenario 4.1: Account lockout after failed attempts**
- Given a user enters an incorrect password 5 consecutive times
- When the 5th failed attempt occurs
- Then the account is locked
- And the system displays "Your account has been locked due to too many failed login attempts. Please contact an administrator."

**Scenario 4.2: Token auto-refresh**
- Given the user's JWT token is about to expire (within 5 minutes)
- When the user makes an API request
- Then the system automatically refreshes the token before completing the request
- And the new token is stored for future requests

**Scenario 4.3: Session expiry**
- Given the user's JWT token has expired and refresh has failed
- When the user makes an API request
- Then the user is redirected to the login page with a message "Your session has expired. Please log in again."

**Scenario 4.4: Manual logout**
- Given the user is logged in
- When the user clicks the logout button
- Then the token and user data are cleared from storage
- And the user is redirected to the login page

---

## 4. Edge Cases

| ID    | Description                                                                 | Handling                                                                                     |
|-------|-----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| EC-01 | User submits login form while request is in-flight                          | Disable submit button and show spinner; prevent duplicate requests                           |
| EC-02 | JWT token is tampered or malformed                                          | Treat as expired: clear auth state and redirect to login                                     |
| EC-03 | Admin deletes their own account                                             | Prevent self-deletion; show error "You cannot delete your own account"                       |
| EC-04 | Admin creates a user with a role of Doctor but no specialization            | Show validation error: "Specialization is required for Doctor role"                          |
| EC-05 | Simultaneous tabs with expired tokens                                       | On first 401 response, refresh token once; if refresh also fails, log out all tabs           |
| EC-06 | Browser localStorage is cleared manually while user is on a protected page  | On next API call, receive 401; redirect to login                                            |
| EC-07 | Registration with email in different casing (John@Example.com)              | Backend normalizes to lowercase; frontend displays error if duplicate                        |
| EC-08 | User navigates directly to /login while already authenticated               | Redirect to dashboard                                                                       |
| EC-09 | Password contains only spaces                                               | Validation error: "Password must contain at least one non-space character"                   |
| EC-10 | Very long email (>254 characters)                                           | Validation error: "Email must not exceed 254 characters"                                     |

---

## 5. Functional Requirements

### FR-001: Login Form
The system shall present a login form with email and password fields. The form shall validate inputs client-side before submission. On success, the JWT token shall be stored and the user redirected to the dashboard.

### FR-002: Registration Form
The system shall present a registration form with email, password, password confirmation, first name, and last name fields. Client-side validation shall enforce email format, minimum password length (8 characters), and password match. On success, the JWT token shall be stored and the user redirected to the dashboard.

### FR-003: JWT Token Storage
The system shall store the JWT token in localStorage under the key `auth_token`. The token shall be attached as a Bearer header to all API requests except `/auth/login` and `/auth/register`.

### FR-004: Authenticated State Management
The system shall maintain authentication state (user object, token, isAuthenticated, isLoading) using Zustand. The state shall persist across page refreshes via localStorage hydration.

### FR-005: Route Protection
The system shall protect all routes except `/login` and `/register`. Unauthenticated users attempting to access protected routes shall be redirected to `/login`.

### FR-006: Role-Based Access Control
The system shall restrict access to the User Management page (CRUD operations) to users with the Admin role. Non-admin users shall be redirected or shown an access-denied view.

### FR-007: Account Lockout
The system shall display a lockout message when the backend responds with an account-locked status after 5 consecutive failed login attempts. The user shall be instructed to contact an administrator.

### FR-008: Token Refresh
The system shall intercept 401 responses and attempt to refresh the JWT token. If refresh succeeds, the original request shall be retried. If refresh fails, the user shall be logged out and redirected to `/login`.

---

## 6. Key Entities

### User

| Field   | Type   | Description                          |
|---------|--------|--------------------------------------|
| id      | string | Unique user identifier (UUID)        |
| email   | string | User email address                   |
| userName| string | Display name (firstName + lastName)  |
| role    | string | One of: Patient, Doctor, Receptionist, Admin |

### AuthState

| Field         | Type           | Description                                  |
|---------------|----------------|----------------------------------------------|
| user          | User \| null   | Currently authenticated user                 |
| token         | string \| null | JWT token                                    |
| isAuthenticated | boolean      | Whether the user is authenticated            |
| isLoading     | boolean        | Whether an auth operation is in progress     |

---

## 7. Success Criteria

| ID   | Criterion                                                                       | Measurement                            |
|------|---------------------------------------------------------------------------------|----------------------------------------|
| SC-01| Users can log in with valid credentials and are redirected to the dashboard     | Manual test / E2E test passes          |
| SC-02| Users can register a new account and are automatically authenticated            | Manual test / E2E test passes          |
| SC-03| Invalid login credentials display a clear error message                         | Error message visible in UI            |
| SC-04| Admins can perform full CRUD on user accounts via the User Management page      | All CRUD operations verified           |
| SC-05| Non-admin users cannot access the User Management page                          | Redirect or access-denied shown        |
| SC-06| Accounts are locked after 5 consecutive failed login attempts                   | Lockout message displayed              |
| SC-07| JWT tokens are automatically refreshed when about to expire                     | Token refreshed without user action    |
| SC-08| Expired sessions redirect to login with a message                               | Redirect occurs within 2 seconds       |
| SC-09| All forms validate inputs client-side before API submission                     | No API call on invalid input           |
| SC-10| Auth state persists across page refreshes                                       | State restored from localStorage       |

---

## 8. Assumptions

1. The backend API is available at `http://localhost:8080/api` and follows REST conventions.
2. JWT tokens contain the user's `id`, `email`, `userName`, and `role` in the payload.
3. The backend returns appropriate HTTP status codes: 200 (success), 400 (validation error), 401 (unauthorized), 403 (forbidden), 409 (conflict/duplicate email), 423 (account locked).
4. Passwords are never returned by the API in any response.
5. The backend handles password hashing and account lockout logic; the frontend only displays the result.
6. Token refresh is handled by re-calling the login endpoint or a dedicated `/auth/refresh` endpoint (TBD during Phase 0 research).
7. There is no "Forgot Password" flow in this feature scope.
8. Only one role is assigned per user (no multi-role support).
9. The Admin role is seeded in the backend; the first Admin cannot be created through the registration form.
10. The frontend is a client-side rendered Next.js application using the App Router.
