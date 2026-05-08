# Doctor Feature — Technical Plan

## Architecture

This feature follows Feature-Sliced Design (FSD) v2.1. The implementation is organized into layers: entities (shared domain models and APIs), and pages (route-level compositions).

---

## Directory Structure

```
src/
├── entities/
│   ├── doctor/
│   │   ├── api/
│   │   │   ├── get-doctors.ts        # GET /doctors with filters
│   │   │   ├── get-doctor-by-id.ts   # GET /doctors/{id}
│   │   │   ├── update-doctor.ts      # PUT /doctors/{id}
│   │   │   └── patch-doctor-status.ts # PATCH /doctors/{id}/status
│   │   ├── model/
│   │   │   ├── doctor.types.ts       # Doctor interface & DTOs
│   │   │   └── doctor.queries.ts     # TanStack Query hooks for doctor APIs
│   │   └── index.ts                  # Public API barrel export
│   └── schedule/
│       ├── api/
│       │   ├── get-schedules.ts      # GET /doctors/{id}/schedules
│       │   ├── create-schedule.ts    # POST /doctors/{id}/schedules
│       │   └── get-slots.ts          # GET /doctors/{id}/slots?date=
│       ├── model/
│       │   ├── schedule.types.ts     # Schedule, SlotAvailability, ScheduleBreak
│       │   ├── schedule.queries.ts   # TanStack Query hooks for schedule APIs
│       │   └── slot-generator.ts     # Client-side slot generation utility
│       └── index.ts                  # Public API barrel export
├── pages/
│   ├── doctor-profile/
│   │   ├── ui/
│   │   │   ├── DoctorProfilePage.tsx   # View + edit mode toggle
│   │   │   └── DoctorProfileForm.tsx   # Editable form for bio/phone/specialization
│   │   └── index.ts
│   ├── doctor-schedule/
│   │   ├── ui/
│   │   │   ├── DoctorSchedulePage.tsx  # Schedule management page
│   │   │   ├── ScheduleForm.tsx        # Create schedule form
│   │   │   ├── BreakFields.tsx         # Dynamic break entry fields
│   │   │   └── SlotsView.tsx           # Display generated slots for a date
│   │   └── index.ts
│   └── doctor-list/
│       ├── ui/
│       │   ├── DoctorListPage.tsx      # Doctor list with filters & pagination
│       │   ├── DoctorFilters.tsx       # Specialization & status filter controls
│       │   ├── DoctorCard.tsx          # Individual doctor summary card
│       │   └── DoctorStatusToggle.tsx  # Admin activate/deactivate toggle
│       └── index.ts
```

---

## Routing

| Route | Page Component | Access |
|---|---|---|
| `/doctors` | DoctorListPage | Public |
| `/doctors/:id` | DoctorProfilePage | Doctor (self), Admin |
| `/doctors/:id/schedule` | DoctorSchedulePage | Doctor (self), Admin |

---

## State Management

- **Server state**: TanStack Query v5
  - `useDoctors(filters)` — paginated doctor list with filter params as query key
  - `useDoctor(id)` — single doctor profile
  - `useUpdateDoctor()` — mutation with optimistic update
  - `usePatchDoctorStatus()` — mutation with cache invalidation
  - `useSchedules(doctorId)` — schedule list
  - `useCreateSchedule()` — mutation with cache invalidation
  - `useSlots(doctorId, date)` — slot availability
- **UI state**: React `useState` / `useReducer` for form mode, filter selections, pagination cursor

---

## Key Technical Decisions

1. **Slot generation**: Performed server-side based on the schedule. The client displays results from `GET /doctors/{id}/slots`. A client-side `slot-generator.ts` utility exists for preview/validation only.
2. **Form handling**: React Hook Form + Zod for validation schemas shared between client types and runtime validation.
3. **Pagination**: Cursor-free offset pagination using `page` and `size` query params matching the API contract.
4. **Optimistic updates**: Doctor profile updates and status toggles use optimistic cache updates for instant UI feedback, with rollback on error.
5. **Specialization filter**: Free-text dropdown populated from distinct specializations returned by the API; no separate lookup endpoint.

---

## Dependencies

- `@tanstack/react-query` v5 — server state
- `react-hook-form` + `@hookform/resolvers` + `zod` — forms & validation
- `react-router` v7 or TanStack Router — routing (depends on project setup)
- Tailwind CSS — styling (matches existing project convention)

---

## Error Handling Strategy

- API errors map to toast notifications via a shared error handler.
- Form validation errors render inline below each field.
- Network failures trigger a retry (TanStack Query default: 3 retries).
- 404 responses on doctor profile render a dedicated "Not Found" UI.
- 409 Conflict on duplicate schedule shows a user-friendly message.

---

## Performance Considerations

- Doctor list uses `placeholderData: keepPreviousData` to avoid flash during pagination.
- Slot queries are cached per `(doctorId, date)` key; stale time set to 30 seconds.
- Doctor profile images (if added later) should use lazy loading.
- Schedule form uses `mode: 'onChange'` for real-time validation without excessive re-renders.
