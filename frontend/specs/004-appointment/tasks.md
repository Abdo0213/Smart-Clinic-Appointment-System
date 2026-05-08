# Appointment Feature — Phased Tasks

| Field          | Value                          |
|----------------|--------------------------------|
| Feature Branch | `004-appointment`              |
| Status         | Complete                       |
| Owner          | Frontend Team                  |
| Created        | 2026-05-07                     |
| Updated        | 2026-05-08                     |

---

## Phase 1: Foundation (Entities & Shared)

- [x] T1.1 Define Appointment types in `src/entities/appointment/model/types.ts` — Appointment, AppointmentStatus (re-exported from shared enums), BookAppointmentRequest, CancelAppointmentRequest, RescheduleAppointmentRequest, AppointmentFilters, AppointmentListResponse, WaitlistEntry, APPOINTMENT_STATUS_VALUES
- [x] T1.2 Create API client in `src/entities/appointment/api/appointmentApi.ts` — getAll, getById, create, updateStatus, cancel, joinWaitlist, reschedule
- [x] T1.3 Create React Query hooks in `src/entities/appointment/model/appointmentQueries.ts` — useGetAppointments (with keepPreviousData), useGetAppointment, useDoctorQueue (30s polling), useBookAppointment, useUpdateAppointmentStatus (with optimistic update + rollback), useCancelAppointment, useRescheduleAppointment, useJoinWaitlist
- [x] T1.4 Create status transition validator utility — `src/entities/appointment/model/status-transitions.ts` (VALID_TRANSITIONS map, isValidTransition, getValidNextStatuses, isTerminalStatus, canCancel, canReschedule)

---

## Phase 2: UI Primitives (Entity Layer)

- [x] T2.1 Build `AppointmentStatusBadge` component — `src/entities/appointment/ui/StatusBadge.tsx` (color-coded: BOOKED=blue, ARRIVED=yellow, COMPLETED=green, CANCELLED=red, NO_SHOW=gray)
- [x] T2.2 Build `AppointmentCard` component — `src/entities/appointment/ui/AppointmentCard.tsx` (doctor name, patient name, date, time, status badge, click handler)
- [ ] T2.3 Build `AppointmentTimeline` component — **DEFERRED** (P3 enhancement; visual timeline of status changes not required for MVP)
- [x] T2.4 Build `AppointmentFilters` component — `src/entities/appointment/ui/AppointmentFilters.tsx` (date, status, doctorId, patientSearch filters)

---

## Phase 3: Booking Wizard (Feature Layer)

- [x] T3.1 Create Zustand `bookingStore` — `src/features/appointment-booking/model/bookingStore.ts` (step, selectedDoctorId, selectedDate, selectedSlot; actions: setStep, selectDoctor, selectDate, selectSlot, reset)
- [x] T3.2 Booking wizard logic — Logic in `AppointmentBookingWizard.tsx` (step navigation, submission via useBookAppointment, store reset on success)
- [x] T3.3 Build `StepSelectDoctor` component — Inline in `DoctorSlotPicker.tsx` (step 1: doctor list with specialization filter, DoctorCard selection)
- [x] T3.4 Build `StepSelectSlot` component — Inline in `DoctorSlotPicker.tsx` (step 2: Calendar date picker; step 3: SlotAvailabilityGrid)
- [x] T3.5 Build `StepReviewConfirm` component — Inline in `DoctorSlotPicker.tsx` (step 4: booking summary) + confirm in `AppointmentBookingWizard.tsx`
- [x] T3.6 Build `BookingWizard` container — `AppointmentBookingWizard.tsx` (step indicator, back/next navigation, DoctorSlotPicker)
- [x] T3.7 Build `BookingSuccess` component — Inline in `AppointmentBookingWizard.tsx` (confirmation card with "Book Another" + "View Appointments")
- [x] T3.8 Zod validation schemas — `src/features/appointment-booking/model/schemas.ts` (bookAppointmentSchema, cancelAppointmentSchema, statusUpdateSchema)

---

## Phase 4: Status, Cancel, Reschedule Features

- [x] T4.1 Build `StatusUpdateDropdown` component — `src/features/appointment-status-update/ui/StatusUpdateDropdown.tsx` (shows only valid next statuses from transition map, toast feedback, optimistic UI)
- [x] T4.2 Build `CancelDialog` component — `src/features/appointment-cancel/ui/CancelDialog.tsx` (Dialog with min 5-char reason validation, canCancel guard, toast notifications)
- [x] T4.3 Build `RescheduleDialog` component — `src/features/appointment-reschedule/ui/RescheduleDialog.tsx` (date picker, slot grid from schedule API, canReschedule guard, toast notifications, BOOKED-only)
- [x] T4.4 Build `WaitlistButton` component — `src/features/appointment-booking/ui/WaitlistButton.tsx` (join waitlist with joined state display)

---

## Phase 5: Widgets

- [ ] T5.1 Build `AppointmentList` widget — **DEFERRED** (P3; list logic is inline in pages; extraction to shared widget is a refactoring task)

---

## Phase 6: Pages

