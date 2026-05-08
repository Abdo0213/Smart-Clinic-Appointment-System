# SpecKit: Notifications

## Feature Name
Notification — Appointment Reminders, Status Alerts, Prescription Ready

## Description
Notification system for appointment reminders (24h and 2h before), appointment status change alerts, and prescription-ready notifications. This is primarily a backend-driven service (SQS + email), but the frontend needs a notification center UI and real-time updates.

## User Stories

- **US-NOT-01**: As a patient, I can see my notifications (appointment reminders, status changes, prescription ready).
- **US-NOT-02**: As a doctor, I can see notifications about my upcoming appointments.
- **US-NOT-03**: As a receptionist, I can see notifications about appointment changes.
- **US-NOT-04**: As a user, I can mark notifications as read.
- **US-NOT-05**: As a user, I see a badge count of unread notifications.

## UI States

| State | Description |
|---|---|
| **Loading** | Skeleton in notification dropdown |
| **Empty** | "No notifications" message |
| **Error** | Toast on fetch failure; graceful degradation |
| **Success** | Notification list loaded; badge count updated |

## Components (Atomic Breakdown)

| Component | Type | Description |
|---|---|---|
| `NotificationCenter` | Organism | Dropdown/panel showing notification list |
| `NotificationList` | Molecule | Scrollable list of notifications |
| `NotificationItem` | Molecule | Single notification: icon, message, timestamp, read status |
| `NotificationBadge` | Atom | Unread count badge on bell icon |
| `NotificationBell` | Atom | Bell icon button with badge, opens center |

## Data Models

```typescript
type NotificationType =
  | "APPOINTMENT_REMINDER_24H"
  | "APPOINTMENT_REMINDER_2H"
  | "APPOINTMENT_STATUS_CHANGE"
  | "PRESCRIPTION_READY"
  | "APPOINTMENT_CANCELLED";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    appointmentId?: string;
    doctorId?: string;
    patientId?: string;
  };
}
```

## API Integration

| Action | Method | Endpoint | Auth | Request | Response |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

**No endpoints exist for notifications.** All notification endpoints are missing from the Postman collection and API guide. See `missing-endpoints.md`.

## State Management

- **Zustand**: `useNotificationStore` — holds notifications, unread count, and actions (fetch, markRead, markAllRead)
- **Polling**: React Query with `refetchInterval` (every 30s) to poll for new notifications
- **Future**: WebSocket/SSE for real-time push when backend supports it

## Edge Cases

1. **No backend notification API**: Currently there's no way to fetch, mark as read, or manage notifications from the frontend. All notification endpoints are missing.
2. **Email-only notifications**: Requirements mention email notifications — these are entirely server-side. Frontend notification center is a stretch goal that requires backend support.
3. **Real-time updates**: Without WebSocket/SSE, must rely on polling which has latency.
4. **Notification volume**: Many notifications could accumulate — need pagination.

## FSD Placement

```
src/
  features/
    notifications/
      ui/
        NotificationCenter.tsx
        NotificationList.tsx
        NotificationItem.tsx
        NotificationBadge.tsx
        NotificationBell.tsx
      model/
        notificationStore.ts   # Zustand
        types.ts
      api/
        notificationApi.ts     # Will be stub until backend adds endpoints
      index.ts
  widgets/
    header/
      ui/
        Header.tsx             # Includes NotificationBell
      index.ts
```

**Note**: This feature is blocked by missing backend endpoints. Implementation should be deferred or stubbed until API is available.
