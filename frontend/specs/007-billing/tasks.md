# Billing Feature — Tasks

## Phase 1: Foundation (Entities & Types)

| #  | Task                                                                 | Status |
|----|----------------------------------------------------------------------|--------|
| 1  | Define Invoice, LineItem, InvoiceStatus types in `entities/invoice/model/invoice.types.ts` → `types.ts` | [x] |
| 2  | Define API request/response DTOs in `entities/invoice/model/invoice.dto.ts` → Combined in `types.ts` (InvoiceFilters, InvoiceListResponse, CreateInvoiceRequest, WaiveInvoiceRequest) | [x] |
| 3  | Create DTO → Entity mapper functions — Not needed (API returns entity-compatible shapes directly) | [x] |
| 4  | Implement `calculate-total.ts` utility for line item and invoice totals | [x] |
| 5  | Implement `format-currency.ts` utility with locale-aware formatting — Re-exports shared `formatCurrency` | [x] |
| 6  | Create `entities/invoice/index.ts` public API barrel export          | [x] |

## Phase 2: API Layer

| #  | Task                                                                 | Status |
|----|----------------------------------------------------------------------|--------|
| 7  | Implement `GET /billing/invoices` query hook `useGetInvoices(params)` with pagination and filters | [x] |
| 8  | Implement `GET /billing/invoices/:id` query hook `useGetInvoice(id)`    | [x] |
| 9  | Implement `POST /billing/invoices` mutation hook `useCreateInvoice()` with cache invalidation | [x] |
| 10 | Implement `PATCH /billing/invoices/:id/pay` mutation hook `useMarkAsPaid()` with cache invalidation | [x] |
| 11 | Implement `PATCH /billing/invoices/:id/waive` mutation hook `useWaiveInvoice()` with cache invalidation | [x] |

## Phase 3: Entity UI Components

| #  | Task                                                                 | Status |
|----|----------------------------------------------------------------------|--------|
| 12 | Build `InvoiceStatusBadge` (StatusBadge) with color-coded status display | [x] |
| 13 | Build `InvoiceTotal` → `AmountDisplay` with formatted currency display | [x] |
| 14 | Build `LineItemRow` — Implemented inline within `LineItemsTable`     | [x] |
| 15 | Build `LineItemTable` → `LineItemsTable` composing rows with totals  | [x] |
| 16 | Build `InvoiceCard` summary component for list view                  | [x] |
| 17 | Build `LineItemForm` — Implemented inline in `CreateInvoicePage` with add/remove rows | [x] |

## Phase 4: Feature Slices

| #  | Task                                                                 | Status |
|----|----------------------------------------------------------------------|--------|
| 18 | Build `InvoiceFilters` — Implemented inline in InvoiceListPage (status select + search) | [x] |
| 19 | Implement filter state — managed via useState in InvoiceListPage     | [x] |
| 20 | Build `CreateInvoiceForm` — Implemented in CreateInvoicePage with dynamic LineItem rows | [x] |
| 21 | Implement form validation with Zod schema (`createInvoiceSchema`)    | [x] |
| 22 | Build `MarkPaidButton` with confirmation dialog                      | [x] |
| 23 | Implement mark-paid mutation with cache invalidation                 | [x] |
| 24 | Build `WaiveInvoiceButton` with confirmation dialog and reason field | [x] |
| 25 | Implement waive mutation with cache invalidation                     | [x] |
| 26 | Build `PatientInvoiceList` component — Deferred (P2, backend dependent) | [ ] |
| 27 | Implement `use-patient-invoices` hook — Deferred (P2, backend dependent) | [ ] |

## Phase 5: Widgets & Pages

| #  | Task                                                                 | Status |
|----|----------------------------------------------------------------------|--------|
| 28 | Build `BillingLayout` widget — Not needed (uses existing dashboard layout) | [x] |
| 29 | Build `BillingPage` (InvoiceListPage) composing filters, invoice list, and pagination | [x] |
| 30 | Build `InvoiceDetailPage` with line items, status, and action buttons | [x] |
| 31 | Build `CreateInvoicePage` wrapping CreateInvoiceForm                 | [x] |
| 32 | Build `PatientBillingPage` — Deferred (P2, requires patient-scoped API) | [ ] |
| 33 | Configure route definitions for billing pages (`/billing`, `/billing/invoices/[id]`, `/billing/invoices/create`) | [x] |

## Phase 6: Integration & Polish

| #  | Task                                                                 | Status |
|----|----------------------------------------------------------------------|--------|
| 34 | Add loading skeleton states for list and detail views                | [x] |
| 35 | Add error states with retry/empty display for failed API calls       | [x] |
| 36 | Implement empty state for invoice list when no results found         | [x] |
| 37 | Add toast notifications for success/error on mutations               | [x] |
| 38 | Verify role-based UI gating (hide waive button from non-admins)      | [x] |
| 39 | End-to-end manual testing — Deferred (requires running backend)      | [ ] |
| 40 | Code review and refactor based on FSD import rules                   | [x] |

## Summary

- **Completed**: 36/40 tasks (90%)
- **Deferred**: 4 tasks
  - T26/T27: Patient invoice list & hook (P2, requires patient-scoped API)
  - T32: Patient billing page (P2, requires patient-scoped API)
  - T39: E2E testing (requires running backend)

## Implementation Notes

### Architecture Decisions
- Types, API, queries, and UI components live in `entities/invoice/` following FSD
- Pages live in `pages/billing/` (FSD pages layer) with thin app-router wrappers in `app/(dashboard)/billing/`
- Feature-level concerns (filters, create form, mark-paid, waive) are collocated with their page components rather than being separate FSD feature slices — this is a pragmatic decision since the features are tightly coupled to their page context
- Zod form schemas live in `pages/billing/model/` since they are page-level concerns
- The `BillingLayout` widget was not needed because the existing dashboard layout provides the required sidebar and header

### Key Files
- `src/entities/invoice/` — Types, API layer, query hooks, UI components, lib utilities
- `src/pages/billing/ui/` — InvoiceListPage, InvoiceDetailPage, CreateInvoicePage
- `src/pages/billing/model/schemas.ts` — Zod form validation schemas
- `src/app/(dashboard)/billing/` — Next.js App Router page wrappers
- `src/shared/api/apiRoutes.ts` — API route constants
