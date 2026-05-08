# Tasks: Notification Center

**Input**: Design documents from `/specs/006-notification/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- ⛔ = BLOCKED (depends on backend endpoints that do not exist yet)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and notification feature structure

- [x] T001 Create `src/features/notifications/` directory structure per plan.md (model/, api/, ui/)
- [x] T002 Create `src/widgets/notification-center/` directory structure per plan.md (ui/, model/)
- [x] T003 [P] Define `NotificationType` enum and `Notification` interface in `src/features/notifications/model/notification.types.ts`
- [x] T004 [P] Create Zod schemas `notificationSchema` and `notificationTypeSchema` in `src/features/notifications/model/notification.schemas.ts`
- [x] T005 [P] Create mock notification data (12 items covering all 5 types, mix of read/unread) in `src/features/notifications/model/notification.mock.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API layer and query hooks that ALL user stories depend on

- [x] T006 ⛔ Create `getNotifications()` API function — **STUBBED** (backend MISSING)
- [x] T007 ⛔ Create `markNotificationRead()` API function — **STUBBED** (backend MISSING)
- [x] T008 ⛔ Create `markAllNotificationsRead()` API function — **STUBBED** (backend MISSING)
- [x] T009 ⛔ Create `getUnreadCount()` API function — **STUBBED** (backend MISSING)
- [x] T010 Create stub implementations for all 4 API functions using mock data with console.warn
- [x] T011 Create `useNotifications` React Query hook (queryKey: `['notifications']`, refetchInterval: 30000)
- [x] T012 [P] Create `useMarkAsRead` React Query mutation hook with optimistic updates + rollback
- [x] T013 [P] Create `useMarkAllRead` React Query mutation hook with optimistic updates + rollback
- [x] T014 [P] Create `useUnreadCount` React Query hook (queryKey: `['notifications', 'unread-count']`, refetchInterval: 30000)

---

## Phase 3: User Story 1 - View Notifications (Priority: P1) 🎯 MVP

- [x] T015 Create `NotificationItem` component — renders icon (by type), title, message, relative timestamp, and read/unread visual state
- [x] T016 [P] Create `NotificationEmptyState` component — shown when notification list is empty
- [x] T017 Create `NotificationCenter` component — panel with notification list, loading skeleton, error state
- [x] T018 Create `NotificationBell` component — bell icon with popover that toggles NotificationCenter
- [x] T019 Create `notificationCenterStore` Zustand store for `isPanelOpen` UI state
- [x] T020 NotificationBell integrated into app header (was already integrated in prior work)

---

## Phase 4: User Story 2 - Mark as Read (Priority: P2)

- [x] T021 Add "mark as read" action button to `NotificationItem` (only shown when isRead === false)
- [x] T022 Wire `useMarkAsRead` mutation — optimistic update: set isRead=true, rollback on error
- [x] T023 Add error toast on mutation failure using sonner toast system

---

## Phase 5: User Story 3 - Unread Badge Count (Priority: P3)

- [x] T024 Create `NotificationBadge` component — displays unread count, caps at "99+", hidden when 0
- [x] T025 Wire `useUnreadCount` hook to `NotificationBadge`
- [x] T026 Integrate `NotificationBadge` with `NotificationBell` — badge overlays bell icon
- [x] T027 Invalidate unread-count query cache after markAsRead and markAllRead mutations

---

## Phase 6: User Story 4 - Mark All Read (Priority: P4)

- [x] T028 Add "Mark all as read" button to NotificationCenter header — disabled when unread count is 0
- [x] T029 Wire `useMarkAllRead` mutation — optimistic: set all isRead=true, rollback on error
- [x] T030 Add loading spinner to "Mark all as read" button while mutation is pending; disable to prevent double-click
- [x] T031 Add error/success toast on mark-all-read mutation

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T032 [P] Add dev-mode banner when stubbed API data is being served
- [x] T033 [P] Add keyboard accessibility (ARIA labels on bell, list items, actions)
- [x] T034 [P] Responsive styles — 384px wide popover panel
- [x] T035 All 5 notification types render with correct icons and color accents
- [x] T036 Run typecheck — passes with zero NEW errors (pre-existing patient-list errors remain)
- [ ] T037 Run quickstart.md validation (P3 — requires running dev server)
