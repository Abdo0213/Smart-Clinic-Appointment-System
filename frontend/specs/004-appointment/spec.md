# Appointment Feature Specification

## Feature Branch

`004-appointment`

## Overview

The Appointment feature enables patients, receptionists, and doctors to manage clinic appointments end-to-end: booking, viewing, filtering, status updates, cancellation, rescheduling, and waitlist management. It also provides doctors with a daily queue view and receptionists with a dashboard for operational control.

---

## User Stories

### P1 — Book Appointment

**As a** patient or receptionist  
**I want to** book an appointment with a doctor for a specific date and time slot  
**So that** the patient receives a confirmed consultation slot

### P2 — View Appointment List with Filters

**As a** patient, doctor, or receptionist  
**I want to** view a filtered and paginated list of appointments  
**So that** I can find relevant appointments quickly by patient, doctor, date, or status

### P3 — Update Appointment Status

**As a** receptionist or doctor  
**I want to** update the status of an appointment (e.g., ARRIVED, COMPLETED, NO_SHOW)  
**So that** the system accurately reflects what happened during the visit

### P4 — Cancel Appointment

**As a** patient or receptionist  
**I want to** cancel an appointment with a reason  
**So that** the slot is freed and the cancellation is tracked

### P5 — Join Waitlist

**As a** patient  
**I want to** join a waitlist for a fully-booked slot  
**So that** I am notified if the slot becomes available

### P6 — View Daily Queue (Doctor)

**As a** doctor  
**I want to** see my daily appointment queue ordered by time  
**So that** I can manage patient flow efficiently

### P7 — Reschedule Appointment

**As a** patient or receptionist  
**I want to** reschedule an existing appointment to a different date/time  
**So that** the patient can attend at a more suitable time

---

## Acceptance Scenarios

### US-1: Book Appointment

```gherkin
Given a patient selects a doctor and an available slot
When the patient confirms the booking
Then an appointment is created with status BOOKED
And the slot is no longer available for booking
And a confirmation is displayed to the patient
```

```gherkin
Given a receptionist selects a patient, doctor, and available slot
When the receptionist confirms the booking
Then an appointment is created with status BOOKED
And the bookedBy field records the receptionist
And the slot is no longer available for booking
```

```gherkin
Given a selected slot is already booked
When the patient or receptionist attempts to book
Then an error is displayed indicating the slot is unavailable
```

### US-2: View Appointment List with Filters

```gherkin
Given the user is on the appointments page
When the user applies filters for patientId, doctorId, date, and/or status
Then only matching appointments are displayed in a paginated list
And the total count reflects the filtered results
```

```gherkin
Given the user is on the appointments page with no filters
When the page loads
Then the first page of appointments is displayed ordered by slotDate and slotStart
```

### US-3: Update Appointment Status

```gherkin
Given a receptionist or doctor views an appointment with status BOOKED
When they change the status to ARRIVED
Then the appointment status is updated to ARRIVED
And the change is reflected immediately in the UI
```

```gherkin
Given a doctor views an appointment with status ARRIVED
When they change the status to COMPLETED
Then the appointment status is updated to COMPLETED
```

```gherkin
Given a user who is not a receptionist or doctor
When they attempt to update an appointment status
Then the action is denied with an authorization error
```

### US-4: Cancel Appointment

```gherkin
Given a patient or receptionist views a BOOKED appointment
When they cancel it and provide a reason
Then the appointment status is changed to CANCELLED
And the reason is stored with the appointment
And the slot becomes available again
```

```gherkin
Given a patient attempts to cancel a COMPLETED appointment
When they submit the cancellation
Then an error is displayed indicating the appointment cannot be cancelled
```

### US-5: Join Waitlist

```gherkin
Given a patient views a fully-booked slot
When they join the waitlist
Then a waitlist entry is created for that patient and slot
And the patient is shown their position on the waitlist
```

```gherkin
Given a patient is already on the waitlist for a slot
When they attempt to join again
Then a duplicate entry is prevented and a message is shown
```

### US-6: View Daily Queue (Doctor)

```gherkin
Given a doctor is logged in
When they navigate to the daily queue view
Then they see today's appointments ordered by slotStart
And each appointment shows patient name, slot time, and current status
```

```gherkin
Given a doctor views the daily queue
When an appointment status changes externally
Then the queue view reflects the updated status without a full page reload
```

### US-7: Reschedule Appointment

```gherkin
Given a patient or receptionist views a BOOKED appointment
When they select a new available slot and confirm
Then the original appointment is cancelled
And a new appointment is created with the new slot details
And the status of the new appointment is BOOKED
```

