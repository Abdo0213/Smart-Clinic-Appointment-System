# Appointment Feature — Data Model

## Appointment

```typescript
interface Appointment {
  id: string;                  // UUID
  patientId: string;           // UUID — reference to Patient entity
  doctorId: string;            // UUID — reference to Doctor entity
  slotDate: string;            // ISO date format (YYYY-MM-DD)
  slotStart: string;           // Time in HH:mm format
  slotEnd: string;             // Time in HH:mm format
  status: AppointmentStatus;   // Current lifecycle status
  price: number;               // Consultation price (determined server-side)
  bookedBy: string;            // UUID of the user who created the booking
  cancelReason?: string;       // Populated when status is CANCELLED
  createdAt: string;           // ISO datetime
  updatedAt?: string;          // ISO datetime
  patientName?: string;        // Denormalized for display (from API join)
  doctorName?: string;         // Denormalized for display (from API join)
}
```

## AppointmentStatus

```typescript
enum AppointmentStatus {
  BOOKED = 'BOOKED',
  ARRIVED = 'ARRIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}
```

### State Machine

```
          ┌──────────┐
          │  BOOKED   │
          └────┬──────┘
          ┌────┴──────┐
          ▼           ▼
    ┌──────────┐ ┌───────────┐
    │  ARRIVED  │ │ CANCELLED │ (terminal)
    └──┬───┬───┘ └───────────┘
   ┌───┘   └───┐
   ▼           ▼
┌───────────┐ ┌───────────┐
│ COMPLETED │ │  NO_SHOW  │
│ (terminal)│ │ (terminal) │
└───────────┘ └───────────┘
```

Valid transitions:

| From | To |
|---|---|
| BOOKED | ARRIVED |
| BOOKED | CANCELLED |
| ARRIVED | COMPLETED |
| ARRIVED | CANCELLED |
| ARRIVED | NO_SHOW |

Terminal states (no outgoing transitions): COMPLETED, CANCELLED, NO_SHOW.

## BookAppointmentRequest

```typescript
interface BookAppointmentRequest {
  patientId: string;   // UUID — required
  doctorId: string;    // UUID — required
  slotDate: string;    // ISO date (YYYY-MM-DD) — required
  slotStart: string;   // HH:mm — required
  slotEnd: string;     // HH:mm — required
}
```

Validation rules:
- `patientId` must be a valid UUID
- `doctorId` must be a valid UUID
- `slotDate` must be today or a future date
- `slotStart` must be before `slotEnd`
- `slotStart` and `slotEnd` must align with the doctor's schedule slot duration

## CancelAppointmentRequest

```typescript
interface CancelAppointmentRequest {
  reason: string;  // Required, minimum 5 characters
}
```

Validation rules:
- `reason` is required and must be at least 5 characters
- Only appointments in BOOKED or ARRIVED status can be cancelled

## RescheduleAppointmentRequest

```typescript
interface RescheduleAppointmentRequest {
  slotDate: string;    // ISO date (YYYY-MM-DD) — required
  slotStart: string;   // HH:mm — required
  slotEnd: string;     // HH:mm — required
}
```

Validation rules:
- Same slot validation as BookAppointmentRequest
- Only BOOKED appointments can be rescheduled

## WaitlistEntry

```typescript
interface WaitlistEntry {
  id: string;                  // UUID
  appointmentId?: string;      // Null until slot becomes available and is booked
  patientId: string;           // UUID
  doctorId: string;            // UUID
  slotDate: string;            // ISO date
  slotStart: string;           // HH:mm
  slotEnd: string;             // HH:mm
  position: number;            // 1-based position in waitlist
  status: WaitlistEntryStatus; // PENDING | NOTIFIED | FULFILLED | EXPIRED
  createdAt: string;           // ISO datetime
}

enum WaitlistEntryStatus {
  PENDING = 'PENDING',
  NOTIFIED = 'NOTIFIED',
  FULFILLED = 'FULFILLED',
  EXPIRED = 'EXPIRED',
}
```

## Paginated Appointment List Response

```typescript
interface PaginatedResponse<T> {
  content: T[];
  page: number;          // 0-based page index
  size: number;          // Requested page size
  totalElements: number; // Total matching records
  totalPages: number;    // Total pages available
  last: boolean;         // Whether this is the last page
}

type AppointmentListResponse = PaginatedResponse<Appointment>;
```

### Query Parameters for List Endpoint

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| patientId | string (UUID) | No | — | Filter by patient |
| doctorId | string (UUID) | No | — | Filter by doctor |
| date | string (ISO date) | No | — | Filter by slot date |
| status | AppointmentStatus | No | — | Filter by status |
| page | number | No | 0 | Page index (0-based) |
| size | number | No | 20 | Page size |

### Sorting

Default sort: `slotDate ASC, slotStart ASC`
