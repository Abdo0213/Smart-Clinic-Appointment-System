# Requirements Checklist: Notification Center

**Purpose**: Verify all functional requirements and acceptance criteria are met for the notification center feature
**Created**: 2026-05-07
**Feature**: [spec.md](./spec.md)

## User Story 1: View Notifications (P1)

- [x] CHK001 Bell icon is visible in the app header/navbar on all authenticated pages
- [x] CHK002 Clicking the bell icon opens the notification center panel
- [x] CHK003 Notification list renders with items sorted by `createdAt` descending
- [x] CHK004 Each notification displays type icon, title, message, and timestamp
- [x] CHK005 Each notification type has a distinct icon and color accent
- [x] CHK006 Unread notifications are visually distinct from read notifications
- [x] CHK007 Empty state is shown when there are no notifications
- [x] CHK008 Unauthenticated users cannot access notifications (redirected to login — handled by app layout)
- [x] CHK009 Loading skeleton/state is shown while notifications are being fetched
- [x] CHK010 Error state is shown when notification fetch fails

## User Story 2: Mark as Read (P2)

- [x] CHK011 "Mark as read" action is visible on unread notifications
- [x] CHK012 "Mark as read" action is NOT shown on already-read notifications
- [x] CHK013 Clicking "mark as read" changes the notification to read visual state
- [x] CHK014 Mark-as-read uses optimistic UI update (immediate visual change)
- [x] CHK015 Mark-as-read rolls back optimistically on API error
- [x] CHK016 Error toast is displayed if mark-as-read API call fails
- [x] CHK017 Badge count decrements when a notification is marked as read

## User Story 3: Unread Badge Count (P3)

- [x] CHK018 Badge displays the correct unread notification count
- [x] CHK019 Badge is hidden when unread count is 0
- [x] CHK020 Badge displays "99+" when unread count exceeds 99
- [x] CHK021 Badge count updates when notifications are marked as read
- [x] CHK022 Badge count updates when "mark all as read" is triggered
- [x] CHK023 Bell icon is still shown (without badge) if unread count API fails

## User Story 4: Mark All Read (P4)

- [x] CHK024 "Mark all as read" button is present in the notification center
- [x] CHK025 "Mark all as read" button is hidden when 0 unread notifications
- [x] CHK026 Clicking "Mark all as read" marks all notifications as read
- [x] CHK027 All notifications change to read visual state after "Mark all as read"
- [x] CHK028 Badge count resets to 0 after "Mark all as read"
- [x] CHK029 "Mark all as read" button shows loading state during mutation
- [x] CHK030 "Mark all as read" button is disabled during mutation (no double-click)
- [x] CHK031 Error toast is displayed if mark-all-read API call fails
- [x] CHK032 No notifications change state if mark-all-read API call fails (rollback)

## Data Model Compliance

- [x] CHK033 Notification interface matches data-model.md (id, type, title, message, isRead, createdAt, metadata)
- [x] CHK034 NotificationType enum includes all 5 values
- [x] CHK035 Zod schemas validate Notification and NotificationType
- [x] CHK036 Metadata fields are present and correctly typed per notification type

## API Contracts

- [x] CHK037 All 4 API functions are implemented (stubbed): getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount
- [x] CHK038 Stub functions return data matching the response shapes in contracts/notification-api.md
- [x] CHK039 Stub functions log console.warn indicating stubbed mode
- [x] CHK040 API function signatures match the TypeScript contracts in notification-api.md
- [x] CHK041 Paginated response follows the Spring Boot format (content, totalPages, etc.)

## FSD Architecture Compliance

- [x] CHK042 Notification domain logic is in `src/features/notifications/`
- [x] CHK043 Notification center composite UI is in `src/widgets/notification-center/`
- [x] CHK044 No FSD layer import violations (widgets import features; features do not import widgets)
- [x] CHK045 Zustand store is only used for UI state (panel open/close), not for server state
- [x] CHK046 React Query manages all notification server state

## Blocked/Stubbed Status

- [x] CHK047 All 4 backend endpoints are documented as MISSING in contracts/notification-api.md
- [x] CHK048 Dev-mode indicator (banner) shows when stubbed data is being served
- [x] CHK049 Mock data covers all 5 notification types
- [x] CHK050 Mock data includes a mix of read and unread notifications (7 unread, 5 read)

## Code Quality

- [x] CHK051 TypeScript check passes with zero new errors
- [x] CHK052 No `any` types used in notification feature code
- [x] CHK053 All components have ARIA labels for accessibility
- [x] CHK054 Notification panel is responsive (w-96 on desktop, constrained by popover)
- [ ] CHK055 Full lint pass (P3 — deferred to maintenance)

## Notes

- All 4 backend endpoints are BLOCKED — using stubbed mock data with console.warn indicators
- Dev-mode banner visible in NotificationCenter panel when NODE_ENV === 'development'
- When backend endpoints become available, replace stubs in `notification.api.ts` with real HTTP calls
