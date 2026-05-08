# Auth & User API Contracts

| Field          | Value                          |
|----------------|--------------------------------|
| Feature Branch | `001-auth`                     |
| Base URL       | `http://localhost:8080/api`    |
| Created        | 2026-05-07                     |
| Updated        | 2026-05-07                     |

---

## Authentication

All endpoints except `/auth/login` and `/auth/register` require a Bearer JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. POST /auth/login

Authenticate a user with email and password.

**Request:**

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

| Field    | Type   | Required | Constraints                |
|----------|--------|----------|----------------------------|
| email    | string | Yes      | Valid email format         |
| password | string | Yes      | Non-empty                  |

**Response 200 (Success):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Field | Type   | Description      |
|-------|--------|------------------|
| token | string | JWT token        |

**Response 400 (Validation Error):**

```json
{
  "message": "Invalid request",
  "errors": [
    { "field": "email", "message": "Please enter a valid email address" }
  ]
}
```

**Response 401 (Invalid Credentials):**

```json
{
  "message": "Invalid email or password"
}
```

**Response 423 (Account Locked):**

```json
{
  "message": "Your account has been locked due to too many failed login attempts. Please contact an administrator."
}
```

---

### 2. POST /auth/register

Register a new user account.

**Request:**

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "email": "jane@example.com",
  "password": "securePassword123",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

| Field     | Type   | Required | Constraints              |
|-----------|--------|----------|--------------------------|
| email     | string | Yes      | Valid email format       |
| password  | string | Yes      | Min 8 characters         |
| firstName | string | Yes      | Non-empty                |
| lastName  | string | Yes      | Non-empty                |

**Response 200 (Success):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 400 (Validation Error):**

```json
{
  "message": "Invalid request",
  "errors": [
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

**Response 409 (Duplicate Email):**

```json
{
  "message": "A user with this email already exists"
}
```

---

### 3. POST /users

Create a new user (Admin only).

**Request:**

```http
POST /users
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice@example.com",
  "password": "securePassword123",
  "role": "Doctor",
  "specialization": "Cardiology"
}
```

| Field           | Type   | Required | Constraints                                     |
|-----------------|--------|----------|-------------------------------------------------|
| firstName       | string | Yes      | Non-empty, max 100 chars                        |
| lastName        | string | Yes      | Non-empty, max 100 chars                        |
| email           | string | Yes      | Valid email format                              |
| password        | string | Yes      | Min 8 characters                                |
| role            | string | Yes      | One of: Patient, Doctor, Receptionist, Admin    |
| specialization  | string | No       | Required when role is Doctor                    |

**Response 201 (Created):**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "alice@example.com",
  "userName": "Alice Smith",
  "role": "Doctor"
}
```

**Response 400 (Validation Error):**

```json
{
  "message": "Invalid request",
  "errors": [
    { "field": "specialization", "message": "Specialization is required for Doctor role" }
  ]
}
```

**Response 401 (Unauthorized):**

```json
{
  "message": "Authentication required"
}
```

**Response 403 (Forbidden):**

```json
{
  "message": "You do not have permission to perform this action"
}
```

**Response 409 (Duplicate Email):**

```json
{
  "message": "A user with this email already exists"
}
```

---

### 4. GET /users

Retrieve a paginated list of users (Admin only).

**Request:**

```http
GET /users?page=1&pageSize=10&search=john&role=Doctor
Authorization: Bearer <token>
```

| Query Param | Type   | Required | Default | Description                     |
|-------------|--------|----------|---------|---------------------------------|
| page        | number | No       | 1       | Page number (1-based)           |
| pageSize    | number | No       | 10      | Items per page (max 100)        |
| search      | string | No       | —       | Search by name or email         |
| role        | string | No       | —       | Filter by role                  |

**Response 200 (Success):**

