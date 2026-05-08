# SpecKit: Patient Profile Management

## Feature Name
Patient — Profile CRUD, Demographics, Medical Info

## Description
Patient profile management including demographics, blood type, known allergies, emergency contacts, and insurance information. Field-level access control: doctors see full profile, patients see their own only.

## User Stories

- **US-PAT-01**: As a patient, I can create my profile with demographics and medical info after registration.
- **US-PAT-02**: As a patient, I can view and update my own profile details.
- **US-PAT-03**: As a doctor, I can view a patient's full profile during a visit.
- **US-PAT-04**: As a receptionist, I can register a walk-in patient and create their profile.
- **US-PAT-05**: As an admin, I can view and search all patient profiles.
- **US-PAT-06**: As a receptionist, I can search patients by name or phone.

## UI States

| State | Description |
|---|---|
| **Loading** | Skeleton on profile page; spinner on form submit |
| **Empty** | "No patients found" on search/list; "Profile not created" prompt for new patients |
| **Error** | Inline validation errors; toast for server errors |
| **Success** | Profile saved toast; updated profile display |

## Components (Atomic Breakdown)

| Component | Type | Description |
|---|---|---|
| `PatientProfileForm` | Organism | Full profile form (demographics, medical, insurance, emergency) |
| `PatientProfileCard` | Organism | Read-only profile display with edit button |
| `PatientListTable` | Organism | DataTable (DiceUI) with search, pagination, filters |
| `PatientSearchBar` | Molecule | Search input with name/phone filter |
| `EmergencyContactSection` | Molecule | Emergency contact fields group |
| `InsuranceSection` | Molecule | Insurance provider and number fields |
| `MedicalInfoSection` | Molecule | Blood type, allergies display |

## Data Models

```typescript
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;        // "YYYY-MM-DD"
  gender: "MALE" | "FEMALE" | "OTHER";
  phone: string;
  address: string;
  bloodType: string;          // "A+", "O-", etc.
  knownAllergies: string;
  emergencyContact: string;
  emergencyPhone: string;
  insuranceProvider: string;
  insuranceNumber: string;
  createdAt: string;
}

interface PatientListResponse {
  content: Patient[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  bloodType: string;
  knownAllergies: string;
  emergencyContact: string;
  emergencyPhone: string;
  insuranceProvider: string;
  insuranceNumber: string;
}
```

## API Integration

| Action | Method | Endpoint | Auth | Request | Response |
|---|---|---|---|---|---|
| Create Patient | POST | `/patients` | Patient, Receptionist, Admin | `CreatePatientRequest` | `Patient` |
| Get Patient by ID | GET | `/patients/{id}` | Patient (own), Doctor, Receptionist, Admin | — | `Patient` |
| List Patients | GET | `/patients` | Doctor, Receptionist, Admin | `?name=&phone=&page=&size=` | `PatientListResponse` |
| Update Patient | PUT | `/patients/{id}` | Patient (own), Receptionist, Admin | `Partial<Patient>` | `Patient` |

## State Management

- **React Query**: `useGetPatient(id)`, `useGetPatients(filters)`, `useCreatePatient()`, `useUpdatePatient()`
- **Zustand**: No dedicated store needed — React Query handles caching and server state
- **URL state**: Search filters and pagination stored in URL search params via `nuqs` or manual

## Validation Rules (Zod)

```typescript
const patientSchema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(5, "Address required"),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  knownAllergies: z.string().default("None known"),
  emergencyContact: z.string().min(2, "Emergency contact name required"),
  emergencyPhone: z.string().min(10, "Emergency phone required"),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
});
```

## Edge Cases

1. **New patient after registration**: After `POST /auth/register`, patient has no profile yet — show "Create your profile" prompt.
2. **Self-only access**: Patient can only access `GET /patients/{ownId}` — enforce client-side and trust backend 403.
3. **Walk-in registration**: Receptionist creates both auth user + patient profile — two API calls needed.
4. **Partial profile**: Patient may not have filled insurance/emergency info — handle gracefully with optional fields.
5. **Search with no results**: Show empty state with suggestion to register new patient.

## FSD Placement

```
src/
  entities/
    patient/
      model/
        types.ts
        patientQueries.ts    # React Query hooks
      api/
        patientApi.ts
      ui/
        PatientCard.tsx
        PatientSearchBar.tsx
      index.ts
  pages/
    patient-profile/
      ui/
        PatientProfilePage.tsx
        PatientProfileForm.tsx
        PatientProfileCard.tsx
      model/
        schemas.ts
      api/
        profileApi.ts
      index.ts
    patient-list/
      ui/
        PatientListPage.tsx
        PatientListTable.tsx
      index.ts
```
