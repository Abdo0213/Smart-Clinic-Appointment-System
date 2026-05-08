# Patient Feature — Requirements Checklist

## Functional Requirements

- [ ] FR-001: Patient profile creation form with required fields (firstName, lastName, dateOfBirth, gender, phone) and optional fields (address, bloodType, knownAllergies, emergencyContact, emergencyPhone, insuranceProvider, insuranceNumber)
- [ ] FR-002: Read-only display of complete patient profile including all personal and medical fields
- [ ] FR-003: Profile editing with required field validation and cancel-to-discard mechanism
- [ ] FR-004: Paginated, searchable patient list accessible to admin and receptionist roles with name and phone filters
- [ ] FR-005: Role-based field visibility (patient edits own, doctor views any read-only, admin/receptionist can list and view)
- [ ] FR-006: Client-side and server-side data validation (required fields, dateOfBirth in past, phone format, bloodType enum, gender enum)

## User Stories

- [ ] P1: Create Patient Profile
- [ ] P2: View/Edit Own Profile
- [ ] P3: Search/List Patients (admin/receptionist)
- [ ] P4: View Patient as Doctor

## Acceptance Criteria

### P1: Create Patient Profile

- [ ] Successful creation redirects to profile page with success toast
- [ ] Validation errors shown inline on required field blur
- [ ] Server errors display toast and retain form values

### P2: View/Edit Own Profile

- [ ] Profile displays in read-only mode by default
- [ ] Edit button toggles editable mode with Save and Cancel buttons
- [ ] Save persists changes and returns to read-only with success toast
- [ ] Cancel discards changes and reverts to original values
- [ ] Validation errors shown inline on required field blur during edit

### P3: Search/List Patients

- [ ] Paginated table displays firstName, lastName, phone, dateOfBirth, gender
- [ ] Name search filters by firstName or lastName (partial, case-insensitive)
- [ ] Phone search filters by phone (partial match)
- [ ] Pagination controls reflect current page and total pages
- [ ] Clicking a row navigates to patient profile
- [ ] Access restricted to admin and receptionist roles

### P4: Doctor View Patient

- [ ] Full profile displayed in read-only mode for doctor role
- [ ] Medical fields (bloodType, knownAllergies) prominently displayed
- [ ] Edit button hidden for doctor viewing another patient

## Non-Functional

- [ ] Patient list search returns results within 2 seconds
- [ ] Pagination supports page sizes of 10, 20, and 50
- [ ] Inline validation errors appear within 100ms of field blur
- [ ] API errors surfaced via toast notifications
- [ ] Loading states (skeletons) on profile and list pages
- [ ] Empty state when no patients match search criteria
- [ ] Responsive layout for all patient pages

## Security

- [ ] No role can access edit functionality outside their permission scope
- [ ] Doctor cannot edit another patient's profile
- [ ] Patient cannot access the patient list page
- [ ] API 403 responses handled with permission denied message
