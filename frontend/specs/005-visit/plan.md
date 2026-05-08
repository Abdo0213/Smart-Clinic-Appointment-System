# Visit Feature — Implementation Plan

## FSD Structure

```
src/
├── entities/
│   └── visit/
│       ├── model/
│       │   ├── types.ts              # Visit, Prescription, SignVisitRequest, BillingLineItem, CreateVisitRequest
│       │   ├── visit.queries.ts      # TanStack Query hooks: useVisits, useVisit
│       │   ├── visit.mutations.ts    # TanStack Query hooks: useCreateVisit, useSignVisit
│       │   └── index.ts
│       ├── ui/
│       │   ├── VisitCard.tsx         # Summary card for visit list items
│       │   ├── PrescriptionRow.tsx   # Single prescription display row
│       │   ├── PrescriptionList.tsx  # List of prescriptions in a visit
│       │   ├── BillingLineItemRow.tsx
│       │   ├── VisitStatusBadge.tsx  # Draft / Signed badge
│       │   └── index.ts
│       └── index.ts
├── features/
│   └── visit-form/
│       ├── model/
│       │   ├── useVisitForm.ts       # Form state management for create/edit
│       │   ├── usePrescriptionForm.ts # Prescription add form state
│       │   ├── useSignVisit.ts       # Sign visit with billing items
│       │   ├── useFollowUp.ts        # Schedule follow-up from visit
│       │   └── index.ts
│       ├── ui/
│       │   ├── VisitForm.tsx         # Main visit creation/edit form
│       │   ├── ChiefComplaintField.tsx
│       │   ├── ExaminationFindingsField.tsx
│       │   ├── AssessmentField.tsx
│       │   ├── PlanField.tsx
│       │   ├── Icd10CodeInput.tsx    # Autocomplete ICD-10 code selector
│       │   ├── PrescriptionForm.tsx  # Add prescription form
│       │   ├── SignVisitDialog.tsx   # Dialog to sign + add billing items
│       │   ├── BillingItemForm.tsx   # Add billing line items during signing
│       │   ├── FollowUpDialog.tsx    # Schedule follow-up appointment
│       │   └── index.ts
│       └── index.ts
├── pages/
│   └── visit/
│       ├── VisitCreatePage.tsx       # Route: /appointments/:id/visits/new
│       ├── VisitDetailPage.tsx       # Route: /visits/:id
│       ├── VisitHistoryPage.tsx      # Route: /patients/:id/visits
│       └── index.ts
└── widgets/
    └── visit-history/
        ├── ui/
        │   ├── VisitHistoryTable.tsx # Paginated visit history table
        │   └── index.ts
        └── index.ts
```

## Route Definitions

| Route                                | Page                  | Access     |
|--------------------------------------|-----------------------|------------|
| `/appointments/:appointmentId/visits/new` | VisitCreatePage  | Doctor     |
| `/visits/:visitId`                   | VisitDetailPage       | Doctor, Patient |
| `/patients/:patientId/visits`        | VisitHistoryPage      | Doctor, Patient |

## Layer Dependencies

```
pages/visit → features/visit-form → entities/visit
pages/visit → widgets/visit-history → entities/visit
```

- `entities/visit` has no feature dependencies (pure data layer)
- `features/visit-form` depends on `entities/visit` for types and query hooks
- `pages/visit` orchestrates features and entities, owns route logic

## Implementation Order

1. **entities/visit** — Types, query hooks, mutation hooks, UI primitives
2. **features/visit-form** — Form logic, field components, dialog components
3. **widgets/visit-history** — Composed visit history table
4. **pages/visit** — Route pages wiring everything together

## Shared Dependencies

- `shared/api` — HTTP client for visit API calls
- `shared/lib` — Pagination types, date formatting, PDF download helper
- `shared/ui` — Form controls, dialogs, tables, badges, autocomplete
