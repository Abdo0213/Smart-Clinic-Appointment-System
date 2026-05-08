# Billing Feature — Quickstart

## Prerequisites

- Node.js >= 18
- Access to the Smart Clinic backend API (billing endpoints)
- Valid authentication token (admin or patient role)

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Routes

| URL                                | Description              | Role   |
|------------------------------------|--------------------------|--------|
| `http://localhost:3000/billing`    | Invoice list (admin)     | Admin  |
| `http://localhost:3000/billing/invoices/:id` | Invoice detail  | Admin  |
| `http://localhost:3000/billing/create` | Create invoice       | Admin  |
| `http://localhost:3000/my-billing` | Patient's invoices       | Patient|

## Key Files

| Purpose              | Path                                            |
|----------------------|-------------------------------------------------|
| Types                | `src/entities/invoice/model/invoice.types.ts`   |
| API hooks            | `src/entities/invoice/api/invoice.api.ts`       |
| Currency formatter   | `src/entities/invoice/lib/format-currency.ts`   |
| Total calculator     | `src/entities/invoice/lib/calculate-total.ts`   |
| Invoice filters      | `src/features/billing/filter-invoices/ui/InvoiceFilters.tsx` |
| Create invoice form  | `src/features/billing/create-invoice/ui/CreateInvoiceForm.tsx` |
| Mark paid button     | `src/features/billing/mark-invoice-paid/ui/MarkPaidButton.tsx` |
| Waive invoice button | `src/features/billing/waive-invoice/ui/WaiveInvoiceButton.tsx` |
| Billing list page    | `src/pages/billing/ui/BillingPage.tsx`          |
| Invoice detail page  | `src/pages/billing/ui/InvoiceDetailPage.tsx`    |
| Create invoice page  | `src/pages/billing/ui/CreateInvoicePage.tsx`    |
| Patient billing page | `src/pages/billing/ui/PatientBillingPage.tsx`   |

## Running Tests

```bash
# Unit tests
npm run test

# Tests in watch mode
npm run test:watch

# E2E tests
npm run test:e2e
```

## Lint & Type Check

```bash
npm run lint
npm run typecheck
```

## Feature Branch

```bash
git checkout -b 007-billing
```

## API Base URL

Configure in `.env.local`:

```
VITE_API_BASE_URL=http://localhost:8080/api
```
