# SpecKit: Visit & Clinical Records

## Feature Name
Visit — Structured Visit Form, Prescriptions, PDF Generation, Sign/Finalize

## Description
Clinical visit management: creating structured visit records (chief complaint, examination findings, assessment, plan), issuing prescriptions with medication details, signing/finalizing visits (locking the record), scheduling follow-ups, and accessing prescription PDFs via pre-signed S3 URLs.

## User Stories

- **US-VIS-01**: As a doctor, I can create a visit record for an appointment with structured fields.
- **US-VIS-02**: As a doctor, I can issue a prescription during a visit (medication, dosage, frequency, duration, notes).
- **US-VIS-03**: As a doctor, I can sign/finalize a visit to lock the record (includes additional line items for billing).
- **US-VIS-04**: As a doctor, I can schedule a follow-up appointment from within a visit.
- **US-VIS-05**: As a doctor/admin, I can view visit records.
- **US-VIS-06**: As a patient, I can download my prescription PDF.
- **US-VIS-07**: As a doctor, I can view my visit history.

## UI States

| State | Description |
|---|---|
| **Loading** | Spinner on visit creation; PDF download in progress |
| **Empty** | "No visits recorded"; "No prescriptions" |
| **Error** | Validation errors on visit form; PDF generation failure toast |
| **Success** | Visit created; prescription issued; visit signed (locked indicator); PDF ready for download |

## Components (Atomic Breakdown)

| Component | Type | Description |
|---|---|---|
| `VisitForm` | Organism | Structured visit form: complaint, findings, assessment, plan, ICD-10 codes |
| `VisitDetail` | Organism | Read-only visit record display |
| `PrescriptionForm` | Organism | Medicication, dosage, frequency, duration, notes form |
| `PrescriptionCard` | Molecule | Display a single prescription |
| `SignVisitDialog` | Molecule | Confirmation dialog with additional billing items |
| `LineItemForm` | Molecule | Dynamic add/remove for billing line items during signing |
| `FollowUpScheduler` | Molecule | Date/time picker for follow-up appointment |
| `VisitListTable` | Organism | DataTable (DiceUI) of visits |
| `PdfDownloadButton` | Atom | Button to download prescription PDF via pre-signed URL |
| `VisitStatusBadge` | Atom | Signed/Unsigned status indicator |
| `Icd10CodeInput` | Molecule | Input with ICD-10 code lookup/autocomplete |

## Data Models

```typescript
interface Visit {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  chiefComplaint: string;
  examinationFindings: string;
  assessment: string;
  plan: string;
  icd10Codes: string;
  isSigned: boolean;
  signedAt: string | null;
}

interface CreateVisitRequest {
  appointmentId: string;
  chiefComplaint: string;
  examinationFindings: string;
  assessment: string;
  plan: string;
  icd10Codes: string;
}

interface Prescription {
  medicationName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  notes: string;
}

interface SignVisitRequest {
  additionalItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface FollowUpRequest {
  // Needs to match appointment booking request shape
  patientId: string;
  doctorId: string;
  slotDate: string;
  slotStart: string;
  slotEnd: string;
}

interface BillingLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
```

## API Integration

| Action | Method | Endpoint | Auth | Request | Response |
|---|---|---|---|---|---|
| List Visits | GET | `/visits` | Doctor, Admin | `?doctorId=&patientId=&page=&size=` | Paginated `Visit[]` |
| Create Visit | POST | `/visits` | Doctor, Admin | `CreateVisitRequest` | `Visit` |
| Get Visit by ID | GET | `/visits/{id}` | Doctor, Admin | — | `Visit` |
| Sign Visit | POST | `/visits/{id}/sign` | Doctor | `SignVisitRequest` | `Visit` |
| Issue Prescription | POST | `/visits/{id}/prescriptions` | Doctor | `Prescription` | `Prescription` |
| Schedule Follow-up | POST | `/visits/{id}/follow-up` | Doctor | `FollowUpRequest` | `Appointment` |

## State Management

- **React Query**: `useGetVisits(filters)`, `useGetVisit(id)`, `useCreateVisit()`, `useSignVisit()`, `useIssuePrescription()`, `useScheduleFollowUp()`
- **Zustand**: `useVisitFormStore` — multi-step form state (visit fields, prescriptions, billing items) during visit creation
- **Form state**: React Hook Form manages the visit form and prescription sub-forms

## Validation Rules (Zod)

```typescript
const createVisitSchema = z.object({
  appointmentId: z.string().uuid("Invalid appointment ID"),
  chiefComplaint: z.string().min(3, "Chief complaint required"),
  examinationFindings: z.string().min(3, "Examination findings required"),
  assessment: z.string().min(3, "Assessment required"),
  plan: z.string().min(3, "Plan required"),
  icd10Codes: z.string().optional(),
});

const prescriptionSchema = z.object({
  medicationName: z.string().min(2, "Medication name required"),
  dosage: z.string().min(1, "Dosage required"),
  frequency: z.string().min(1, "Frequency required"),
  durationDays: z.number().min(1, "At least 1 day").max(365, "Maximum 365 days"),
  notes: z.string().optional(),
});

const signVisitSchema = z.object({
  additionalItems: z.array(z.object({
    description: z.string().min(1, "Description required"),
    quantity: z.number().min(1, "At least 1"),
    unitPrice: z.number().min(0, "Price must be non-negative"),
  })).optional(),
});
```

## Edge Cases

1. **Signed visit is immutable**: Once signed, the visit form should be read-only. Attempting to edit shows "Visit is locked" message.
2. **Multiple prescriptions**: A visit can have multiple prescriptions — `POST /visits/{id}/prescriptions` can be called multiple times.
3. **Sign visit triggers billing**: Signing a visit auto-generates a billing invoice. The `additionalItems` in the sign request are added to the invoice.
4. **PDF not immediately available**: After signing, PDF generation is async — may need polling or wait for notification before download is available.
5. **Follow-up slot availability**: The follow-up scheduler must check slot availability before creating the appointment.
6. **ICD-10 code format**: Free text currently — no validation beyond format. Consider autocomplete from ICD-10 list.
7. **Visit without appointment**: Current API requires `appointmentId` — no standalone visit creation.
8. **Prescription download URL**: No API endpoint returns the pre-signed S3 URL directly. Need to know how frontend gets the PDF URL (see missing endpoints).

## FSD Placement

```
src/
  features/
    visit-form/
      ui/
        VisitForm.tsx
        PrescriptionForm.tsx
        SignVisitDialog.tsx
        LineItemForm.tsx
        FollowUpScheduler.tsx
      model/
        visitFormStore.ts    # Zustand: multi-step form state
        schemas.ts
        types.ts
      api/
        createVisit.ts
        signVisit.ts
        issuePrescription.ts
        scheduleFollowUp.ts
      index.ts
  entities/
    visit/
      model/
        types.ts
        visitQueries.ts
      api/
        visitApi.ts
      ui/
        VisitDetail.tsx
        PrescriptionCard.tsx
        VisitStatusBadge.tsx
        PdfDownloadButton.tsx
      index.ts
  pages/
    visit/
      ui/
        VisitPage.tsx           # Doctor's visit workspace
        VisitDetailPage.tsx     # View-only visit record
        VisitListPage.tsx       # Visit history
        VisitListTable.tsx
      index.ts
```