- [x] T6.1 Build `PatientAppointmentsPage` — `src/pages/patient-appointments/ui/PatientAppointmentsPage.tsx` (DataTable with status filter, CancelDialog with min 5 char, RescheduleDialog, empty state, loading spinner, "Book New Appointment" button)
- [x] T6.2 Build `DoctorQueuePage` — `src/app/(dashboard)/doctor/queue/page.tsx` (date picker, 30s polling via useDoctorQueue, summary stats, ordered cards, StatusUpdateDropdown with transition validation, EmptyState)
- [x] T6.3 Build `ReceptionDashboardPage` — `src/app/(dashboard)/reception/page.tsx` (4-stat summary cards, full DataTable with filters, StatusUpdateDropdown, CancelDialog, RescheduleDialog, quick-book button)

---

## Phase 7: Integration & Polish

- [x] T7.1 Wire routes in router configuration — `/patient/appointments`, `/patient/appointments/book`, `/doctor/queue`, `/reception`, `/admin/appointments`
- [x] T7.2 Role-based route placement — Routes under role-specific path prefixes (`/patient/`, `/doctor/`, `/reception/`, `/admin/`)
- [x] T7.3 Add toast notifications for all mutations — toast.success/toast.error in booking, cancel, reschedule, and status update flows (via sonner)
- [x] T7.4 Add loading states — LoadingSpinner in all pages
- [x] T7.5 Add empty states — EmptyState component with appropriate icons and messages in all pages
- [ ] T7.6 Add error boundary per page — **DEFERRED** (P3 enhancement; would need a shared ErrorBoundary component)
- [ ] T7.7 Cross-browser and responsive testing — **N/A** (requires manual testing)
- [ ] T7.8 E2E test for booking, cancellation, and queue flows — **DEFERRED** (requires backend + test infrastructure)

---

## Task Dependencies

```
T1.1-T1.4 (Foundation) ✅
         ↓
T2.1-T2.4 (UI Primitives) ✅ (T2.3 deferred)
         ↓
T3.1-T3.8 (Booking Wizard) ✅
         ↓
T4.1-T4.4 (Status/Cancel/Reschedule) ✅
         ↓
T5.1 (Widgets) — Deferred
         ↓
T6.1-T6.3 (Pages) ✅
         ↓
T7.1-T7.8 (Integration) ✅ (T7.6-T7.8 deferred)
```

## Summary

| Phase | Status | Completed | Deferred |
|-------|--------|-----------|----------|
| Phase 1: Foundation | ✅ Done | 4/4 | 0 |
| Phase 2: UI Primitives | ✅ Done | 3/4 | T2.3 (timeline, P3) |
| Phase 3: Booking Wizard | ✅ Done | 8/8 | 0 |
| Phase 4: Status/Cancel/Reschedule | ✅ Done | 4/4 | 0 |
| Phase 5: Widgets | ⏭️ Deferred | 0/1 | T5.1 (refactoring, P3) |
| Phase 6: Pages | ✅ Done | 3/3 | 0 |
| Phase 7: Integration | ✅ Done | 5/8 | T7.6-T7.8 (testing/infra) |
| **Total** | **~90%** | **27/32** | **5 (P3/N/A)** |

### Files Created This Session

| Action | File | Description |
|--------|------|-------------|
| **NEW** | `src/entities/appointment/model/status-transitions.ts` | Status transition validator (state machine, guards) |
| **NEW** | `src/features/appointment-status-update/ui/StatusUpdateDropdown.tsx` | Transition-aware status update dropdown |
| **NEW** | `src/features/appointment-status-update/index.ts` | Barrel export |
| **NEW** | `src/features/appointment-cancel/ui/CancelDialog.tsx` | Cancel dialog with min 5 char reason validation |
| **NEW** | `src/features/appointment-cancel/index.ts` | Barrel export |
| **NEW** | `src/features/appointment-reschedule/ui/RescheduleDialog.tsx` | Reschedule dialog with date/slot picker |
| **NEW** | `src/features/appointment-reschedule/index.ts` | Barrel export |
| **NEW** | `src/pages/patient-appointments/index.ts` | Barrel export |
| **MOD** | `src/shared/api/apiRoutes.ts` | Added RESCHEDULE route |
| **MOD** | `src/entities/appointment/model/types.ts` | Added RescheduleAppointmentRequest |
| **MOD** | `src/entities/appointment/api/appointmentApi.ts` | Added reschedule() method |
| **MOD** | `src/entities/appointment/model/appointmentQueries.ts` | Added useDoctorQueue (30s polling), useRescheduleAppointment, optimistic status updates, keepPreviousData |
| **MOD** | `src/entities/appointment/index.ts` | Updated barrel with all new exports |
| **MOD** | `src/features/appointment-booking/ui/AppointmentBookingWizard.tsx` | Added toast notifications |
| **MOD** | `src/app/(dashboard)/doctor/queue/page.tsx` | Enhanced with 30s polling, date picker, summary stats, StatusUpdateDropdown |
| **MOD** | `src/pages/patient-appointments/ui/PatientAppointmentsPage.tsx` | Enhanced with CancelDialog, RescheduleDialog, status guards |
| **MOD** | `src/app/(dashboard)/reception/page.tsx` | Full rewrite with appointment list, filters, status updates, cancel, reschedule, quick-book |
| **MOD** | `src/app/(dashboard)/admin/appointments/page.tsx` | Enhanced with StatusUpdateDropdown, CancelDialog, EmptyState |
