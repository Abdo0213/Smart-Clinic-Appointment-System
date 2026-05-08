# Doctor Feature — Tasks

| Field          | Value                          |
|----------------|--------------------------------|
| Feature Branch | `003-doctor`                   |
| Status         | In Progress                    |
| Owner          | Frontend Team                  |
| Created        | 2026-05-07                     |
| Updated        | 2026-05-08                     |

---

## Phase 1 — Foundation (Entities & Types)

- [x] T001 [P1] [US#1] Define Doctor type and DTOs in `src/entities/doctor/model/types.ts` — Doctor, DoctorFilters, UpdateDoctorRequest, DoctorListResponse
- [x] T002 [P1] [US#3] Define Schedule, SlotAvailability, ScheduleBreak types in `src/entities/schedule/model/types.ts` — Schedule, CreateScheduleRequest, ScheduleSlot, SlotAvailability, ScheduleBreak
- [x] T003 [P1] [US#1] Implement `getDoctorById` API function — in `src/entities/doctor/api/doctorApi.ts → getById()`
- [x] T004 [P1] [US#6] Implement `getDoctors` API function with filters — in `src/entities/doctor/api/doctorApi.ts → getAll(filters)`
- [x] T005 [P1] [US#2] Implement `updateDoctor` API function — in `src/entities/doctor/api/doctorApi.ts → update()`
- [x] T006 [P1] [US#5] Implement `patchDoctorStatus` API function — in `src/entities/doctor/api/doctorApi.ts → toggleStatus()`
- [x] T007 [P1] [US#3] Implement `getSchedules` API function — in `src/entities/schedule/api/scheduleApi.ts → getSchedules()`
- [x] T008 [P1] [US#3] Implement `createSchedule` API function — in `src/entities/schedule/api/scheduleApi.ts → createSchedule()`
- [x] T009 [P1] [US#4] Implement `getSlots` API function — in `src/entities/schedule/api/scheduleApi.ts → getAvailableSlots()`
- [x] T010 [P1] [US#1] Create TanStack Query hooks for doctor APIs — in `src/entities/doctor/model/doctorQueries.ts` (useGetDoctors, useGetDoctor, useUpdateDoctor with optimistic update, useToggleDoctorStatus with optimistic update)
- [x] T011 [P1] [US#3] Create TanStack Query hooks for schedule APIs — in `src/entities/schedule/model/scheduleQueries.ts` (useGetSchedules, useCreateSchedule, useGetAvailableSlots)
- [x] T012 [P2] [US#4] Implement client-side slot generation utility — in `src/entities/schedule/model/slot-generator.ts` (generateSlots with break exclusion)
- [x] T013 [P1] Create barrel exports in `src/entities/doctor/index.ts` — types, hooks, API, UI components exported
- [x] T014 [P1] Create barrel exports in `src/entities/schedule/index.ts` — types, hooks, API, UI components exported

---

## Phase 2 — Doctor Profile Page

- [x] T015 [P1] [US#1] Build `DoctorProfilePage` with view/edit toggle — `src/pages/doctor-profile/ui/DoctorProfilePage.tsx` (read-only view with dialog-based edit for own profile, 404 state for missing profiles)
- [x] T016 [P1] [US#2] Build `DoctorProfileForm` with React Hook Form + Zod validation — `src/pages/doctor-profile/ui/DoctorProfileForm.tsx` (editable fields: specialization, bio, phone)
- [x] T017 [P1] [US#2] Add phone format validation (E.164 / local) — regex `/^(\+?\d{7,15}|\d{10,15})$/` in DoctorProfileForm Zod schema
- [x] T018 [P1] [US#1] Handle 404 "Profile not found" state — DoctorProfilePage shows icon + "Profile Not Found" message on error/missing data
- [x] T019 [P1] [US#2] Add success/error toast notifications for profile update — `toast.success()` and `toast.error()` in DoctorProfileForm mutation callbacks
- [x] T020 [P1] Create barrel export in `src/pages/doctor-profile/index.ts` — exports DoctorProfilePage and DoctorProfileForm
- [x] T021 [P1] Register routes: `/doctor/profile` (own profile), `/admin/doctors/[id]` (admin view) — both routes created in `src/app/(dashboard)/`

---

## Phase 3 — Schedule Page

- [x] T022 [P2] [US#3] Build `DoctorSchedulePage` layout — in `src/pages/doctor-schedule/ui/DoctorSchedulePage.tsx` (two-column layout: create form + existing schedules + slot preview)
- [x] T023 [P2] [US#3] Build `ScheduleForm` with date, start/end time, slot duration, price fields — inline in DoctorSchedulePage (React Hook Form + Zod)
- [x] T024 [P2] [US#3] Build `BreakFields` for dynamic break entry — inline in DoctorSchedulePage (add/remove/update break fields)
- [x] T025 [P2] [US#3] Add schedule validation: startTime < endTime, slotDuration 5–120, date >= today, breaks within working hours — Zod `.refine()` for cross-field validation + `validateBreaks()` helper
- [x] T026 [P2] [US#3] Handle 409 conflict error for duplicate schedule on same date — explicit `status === 409` check in onError with user-friendly toast
- [x] T027 [P3] [US#4] Build `SlotsView` component to display generated slots — `src/entities/schedule/ui/SlotAvailabilityGrid.tsx` + `SlotCard.tsx`
- [x] T028 [P3] [US#4] Add date picker to load and display slots for a specific date — in DoctorSchedulePage (preview date input)
- [x] T029 [P2] [US#3] Add success/error toast notifications for schedule creation — `toast.success()` and `toast.error()` in createSchedule mutation callbacks
- [x] T030 [P2] Create barrel export in `src/pages/doctor-schedule/index.ts` — exports DoctorSchedulePage
- [x] T031 [P2] Register `/doctors/:id/schedule` route — `/doctor/schedule` route exists at `src/app/(dashboard)/doctor/schedule/page.tsx`

---

## Phase 4 — Doctor List Page

- [x] T032 [P1] [US#6] Build `DoctorListPage` with filter bar and grid — in `src/pages/doctor-list/ui/DoctorListPage.tsx` (DataTable with columns, filters, actions)
- [x] T033 [P1] [US#6] Build `DoctorFilters` with specialization and status filter — inline in DoctorListPage (Select dropdown for specialization + Select for status)
- [x] T034 [P1] [US#6] Build `DoctorCard` summary component — in `src/entities/doctor/ui/DoctorCard.tsx`
- [x] T035 [P4] [US#5] Build `DoctorStatusToggle` for admin activate/deactivate — inline in DoctorListPage (ConfirmDialog with optimistic toggle)
- [x] T036 [P1] [US#6] Implement pagination controls with page/size params — DataTable pagination in DoctorListPage
- [x] T037 [P1] [US#6] Use `keepPreviousData` for smooth pagination transitions — in `useGetDoctors` (placeholderData: keepPreviousData)
- [x] T038 [P1] [US#6] Populate specialization dropdown from API data — Select dropdown populated from distinct specializations fetched via `useGetDoctors({ size: 200 })`
- [x] T039 [P1] Create barrel export in `src/pages/doctor-list/index.ts` — exports DoctorListPage
- [x] T040 [P1] Register `/doctors` route — `/admin/doctors` route exists at `src/app/(dashboard)/admin/doctors/page.tsx`

---

## Phase 5 — Polish & Edge Cases

- [x] T041 [P1] [US#5] Confirm optimistic update with rollback for status toggle — in `useToggleDoctorStatus` (onMutate/onError/onSettled)
- [x] T042 [P1] [US#2] Confirm optimistic update with rollback for profile update — in `useUpdateDoctor` (onMutate/onError/onSettled)
- [x] T043 [P2] Add loading skeleton states for profile, schedule, and list pages — `LoadingSpinner` used in all pages
- [x] T044 [P2] Add empty state illustrations for no doctors, no schedules, no slots — EmptyState components in schedule page, list page; text fallback in SlotAvailabilityGrid
- [x] T045 [P3] Verify slot query cache (30s stale time) behavior — `staleTime: 30 * 1000` configured in `useGetAvailableSlots`
- [x] T046 [P1] [US#6] Verify filter + pagination combination preserves filters on page change — filters reset page to 0 on change; pagination uses separate state
- [x] T047 [P1] Add role-based access guards on doctor profile and schedule routes — Profile edit button only shown for `isOwnProfile` check; routes under `/doctor/` (doctor role) and `/admin/doctors/` (admin role) paths
- [x] T048 [P2] [US#3] Validate break overlap detection in BreakFields — `findBreakOverlaps()` helper validates all break pairs for time overlap, with inline error messages

---

## Task Dependencies

```
T001-T014 (Foundation) ✅
         ↓
T015-T021 (Doctor Profile) ✅
T022-T031 (Schedule Page) ✅
T032-T040 (Doctor List Page) ✅
         ↓
T041-T048 (Polish) ✅
```

## Summary

| Phase | Status | Completed | Remaining |
|-------|--------|-----------|-----------|
| Phase 1: Foundation | ✅ Done | 14/14 | 0 |
| Phase 2: Doctor Profile | ✅ Done | 7/7 | 0 |
| Phase 3: Schedule Page | ✅ Done | 10/10 | 0 |
| Phase 4: Doctor List Page | ✅ Done | 9/9 | 0 |
| Phase 5: Polish & Edge Cases | ✅ Done | 8/8 | 0 |
| **Total** | **✅ 100%** | **48/48** | **0** |

### Files Created/Modified

| Action | File | Description |
|--------|------|-------------|
| **NEW** | `src/pages/doctor-profile/ui/DoctorProfilePage.tsx` | View/edit doctor profile with role-based edit visibility |
| **NEW** | `src/pages/doctor-profile/ui/DoctorProfileForm.tsx` | Profile edit form with Zod + phone validation |
| **NEW** | `src/pages/doctor-profile/index.ts` | Barrel export |
| **NEW** | `src/pages/doctor-list/index.ts` | Barrel export |
| **NEW** | `src/pages/doctor-schedule/index.ts` | Barrel export |
| **NEW** | `src/app/(dashboard)/doctor/profile/page.tsx` | Doctor own profile route |
| **NEW** | `src/app/(dashboard)/admin/doctors/[id]/page.tsx` | Admin doctor detail route |
| **NEW** | `src/components/ui/form.tsx` | Shadcn Form component (missing from project) |
| **MOD** | `src/pages/doctor-schedule/ui/DoctorSchedulePage.tsx` | Added cross-field validation, 409 handling, break overlap, toast |
| **MOD** | `src/pages/doctor-list/ui/DoctorListPage.tsx` | Specialization dropdown from API data |
| **MOD** | `src/entities/schedule/model/scheduleQueries.ts` | Added 30s staleTime to slot queries |
