# Visit Feature Specification

## Feature Branch

`005-visit`

## Overview

The Visit feature enables doctors to create, manage, and finalize clinical visit records for patients. It covers the full clinical documentation lifecycle: recording examination findings, issuing prescriptions, signing/finalizing visits, scheduling follow-ups, viewing visit history, and downloading prescription PDFs.

## User Stories

### P1: Create Visit Record (Doctor)

As a doctor, I want to create a visit record for an appointment so that clinical findings and assessments are documented.

### P2: Issue Prescription

As a doctor, I want to issue prescriptions during a visit so that patients receive medication orders.

### P3: Sign/Finalize Visit

As a doctor, I want to sign and finalize a visit record so that it becomes locked and billable.

### P4: Schedule Follow-up

As a doctor, I want to schedule a follow-up appointment from within a visit so that continuity of care is maintained.

### P5: View Visit History

As a doctor or patient, I want to view visit history so that past clinical records are accessible.

### P6: Download Prescription PDF

As a patient, I want to download a prescription as a PDF so that I can present it at a pharmacy.

## Acceptance Scenarios

### US1: Create Visit Record

- **Given** a doctor has an active appointment
- **When** they fill in chief complaint, examination findings, assessment, plan, and ICD-10 codes
- **And** they submit the visit form
- **Then** a visit record is created with status "draft" and linked to the appointment

- **Given** a visit already exists for the appointment
- **When** the doctor attempts to create another visit
- **Then** the system prevents duplicate creation and shows an error

### US2: Issue Prescription

- **Given** a draft visit exists
- **When** the doctor adds a prescription with medication name, dosage, frequency, duration, and notes
- **Then** the prescription is saved and linked to the visit

- **Given** a visit is already signed
- **When** the doctor attempts to add a prescription
- **Then** the system rejects the operation with a "visit locked" error

### US3: Sign/Finalize Visit

- **Given** a draft visit with at least chief complaint and assessment filled
- **When** the doctor signs the visit, optionally adding additional billing line items
- **Then** the visit status changes to "signed", the signedAt timestamp is set, and the visit becomes immutable

- **Given** a draft visit missing required fields
- **When** the doctor attempts to sign
- **Then** validation errors are displayed for missing fields

### US4: Schedule Follow-up

- **Given** a signed visit
- **When** the doctor schedules a follow-up with date, time, and reason
- **Then** a new appointment is created linked to the patient and doctor

- **Given** a draft visit
- **When** the doctor attempts to schedule a follow-up
- **Then** the system allows it with a warning that the visit is not yet finalized

### US5: View Visit History

- **Given** a doctor views a patient's visit history
- **When** they request the list filtered by patientId
- **Then** paginated visit records are displayed in reverse chronological order

- **Given** a patient views their own visit history
- **When** they request the list filtered by their patientId
- **Then** only their visits are returned, excluding draft visits from other doctors

### US6: Download Prescription PDF

- **Given** a visit with prescriptions
- **When** the patient requests a PDF download
- **Then** a pre-signed S3 URL is returned for downloading the prescription PDF

- **Given** a visit with no prescriptions
- **When** the patient attempts to download
- **Then** a "no prescriptions available" message is shown

## Functional Requirements

| ID   | Requirement                                                                                           |
|------|-------------------------------------------------------------------------------------------------------|
| FR-1 | Doctors can create a visit record from an active appointment                                          |
| FR-2 | Visit form supports structured fields: chief complaint, examination findings, assessment, plan, ICD-10 |
| FR-3 | ICD-10 code input provides search/autocomplete from a reference list                                  |
| FR-4 | Doctors can add one or more prescriptions to a draft visit                                            |
| FR-5 | Each prescription includes medication name, dosage, frequency, duration, and notes                    |
| FR-6 | Doctors can sign a visit to finalize it, making it immutable                                          |
| FR-7 | Signing a visit optionally allows adding additional billing line items                                |
| FR-8 | Signed visits cannot be edited or have prescriptions added                                            |
| FR-9 | Doctors can schedule follow-up appointments from a visit                                              |
| FR-10| Visit history is viewable by doctors (all visits) and patients (own visits only)                      |
| FR-11| Visit list supports pagination and filtering by doctorId or patientId                                 |
| FR-12| Prescription PDFs are generated server-side and served via pre-signed S3 URLs                         |
| FR-13| Visit form validates required fields before submission and before signing                             |

## Key Entities

### Visit

The core clinical record linking an appointment to documented findings.

### Prescription

A medication order issued within the context of a visit.

### SignVisitRequest

The payload for finalizing a visit, including optional additional billing items.

### BillingLineItem

A chargeable item added during visit signing (e.g., procedures, supplies).

## Success Criteria

1. Doctors can complete the full visit workflow (create → prescribe → sign → follow-up) without errors
2. Signed visits are immutable — no further edits or additions are permitted
3. Visit history loads within 2 seconds for paginated results
4. Prescription PDF download completes within 5 seconds via pre-signed URL
5. ICD-10 code search returns results within 300ms for partial matches
6. Form validation prevents submission of incomplete visit records

## Assumptions

- ICD-10 code data is provided via an external reference API or bundled dataset
- Prescription PDF generation is handled by the backend; the frontend only receives a download URL
- Pre-signed S3 URLs have a configurable TTL (default 15 minutes)
- Only doctors with an active appointment can create visits for that appointment
- Billing line items added during signing are forwarded to the billing module
- Follow-up appointments created from visits inherit the same doctor and patient
- Visit records are retained indefinitely for medical-legal compliance
- The appointment must exist and be in "in-progress" status before a visit can be created
