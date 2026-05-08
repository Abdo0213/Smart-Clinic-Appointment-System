# API Contracts: Notification

**Feature**: Notification Center
**Branch**: `006-notification`
**Date**: 2026-05-07
**Base URL**: `http://localhost:8080/api`

---

> ## ⛔ BACKEND STATUS: ALL ENDPOINTS ARE MISSING
>
> None of the notification endpoints listed below exist in the backend API Gateway.
> The frontend will use **stubbed implementations** returning mock data until the backend team adds these endpoints.
> All stubs are documented in `src/features/notifications/api/notification.api.ts` and emit `console.warn` in development mode.
>
> When backend endpoints become available, replace stubs with real HTTP calls using the existing API client.

---

## 1. GET /notifications

**Status**: ⛔ MISSING — No backend endpoint exists

**Description**: Retrieve the authenticated user's notifications, sorted by creation date descending, with pagination.

**Access**: All authenticated roles (Patient, Doctor, Receptionist, Admin)

**Request**:

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `page` | Query | `number` | No | Page number (0-indexed). Default: `0` |
| `size` | Query | `number` | No | Page size. Default: `20` |
| `sort` | Query | `string` | No | Sort field and direction. Default: `createdAt,desc` |
| `unreadOnly` | Query | `boolean` | No | Filter to unread notifications only. Default: `false` |

**Response** (200 OK):

```json
{
  "content": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "type": "APPOINTMENT_REMINDER_24H",
      "title": "Appointment Reminder",
      "message": "You have an appointment with Dr. Smith tomorrow at 09:00 AM",
      "isRead": false,
      "createdAt": "2026-05-07T10:30:00Z",
      "metadata": {
        "appointmentId": "uuid-appointment",
        "doctorId": "uuid-doctor",
        "doctorName": "Dr. Smith",
        "slotDate": "2026-05-08",
        "slotStart": "09:00:00",
        "slotEnd": "09:30:00"
      }
    }
  ],
  "totalPages": 3,
  "totalElements": 45,
  "size": 20,
  "number": 0,
  "first": true,
  "last": false,
  "empty": false
}
```

**Error Responses**:

| Status | Condition |
|--------|-----------|
| 401 | Not authenticated |

**Stub Behavior**: Returns mock array of 10–15 notifications covering all 5 types with mixed read/unread states. Paginated response wrapper matches the Spring Boot format.

---

## 2. PATCH /notifications/{id}/read

**Status**: ⛔ MISSING — No backend endpoint exists

**Description**: Mark a single notification as read.

**Access**: All authenticated roles (only own notifications)

**Request**:

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `id` | Path | `string` (UUID) | Yes | The notification ID to mark as read |

**Request Body**: None

**Response** (200 OK):

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "APPOINTMENT_REMINDER_24H",
  "title": "Appointment Reminder",
  "message": "You have an appointment with Dr. Smith tomorrow at 09:00 AM",
  "isRead": true,
  "createdAt": "2026-05-07T10:30:00Z",
  "metadata": {
    "appointmentId": "uuid-appointment",
    "doctorId": "uuid-doctor",
    "doctorName": "Dr. Smith",
    "slotDate": "2026-05-08",
    "slotStart": "09:00:00",
    "slotEnd": "09:30:00"
  }
}
```

**Error Responses**:

| Status | Condition |
|--------|-----------|
| 401 | Not authenticated |
| 403 | Notification does not belong to the authenticated user |
| 404 | Notification not found |

**Stub Behavior**: Finds the notification in mock data by ID, sets `isRead=true`, returns the updated notification. Returns 404 if ID not found in mock data.

---

## 3. PATCH /notifications/read-all

**Status**: ⛔ MISSING — No backend endpoint exists

**Description**: Mark all of the authenticated user's unread notifications as read in a single operation.

**Access**: All authenticated roles (only own notifications)

**Request**: No path parameters, no request body.

**Response** (200 OK):

```json
{
  "updatedCount": 7
}
```

**Error Responses**:

| Status | Condition |
|--------|-----------|
| 401 | Not authenticated |

**Stub Behavior**: Iterates all mock notifications, sets `isRead=true` on all unread items, returns `{ updatedCount: <number of items changed> }`.

---

## 4. GET /notifications/unread-count

**Status**: ⛔ MISSING — No backend endpoint exists

**Description**: Get the count of unread notifications for the authenticated user. Lightweight endpoint for badge count polling.

**Access**: All authenticated roles (only own count)

**Request**: No parameters.

**Response** (200 OK):

```json
{
  "count": 7
}
```

**Error Responses**:

| Status | Condition |
|--------|-----------|
| 401 | Not authenticated |

**Stub Behavior**: Counts unread notifications in mock data and returns `{ count: <number> }`.

---

## Stub Implementation Contract

All stubs must conform to the same TypeScript return types as the real API functions:

```typescript
async function getNotifications(params?: {
  page?: number;
  size?: number;
  sort?: string;
  unreadOnly?: boolean;
}): Promise<PaginatedNotifications>;

async function markNotificationRead(id: string): Promise<Notification>;

async function markAllNotificationsRead(): Promise<{ updatedCount: number }>;

async function getUnreadCount(): Promise<{ count: number }>;
```

Each stub function MUST:
1. Return data matching the response schemas above
2. Simulate network latency with a small delay (100–300ms)
3. Log `console.warn("[STUB] Notification API endpoint not available. Using mock data.")` on each call
4. Be easily swappable with real implementations when backend endpoints are added

---

## Migration Checklist (When Backend Adds Endpoints)

- [ ] Replace stub functions with real HTTP calls in `src/features/notifications/api/notification.api.ts`
- [ ] Verify response shapes match the contracts above (adjust if backend differs)
- [ ] Add `Authorization: Bearer <token>` header via the existing API client
- [ ] Remove `console.warn` stub indicators
- [ ] Update React Query retry/stale configurations based on real API performance
- [ ] Remove or convert `notification.mock.ts` to test fixtures
- [ ] Integration test against real backend
