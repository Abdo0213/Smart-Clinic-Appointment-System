# Doctor Feature Specification

## Overview

The Doctor feature manages doctor profiles, their weekly schedules, available appointment slots, and administrative lifecycle within the Smart Clinic Appointment System. Doctors can view and update their profiles, configure weekly availability with breaks, and view generated time slots. Administrators can activate or deactivate doctors, and patients can browse doctors with filters.

## Feature Branch

`003-doctor`

---

## User Stories

### US-001 — View Doctor Profile (P1)

As a doctor, I want to view my profile so that I can verify my personal and professional information.

### US-002 — Update Doctor Profile (P1)

As a doctor, I want to update my profile (bio, phone, specialization) so that my information stays current.

### US-003 — Configure Weekly Schedule (P2)

As a doctor, I want to configure my weekly availability (working hours, slot duration, breaks) so that patients can book appointments during my available times.

### US-004 — View Available Slots (P3)

As a doctor or patient, I want to view available time slots for a given date so that I can see when appointments can be booked.

### US-005 — Admin Activate/Deactivate Doctor (P4)

As an admin, I want to activate or deactivate a doctor so that inactive doctors do not appear in search results or receive bookings.

### US-006 — List Doctors with Filters (P5)

As a patient or admin, I want to list doctors filtered by specialization and active status so that I can find the right doctor quickly.

---

## Acceptance Scenarios

### US-001 — View Doctor Profile

**Scenario 1: Doctor views own profile**

- Given a doctor is logged in
- When they navigate to the doctor profile page
- Then the system displays their first name, last name, specialization, bio, phone, and active status

**Scenario 2: Profile not found**

- Given a doctor ID does not exist
- When the profile page is requested
- Then the system shows a "Profile not found" message

### US-002 — Update Doctor Profile

**Scenario 1: Doctor updates bio and phone**

- Given a doctor is viewing their profile
- When they edit the bio and phone fields and submit
- Then the system saves the changes and shows a success notification

**Scenario 2: Validation failure**

- Given a doctor is editing their profile
- When they submit with an invalid phone format
- Then the system displays a validation error for the phone field

### US-003 — Configure Weekly Schedule

**Scenario 1: Doctor creates a schedule for a date**

- Given a doctor is on the schedule configuration page
- When they select a date, set start time, end time, slot duration, price, and optional breaks, then submit
- Then the system creates the schedule and generates available slots

**Scenario 2: Overlapping schedule**

- Given a doctor already has a schedule for a date
- When they attempt to create another schedule for the same date
- Then the system rejects the request with a conflict error

**Scenario 3: Break outside working hours**

- Given a doctor is creating a schedule from 09:00 to 17:00
- When they add a break from 08:00 to 09:00
- Then the system rejects the break as outside the working window

### US-004 — View Available Slots

**Scenario 1: Slots returned for a date**

- Given a doctor has a schedule on 2026-05-10
- When the user requests slots for that date
- Then the system returns all time slots with their availability status

**Scenario 2: No schedule for date**

- Given a doctor has no schedule on 2026-05-15
- When the user requests slots for that date
- Then the system returns an empty slot list

### US-005 — Admin Activate/Deactivate Doctor

**Scenario 1: Admin deactivates a doctor**

- Given an admin is logged in and viewing the doctor list
- When they click "Deactivate" on an active doctor
- Then the doctor's status changes to inactive and they no longer appear in patient searches

**Scenario 2: Admin reactivates a doctor**

- Given an admin views an inactive doctor
- When they click "Activate"
- Then the doctor's status changes to active

### US-006 — List Doctors with Filters

**Scenario 1: Filter by specialization**

- Given the doctor list page is loaded
- When the user selects "Cardiology" from the specialization filter
- Then only doctors with the Cardiology specialization are displayed

**Scenario 2: Filter by active status**

- Given the doctor list page is loaded
- When the user filters by "Active" status
- Then only active doctors are shown

**Scenario 3: Paginated results**

- Given there are 25 doctors matching the filter
- When the page size is 10
- Then the first page shows 10 doctors with pagination controls showing 3 pages

---

## Functional Requirements

### FR-001 — Doctor Profile Retrieval

The system shall fetch and display a doctor's profile by ID, including firstName, lastName, specialization, bio, phone, and isActive status.

### FR-002 — Doctor Profile Update

The system shall allow a doctor to update their bio, phone, and specialization. First name and last name are read-only (managed via user service). The system shall validate phone format (E.164 or local format) before submission.

### FR-003 — Schedule Configuration

The system shall allow a doctor to create a schedule for a specific date with: startTime, endTime, slotDuration (in minutes), price, and optional breaks. The system shall validate that startTime < endTime, slotDuration > 0, and breaks fall within the working window.

### FR-004 — Slot Generation

The system shall automatically generate time slots from a schedule's working hours minus breaks, splitting the available time into intervals of slotDuration. Each slot shall have a startTime, endTime, and isAvailable flag.

### FR-005 — Slot Availability Query

The system shall return available and booked slots for a given doctor and date. Slots already booked shall have isAvailable = false.

### FR-006 — Doctor Status Toggle

The system shall allow an admin to activate or deactivate a doctor via a status patch endpoint. Deactivated doctors shall be excluded from patient-facing searches by default.

### FR-007 — Doctor List with Filters and Pagination

The system shall return a paginated list of doctors filterable by specialization (exact match), isActive status, or both. Default page size shall be 10. Results shall include total count for pagination controls.

---

## Key Entities

| Entity | Description |
|---|---|
| Doctor | Core doctor profile linked to a user account |
| Schedule | A doctor's working schedule for a specific date |
| SlotAvailability | Generated time slots with availability status for a doctor on a date |
| ScheduleBreak | A break period within a schedule |

---

## Success Criteria

1. Doctors can view and update their profiles without errors.
2. Doctors can configure schedules that correctly generate time slots excluding break periods.
3. Available slots accurately reflect booked vs. free status.
4. Admins can toggle doctor active/inactive status and the filter respects it.
5. The doctor list page supports specialization and status filters with correct pagination.
6. All API error states display user-friendly feedback.
7. Page load time for the doctor list is under 2 seconds with 100 records.

---

## Assumptions

- Doctor authentication and role-based access are handled by a shared auth module (not part of this feature).
- The user service is the source of truth for firstName, lastName, and email; the doctor entity stores a userId reference.
- Specializations are free-text strings; a future feature may introduce a specialization enum or lookup table.
- Slot generation is deterministic: slots are calculated from schedule working hours minus breaks, divided by slotDuration.
- A doctor can have at most one schedule per date.
- Prices are stored as numbers (currency assumed from clinic configuration).
- The system uses a single timezone per clinic; timezone handling is out of scope for this feature.
