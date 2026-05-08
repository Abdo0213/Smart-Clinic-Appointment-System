# Feature Specification: Notification Center

**Feature Branch**: `006-notification`
**Created**: 2026-05-07
**Status**: Draft — BLOCKED (no backend notification endpoints exist yet)
**Input**: User description: "Notification center for Smart Clinic Appointment System — view notifications, mark as read, unread badge count, mark all read"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Notifications (Priority: P1)

As any authenticated user (Patient, Doctor, Receptionist, Admin), I want to see a list of my notifications so that I am aware of appointment reminders, status changes, and other important clinic events.

**Why this priority**: Without the ability to view notifications, no other notification feature has value. This is the foundational read path.

**Independent Test**: Can be fully tested by logging in, opening the notification center, and verifying that notifications render with correct type icons, timestamps, and content. Delivers immediate value even without read-state management.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and has 5 notifications, **When** they open the notification center, **Then** all 5 notifications are displayed sorted by `createdAt` descending (newest first)
2. **Given** the user has no notifications, **When** they open the notification center, **Then** an empty state is shown with a message like "No notifications yet"
3. **Given** the user is not authenticated, **When** they attempt to access notifications, **Then** they are redirected to the login page
4. **Given** a notification of type `APPOINTMENT_REMINDER_24H`, **When** it is rendered, **Then** it displays a clock icon and the message includes the appointment date/time
5. **Given** a notification of type `APPOINTMENT_CANCELLED`, **When** it is rendered, **Then** it displays an alert icon and is visually distinct (e.g., red accent)

---

### User Story 2 - Mark as Read (Priority: P2)

As a user viewing my notifications, I want to mark individual notifications as read so that I can track which ones I have already seen.

**Why this priority**: Read/unread state is the core interaction loop for notification management. Without it, users cannot distinguish seen from unseen notifications.

**Independent Test**: Can be tested by opening a notification, clicking the "mark as read" action, and verifying the notification's visual state changes (e.g., bold → normal text) and the unread count decrements.

**Acceptance Scenarios**:

1. **Given** a notification is unread (isRead=false), **When** the user clicks the "mark as read" action on that notification, **Then** the notification's visual state changes to read (e.g., no longer bold) and `isRead` is set to `true`
2. **Given** a notification is already read, **When** the user views it, **Then** no "mark as read" action is shown for that notification
3. **Given** the user marks a notification as read, **When** the unread badge count is visible, **Then** the badge count decrements by 1
4. **Given** the API call to mark as read fails, **When** the user clicks "mark as read", **Then** an error toast is shown and the notification remains in unread state

---

### User Story 3 - Unread Badge Count (Priority: P3)

As a user, I want to see a badge on the notification bell icon showing my unread notification count so that I immediately know how many notifications require my attention without opening the panel.

**Why this priority**: The badge provides at-a-glance awareness. It depends on the read-state concept from US2 but can be stubbed with mock data for independent testing.

**Independent Test**: Can be tested by logging in with a user who has unread notifications and verifying the badge shows the correct count. Marking notifications as read should update the badge.

**Acceptance Scenarios**:

1. **Given** the user has 7 unread notifications, **When** the header/navbar loads, **Then** a badge showing "7" is displayed on the notification bell icon
2. **Given** the user has 0 unread notifications, **When** the header/navbar loads, **Then** no badge is shown (or badge is hidden)
3. **Given** the user has 99+ unread notifications, **When** the header/navbar loads, **Then** the badge displays "99+" to prevent overflow
4. **Given** the user marks a notification as read, **When** the badge count refreshes, **Then** the count decrements without requiring a full page reload
5. **Given** the unread count API call fails, **When** the header loads, **Then** the bell icon is still shown but without a badge count (graceful degradation)

---

### User Story 4 - Mark All Read (Priority: P4)

As a user with multiple unread notifications, I want to mark all notifications as read in a single action so that I can quickly clear my notification backlog.

**Why this priority**: This is a convenience feature that builds on US2. Users can survive without it but it significantly improves UX when notification volume is high.

**Independent Test**: Can be tested by having 5+ unread notifications, clicking "Mark all as read", and verifying all notifications change to read state and the badge resets to 0.

**Acceptance Scenarios**:

