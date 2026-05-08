# Visit Feature — Requirements Checklist

## Functional Requirements

- [x] FR-1: Doctors can create a visit record from an active appointment
- [x] FR-2: Visit form supports structured fields (chief complaint, examination findings, assessment, plan, ICD-10)
- [ ] FR-3: ICD-10 code input provides search/autocomplete from a reference list (P3 — using comma-separated input)
- [x] FR-4: Doctors can add one or more prescriptions to a draft visit
- [x] FR-5: Each prescription includes medication name, dosage, frequency, duration, and notes
- [x] FR-6: Doctors can sign a visit to finalize it, making it immutable
- [x] FR-7: Signing a visit optionally allows adding additional billing line items
- [x] FR-8: Signed visits cannot be edited or have prescriptions added
- [x] FR-9: Doctors can schedule follow-up appointments from a visit
- [x] FR-10: Visit history is viewable by doctors (all visits) and patients (own visits only)
- [x] FR-11: Visit list supports pagination and filtering by doctorId or patientId
- [x] FR-12: Prescription PDFs are served via pre-signed S3 URLs
- [x] FR-13: Visit form validates required fields before submission and before signing

## User Story Coverage

- [x] US1 (P1): Create Visit Record — doctor creates visit from appointment
- [x] US2 (P2): Issue Prescription — doctor adds prescription to draft visit
- [x] US3 (P3): Sign/Finalize Visit — doctor signs visit with optional billing items
- [x] US4 (P4): Schedule Follow-up — doctor creates follow-up from visit
- [x] US5 (P5): View Visit History — doctor/patient views paginated history
- [x] US6 (P6): Download Prescription PDF — patient downloads via pre-signed URL

## Data Model

- [x] Visit type defined with all required fields
- [x] Prescription type defined with medication details
- [x] SignVisitRequest type defined with optional billing items
- [x] BillingLineItem type defined with computed totalPrice
- [x] CreateVisitRequest type defined for visit creation payload

## API Integration

- [x] GET /visits with pagination and filters
- [x] POST /visits for visit creation
- [x] GET /visits/:id for visit detail
- [x] POST /visits/:id/sign for visit finalization
- [x] POST /visits/:id/prescriptions for prescription addition
- [x] POST /visits/:id/follow-up for follow-up scheduling
- [x] GET /visits/:id/prescriptions/pdf for PDF download URL

## UI Components

- [x] VisitForm with structured medical fields
- [ ] Icd10CodeInput with search/autocomplete (P3 — using simple comma-separated input)
- [x] PrescriptionForm for adding medications
- [x] SignVisitDialog with billing items
- [x] FollowUpScheduler for scheduling
- [x] VisitHistoryTable with pagination
- [x] VisitCard for list items
- [x] VisitStatusBadge for draft/signed state
- [x] PrescriptionCard for prescription display

## Validation

- [x] Chief complaint is required
- [x] Assessment is required
- [x] Plan is required
- [x] Cannot sign visit with missing required fields
- [x] Cannot add prescriptions to signed visits
- [ ] Cannot create duplicate visit for same appointment (backend guard)
- [x] Follow-up date must be in the future
- [x] Prescription medication name and dosage are required
- [x] Billing item description, quantity, and unit price are required

## Access Control

- [x] Only doctors can create visits (route guard via /doctor/ paths)
- [x] Patients can only view their own visits (patientId filter)
- [x] Doctors can view all visits (filterable by doctorId)
- [x] PDF download available to the patient of the visit
- [ ] Only the assigned doctor can sign a visit (backend guard)

## Error Handling

- [x] Network errors display user-friendly messages
- [ ] 409 Conflict handled for duplicate visit creation (P3)
- [ ] 403 Forbidden handled for operations on signed visits (P3)
- [ ] 404 Not Found handled for missing visits (P3)
- [ ] 422 Unprocessable Entity handled for sign validation failures (P3)
- [x] Toast notifications for mutation success and failure

## Performance

- [x] Visit history loads with pagination support
- [ ] ICD-10 search returns results within 300ms (P3 — no autocomplete yet)
- [x] PDF download URL fetched on-demand
- [x] Optimistic updates for prescription addition
