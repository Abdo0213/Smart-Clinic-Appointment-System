# Appointment Feature — Implementation Plan

## Architecture: Feature-Sliced Design (FSD)

### Layer Structure

```
src/
├── entities/
│   └── appointment/
│       ├── model/
│       │   ├── types.ts              # Appointment, AppointmentStatus, request/response types
│       │   └── appointment-api.ts    # React Query hooks & API calls
│       ├── ui/
│       │   ├── AppointmentCard.tsx
│       │   ├── AppointmentStatusBadge.tsx
│       │   ├── AppointmentTimeline.tsx
│       │   └── AppointmentFilters.tsx
│       └── index.ts
│
├── features/
│   ├── appointment-booking/
│   │   ├── model/
│   │   │   ├── bookingStore.ts       # Zustand store for multi-step wizard
│   │   │   └── useBookingWizard.ts   # Hook orchestrating wizard logic
│   │   ├── ui/
│   │   │   ├── BookingWizard.tsx     # Wizard container with step navigation
│   │   │   ├── StepSelectDoctor.tsx
│   │   │   ├── StepSelectSlot.tsx
│   │   │   ├── StepReviewConfirm.tsx
│   │   │   └── BookingSuccess.tsx
│   │   └── index.ts
│   │
│   ├── appointment-cancel/
│   │   ├── ui/
│   │   │   └── CancelDialog.tsx      # Dialog with reason textarea
│   │   └── index.ts
│   │
│   ├── appointment-reschedule/
│   │   ├── ui/
│   │   │   └── RescheduleDialog.tsx  # Slot picker + confirm
│   │   └── index.ts
│   │
│   ├── appointment-status-update/
│   │   ├── ui/
│   │   │   └── StatusUpdateDropdown.tsx
│   │   └── index.ts
│   │
│   └── appointment-waitlist/
│       ├── ui/
│       │   └── WaitlistButton.tsx
│       └── index.ts
│
├── pages/
│   ├── patient-appointments/
│   │   ├── ui/
│   │   │   └── PatientAppointmentsPage.tsx
│   │   └── index.ts
│   │
│   ├── doctor-queue/
│   │   ├── ui/
│   │   │   └── DoctorQueuePage.tsx
│   │   └── index.ts
│   │
│   └── reception-dashboard/
│       ├── ui/
│       │   └── ReceptionDashboardPage.tsx
│       └── index.ts
│
├── widgets/
│   └── appointment-list/
│       ├── ui/
│       │   └── AppointmentList.tsx   # Shared list with filters & pagination
│       └── index.ts
│
└── shared/
    └── api/
        └── appointment.ts            # Raw API client functions
```

---

## State Management Strategy

### Zustand — Booking Wizard (Client State)

The multi-step booking wizard uses Zustand because:

- Form state across multiple steps needs to persist without URL coupling
- Step navigation (current step, visited steps) is pure UI state
- Validation state per step is transient and doesn't belong in server state
- Reset on success or cancel is trivial

```typescript
// bookingStore.ts shape
interface BookingState {
  step: 1 | 2 | 3;
  doctorId: string | null;
  slotDate: string | null;
  slotStart: string | null;
  slotEnd: string | null;
  patientId: string | null;
  setStep: (step: 1 | 2 | 3) => void;
  setDoctor: (doctorId: string) => void;
  setSlot: (date: string, start: string, end: string) => void;
  setPatient: (patientId: string) => void;
  reset: () => void;
}
```

### React Query — Server State

All appointment data fetching and mutations use React Query:

| Hook | Type | Purpose |
|---|---|---|
| `useAppointments` | Query | Fetch filtered, paginated appointment list |
| `useAppointment` | Query | Fetch single appointment by ID |
| `useDoctorQueue` | Query | Fetch today's appointments for a doctor |
| `useBookAppointment` | Mutation | Book a new appointment |
| `useCancelAppointment` | Mutation | Cancel with reason |
| `useUpdateStatus` | Mutation | Update appointment status |
| `useJoinWaitlist` | Mutation | Join waitlist for a slot |
| `useRescheduleAppointment` | Mutation | Reschedule to a new slot |

**Optimistic Updates**: Status updates use optimistic rendering. On mutation error, the previous state is restored via `onError` rollback with query invalidation.

**Polling**: `useDoctorQueue` polls every 30 seconds to keep the daily queue current.

---

## Routing

| Route | Page | Access |
|---|---|---|
| `/appointments` | PatientAppointmentsPage | Patient |
| `/appointments/book` | BookingWizard (embedded) | Patient, Receptionist |
| `/doctor/queue` | DoctorQueuePage | Doctor |
| `/reception/dashboard` | ReceptionDashboardPage | Receptionist |

---

## Component Interaction Flow

### Booking Wizard

```
BookingWizard
 ├── StepSelectDoctor      → sets doctorId in bookingStore
 ├── StepSelectSlot        → sets slotDate, slotStart, slotEnd in bookingStore
 └── StepReviewConfirm     → reads bookingStore, calls useBookAppointment mutation
       └── BookingSuccess  → resets bookingStore
```

### Appointment List

```
AppointmentList (widget)
 ├── AppointmentFilters    → updates URL search params
 ├── AppointmentCard[]     → displays each appointment
 │    ├── AppointmentStatusBadge
 │    ├── CancelDialog (feature)
 │    ├── RescheduleDialog (feature)
 │    └── StatusUpdateDropdown (feature)
 └── Pagination
```

### Doctor Queue

```
DoctorQueuePage
 ├── Date selector (defaults to today)
 └── AppointmentCard[] (ordered by slotStart)
      └── StatusUpdateDropdown
```

---

## Error Handling

- **API Errors**: Parsed from response body and displayed as toast notifications via a shared toast provider.
- **Validation Errors**: Shown inline next to the relevant form field.
- **Conflict Errors** (slot already booked): Trigger waitlist offer.
- **Authorization Errors**: Redirect to appropriate page with informational message.

---

## Testing Strategy

- **Unit**: Zustand store logic, utility functions, status transition validator
- **Integration**: React Query hooks with MSW mock server
- **Component**: Booking wizard step navigation, filter application, status dropdown
- **E2E**: Full booking flow, cancellation flow, daily queue rendering