1. **Given** the user has 5 unread notifications, **When** they click "Mark all as read", **Then** all 5 notifications change to read state and the unread badge resets to 0
2. **Given** the user has 0 unread notifications, **When** the notification center is open, **Then** the "Mark all as read" button is disabled or hidden
3. **Given** the "Mark all as read" API call fails, **When** the user clicks the button, **Then** an error toast is shown and no notifications change state
4. **Given** the user clicks "Mark all as read", **When** the operation is in progress, **Then** the button shows a loading spinner and is disabled to prevent double-click

---

### Edge Cases

- What happens when the backend notification endpoints are unavailable? → Stubbed data should be shown with a visual indicator that notifications are in demo/offline mode
- What happens when a new notification arrives while the panel is open? → Polling or optimistic update should refresh the list without user action
- What happens when the user has more than 50 notifications? → Pagination or virtual scrolling should be used to prevent performance issues
- How does the system handle concurrent read-state updates from multiple tabs? → Optimistic UI update with server reconciliation on next fetch
- What happens if the user clicks a notification that references a deleted appointment? → The notification should still render but any deep-link navigation should show a "not found" state

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a notification bell icon in the application header/navbar accessible from all authenticated pages
- **FR-002**: System MUST open a notification center panel (dropdown or slide-over) when the bell icon is clicked
- **FR-003**: System MUST render each notification with its type icon, title, message, timestamp, and read/unread visual state
- **FR-004**: System MUST sort notifications by `createdAt` in descending order (newest first)
- **FR-005**: System MUST display an unread badge count on the bell icon reflecting the current number of unread notifications
- **FR-006**: System MUST cap the badge display at "99+" when unread count exceeds 99
- **FR-007**: System MUST allow users to mark individual notifications as read
- **FR-008**: System MUST allow users to mark all notifications as read in a single action
- **FR-009**: System MUST hide or disable the "Mark all as read" action when there are zero unread notifications
- **FR-010**: System MUST show an empty state when no notifications exist
- **FR-011**: System MUST handle API errors gracefully with toast notifications and optimistic rollback
- **FR-012**: System MUST visually differentiate notification types (APPOINTMENT_REMINDER_24H, APPOINTMENT_REMINDER_2H, APPOINTMENT_STATUS_CHANGE, PRESCRIPTION_READY, APPOINTMENT_CANCELLED)
- **FR-013**: System MUST differentiate read vs unread notifications visually (e.g., bold text, background tint)
- **FR-014**: System MUST stub all API calls since backend notification endpoints do not exist yet
- **FR-015**: System MUST indicate to developers when stubbed data is being served (console warning or dev-mode banner)

### Key Entities

- **Notification**: Represents a single notification delivered to a user. Key attributes: id, type (NotificationType), title, message, isRead, createdAt, metadata. Each notification belongs to one user.
- **NotificationType**: Enum representing the category of notification. Values: APPOINTMENT_REMINDER_24H, APPOINTMENT_REMINDER_2H, APPOINTMENT_STATUS_CHANGE, PRESCRIPTION_READY, APPOINTMENT_CANCELLED. Determines the icon and visual style used.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view all their notifications in a list sorted by recency within 1 second of opening the panel
- **SC-002**: Marking a notification as read reflects in the UI within 200ms (optimistic update)
- **SC-003**: The unread badge count is accurate within the polling interval (≤30s delay acceptable)
- **SC-004**: "Mark all as read" completes for up to 50 notifications within 1 second (optimistic)
- **SC-005**: The notification panel renders correctly on viewports from 320px to 1920px
- **SC-006**: Zero TypeScript errors and all lint checks pass

## Assumptions

- THIS FEATURE IS BLOCKED — no backend notification endpoints exist yet. All API calls will be stubbed with mock data and clearly documented as blocked.
- Users have stable internet connectivity (polling-based approach for MVP)
- Notification delivery mechanism is polling-based for v1; WebSocket/SSE is a future enhancement
- The notification bell icon will be added to the existing application header/navbar layout
- Only in-app notifications are in scope; email/SMS/push notifications are out of scope for v1
- The notification center is accessible to all authenticated roles (Patient, Doctor, Receptionist, Admin)
- Notification data is scoped to the currently authenticated user only
- The maximum expected notification volume is ~100 per user; pagination is implemented but infinite scroll is not required for v1
- Backend team will add notification endpoints in a future sprint; this spec documents the expected contracts so they can implement independently
