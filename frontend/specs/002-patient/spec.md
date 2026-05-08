# Patient Feature Specification

## Feature Branch

`002-patient`

## Overview

The Patient feature provides full lifecycle management of patient profiles within the Smart Clinic Appointment System. It enables patients to create and manage their own profiles, allows administrative staff to search and list patients, and gives doctors a read-only clinical view of patient data.

## User Stories

### P1: Create Patient Profile

**As a** new patient,
**I want to** create my profile with personal and medical information,
**So that** the clinic has my details for appointments and medical records.

### P2: View/Edit Own Profile

**As a** registered patient,
**I want to** view and edit my own profile,
**So that** I can keep my contact and medical information up to date.

### P3: Search/List Patients (Admin/Receptionist)

**As an** admin or receptionist,
**I want to** search and browse a paginated list of patients,
**So that** I can quickly find and manage patient records.

### P4: View Patient as Doctor

**As a** doctor,
**I want to** view a patient's full profile including medical details,
**So that** I have the necessary context before or during a consultation.

## Acceptance Scenarios

### P1: Create Patient Profile

```gherkin
Scenario: Successful patient profile creation
  Given the user is on the patient registration page
  And the user fills in all required fields (firstName, lastName, dateOfBirth, gender, phone)
  When the user submits the registration form
  Then the system creates a new patient profile
  And the user is redirected to their profile page
  And a success notification is displayed

Scenario: Validation error on patient creation
  Given the user is on the patient registration page
  And the user leaves a required field empty
  When the user submits the registration form
  Then the system displays inline validation errors for the missing fields
  And no API request is sent

Scenario: Server error on patient creation
  Given the user is on the patient registration page
  And the user fills in all required fields
  When the user submits the registration form
  And the server returns an error
  Then an error notification is displayed
  And the form retains the entered values
```

### P2: View/Edit Own Profile

```gherkin
Scenario: Patient views their profile
  Given the patient is logged in
  When the patient navigates to their profile page
  Then the system displays all their profile information in read-only mode
  And an "Edit" button is visible

Scenario: Patient edits their profile
  Given the patient is viewing their profile
  When the patient clicks the "Edit" button
  Then the profile fields become editable
  And a "Save" and "Cancel" button appear

Scenario: Patient saves edited profile
  Given the patient has edited their profile fields
  When the patient clicks "Save"
  Then the system sends the updated data to the server
  And a success notification is displayed
  And the profile returns to read-only mode

Scenario: Patient cancels editing
  Given the patient has edited their profile fields
  When the patient clicks "Cancel"
  Then all changes are discarded
  And the profile returns to read-only mode with original values

Scenario: Validation error on profile edit
  Given the patient is editing their profile
  And the patient clears a required field
  When the patient clicks "Save"
  Then inline validation errors are displayed
  And no API request is sent
```

### P3: Search/List Patients (Admin/Receptionist)

```gherkin
Scenario: Admin views patient list
  Given the admin is logged in
  When the admin navigates to the patient list page
  Then the system displays a paginated table of patients
  And each row shows firstName, lastName, phone, dateOfBirth, and gender

Scenario: Admin searches patients by name
  Given the admin is on the patient list page
  When the admin types a name into the search field
  Then the table filters to show only patients whose firstName or lastName matches the query

Scenario: Admin searches patients by phone
  Given the admin is on the patient list page
  When the admin types a phone number into the search field
  Then the table filters to show only patients whose phone matches the query

Scenario: Admin paginates through patients
  Given the admin is on the patient list page
  And there are more patients than the page size
  When the admin clicks the next page button
  Then the table displays the next page of patients
  And the pagination controls reflect the current page

Scenario: Admin clicks a patient row
  Given the admin is on the patient list page
  When the admin clicks on a patient row
  Then the system navigates to that patient's profile page
```

### P4: View Patient as Doctor

```gherkin
Scenario: Doctor views a patient's profile
  Given the doctor is logged in
  And a patient exists with a known ID
  When the doctor navigates to the patient's profile page
  Then the system displays the patient's full profile
  And medical fields (bloodType, knownAllergies) are prominently displayed
  And no "Edit" button is shown

Scenario: Doctor views patient from appointment context
  Given the doctor is viewing an appointment
  When the doctor clicks the patient's name
  Then the system navigates to the patient's profile page
  And the full medical profile is displayed in read-only mode
```

## Functional Requirements

### FR-001: Patient Profile Creation

The system shall provide a form allowing new patients to register with the following required fields: firstName, lastName, dateOfBirth, gender, phone. Optional fields: address, bloodType, knownAllergies, emergencyContact, emergencyPhone, insuranceProvider, insuranceNumber.

### FR-002: Profile Viewing

The system shall display a patient's complete profile, including all personal and medical fields. The display mode shall be read-only by default.

### FR-003: Profile Editing

The system shall allow a patient to edit their own profile. The form shall validate all required fields before submission. The system shall provide a cancel mechanism that discards unsaved changes.

### FR-004: Patient Search and Listing

The system shall provide a paginated, searchable list of patients accessible to admin and receptionist roles. Search shall support filtering by name and phone number. The list shall display key patient fields in a tabular format with pagination controls.

### FR-005: Role-Based Field Visibility

The system shall enforce role-based field visibility. Patients see and edit only their own profile. Doctors see all fields in read-only mode. Admins and receptionists see all fields and can navigate from the list to a profile view.

### FR-006: Data Validation

The system shall validate patient data on both client and server side. Required fields must not be empty. dateOfBirth must be a valid past date. phone must match a valid phone format. bloodType must be one of the predefined values (A+, A-, B+, B-, AB+, AB-, O+, O-). gender must be one of: male, female, other.

## Key Entities

### Patient

| Field | Type | Required | Description |
|---|---|---|---|
| id | string (UUID) | Auto | Unique identifier |
| firstName | string | Yes | Patient's first name |
| lastName | string | Yes | Patient's last name |
| dateOfBirth | string (ISO date) | Yes | Date of birth |
| gender | enum | Yes | male, female, other |
| phone | string | Yes | Contact phone number |
| address | string | No | Residential address |
| bloodType | enum | No | A+, A-, B+, B-, AB+, AB-, O+, O- |
| knownAllergies | string | No | Known medical allergies |
| emergencyContact | string | No | Emergency contact name |
| emergencyPhone | string | No | Emergency contact phone |
| insuranceProvider | string | No | Insurance company name |
| insuranceNumber | string | No | Insurance policy number |
| createdAt | string (ISO datetime) | Auto | Record creation timestamp |

## Success Criteria

1. A patient can successfully create a profile and is redirected to their profile page within 2 seconds of submission.
2. A patient can view and edit their profile with all changes persisted on the server after a successful save.
3. An admin can search for a patient by name or phone and receive filtered results within 2 seconds.
4. The patient list supports pagination with page sizes of 10, 20, and 50 records.
5. A doctor can view a patient's full profile including medical fields in read-only mode.
6. All forms display inline validation errors within 100ms of field blur.
7. All API errors are surfaced to the user via toast notifications.
8. No role can access edit functionality outside their permission scope.

## Assumptions

- Authentication and role management are handled by a separate feature; this feature receives the current user's role and ID from the auth context.
- The API base URL is `http://localhost:8080/api`.
- Patient IDs are UUIDs generated server-side.
- Insurance and emergency contact fields are free-text; no external validation against insurance databases is required.
- The dateOfBirth field uses the ISO 8601 date format (YYYY-MM-DD).
- Only one profile per patient is supported; no family or dependent profiles.
- Soft-delete of patient records is not in scope for this feature.
- Image/avatar upload for patient profiles is not in scope for this feature.
