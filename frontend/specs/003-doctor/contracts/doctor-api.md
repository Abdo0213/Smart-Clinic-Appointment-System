# Doctor API Contracts

Base URL: `/api/v1`

All request/response bodies are JSON. Authentication required via `Authorization: Bearer <token>` header.

---

## GET /doctors

List doctors with optional filters and pagination.

### Request

| Param | Type | Required | Default | Description |
|---|---|---|---|---|
| specialization | string | no | — | Filter by exact specialization match |
| isActive | boolean | no | — | Filter by active status (true/false) |
| page | number | no | 0 | Page number (0-indexed) |
| size | number | no | 10 | Items per page (max 100) |

```
GET /api/v1/doctors?specialization=Cardiology&isActive=true&page=0&size=10
```

### Response — 200 OK

```json
{
  "content": [
    {
      "id": "d1a2b3c4-5678-90ab-cdef-1234567890ab",
      "userId": "u1a2b3c4-5678-90ab-cdef-1234567890ab",
      "firstName": "Alice",
      "lastName": "Smith",
      "specialization": "Cardiology",
      "bio": "Board-certified cardiologist with 15 years of experience.",
      "phone": "+1234567890",
      "isActive": true,
      "createdAt": "2026-01-15T08:30:00Z"
    }
  ],
  "totalElements": 42,
  "totalPages": 5,
  "page": 0,
  "size": 10
}
```

### Error Responses

| Status | Condition |
|---|---|
| 400 | Invalid query parameter values |
| 401 | Missing or invalid auth token |

---

## GET /doctors/{id}

Retrieve a single doctor by ID.

### Request

```
GET /api/v1/doctors/d1a2b3c4-5678-90ab-cdef-1234567890ab
```

### Response — 200 OK

```json
{
  "id": "d1a2b3c4-5678-90ab-cdef-1234567890ab",
  "userId": "u1a2b3c4-5678-90ab-cdef-1234567890ab",
  "firstName": "Alice",
  "lastName": "Smith",
  "specialization": "Cardiology",
  "bio": "Board-certified cardiologist with 15 years of experience.",
  "phone": "+1234567890",
  "isActive": true,
  "createdAt": "2026-01-15T08:30:00Z"
}
```

### Error Responses

| Status | Condition |
|---|---|
| 401 | Missing or invalid auth token |
| 404 | Doctor not found |

---

## PUT /doctors/{id}

Update a doctor's editable profile fields.

### Request

```json
PUT /api/v1/doctors/d1a2b3c4-5678-90ab-cdef-1234567890ab
Content-Type: application/json

{
  "specialization": "Cardiology",
  "bio": "Updated bio text.",
  "phone": "+1987654321"
}
```

### Response — 200 OK

Returns the full updated Doctor object (same shape as GET /doctors/{id}).

### Error Responses

| Status | Condition |
|---|---|
| 400 | Validation error (invalid phone, missing required fields) |
| 401 | Missing or invalid auth token |
| 403 | User is not the doctor or an admin |
| 404 | Doctor not found |

---

## PATCH /doctors/{id}/status

Activate or deactivate a doctor. Admin only.

### Request

```
PATCH /api/v1/doctors/d1a2b3c4-5678-90ab-cdef-1234567890ab/status?isActive=false
```

| Param | Type | Required | Description |
|---|---|---|---|
| isActive | boolean | yes | Target active status |

### Response — 200 OK

Returns the full updated Doctor object with the new `isActive` value.

### Error Responses

| Status | Condition |
|---|---|
| 400 | Missing or invalid isActive parameter |
| 401 | Missing or invalid auth token |
| 403 | User is not an admin |
| 404 | Doctor not found |

---

## GET /doctors/{id}/schedules

List all schedules for a doctor.

### Request

```
GET /api/v1/doctors/d1a2b3c4-5678-90ab-cdef-1234567890ab/schedules
```

### Response — 200 OK

```json
[
  {
    "id": "s1a2b3c4-5678-90ab-cdef-1234567890ab",
    "doctorId": "d1a2b3c4-5678-90ab-cdef-1234567890ab",
    "date": "2026-05-10",
    "startTime": "09:00",
    "endTime": "17:00",
    "slotDuration": 30,
    "price": 150.00,
    "breaks": [
      { "breakStart": "12:00", "breakEnd": "13:00" }
    ]
  }
]
```

### Error Responses

| Status | Condition |
|---|---|
| 401 | Missing or invalid auth token |
| 404 | Doctor not found |

---

## POST /doctors/{id}/schedules

Create a new schedule for a doctor on a specific date.

### Request

```json
POST /api/v1/doctors/d1a2b3c4-5678-90ab-cdef-1234567890ab/schedules
Content-Type: application/json

{
  "date": "2026-05-10",
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDuration": 30,
  "price": 150.00,
  "breaks": [
    { "breakStart": "12:00", "breakEnd": "13:00" }
  ]
}
```

### Response — 201 Created

Returns the created Schedule object (same shape as items in GET /doctors/{id}/schedules) with the server-assigned `id`.

### Error Responses

| Status | Condition |
|---|---|
| 400 | Validation error (invalid times, breaks outside working hours, slotDuration <= 0) |
| 401 | Missing or invalid auth token |
| 403 | User is not the doctor or an admin |
| 404 | Doctor not found |
| 409 | Schedule already exists for this doctor on this date |

---

## GET /doctors/{id}/slots

Retrieve generated time slots with availability for a doctor on a specific date.

### Request

| Param | Type | Required | Description |
|---|---|---|---|
| date | string | yes | Date in YYYY-MM-DD format |

```
GET /api/v1/doctors/d1a2b3c4-5678-90ab-cdef-1234567890ab/slots?date=2026-05-10
```

### Response — 200 OK

```json
{
  "doctorId": "d1a2b3c4-5678-90ab-cdef-1234567890ab",
  "date": "2026-05-10",
  "slots": [
    { "startTime": "09:00", "endTime": "09:30", "isAvailable": true },
    { "startTime": "09:30", "endTime": "10:00", "isAvailable": true },
    { "startTime": "10:00", "endTime": "10:30", "isAvailable": false },
    { "startTime": "10:30", "endTime": "11:00", "isAvailable": true },
    { "startTime": "11:00", "endTime": "11:30", "isAvailable": true },
    { "startTime": "11:30", "endTime": "12:00", "isAvailable": true },
    { "startTime": "13:00", "endTime": "13:30", "isAvailable": true },
    { "startTime": "13:30", "endTime": "14:00", "isAvailable": true },
    { "startTime": "14:00", "endTime": "14:30", "isAvailable": true },
    { "startTime": "14:30", "endTime": "15:00", "isAvailable": true },
    { "startTime": "15:00", "endTime": "15:30", "isAvailable": true },
    { "startTime": "15:30", "endTime": "16:00", "isAvailable": true },
    { "startTime": "16:00", "endTime": "16:30", "isAvailable": true },
    { "startTime": "16:30", "endTime": "17:00", "isAvailable": true }
  ]
}
```

### Error Responses

| Status | Condition |
|---|---|
| 400 | Missing or invalid date parameter |
| 401 | Missing or invalid auth token |
| 404 | Doctor not found |
