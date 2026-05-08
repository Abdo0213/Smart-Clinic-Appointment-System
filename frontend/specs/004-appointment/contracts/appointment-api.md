# Appointment API Contracts

Base URL: `/api/v1`

All endpoints require `Authorization: Bearer <token>` header.

---

## GET /appointments

Retrieve a filtered, paginated list of appointments.

### Request

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| patientId | query | string (UUID) | No | Filter by patient |
| doctorId | query | string (UUID) | No | Filter by doctor |
| date | query | string (ISO date) | No | Filter by slot date (YYYY-MM-DD) |
| status | query | string | No | Filter by status (BOOKED, ARRIVED, COMPLETED, CANCELLED, NO_SHOW) |
| page | query | integer | No | Page index, 0-based (default: 0) |
| size | query | integer | No | Page size (default: 20, max: 100) |

### Response — 200 OK

```json
{
  "content": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "patientId": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
      "doctorId": "d1a2b3c4-d5e6-7890-abcd-ef1234567890",
      "slotDate": "2026-05-10",
      "slotStart": "09:00",
      "slotEnd": "09:30",
      "status": "BOOKED",
      "price": 150.00,
      "bookedBy": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
      "cancelReason": null,
      "createdAt": "2026-05-07T10:30:00Z",
      "updatedAt": null,
      "patientName": "John Doe",
      "doctorName": "Dr. Jane Smith"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

### Error Responses

| Status | Condition |
|---|---|
| 400 | Invalid query parameter values |
| 401 | Missing or invalid authentication |
| 403 | User not authorized to view appointments |

---

## POST /appointments

Create a new appointment.

### Request

```json
{
  "patientId": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "doctorId": "d1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "slotDate": "2026-05-10",
  "slotStart": "09:00",
  "slotEnd": "09:30"
}
```

### Response — 201 Created

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "patientId": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "doctorId": "d1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "slotDate": "2026-05-10",
  "slotStart": "09:00",
  "slotEnd": "09:30",
  "status": "BOOKED",
  "price": 150.00,
  "bookedBy": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "cancelReason": null,
  "createdAt": "2026-05-07T10:30:00Z",
  "updatedAt": null,
  "patientName": "John Doe",
  "doctorName": "Dr. Jane Smith"
}
```

### Error Responses

| Status | Condition |
|---|---|
| 400 | Validation error (missing/invalid fields, past date, slotStart >= slotEnd) |
| 401 | Missing or invalid authentication |
| 403 | User not authorized to book (e.g., patient booking for another patient) |
| 409 | Slot conflict — already booked |

---

## GET /appointments/{id}

Retrieve a single appointment by ID.

### Request

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| id | path | string (UUID) | Yes | Appointment ID |

### Response — 200 OK

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "patientId": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "doctorId": "d1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "slotDate": "2026-05-10",
  "slotStart": "09:00",
  "slotEnd": "09:30",
  "status": "BOOKED",
  "price": 150.00,
  "bookedBy": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "cancelReason": null,
  "createdAt": "2026-05-07T10:30:00Z",
  "updatedAt": null,
  "patientName": "John Doe",
  "doctorName": "Dr. Jane Smith"
}
```

### Error Responses

| Status | Condition |
|---|---|
| 401 | Missing or invalid authentication |
| 403 | User not authorized to view this appointment |
| 404 | Appointment not found |

---

## PATCH /appointments/{id}/status

Update the status of an appointment. Only valid transitions are accepted.

### Request

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| id | path | string (UUID) | Yes | Appointment ID |

```json
{
  "status": "ARRIVED"
}
```

### Response — 200 OK

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "patientId": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "doctorId": "d1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "slotDate": "2026-05-10",
  "slotStart": "09:00",
  "slotEnd": "09:30",
  "status": "ARRIVED",
  "price": 150.00,
  "bookedBy": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "cancelReason": null,
  "createdAt": "2026-05-07T10:30:00Z",
  "updatedAt": "2026-05-10T08:55:00Z",
  "patientName": "John Doe",
  "doctorName": "Dr. Jane Smith"
}
```

### Error Responses

| Status | Condition |
|---|---|
| 400 | Invalid status value |
| 401 | Missing or invalid authentication |
| 403 | User not authorized (not a doctor or receptionist) |
| 404 | Appointment not found |
| 409 | Invalid status transition (e.g., COMPLETED → BOOKED) |

---

## DELETE /appointments/{id}

Cancel an appointment. Requires a reason.

### Request

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| id | path | string (UUID) | Yes | Appointment ID |

```json
{
  "reason": "Patient requested cancellation due to schedule conflict"
}
```

### Response — 204 No Content

No response body.

### Error Responses

| Status | Condition |
|---|---|
| 400 | Missing or too short reason (minimum 5 characters) |
| 401 | Missing or invalid authentication |
| 403 | User not authorized to cancel (not own appointment or not a receptionist) |
| 404 | Appointment not found |
| 409 | Appointment is in a terminal status (COMPLETED, CANCELLED, NO_SHOW) |

---

## POST /appointments/{id}/waitlist

Join the waitlist for a fully-booked appointment slot.

### Request

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| id | path | string (UUID) | Yes | Appointment ID (of a fully-booked slot) |

No request body required. The patient is identified from the authentication token.

### Response — 201 Created

```json
{
  "id": "w1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "appointmentId": null,
  "patientId": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "doctorId": "d1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "slotDate": "2026-05-10",
  "slotStart": "09:00",
  "slotEnd": "09:30",
  "position": 2,
  "status": "PENDING",
  "createdAt": "2026-05-07T11:00:00Z"
}
```

### Error Responses

| Status | Condition |
|---|---|
| 401 | Missing or invalid authentication |
| 403 | User not authorized (not a patient) |
| 404 | Appointment slot not found |
| 409 | Patient already on waitlist for this slot |
