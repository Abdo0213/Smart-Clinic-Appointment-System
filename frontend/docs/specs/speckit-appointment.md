# SpecKit: Appointment Management

## Feature Name
Appointment — Booking, Status Lifecycle, Cancellation, Waitlist

## Description
End-to-end appointment management: slot booking by patients and receptionists, status transitions (BOOKED → ARRIVED → COMPLETED / CANCELLED / NO_SHOW), cancellation with reason, waitlist for full slots, and appointment listing with filters.

## User Stories

- **US-APT-01**: As a patient, I can book an appointment by selecting a doctor, date, and available time slot.
- **US-APT-02**: As a receptionist, I can book an appointment for a patient (walk-in or phone booking).
- **US-APT-03**: As a patient, I can view my upcoming and past appointments.
- **US-APT-04**: As a doctor, I can view my daily appointment queue.
- **US-APT-05**: As a receptionist/admin, I can update appointment status (ARRIVED, COMPLETED, NO_SHOW).
- **US-APT-06**: As a patient, I can cancel my appointment with a reason.
- **US-APT-07**: As a receptionist/admin, I can cancel any appointment.
- **US-APT-08**: As a patient/receptionist, I can add a patient to a waitlist when a slot is full.
- **US-APT-09**: As any user, I can view appointment details including doctor and patient info.
- **US-APT-10**: As an admin, I can filter appointments by doctor, patient, date, and status.

## UI States

| State | Description |
|---|---|
| **Loading** | Spinner on booking; skeleton on appointment list |
| **Empty** | "No appointments found"; "No upcoming appointments" |
| **Error** | Conflict booking toast; validation errors; server error |
| **Success** | Booking confirmed with slot details; status updated toast; cancellation confirmed |

## Components (Atomic Breakdown)

| Component | Type | Description |
|---|---|---|
| `AppointmentBookingWizard` | Organism | Multi-step: select doctor → select date → select slot → confirm |
| `AppointmentListTable` | Organism | DataTable (DiceUI) with filters (doctor, patient, date, status) |
| `AppointmentCard` | Molecule | Summary card with doctor, date, time, status |
| `AppointmentDetail` | Organism | Full appointment details with status actions |
| `StatusUpdateDropdown` | Molecule | Dropdown to change appointment status (receptionist/admin) |
| `CancellationDialog` | Molecule | Modal with reason input for cancellation |
| `WaitlistButton` | Atom | Button to add to waitlist for full slot |
| `AppointmentFilters` | Molecule | Filter bar: date picker, status select, doctor select, patient search |
| `DoctorSlotPicker` | Organism | Calendar + time slot grid for booking |
| `DailyQueueView` | Organism | Doctor's daily appointment list in chronological order |

## Data Models

```typescript
type AppointmentStatus =
  | "BOOKED"
  | "ARRIVED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  slotDate: string;        // "YYYY-MM-DD"
  slotStart: string;       // "HH:mm:ss"
  slotEnd: string;         // "HH:mm:ss"
  status: AppointmentStatus;
  price: number;
  bookedBy: string;
  createdAt: string;
}

interface BookAppointmentRequest {
  patientId: string;
  doctorId: string;
  slotDate: string;
  slotStart: string;
  slotEnd: string;
}

interface CancelAppointmentRequest {
  reason: string;
}

interface AppointmentListResponse {
  content: Appointment[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
```

## API Integration

| Action | Method | Endpoint | Auth | Request | Response |
|---|---|---|---|---|---|
| List Appointments | GET | `/appointments` | All roles | `?patientId=&doctorId=&date=&status=&page=&size=` | `AppointmentListResponse` |
| Book Appointment | POST | `/appointments` | Patient, Receptionist, Admin | `BookAppointmentRequest` | `Appointment` |
| Get Appointment | GET | `/appointments/{id}` | All roles | — | `Appointment` |
| Update Status | PATCH | `/appointments/{id}/status` | Doctor, Receptionist, Admin | `{ status: AppointmentStatus }` | `Appointment` |
| Cancel Appointment | DELETE | `/appointments/{id}` | Patient (own), Receptionist, Admin | `CancelAppointmentRequest` (in body) | `void` |
| Add to Waitlist | POST | `/appointments/{id}/waitlist` | Patient, Receptionist, Admin | — | `WaitlistEntry` |

## State Management

- **React Query**: `useGetAppointments(filters)`, `useGetAppointment(id)`, `useBookAppointment()`, `useUpdateAppointmentStatus()`, `useCancelAppointment()`, `useJoinWaitlist()`
- **Zustand**: `useBookingStore` — holds wizard state (selected doctor, date, slot) during multi-step booking flow
- **URL state**: Filters and pagination in search params
- **Optimistic updates**: Status changes can use optimistic UI updates with rollback on error

## Validation Rules (Zod)

```typescript
const bookAppointmentSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  doctorId: z.string().uuid("Invalid doctor ID"),
  slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  slotStart: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time"),
  slotEnd: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time"),
}).refine(data => data.slotStart < data.slotEnd, {
  message: "Start time must be before end time",
});

const cancelAppointmentSchema = z.object({
  reason: z.string().min(5, "Please provide a cancellation reason").max(500),
});

const statusUpdateSchema = z.object({
  status: z.enum(["ARRIVED", "COMPLETED", "NO_SHOW"]),
});
```

## Edge Cases

1. **Double booking race condition**: Two patients book same slot simultaneously — backend rejects one with conflict error, show "Slot no longer available" message.
2. **Cancelling past appointments**: Should not be allowed — client-side date check + backend validation.
3. **Status transition rules**: BOOKED → ARRIVED → COMPLETED is the happy path. Cannot go COMPLETED → BOOKED. Validate transitions client-side.
4. **Patient booking for self vs receptionist booking for patient**: Different flows — patient auto-fills their own `patientId`; receptionist searches and selects.
5. **Waitlist notification**: When a slot opens up, how is the waitlisted patient notified? Backend event → Notification Service. No API to query waitlist position (see missing endpoints).
6. **Booked-by tracking**: `bookedBy` field is auto-set by backend from JWT — no need to send it.
7. **Price display**: Price comes from schedule configuration, shown before booking confirmation.
8. **Timezone handling**: All times from backend are in clinic's local timezone — display accordingly.

## FSD Placement

```
src/
  features/
    appointment-booking/
      ui/
        AppointmentBookingWizard.tsx
        DoctorSlotPicker.tsx
        WaitlistButton.tsx
      model/
        bookingStore.ts       # Zustand: wizard state
        schemas.ts
        types.ts
      api/
        bookAppointment.ts
      index.ts
  entities/
    appointment/
      model/
        types.ts
        appointmentQueries.ts
      api/
        appointmentApi.ts
      ui/
        AppointmentCard.tsx
        StatusBadge.tsx
        AppointmentFilters.tsx
      index.ts
  pages/
    appointments/
      ui/
        AppointmentListPage.tsx
        AppointmentListTable.tsx
        AppointmentDetailPage.tsx
        DailyQueuePage.tsx
        CancellationDialog.tsx
      model/
        schemas.ts
      index.ts
```