```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "email": "alice@example.com",
      "userName": "Alice Smith",
      "role": "Doctor"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "email": "bob@example.com",
      "userName": "Bob Jones",
      "role": "Patient"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

**Response 401 (Unauthorized):**

```json
{
  "message": "Authentication required"
}
```

**Response 403 (Forbidden):**

```json
{
  "message": "You do not have permission to perform this action"
}
```

---

### 5. GET /users/{id}

Retrieve a single user by ID (Admin only).

**Request:**

```http
GET /users/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
```

| Path Param | Type   | Required | Description       |
|------------|--------|----------|-------------------|
| id         | string | Yes      | User UUID         |

**Response 200 (Success):**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "alice@example.com",
  "userName": "Alice Smith",
  "role": "Doctor"
}
```

**Response 401 (Unauthorized):**

```json
{
  "message": "Authentication required"
}
```

**Response 403 (Forbidden):**

```json
{
  "message": "You do not have permission to perform this action"
}
```

**Response 404 (Not Found):**

```json
{
  "message": "User not found"
}
```

---

### 6. PUT /users/{id}

Update an existing user (Admin only).

**Request:**

```http
PUT /users/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "firstName": "Alice",
  "lastName": "Smith-Jones",
  "email": "alice.new@example.com",
  "role": "Doctor",
  "specialization": "Neurology"
}
```

| Field           | Type   | Required | Constraints                                     |
|-----------------|--------|----------|-------------------------------------------------|
| firstName       | string | No       | Non-empty, max 100 chars                        |
| lastName        | string | No       | Non-empty, max 100 chars                        |
| email           | string | No       | Valid email format                              |
| role            | string | No       | One of: Patient, Doctor, Receptionist, Admin    |
| specialization  | string | No       | Required when role is Doctor                    |

Note: Password cannot be updated through this endpoint. All fields are optional; only provided fields are updated.

**Response 200 (Success):**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "alice.new@example.com",
  "userName": "Alice Smith-Jones",
  "role": "Doctor"
}
```

**Response 400 (Validation Error):**

```json
{
  "message": "Invalid request",
  "errors": [
    { "field": "email", "message": "Please enter a valid email address" }
  ]
}
```

**Response 401 (Unauthorized):**

```json
{
  "message": "Authentication required"
}
```

**Response 403 (Forbidden):**

```json
{
  "message": "You do not have permission to perform this action"
}
```

**Response 404 (Not Found):**

```json
{
  "message": "User not found"
}
```

**Response 409 (Duplicate Email):**

```json
{
  "message": "A user with this email already exists"
}
```

---

### 7. DELETE /users/{id}

Delete a user by ID (Admin only).

**Request:**

```http
DELETE /users/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
```

| Path Param | Type   | Required | Description       |
|------------|--------|----------|-------------------|
| id         | string | Yes      | User UUID         |

**Response 204 (No Content):**

No response body.

**Response 401 (Unauthorized):**

```json
{
  "message": "Authentication required"
}
```

**Response 403 (Forbidden):**

```json
{
  "message": "You do not have permission to perform this action"
}
```

**Response 404 (Not Found):**

```json
{
  "message": "User not found"
}
```

**Response 400 (Cannot Delete Self):**

```json
{
  "message": "You cannot delete your own account"
}
```

---

## Error Response Format

All error responses follow a consistent structure:

```json
{
  "message": "Human-readable error description",
  "errors": [
    { "field": "fieldName", "message": "Field-specific error" }
  ]
}
```

| Field           | Type    | Required | Description                            |
|-----------------|---------|----------|----------------------------------------|
| message         | string  | Yes      | General error description              |
| errors          | array   | No       | Field-level validation errors          |
| errors[].field  | string  | Yes      | Name of the invalid field              |
| errors[].message| string  | Yes      | Description of the field error         |

---

## HTTP Status Codes Summary

| Code | Meaning              | When Used                                            |
|------|----------------------|------------------------------------------------------|
| 200  | OK                   | Successful GET, PUT, POST (login, register)          |
| 201  | Created              | Successful POST (create user)                        |
| 204  | No Content           | Successful DELETE                                    |
| 400  | Bad Request          | Validation errors, self-deletion attempt             |
| 401  | Unauthorized         | Missing or invalid token                             |
| 403  | Forbidden            | Insufficient role permissions                        |
| 404  | Not Found            | Resource does not exist                              |
| 409  | Conflict             | Duplicate email                                      |
| 423  | Locked               | Account locked due to failed login attempts          |
| 500  | Internal Server Error| Unexpected server error                              |