```gherkin
Given an appointment with status COMPLETED or CANCELLED
When the user attempts to reschedule
Then an error is displayed indicating rescheduling is not allowed
```

---

## Functional Requirements

### FR-001: Slot Availability Check

Before booking, the system shall verify that the requested slot is available. If unavailable, the user shall be offered the waitlist option.

### FR-002: Multi-Step Booking Wizard

The booking flow shall present a multi-step wizard: (1) Select Doctor → (2) Select Date & Slot → (3) Review & Confirm. Each step shall validate before proceeding.

### FR-003: Appointment Creation

The system shall create an appointment record with status BOOKED, capturing patientId, doctorId, slotDate, slotStart, slotEnd, price, and bookedBy.

### FR-004: Status Transition Validation

The system shall enforce the following valid status transitions:

- BOOKED → ARRIVED
- BOOKED → CANCELLED
- ARRIVED → COMPLETED
- ARRIVED → CANCELLED
- ARRIVED → NO_SHOW
- CANCELLED → (terminal)
- COMPLETED → (terminal)
- NO_SHOW → (terminal)

Any invalid transition shall be rejected with a clear error.

### FR-005: Cancellation with Reason

Cancelling an appointment shall require a reason. The system shall record the reason and change the status to CANCELLED.

### FR-006: Waitlist Management

When a slot is fully booked, patients may join a waitlist. The system shall track waitlist position and prevent duplicates.

### FR-007: Filtered and Paginated List

The appointment list shall support filtering by patientId, doctorId, date, and status. Results shall be paginated with configurable page size.

### FR-008: Daily Queue View

Doctors shall have a dedicated view showing their appointments for the current date, ordered by slotStart, with real-time status updates.

### FR-009: Rescheduling

Rescheduling shall cancel the existing appointment and create a new one atomically. Only BOOKED appointments may be rescheduled.

### FR-010: Authorization Enforcement

Booking and cancellation shall be available to patients (for their own appointments) and receptionists. Status updates shall be restricted to receptionists and doctors. The daily queue shall be restricted to doctors.

---

## Key Entities

### Appointment

| Field | Type | Description |
|---|---|---|
| id | string (UUID) | Unique identifier |
| patientId | string (UUID) | Reference to patient |
| doctorId | string (UUID) | Reference to doctor |
| slotDate | string (ISO date) | Date of the appointment |
| slotStart | string (HH:mm) | Start time of the slot |
| slotEnd | string (HH:mm) | End time of the slot |
| status | AppointmentStatus | Current status |
| price | number | Consultation price |
| bookedBy | string | ID of the user who booked |
| cancelReason | string? | Reason for cancellation |
| createdAt | string (ISO datetime) | Creation timestamp |

### AppointmentStatus

```
BOOKED | ARRIVED | COMPLETED | CANCELLED | NO_SHOW
```

### BookAppointmentRequest

| Field | Type | Description |
|---|---|---|
| patientId | string (UUID) | Patient to book for |
| doctorId | string (UUID) | Doctor to book with |
| slotDate | string (ISO date) | Date of the appointment |
| slotStart | string (HH:mm) | Slot start time |
| slotEnd | string (HH:mm) | Slot end time |

### CancelAppointmentRequest

| Field | Type | Description |
|---|---|---|
| reason | string | Required cancellation reason |

---

## Success Criteria

1. A patient or receptionist can successfully book an appointment through the multi-step wizard.
2. Appointment list loads with filters applied and pagination working correctly.
3. Status transitions follow the defined state machine; invalid transitions are rejected.
4. Cancellation records the reason and frees the slot.
5. Waitlist allows patients to register interest in fully-booked slots.
6. Doctor daily queue displays today's appointments in order with live status.
7. Rescheduling cancels the original and creates a new appointment atomically.
8. Role-based access control prevents unauthorized actions.
9. All API errors display user-friendly messages.
10. Optimistic updates are used for status changes with rollback on failure.

---

## Assumptions

1. The backend API is already available and follows REST conventions.
2. Doctor schedules and available slots are provided by a separate Schedule feature.
3. Patient and Doctor entities exist in the system with their own APIs.
4. Authentication and role information are available via a shared auth context.
5. Prices are determined server-side based on doctor specialty.
6. The frontend uses React with TypeScript, Zustand for client state, and React Query for server state.
7. The project follows Feature-Sliced Design (FSD) architecture.
8. Real-time updates for the daily queue are achieved via polling (WebSocket integration is a future enhancement).
9. Notification for waitlist availability is out of scope for this phase.
10. Timezone handling uses the clinic's local timezone.
