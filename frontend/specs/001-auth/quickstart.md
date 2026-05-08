# Auth Feature — Quickstart / Testing Guide

| Field          | Value                          |
|----------------|--------------------------------|
| Feature Branch | `001-auth`                     |
| Created        | 2026-05-07                     |
| Updated        | 2026-05-07                     |

---

## Prerequisites

- Node.js 18+ installed
- Backend API running at `http://localhost:8080/api`
- A seeded Admin account (email: `admin@clinic.com`, password: `Admin123!`)

---

## 1. Setup

```bash
# Clone and checkout the feature branch
git clone <repo-url>
cd <project>
git checkout 001-auth

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Verify NEXT_PUBLIC_API_URL=http://localhost:8080/api is set

# Start the development server
npm run dev
```

The app is available at `http://localhost:3000`.

---

## 2. Test Login (US1)

### 2.1 Successful Login

1. Navigate to `http://localhost:3000/login`
2. Enter email: `admin@clinic.com`
3. Enter password: `Admin123!`
4. Click **Sign In**
5. **Expected:** Redirected to `/` (dashboard), header shows "Logged in as Admin (Admin)"

### 2.2 Invalid Credentials

1. Navigate to `http://localhost:3000/login`
2. Enter email: `admin@clinic.com`
3. Enter password: `wrongpassword`
4. Click **Sign In**
5. **Expected:** Error message "Invalid email or password" appears below the form

### 2.3 Empty Fields

1. Navigate to `http://localhost:3000/login`
2. Leave email and password empty
3. Click **Sign In**
4. **Expected:** Inline validation errors "Email is required" and "Password is required" under respective fields, no API call made

### 2.4 Network Error

1. Stop the backend server
2. Navigate to `http://localhost:3000/login`
3. Enter any credentials and click **Sign In**
4. **Expected:** Error message "Unable to connect to the server. Please try again later."

---

## 3. Test Register (US2)

### 3.1 Successful Registration

1. Navigate to `http://localhost:3000/register`
2. Enter first name: `Jane`
3. Enter last name: `Doe`
4. Enter email: `jane.new@example.com` (must not exist)
5. Enter password: `Password123!`
6. Confirm password: `Password123!`
7. Click **Create Account**
8. **Expected:** Redirected to `/` (dashboard), logged in as new user

### 3.2 Duplicate Email

1. Navigate to `http://localhost:3000/register`
2. Enter email: `admin@clinic.com` (already exists)
3. Fill other fields with valid data
4. Click **Create Account**
5. **Expected:** Error message "A user with this email already exists"

### 3.3 Password Validation

1. Navigate to `http://localhost:3000/register`
2. Enter password: `short` (less than 8 characters)
3. **Expected:** Inline validation "Password must be at least 8 characters"

### 3.4 Password Mismatch

1. Navigate to `http://localhost:3000/register`
2. Enter password: `Password123!`
3. Enter confirm password: `Different123!`
4. **Expected:** Inline validation "Passwords do not match"

---

## 4. Test Admin User Management (US3)

### 4.1 List Users

1. Log in as Admin (`admin@clinic.com` / `Admin123!`)
2. Navigate to `http://localhost:3000/users`
3. **Expected:** Paginated table with columns Name, Email, Role, Actions

### 4.2 Create User

1. On the Users page, click **Create User**
2. Fill in: First Name `Alice`, Last Name `Smith`, Email `alice@example.com`, Password `Password123!`, Role `Doctor`, Specialization `Cardiology`
3. Click **Save**
4. **Expected:** User appears in the list, success toast shown

### 4.3 Create User — Doctor Without Specialization

1. Click **Create User**
2. Fill in all fields, Role `Doctor`, leave Specialization empty
3. Click **Save**
4. **Expected:** Validation error "Specialization is required for Doctor role"

### 4.4 Edit User

1. On the Users page, click **Edit** on a user row
2. Change the last name to `Smith-Jones`
3. Click **Save**
4. **Expected:** User list reflects the updated name, success toast shown

### 4.5 Delete User

1. On the Users page, click **Delete** on a user row (not your own)
2. Confirm in the dialog
3. **Expected:** User removed from the list, success toast shown

### 4.6 Delete Self — Prevention

1. Attempt to delete the user matching your logged-in account
2. **Expected:** Error message "You cannot delete your own account"

### 4.7 Non-Admin Access

1. Log in as a Patient or Doctor user
2. Navigate to `http://localhost:3000/users`
3. **Expected:** Redirected to dashboard or shown access-denied message

### 4.8 Pagination

1. Ensure there are more than 10 users in the system
2. Navigate to the Users page
3. **Expected:** Table shows 10 users, pagination controls at bottom
4. Click page 2
5. **Expected:** Next 10 users displayed

---

## 5. Test Account Lockout & Token Refresh (US4)

### 5.1 Account Lockout

1. Navigate to `http://localhost:3000/login`
2. Enter a valid email but wrong password
3. Click **Sign In** — repeat 5 times
4. **Expected:** After the 5th attempt, message "Your account has been locked due to too many failed login attempts. Please contact an administrator."

### 5.2 Token Auto-Refresh

1. Log in with valid credentials
2. Wait for the token to approach expiry (or use a short-lived test token)
3. Make an action that triggers an API call
4. **Expected:** The request succeeds without the user being logged out; new token is stored

### 5.3 Session Expiry

1. Log in with valid credentials
2. Manually expire or corrupt the stored token in localStorage (`auth-storage` key)
3. Trigger an API call (e.g., navigate to Users page)
4. **Expected:** Redirected to `/login` with message "Your session has expired. Please log in again."

### 5.4 Manual Logout

1. Log in with valid credentials
2. Click the user dropdown in the header and select **Log Out**
3. **Expected:** Token cleared from localStorage, redirected to `/login`

---

## 6. Edge Case Testing

| Edge Case | How to Test | Expected Result |
|-----------|-------------|-----------------|
| EC-01: Double-submit | Click Sign In twice rapidly | Second click disabled; only one request sent |
| EC-02: Tampered JWT | Manually edit token in localStorage | Treated as expired; redirect to login |
| EC-03: Admin deletes self | Click Delete on own account row | Error "You cannot delete your own account" |
| EC-04: Doctor without specialization | Create user with role Doctor, empty specialization | Validation error on specialization field |
| EC-05: Multiple tabs with expired token | Open 2 tabs, let token expire, trigger API in both | First tab refreshes, second reuses new token; if refresh fails, both log out |
| EC-06: Cleared localStorage | Delete localStorage while on protected page | Next API call returns 401; redirect to login |
| EC-07: Case-insensitive email | Register with `John@Example.com` | Backend normalizes; duplicate error if email exists in any case |
| EC-08: Authenticated user visits /login | Log in, then navigate to /login | Redirected to dashboard |
| EC-09: Spaces-only password | Enter "        " as password | Validation error "Password must contain at least one non-space character" |
| EC-10: Very long email | Enter email > 254 characters | Validation error "Email must not exceed 254 characters" |

---

## 7. Automated Tests

```bash
# Run unit tests
npm run test

# Run E2E tests (if configured)
npm run test:e2e

# Run linting
npm run lint

# Run type checking
npm run typecheck
```
