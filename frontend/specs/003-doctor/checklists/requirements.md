# Doctor Feature — Requirements Checklist

## FR-001 — Doctor Profile Retrieval

- [ ] Doctor profile data fetched and displayed by ID
- [ ] All fields shown: firstName, lastName, specialization, bio, phone, isActive, createdAt
- [ ] 404 state renders "Profile not found" message
- [ ] Loading state displayed while fetching

## FR-002 — Doctor Profile Update

- [ ] Editable fields: specialization, bio, phone
- [ ] Read-only fields: firstName, lastName, createdAt
- [ ] Phone validation enforces E.164 or local format
- [ ] Success notification displayed after update
- [ ] Validation errors rendered inline per field
- [ ] Optimistic update with rollback on error

## FR-003 — Schedule Configuration

- [ ] Schedule form accepts date, startTime, endTime, slotDuration, price, breaks
- [ ] Validation: startTime < endTime
- [ ] Validation: slotDuration > 0 and <= 120
- [ ] Validation: breaks fall within working hours
- [ ] Validation: breakStart < breakEnd
- [ ] Validation: date is today or in the future
- [ ] 409 conflict error handled for duplicate date schedule
- [ ] Success notification on schedule creation
- [ ] Dynamic add/remove break fields

## FR-004 — Slot Generation

- [ ] Slots generated from working hours minus breaks
- [ ] Each slot has startTime, endTime, isAvailable
- [ ] Slot intervals match configured slotDuration
- [ ] No slots generated during break periods

## FR-005 — Slot Availability Query

- [ ] Slots returned for a given doctor and date
- [ ] Booked slots have isAvailable = false
- [ ] Empty slot list returned when no schedule exists for date
- [ ] Slot query cached with 30-second stale time

## FR-006 — Doctor Status Toggle

- [ ] Admin-only toggle to activate/deactivate doctor
- [ ] Status change reflected immediately in UI (optimistic)
- [ ] Rollback on API error
- [ ] Deactivated doctors excluded from patient-facing list by default

## FR-007 — Doctor List with Filters and Pagination

- [ ] List displays doctor cards with key info
- [ ] Specialization filter (dropdown, populated from data)
- [ ] Active status filter (toggle or dropdown)
- [ ] Pagination with page/size controls
- [ ] Total page count displayed
- [ ] Filters preserved on page change
- [ ] `keepPreviousData` prevents flash during pagination
- [ ] Empty state shown when no doctors match filters
- [ ] Loading skeleton shown during fetch

## Cross-Cutting

- [ ] Role-based route guards on /doctors/:id and /doctors/:id/schedule
- [ ] All API errors show toast notifications
- [ ] Network failures retry up to 3 times (TanStack Query default)
- [ ] No secrets or API keys committed to source
