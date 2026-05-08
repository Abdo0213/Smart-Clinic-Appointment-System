# Billing Feature — Requirements Checklist

## P1 Requirements

| ID    | Requirement                                                                 | Status |
|-------|-----------------------------------------------------------------------------|--------|
| FR-1  | Display paginated invoice list with configurable page size (default 20)     | [x]    |
| FR-2  | Filter invoices by status (PENDING, PAID, WAIVED)                          | [x]    |
| FR-3  | Filter invoices by patient ID                                               | [x]    |
| FR-4  | Display invoice detail with all line items, totals, and status              | [x]    |
| FR-5  | Create manual invoice with dynamic line items (add/remove rows)             | [x]    |
| FR-6  | Auto-calculate line item totals and invoice total from quantity and unit price | [x] |
| FR-7  | Mark a PENDING invoice as PAID with confirmation dialog                     | [x]    |
| FR-12 | Display currency values with proper locale formatting                       | [x]    |
| FR-13 | Validate all required fields before invoice creation submission             | [x]    |
| FR-14 | Show loading states during API calls                                        | [x]    |
| FR-15 | Show error states with retry option on API failure                          | [x]    |

## P2 Requirements

| ID    | Requirement                                                                 | Status |
|-------|-----------------------------------------------------------------------------|--------|
| FR-8  | Waive a PENDING invoice with reason (admin only) with confirmation dialog   | [x]    |
| FR-9  | Patient-scoped invoice list (auto-filtered by logged-in patient)            | [ ]    |
| FR-10 | Role-based UI: hide admin actions (waive, mark paid) from patients          | [x]    |

## P3 Requirements

| ID    | Requirement                                                                 | Status |
|-------|-----------------------------------------------------------------------------|--------|
| FR-11 | Persist filter state in URL query parameters for deep linking               | [ ]    |

## User Story Coverage

| Story | Description                     | Status |
|-------|---------------------------------|--------|
| P1    | List Invoices with Filters      | [x]    |
| P2    | View Invoice Detail             | [x]    |
| P3    | Create Manual Invoice           | [x]    |
| P4    | Mark Invoice as Paid            | [x]    |
| P5    | Waive Invoice (admin)           | [x]    |
| P6    | Patient View Own Invoices       | [ ]    |

## Acceptance Criteria Checklist

### P1: List Invoices with Filters

- [x] Default pagination loads first page with 20 items
- [x] Total count and page count displayed
- [x] Status filter filters invoices correctly
- [x] Patient filter filters invoices correctly
- [x] Combined filters work together
- [x] Clear Filters button resets all filters (via "All Statuses" select option)
- [x] Pagination navigation works
- [x] Active page indicator updates

### P2: View Invoice Detail

- [x] Clicking invoice row opens detail view (via View button + route /billing/invoices/[id])
- [x] All line items displayed with description, quantity, unit price, total
- [x] Invoice total matches sum of line item totals
- [x] Status badge displays with correct color coding
- [x] Back navigation returns to list (via back button)

### P3: Create Manual Invoice

- [x] Create Invoice button opens form (navigates to /billing/invoices/create)
- [x] Line item total auto-calculates from quantity × unit price
- [x] Add Line Item button adds new row
- [x] Remove line item button removes row and recalculates total
- [x] Successful creation redirects to invoice list
- [x] Success notification shown (toast)
- [x] Validation errors displayed for missing required fields (Zod resolver)
- [x] Cancel returns to list without creating invoice

### P4: Mark Invoice as Paid

- [x] Mark as Paid button shows confirmation dialog
- [x] Confirming changes status to PAID
- [x] paidAt timestamp is set
- [x] Success notification shown (toast)
- [x] Button disabled/hidden for non-PENDING invoices
- [x] Canceling dialog preserves PENDING status

### P5: Waive Invoice (admin)

- [x] Waive Invoice button visible only to admins
- [x] Confirmation dialog includes reason field (text input)
- [x] Confirming with reason changes status to WAIVED
- [x] Success notification shown (toast)
- [x] Non-admin users cannot see Waive button
- [x] Cannot waive a non-PENDING invoice

### P6: Patient View Own Invoices

- [ ] Patient sees only their own invoices — Deferred (P2)
- [ ] Patient filter not shown (auto-scoped) — Deferred (P2)
- [ ] Patient can view invoice detail — Deferred (P2)
- [ ] No admin actions visible to patient — Deferred (P2)
- [ ] Direct URL access to other patient's invoices blocked — Backend enforced

## Technical Checklist

- [x] FSD import rules followed (entities → pages, no cross-layer violations)
- [x] All entity components export through index.ts
- [x] TanStack Query cache invalidation after mutations
- [x] TypeScript strict mode passes (zero new errors)
- [x] No `any` types used
- [x] Loading skeletons for all data-dependent views
- [x] Error states for page-level error handling
- [x] Accessible: keyboard navigation, ARIA labels
- [x] Responsive layout for mobile and desktop
