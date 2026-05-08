# Implementation Plan: Notification Center

**Branch**: `006-notification` | **Date**: 2026-05-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-notification/spec.md`

## Summary

Build a notification center for the Smart Clinic Appointment System that allows all authenticated users to view notifications, mark individual or all notifications as read, and see an unread badge count on the notification bell icon. All API calls will be stubbed with mock data since backend notification endpoints do not exist yet. The implementation follows Feature-Sliced Design (FSD) v2.1 architecture with React Query for server state and Shadcn UI for components.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16+ (App Router), React Query (TanStack Query), Shadcn UI, DiceUI, React Hook Form, Zod, Zustand
**Storage**: N/A (all data fetched from API — currently stubbed)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web browser (responsive 320px–1920px)
**Project Type**: Frontend web application
**Performance Goals**: <200ms optimistic UI updates, <1s notification list render
**Constraints**: All API endpoints are MISSING/BLOCKED — must be stubbed
**Scale/Scope**: ~100 notifications per user, 4 notification center views, 5 notification types

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| FSD v2.1 | ✅ Pass | Notification code organized in `features/notifications/` and `widgets/notification-center/` |
| Type Safety First | ✅ Pass | Zod schemas for Notification and NotificationType; no `any` types |
| Role-Based Access Control | ✅ Pass | All authenticated roles can access notifications |
| Server State Separation | ✅ Pass | React Query for notifications; Zustand only for UI state (panel open/close) |
| Component Reusability | ✅ Pass | Shadcn UI + shared components in `shared/ui/` |
| Form Validation | ✅ Pass | N/A — no forms in this feature |
| API Contract Adherence | ✅ Pass | All endpoints documented as MISSING in contracts; stubbed gracefully |

## Project Structure

### Documentation (this feature)

```text
specs/006-notification/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── notification-api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── features/
│   └── notifications/
│       ├── model/
│       │   ├── notification.types.ts
│       │   ├── notification.schemas.ts
│       │   └── notification.mock.ts
│       ├── api/
│       │   ├── notification.api.ts
│       │   └── notification.queries.ts
│       └── ui/
│           ├── notification-item.tsx
│           └── notification-empty-state.tsx
├── widgets/
│   └── notification-center/
│       ├── ui/
│       │   ├── notification-center.tsx
│       │   ├── notification-bell.tsx
│       │   └── notification-badge.tsx
│       └── model/
│           └── notification-center.store.ts
├── entities/
│   └── (existing entities unchanged)
├── shared/
│   ├── ui/
│   │   └── (existing shared components)
│   └── api/
│       └── (existing API client)
└── app/
    └── (layout updates to include notification bell in header)
```

**Structure Decision**: FSD v2.1 — `features/notifications/` contains the notification domain logic (types, API, queries, item component), while `widgets/notification-center/` contains the composite UI (bell, badge, panel). This follows the FSD rule that features are domain slices and widgets compose features into UI blocks.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
