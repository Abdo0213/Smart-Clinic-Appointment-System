# Patient Feature — Technical Plan

## Feature Branch

`002-patient`

## Technology Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Components | Shadcn UI |
| Data Table | DiceUI DataTable |
| Form Management | React Hook Form |
| Validation | Zod |
| Data Fetching | React Query (TanStack Query v5) |
| Styling | Tailwind CSS |
| API Base URL | `http://localhost:8080/api` |

## FSD Directory Structure

```
src/
├── entities/
│   └── patient/
│       ├── model/
│       │   ├── types.ts            # Patient, CreatePatientRequest, PatientListResponse
│       │   ├── schemas.ts          # Zod schemas for patient forms
│       │   ├── constants.ts        # Gender options, blood type options, page sizes
│       │   └── hooks.ts            # usePatient, usePatientList, useCreatePatient, useUpdatePatient
│       ├── api/
│       │   └── patient-api.ts      # API functions: create, getOne, getList, update
│       └── ui/
│           ├── patient-form.tsx     # Shared create/edit form component
│           ├── patient-card.tsx     # Read-only profile card
│           ├── patient-fields.tsx   # Field rendering with role-based visibility
│           └── patient-columns.tsx  # DataTable column definitions
├── pages/
│   ├── patient-profile/
│   │   └── page.tsx                # View/Edit patient profile (patient & doctor)
│   └── patient-list/
│       └── page.tsx                # Searchable paginated patient list (admin/receptionist)
├── shared/
│   └── lib/
│       ├── api-client.ts           # Axios/fetch wrapper with base URL
│       └── auth-context.tsx        # Provides role & userId
```

## Data Flow

1. **Create Patient**: Form → React Hook Form + Zod validation → `useCreatePatient` mutation → `POST /patients` → invalidate patient list queries → redirect to profile.
2. **View Profile**: Page loads `id` from URL params → `usePatient(id)` query → render `PatientCard`.
3. **Edit Profile**: Click Edit → form fields become editable → `useUpdatePatient` mutation → `PUT /patients/{id}` → invalidate patient query → show success toast.
4. **List Patients**: Page loads → `usePatientList({ name, phone, page, size })` query → render DataTable with pagination and search controls.

## Component Design

### PatientForm

- Used for both create and edit flows.
- Accepts `defaultValues?: Patient` and `onSubmit` callback.
- Uses `useForm` with Zod resolver and the appropriate schema.
- Renders shared `PatientFields` component.

### PatientCard

- Displays patient data in a read-only card layout.
- Groups fields: Personal Info, Contact, Medical, Emergency, Insurance.
- Accepts `patient: Patient` and `canEdit: boolean`.
- Shows Edit button when `canEdit` is true.

### PatientFields

- Renders individual form fields with labels.
- Accepts `control` from React Hook Form.
- Conditionally shows medical fields based on role context.

### PatientColumns

- Exports column definitions for DiceUI DataTable.
- Columns: Name (firstName + lastName), Phone, Date of Birth, Gender, Actions (link to profile).

## Route Design

| Route | Component | Roles |
|---|---|---|
| `/patients/new` | PatientForm (create mode) | Patient |
| `/patients/:id` | PatientCard + PatientForm (edit mode) | Patient (own), Doctor |
| `/patients` | PatientList + DataTable | Admin, Receptionist |

## Query Key Strategy

```
["patients"]                    — Invalidate all patient queries
["patients", "list", filters]   — Patient list with specific filters
["patients", "detail", id]      — Single patient by ID
```

## Mutation Strategy

- On successful create: invalidate `["patients", "list"]`, redirect to `/patients/{newId}`.
- On successful update: invalidate `["patients", "detail", id]` and `["patients", "list"]`.
- On error: display toast with error message, retain form state.

## Role-Based Access Control

| Role | Create | View Own | Edit Own | List All | View Any |
|---|---|---|---|---|---|
| Patient | ✅ | ✅ | ✅ | ❌ | ❌ |
| Doctor | ❌ | ✅ | ✅ | ❌ | ✅ (read-only) |
| Admin | ❌ | ✅ | ✅ | ✅ | ✅ (read-only) |
| Receptionist | ❌ | ✅ | ✅ | ✅ | ✅ (read-only) |

## Error Handling

- Network errors: toast with "Unable to connect to the server."
- 422 Validation errors: map server field errors to form fields.
- 404: redirect to not-found page.
- 403: display "You do not have permission" message.
- 500: toast with "An unexpected error occurred."

## Performance Considerations

- Patient list uses server-side pagination; no client-side pagination of large datasets.
- React Query `staleTime` of 5 minutes for patient detail queries.
- Debounce search input by 300ms before triggering API calls.
- Form fields use controlled components with React Hook Form for optimal re-render behavior.
