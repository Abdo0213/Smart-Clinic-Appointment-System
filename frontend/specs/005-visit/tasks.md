# Visit Feature — Phased Tasks

## Phase 1: Foundation (entities/visit)

- [x] T1.1 Define TypeScript types for Visit, Prescription, SignVisitRequest, BillingLineItem, CreateVisitRequest in `entities/visit/model/types.ts`
- [x] T1.2 Implement `useVisits` query hook (GET /visits with filters) in `entities/visit/model/visitQueries.ts`
- [x] T1.3 Implement `useVisit` query hook (GET /visits/:id) in `entities/visit/model/visitQueries.ts`
- [x] T1.4 Implement `useCreateVisit` mutation hook (POST /visits) in `entities/visit/model/visitQueries.ts`
- [x] T1.5 Implement `useSignVisit` mutation hook (POST /visits/:id/sign) in `entities/visit/model/visitQueries.ts`
- [x] T1.6 Implement `useAddPrescription` mutation hook (POST /visits/:id/prescriptions) with optimistic updates in `entities/visit/model/visitQueries.ts`
- [x] T1.7 Implement `useScheduleFollowUp` mutation hook (POST /visits/:id/follow-up) in `entities/visit/model/visitQueries.ts`
- [x] T1.8 Build `VisitCard` component in `entities/visit/ui/VisitCard.tsx`
- [x] T1.9 Build `PrescriptionCard` component in `entities/visit/ui/PrescriptionCard.tsx` (replaces PrescriptionRow/List)
- [ ] T1.10 Build `BillingLineItemRow` component in `entities/visit/ui/BillingLineItemRow.tsx` (P3 — covered by LineItemForm in features)
- [x] T1.11 Build `VisitStatusBadge` component in `entities/visit/ui/VisitStatusBadge.tsx`
- [x] T1.12 Export barrel files for `entities/visit`

## Phase 2: Feature Logic (features/visit-form)

- [x] T2.1 Implement visit form logic with Zod schema + Zustand store in `features/visit-form/model/`
- [x] T2.2 Implement prescription form with validation in `features/visit-form/ui/PrescriptionForm.tsx`
- [x] T2.3 Implement sign visit orchestration with ConfirmDialog in `features/visit-form/ui/SignVisitDialog.tsx`
- [x] T2.4 Implement follow-up scheduling with slot selection in `features/visit-form/ui/FollowUpScheduler.tsx`
- [x] T2.5-T2.8 Medical fields (chief complaint, examination, assessment, plan) inline in VisitForm
- [ ] T2.9 Build `Icd10CodeInput` with search/autocomplete (P3 — currently comma-separated input)
- [x] T2.10 Build `VisitForm` composite form component in `features/visit-form/ui/VisitForm.tsx`
- [x] T2.11 Build `PrescriptionForm` component in `features/visit-form/ui/PrescriptionForm.tsx`
- [x] T2.12 Build `LineItemForm` (BillingItemForm) component in `features/visit-form/ui/LineItemForm.tsx`
- [x] T2.13 Build `SignVisitDialog` component in `features/visit-form/ui/SignVisitDialog.tsx`
- [x] T2.14 Build `FollowUpScheduler` (FollowUpDialog) component in `features/visit-form/ui/FollowUpScheduler.tsx`
- [x] T2.15 Export barrel files for `features/visit-form`

## Phase 3: Widgets

- [x] T3.1 Build `VisitHistoryTable` with pagination and filters in `widgets/visit-history/ui/VisitHistoryTable.tsx`
- [x] T3.2 Export barrel files for `widgets/visit-history`

## Phase 4: Pages & Routing

- [x] T4.1 Build `VisitPage` (visit creation workspace) in `pages/visit/ui/VisitPage.tsx`
- [x] T4.2 Build `VisitDetailPage` at `/doctor/visits/[id]` in `pages/visit/ui/VisitDetailPage.tsx`
- [x] T4.3 Build `VisitHistoryPage` in `pages/visit/ui/VisitHistoryPage.tsx`
- [x] T4.4 Register routes: `/doctor/visits/[id]`, `/doctor/visits/new/[appointmentId]`, `/patient/visits`, `/visits/[appointmentId]`
- [ ] T4.5 Add navigation links from Appointment detail to Visit creation (P3)

## Phase 5: Integration & Polish

- [x] T5.1 Integrate PDF download flow via pre-signed S3 URL on PdfDownloadButton
- [x] T5.2 Add sidebar links and allowed paths for Patient/Doctor visit access
- [x] T5.3 Add loading states, error boundaries, and empty states
- [x] T5.4 Add toast notifications for mutation success/failure (create, prescription, sign, follow-up)
- [x] T5.5 Add optimistic updates for prescription addition
- [ ] T5.6 Write unit tests for mutation hooks (P3)
- [ ] T5.7 Write integration tests for VisitForm submission flow (P3)
- [ ] T5.8 Write E2E test for full visit lifecycle (P3)
