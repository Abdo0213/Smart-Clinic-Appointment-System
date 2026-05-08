# Quickstart: Notification Center

**Feature Branch**: `006-notification`
**Date**: 2026-05-07

## Prerequisites

- Node.js 18+ and npm/pnpm installed
- Smart Clinic frontend project cloned and dependencies installed (`npm install`)
- Backend running or — since notification endpoints are MISSING — the app will use stubbed data automatically

## Setup

```bash
# 1. Create and checkout the feature branch
git checkout -b 006-notification

# 2. Install dependencies (if not already done)
npm install

# 3. Start the dev server
npm run dev
```

## Development Workflow

### Step 1: Create the Feature Structure

```bash
# Create FSD directories
mkdir -p src/features/notifications/model
mkdir -p src/features/notifications/api
mkdir -p src/features/notifications/ui
mkdir -p src/widgets/notification-center/ui
mkdir -p src/widgets/notification-center/model
```

### Step 2: Define Types and Schemas

Create `src/features/notifications/model/notification.types.ts`:

```typescript
export type NotificationType =
  | "APPOINTMENT_REMINDER_24H"
  | "APPOINTMENT_REMINDER_2H"
  | "APPOINTMENT_STATUS_CHANGE"
  | "PRESCRIPTION_READY"
  | "APPOINTMENT_CANCELLED";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}
```

Create `src/features/notifications/model/notification.schemas.ts`:

```typescript
import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "APPOINTMENT_REMINDER_24H",
  "APPOINTMENT_REMINDER_2H",
  "APPOINTMENT_STATUS_CHANGE",
  "PRESCRIPTION_READY",
  "APPOINTMENT_CANCELLED",
]);

export const notificationSchema = z.object({
  id: z.string().uuid(),
  type: notificationTypeSchema,
  title: z.string().min(1),
  message: z.string().min(1),
  isRead: z.boolean(),
  createdAt: z.string().datetime(),
  metadata: z.record(z.unknown()).optional(),
});
```

### Step 3: Create Mock Data

Create `src/features/notifications/model/notification.mock.ts` with at least 10 mock notifications covering all 5 types.

### Step 4: Create Stubbed API Layer

Create `src/features/notifications/api/notification.api.ts` with 4 stub functions:

- `getNotifications()` — returns paginated mock data
- `markNotificationRead(id)` — updates mock item to `isRead: true`
- `markAllNotificationsRead()` — marks all mock items as read
- `getUnreadCount()` — counts unread items in mock data

Each function should:
- Add a small simulated delay (100–300ms)
- Log `console.warn("[STUB] ...")` to indicate stub mode

### Step 5: Create React Query Hooks

Create `src/features/notifications/api/notification.queries.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// ... import API functions

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  });
}
```

### Step 6: Build UI Components

1. **`NotificationItem`** — single notification row with type icon, title, message, timestamp, read/unread styling, mark-as-read action
2. **`NotificationEmptyState`** — shown when list is empty
3. **`NotificationBadge`** — unread count badge, caps at "99+"
4. **`NotificationBell`** — bell icon button that toggles panel
5. **`NotificationCenter`** — dropdown/slide-over panel with notification list, "Mark all as read" button, loading/error states

### Step 7: Add Zustand Store for Panel State

Create `src/widgets/notification-center/model/notification-center.store.ts`:

```typescript
import { create } from "zustand";

interface NotificationCenterState {
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
}

export const useNotificationCenterStore = create<NotificationCenterState>((set) => ({
  isPanelOpen: false,
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
}));
```

### Step 8: Integrate into App Header

Add `NotificationBell` to the existing app layout header/navbar.

## Verification

```bash
# Run linting
npm run lint

# Run type checking
npm run typecheck

# Both must pass with zero errors
```

## Manual Test Checklist

1. [ ] Bell icon appears in the header when logged in
2. [ ] Clicking bell opens the notification center panel
3. [ ] Notifications render with correct type icons and colors
4. [ ] Unread notifications are visually distinct from read ones
5. [ ] Clicking "mark as read" on a notification changes its visual state
6. [ ] Badge count appears on the bell icon when there are unread notifications
7. [ ] Badge count decrements when a notification is marked as read
8. [ ] "Mark all as read" button marks all notifications as read and resets badge
9. [ ] "Mark all as read" button is disabled when no unread notifications exist
10. [ ] Empty state is shown when there are no notifications
11. [ ] Console shows `[STUB]` warnings indicating mock data is being used

## When Backend Is Ready

1. Replace stub API functions with real HTTP calls
2. Remove `console.warn` stub indicators
3. Convert mock data file to test fixtures
4. Run integration tests against real backend
5. Adjust React Query configuration based on real API performance
