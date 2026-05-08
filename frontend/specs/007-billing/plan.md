# Billing Feature — FSD Implementation Plan

## Architecture

This feature follows **Feature-Sliced Design (FSD) v2.1** architecture with the following layer structure:

```
src/
├── entities/
│   └── invoice/
│       ├── model/
│       │   ├── invoice.types.ts        # Invoice, LineItem, InvoiceStatus types
│       │   ├── invoice.store.ts        # Invoice state management
│       │   ├── invoice.dto.ts          # API response/request DTOs
│       │   └── invoice.mapper.ts       # DTO → Entity mappers
│       ├── api/
│       │   └── invoice.api.ts          # TanStack Query hooks & API calls
│       ├── ui/
│       │   ├── InvoiceCard.tsx         # Summary card for list view
│       │   ├── InvoiceStatusBadge.tsx  # Status badge component
│       │   ├── InvoiceTotal.tsx        # Formatted total display
│       │   ├── LineItemRow.tsx         # Single line item display
│       │   ├── LineItemTable.tsx       # Table of line items
│       │   └── LineItemForm.tsx        # Editable line item row for forms
│       ├── lib/
│       │   ├── calculate-total.ts      # Line item & invoice total calculator
│       │   └── format-currency.ts      # Currency formatting utility
│       └── index.ts                    # Public API
├── features/
│   └── billing/
│       ├── filter-invoices/
│       │   ├── ui/
│       │   │   └── InvoiceFilters.tsx  # Status & patient filter controls
│       │   ├── model/
│       │   │   └── use-invoice-filters.ts  # Filter state hook
│       │   └── index.ts
│       ├── create-invoice/
│       │   ├── ui/
│       │   │   └── CreateInvoiceForm.tsx   # Invoice creation form
│       │   ├── model/
│       │   │   └── use-create-invoice.ts   # Form state & mutation hook
│       │   └── index.ts
│       ├── mark-invoice-paid/
│       │   ├── ui/
│       │   │   └── MarkPaidButton.tsx      # Mark as paid action
│       │   ├── model/
│       │   │   └── use-mark-paid.ts        # Paid mutation hook
│       │   └── index.ts
│       ├── waive-invoice/
│       │   ├── ui/
│       │   │   └── WaiveInvoiceButton.tsx  # Waive action (admin)
│       │   ├── model/
│       │   │   └── use-waive-invoice.ts    # Waive mutation hook
│       │   └── index.ts
│       └── patient-invoices/
│           ├── ui/
│           │   └── PatientInvoiceList.tsx  # Patient-scoped invoice list
│           ├── model/
│           │   └── use-patient-invoices.ts # Patient-scoped query hook
│           └── index.ts
├── pages/
│   └── billing/
│       ├── ui/
│       │   ├── BillingPage.tsx         # Main billing list page (admin)
│       │   ├── InvoiceDetailPage.tsx   # Invoice detail page
│       │   ├── CreateInvoicePage.tsx   # Invoice creation page
│       │   └── PatientBillingPage.tsx  # Patient's own billing page
│       └── index.ts
└── widgets/
    └── billing-layout/
        ├── ui/
        │   └── BillingLayout.tsx       # Shared layout with nav for billing pages
        └── index.ts
```

## Route Configuration

| Route                          | Page                  | Access      |
|--------------------------------|-----------------------|-------------|
| `/billing`                     | BillingPage           | Admin       |
| `/billing/invoices/:invoiceId` | InvoiceDetailPage     | Admin       |
| `/billing/create`              | CreateInvoicePage     | Admin       |
| `/my-billing`                  | PatientBillingPage    | Patient     |

## Data Flow

1. **List View**: `BillingPage` → `InvoiceFilters` + `InvoiceCard[]` → TanStack Query `useInvoices(params)`
2. **Detail View**: `InvoiceDetailPage` → `LineItemTable` + `InvoiceStatusBadge` + action buttons → TanStack Query `useInvoice(id)`
3. **Create**: `CreateInvoicePage` → `CreateInvoiceForm` → `LineItemForm[]` → TanStack Mutation `useCreateInvoice()`
4. **Mark Paid**: `MarkPaidButton` → confirmation → TanStack Mutation `useMarkPaid()` → invalidate invoice queries
5. **Waive**: `WaiveInvoiceButton` → confirmation with reason → TanStack Mutation `useWaiveInvoice()` → invalidate invoice queries

## Import Rules (FSD)

- `pages/` may import from `widgets/`, `features/`, `entities/`
- `widgets/` may import from `features/`, `entities/`
- `features/` may import from `entities/`
- `entities/` may not import from any other layer
- Each slice exports only through its `index.ts` public API

## Component Dependency Graph

```
BillingPage
├── BillingLayout (widget)
├── InvoiceFilters (feature)
│   └── use-invoice-filters (model)
├── InvoiceCard (entity)
│   ├── InvoiceStatusBadge (entity)
│   └── InvoiceTotal (entity)
└── useInvoices (entity API)

InvoiceDetailPage
├── BillingLayout (widget)
├── InvoiceStatusBadge (entity)
├── LineItemTable (entity)
│   └── LineItemRow (entity)
├── InvoiceTotal (entity)
├── MarkPaidButton (feature)
└── WaiveInvoiceButton (feature)

CreateInvoicePage
├── BillingLayout (widget)
├── CreateInvoiceForm (feature)
│   ├── LineItemForm[] (entity)
│   ├── calculate-total (entity lib)
│   └── use-create-invoice (model)
└── format-currency (entity lib)

PatientBillingPage
├── BillingLayout (widget)
├── PatientInvoiceList (feature)
│   ├── InvoiceCard (entity)
│   └── use-patient-invoices (model)
└── InvoiceStatusBadge (entity)
```
