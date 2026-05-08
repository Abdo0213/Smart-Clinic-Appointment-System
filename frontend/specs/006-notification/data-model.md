# Data Model: Notification Center

**Feature**: Notification Center
**Branch**: `006-notification`
**Date**: 2026-05-07

## Entities

### Notification

Represents a single notification delivered to a user in the Smart Clinic system.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | Yes | Unique identifier for the notification |
| `type` | `NotificationType` | Yes | Category of the notification; determines icon and visual style |
| `title` | `string` | Yes | Short headline text (e.g., "Appointment Reminder") |
| `message` | `string` | Yes | Full notification body text with details |
| `isRead` | `boolean` | Yes | Whether the user has read this notification; defaults to `false` |
| `createdAt` | `string` (ISO 8601) | Yes | Timestamp when the notification was created |
| `metadata` | `Record<string, unknown>` | No | Optional key-value payload for context-specific data (e.g., `appointmentId`, `doctorId`, `patientId`) |

**TypeScript Interface**:

```typescript
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}
```

**Zod Schema**:

```typescript
import { z } from "zod";

const notificationSchema = z.object({
  id: z.string().uuid(),
  type: notificationTypeSchema,
  title: z.string().min(1),
  message: z.string().min(1),
  isRead: z.boolean(),
  createdAt: z.string().datetime(),
  metadata: z.record(z.unknown()).optional(),
});
```

---

### NotificationType

Enum representing the category of a notification. Each type maps to a specific icon, color accent, and UX behavior.

| Value | Display Label | Icon | Color Accent | Description |
|-------|---------------|------|-------------|-------------|
| `APPOINTMENT_REMINDER_24H` | "24h Reminder" | Clock | Blue | Reminder sent 24 hours before an appointment |
| `APPOINTMENT_REMINDER_2H` | "2h Reminder" | Clock | Amber | Urgent reminder sent 2 hours before an appointment |
| `APPOINTMENT_STATUS_CHANGE` | "Status Update" | RefreshCw | Teal | Appointment status changed (e.g., ARRIVED → COMPLETED) |
| `PRESCRIPTION_READY` | "Prescription Ready" | Pill | Green | A prescription from a visit is ready for pickup |
| `APPOINTMENT_CANCELLED` | "Appointment Cancelled" | AlertTriangle | Red | An appointment has been cancelled |

**TypeScript Type**:

```typescript
type NotificationType =
  | "APPOINTMENT_REMINDER_24H"
  | "APPOINTMENT_REMINDER_2H"
  | "APPOINTMENT_STATUS_CHANGE"
  | "PRESCRIPTION_READY"
  | "APPOINTMENT_CANCELLED";
```

**Zod Schema**:

```typescript
const notificationTypeSchema = z.enum([
  "APPOINTMENT_REMINDER_24H",
  "APPOINTMENT_REMINDER_2H",
  "APPOINTMENT_STATUS_CHANGE",
  "PRESCRIPTION_READY",
  "APPOINTMENT_CANCELLED",
]);
```

---

## Metadata Examples by Type

Each notification type may include contextual metadata that enables deep-linking or additional display logic.

### APPOINTMENT_REMINDER_24H / APPOINTMENT_REMINDER_2H

```json
{
  "appointmentId": "uuid",
  "doctorId": "uuid",
  "doctorName": "Dr. Smith",
  "slotDate": "2026-05-10",
  "slotStart": "09:00:00",
  "slotEnd": "09:30:00"
}
```

### APPOINTMENT_STATUS_CHANGE

```json
{
  "appointmentId": "uuid",
  "previousStatus": "BOOKED",
  "newStatus": "COMPLETED",
  "doctorName": "Dr. Smith"
}
```

### PRESCRIPTION_READY

```json
{
  "prescriptionId": "uuid",
  "visitId": "uuid",
  "doctorName": "Dr. Smith"
}
```

### APPOINTMENT_CANCELLED

```json
{
  "appointmentId": "uuid",
  "doctorName": "Dr. Smith",
  "slotDate": "2026-05-10",
  "slotStart": "09:00:00",
  "cancelledBy": "patient"
}
```

---

## Entity Relationships

```text
User (1) ──── (N) Notification
Notification ──── (1) NotificationType  (via `type` field)
Notification ──── (0..1) Appointment    (via `metadata.appointmentId`)
Notification ──── (0..1) Doctor         (via `metadata.doctorId`)
```

- A **User** has many **Notifications**.
- Each **Notification** has exactly one **NotificationType**.
- Notifications may reference an **Appointment** or **Doctor** through the optional `metadata` field, but this is not a hard foreign key on the frontend — it is used for deep-linking only.

---

## Badge Count Model

The unread badge count is derived data, not a separate entity. It is computed as:

```typescript
type UnreadCount = number;
```

Returned by `GET /notifications/unread-count` (currently MISSING/BLOCKED) and cached via React Query under key `['notifications', 'unread-count']`.

---

## Pagination Model

The notification list supports pagination aligned with the Spring Boot paginated response format used across the project:

```typescript
interface PaginatedNotifications {
  content: Notification[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
```

Query parameters: `?page=0&size=20&sort=createdAt,desc`
