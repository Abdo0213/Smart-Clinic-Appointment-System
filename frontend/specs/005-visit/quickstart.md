# Visit Feature — Quickstart

## Prerequisites

- Node.js >= 18
- Backend API running with visit endpoints available
- Feature `004-appointment` entities available (Appointment type)

## Setup

```bash
# Create feature branch
git checkout main
git pull
git checkout -b 005-visit

# Install dependencies (if not already installed)
npm install
```

## Development

```bash
# Start dev server
npm run dev

# Run type checking
npm run typecheck

# Run linter
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## Key Files to Create

### Step 1: Entities

```bash
# Types
src/entities/visit/model/types.ts

# Query hooks
src/entities/visit/model/visit.queries.ts
src/entities/visit/model/visit.mutations.ts

# UI components
src/entities/visit/ui/VisitCard.tsx
src/entities/visit/ui/PrescriptionRow.tsx
src/entities/visit/ui/PrescriptionList.tsx
src/entities/visit/ui/BillingLineItemRow.tsx
src/entities/visit/ui/VisitStatusBadge.tsx
```

### Step 2: Features

```bash
# Form hooks
src/features/visit-form/model/useVisitForm.ts
src/features/visit-form/model/usePrescriptionForm.ts
src/features/visit-form/model/useSignVisit.ts
src/features/visit-form/model/useFollowUp.ts

# Form UI
src/features/visit-form/ui/VisitForm.tsx
src/features/visit-form/ui/ChiefComplaintField.tsx
src/features/visit-form/ui/ExaminationFindingsField.tsx
src/features/visit-form/ui/AssessmentField.tsx
src/features/visit-form/ui/PlanField.tsx
src/features/visit-form/ui/Icd10CodeInput.tsx
src/features/visit-form/ui/PrescriptionForm.tsx
src/features/visit-form/ui/SignVisitDialog.tsx
src/features/visit-form/ui/BillingItemForm.tsx
src/features/visit-form/ui/FollowUpDialog.tsx
```

### Step 3: Pages

```bash
src/pages/visit/VisitCreatePage.tsx
src/pages/visit/VisitDetailPage.tsx
src/pages/visit/VisitHistoryPage.tsx
```

## API Base URL

Configure in `src/shared/api/client.ts`:

```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
```

## Routes to Register

| Path                                      | Component          |
|-------------------------------------------|--------------------|
| `/appointments/:appointmentId/visits/new` | VisitCreatePage    |
| `/visits/:visitId`                        | VisitDetailPage    |
| `/patients/:patientId/visits`             | VisitHistoryPage   |

## Verification

1. Navigate to an in-progress appointment → click "Create Visit"
2. Fill visit form with all required fields → submit → verify draft visit created
3. Add a prescription → verify it appears in the prescription list
4. Sign the visit → verify it becomes immutable
5. Schedule a follow-up → verify new appointment is created
6. Navigate to patient visit history → verify visit appears
7. Download prescription PDF → verify pre-signed URL works
