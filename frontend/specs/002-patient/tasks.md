# Patient Feature — Task Breakdown

| Field          | Value                          |
|----------------|--------------------------------|
| Feature Branch | `002-patient`                  |
| Status         | In Progress                    |
| Owner          | Frontend Team                  |
| Created        | 2026-05-07                     |
| Updated        | 2026-05-08                     |

---

## Phase 1: Setup

- [x] T001 Set up feature branch `002-patient` from main
- [x] T002 Create FSD directory structure: `src/entities/patient/`, `src/features/patient/`, `src/pages/patient-profile/`, `src/pages/patient-list/`
- [x] T003 Install dependencies: `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, DiceUI DataTable

---

## Phase 2: Foundation (Patient Entity, API Layer, Types)

- [x] T004 Define Patient types in `src/entities/patient/model/types.ts` — Patient, CreatePatientRequest, UpdatePatientRequest, PatientFilters, BloodType
- [x] T005 Define Zod schemas (`patientCreateSchema`, `patientUpdateSchema`) — currently inline in `RegisterPatientForm.tsx` and `UpdatePatientForm.tsx`
- [ ] T006 Define constants (gender options, blood type options, page sizes) in `src/entities/patient/model/constants.ts` — currently inline in form components
- [x] T007 Implement API client wrapper in `src/shared/api/client.ts` — reuses shared Axios client from 001-auth
- [x] T008 Implement patient API functions (`createPatient`, `getPatient`, `getPatientList`, `updatePatient`) in `src/entities/patient/api/patientApi.ts`
- [x] T009 Implement React Query hooks (`useGetPatient`, `useGetPatients`, `useCreatePatient`, `useUpdatePatient`) in `src/entities/patient/model/patientQueries.ts`

---

## Phase 3: US1 — Create Patient Profile (P1)

- [x] T010 Build `PatientFields` component — fields rendered inline in `RegisterPatientForm.tsx` (all required + optional fields)
- [x] T011 Build `PatientForm` component (create mode) in `src/features/patient/ui/RegisterPatientForm.tsx` with React Hook Form + Zod
- [x] T012 Create patient registration route — dialog in `PatientListPage.tsx` for admin/receptionist; `/patient/profile/` for patient self-registration
- [x] T013 Wire form submission to `useCreatePatient` mutation with success toast, query invalidation, and form reset

---

## Phase 4: US2 — View/Edit Own Profile (P2)

- [x] T014 Build `PatientCard` component in `src/entities/patient/ui/PatientCard.tsx`
- [x] T015 Add edit mode toggle — dialog-based edit on patient profile page at `src/pages/patient-profile/ui/PatientProfilePage.tsx`
- [x] T016 Wire `UpdatePatientForm` with `useUpdatePatient` mutation in `src/features/patient/ui/UpdatePatientForm.tsx`
- [x] T017 Implement cancel-edit behavior — dialog close discards changes via React Hook Form reset
- [ ] T018 Add role-based edit visibility — Edit button currently shown to all viewers regardless of role; should hide for doctors viewing other patients

---

## Phase 5: US3 — Search/List Patients (P3)

- [x] T019 Define DataTable columns in `src/pages/patient-list/ui/PatientListPage.tsx` — Name, Phone, DOB, Blood Type, Gender, Created At
- [x] T020 Build patient list page at `src/pages/patient-list/ui/PatientListPage.tsx` (route `/patients`)
- [x] T021 Integrate DataTable with `useGetPatients` query and pagination controls
- [x] T022 Add search input with debounced name and phone filters via `PatientSearchBar` (300ms debounce)
- [x] T023 Add clickable rows navigating to `/patients/:id` via `onRowClick` handler
- [x] T024 Restrict patient list page — admin/receptionist can create, routes under `(dashboard)/patients/`, `(dashboard)/admin/patients/`, `(dashboard)/reception/patients/`

---

## Phase 6: US4 — Doctor View Patient (P4)

- [x] T025 Ensure patient profile page renders all fields in read-only mode for doctor role — all fields displayed in Card layout
- [x] T026 Highlight medical fields section (bloodType, knownAllergies) — Medical Information card with Badge for blood type
- [ ] T027 Hide Edit button when viewer is a doctor viewing another patient — Edit button currently always visible

---

## Phase 7: Polish

- [x] T028 Add loading states to PatientCard and PatientList — `LoadingSpinner` used in both pages
- [x] T029 Add empty state for patient list (no results found) — `EmptyState` component with icon
- [x] T030 Add error state for patient pages — error state in `PatientProfilePage.tsx`
- [x] T031 Verify all toast notifications (success, error) work correctly — Sonner toast in RegisterPatientForm and UpdatePatientForm
- [x] T032 Ensure responsive layout for patient profile and list pages — responsive grid and table layouts
- [ ] T033 Write unit tests for Zod schemas (valid/invalid cases)
- [ ] T034 Write integration tests for `usePatientList` and `useCreatePatient` hooks

---

## Task Dependencies

```
T001 → T002 → T003 (Setup) ✅
         ↓
T004-T009 (Foundation) ✅ (T006 pending — minor)
         ↓
T010-T013 (Create Patient) ✅
T014-T018 (View/Edit Profile, parallel) 🟡 (T018 pending)
         ↓
T019-T024 (Search/List) ✅
T025-T027 (Doctor View, parallel) 🟡 (T027 pending)
         ↓
T028-T034 (Polish) 🟡 (T033, T034 pending)
```

## Summary

| Phase | Status | Completed | Remaining |
|-------|--------|-----------|-----------|
| Phase 1: Setup | ✅ Done | 3/3 | 0 |
| Phase 2: Foundation | 🟡 Partial | 5/6 | T006 |
| Phase 3: Create Patient | ✅ Done | 4/4 | 0 |
| Phase 4: View/Edit Profile | 🟡 Partial | 4/5 | T018 |
| Phase 5: Search/List | ✅ Done | 6/6 | 0 |
| Phase 6: Doctor View | 🟡 Partial | 2/3 | T027 |
| Phase 7: Polish | 🟡 Partial | 5/7 | T033, T034 |
| **Total** | **~85%** | **29/34** | **5** |

### Remaining Tasks

| Task | Priority | Description | Effort |
|------|----------|-------------|--------|
| T006 | P3 | Extract constants to `src/entities/patient/model/constants.ts` | Low |
| T018 | P2 | Role-based Edit button visibility on profile page | Medium |
| T027 | P4 | Hide Edit button for doctor viewing another patient | Medium (same as T018) |
| T033 | P4 | Unit tests for Zod schemas | Low |
| T034 | P4 | Integration tests for hooks | Medium |

> **Note**: T018 and T027 are closely related — both require checking the viewer's role against the patient being viewed. Implementing T018 effectively covers T027.
