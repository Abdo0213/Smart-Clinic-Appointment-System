# Appointment Feature — Requirements Checklist

## Functional Requirements

- [ ] **FR-001**: Slot availability check before booking; offer waitlist if unavailable
- [ ] **FR-002**: Multi-step booking wizard (Doctor → Slot → Confirm) with per-step validation
- [ ] **FR-003**: Appointment creation with status BOOKED capturing all required fields
- [ ] **FR-004**: Status transition validation enforcing the defined state machine
- [ ] **FR-005**: Cancellation requires a reason (min 5 chars); only BOOKED or ARRIVED can be cancelled
- [ ] **FR-006**: Waitlist for fully-booked slots with position tracking and duplicate prevention
- [ ] **FR-007**: Filtered, paginated appointment list (patientId, doctorId, date, status filters)
- [ ] **FR-008**: Doctor daily queue view ordered by slotStart with 30-second polling
- [ ] **FR-009**: Rescheduling cancels original and creates new appointment atomically; only BOOKED allowed
- [ ] **FR-010**: Role-based access control (patient/receptionist/doctor permissions)

## User Story Coverage

- [ ] **P1**: Book Appointment — patient and receptionist paths
- [ ] **P2**: View Appointment List with Filters — all roles
- [ ] **P3**: Update Appointment Status — receptionist and doctor only
- [ ] **P4**: Cancel Appointment — patient (own) and receptionist with reason
- [ ] **P5**: Join Waitlist — patient for fully-booked slots
- [ ] **P6**: View Daily Queue — doctor only, today's appointments
- [ ] **P7**: Reschedule Appointment — patient (own) and receptionist, BOOKED only

## UI Requirements

- [ ] Multi-step wizard with step indicator and back/next navigation
- [ ] Appointment status badge color-coded per status
- [ ] Filter controls synced with URL search params
- [ ] Pagination controls with page size selector
- [ ] Confirmation dialog for destructive actions (cancel, reschedule)
- [ ] Cancel dialog with required reason textarea
- [ ] Loading skeletons for list and card components
- [ ] Empty states for pages with no data
- [ ] Toast notifications for mutation success/error
- [ ] Responsive layout for mobile and desktop

## Data & State

- [ ] Zustand store for booking wizard state (step, doctor, slot, patient)
- [ ] React Query for all server state (appointments, queue, waitlist)
- [ ] Optimistic updates for status changes with rollback on error
- [ ] URL search params for filter state persistence
- [ ] Store reset on booking success or wizard exit

## API Integration

- [ ] GET /appointments with filters and pagination
- [ ] POST /appointments for booking
- [ ] GET /appointments/{id} for detail view
- [ ] PATCH /appointments/{id}/status for status updates
- [ ] DELETE /appointments/{id} for cancellation
- [ ] POST /appointments/{id}/waitlist for waitlist join
- [ ] Error handling for 400, 401, 403, 404, 409 responses
- [ ] Conflict (409) triggers waitlist offer for booking

## Authorization

- [ ] Patient: book own appointment, cancel own, reschedule own, view own list, join waitlist
- [ ] Receptionist: book for any patient, cancel any, reschedule any, view all, update status
- [ ] Doctor: view own daily queue, update status (ARRIVED → COMPLETED/NO_SHOW)
- [ ] Route guards redirect unauthorized users

## Non-Functional

- [ ] TypeScript strict mode — no `any` types
- [ ] FSD import rules enforced (no cross-layer violations)
- [ ] All components accessible (ARIA labels, keyboard navigation)
- [ ] No secrets or API keys in client code
- [ ] Error boundaries per page
