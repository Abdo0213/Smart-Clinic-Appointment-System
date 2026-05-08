# Billing Feature — Research

## Invoice UI Patterns

### List View Patterns

Medical billing systems commonly use a table-based list view with the following columns:

| Column         | Pattern                                              |
|----------------|------------------------------------------------------|
| Invoice #      | Clickable link to detail view                        |
| Patient Name   | Text display, sortable                               |
| Date           | Formatted date (MMM DD, YYYY), sortable              |
| Total Amount   | Right-aligned currency                               |
| Status         | Color-coded badge (yellow/green/gray)                |
| Actions        | Dropdown or inline buttons for status transitions    |

Best practices:
- Default sort by date descending (most recent first).
- Sticky header for long scrollable lists.
- Row-level click to navigate to detail; action buttons stop propagation.
- Bulk actions are out of scope for initial implementation.

### Detail View Patterns

Standard invoice detail layout:

1. **Header section**: Invoice number, status badge, dates (created, paid), patient info.
2. **Line items table**: Description, quantity, unit price, total per line, with a bold total row at the bottom.
3. **Actions section**: Status-dependent action buttons (Mark as Paid, Waive) aligned right.

Reference patterns:
- Stripe invoice detail: Clean, single-column layout with clear visual hierarchy.
- FreshBooks: Two-panel layout with summary sidebar and line items main area.
- Xero: Tabbed detail with invoice | activity | notes sections.

For this feature, a single-column layout with header → line items table → actions is the most appropriate given the scope.

## Currency Formatting

### Approach

Use `Intl.NumberFormat` for locale-aware currency display. This avoids external dependencies and provides built-in rounding and grouping.

```typescript
function formatCurrency(amount: number, locale = 'en-US', currency = 'USD'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
```

### Considerations

| Concern               | Solution                                              |
|-----------------------|-------------------------------------------------------|
| Floating point errors | Store amounts in cents on the frontend for calculations, display as dollars |
| Locale variations     | `Intl.NumberFormat` handles comma/period separators   |
| Negative amounts      | Supported by `Intl.NumberFormat` (e.g., -$150.00)    |
| Zero amounts          | Display as $0.00                                      |
| Large amounts         | `Intl.NumberFormat` adds thousand separators          |

### Internal Calculation Strategy

Line item calculations should use the following approach to minimize floating-point errors:

```typescript
function calculateLineItemTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

function calculateInvoiceTotal(lineItems: LineItem[]): number {
  const sum = lineItems.reduce((acc, item) => acc + item.totalPrice * 100, 0);
  return Math.round(sum) / 100;
}
```

Multiplying by 100, summing integer cents, then dividing back avoids accumulator drift from repeated floating-point addition.

## Line Item Dynamic Forms

### UX Pattern: Dynamic Field Array

Creating invoices requires a variable number of line items. The standard UX pattern is a dynamic field array with add/remove capabilities.

**Reference implementations:**
- React Hook Form's `useFieldArray` hook
- TanStack Form's field array API
- Formik's `FieldArray` component

### Recommended Implementation

Using TanStack Form (consistent with the project's TanStack ecosystem):

```typescript
// Each line item row is a sub-form with:
// - description: string (text input)
// - quantity: number (number input, min 1)
// - unitPrice: number (number input, min 0)
// - totalPrice: computed (read-only, displayed)

// Row-level validation
const lineItemSchema = {
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
};
```

### UX Considerations

| Aspect                 | Recommendation                                        |
|------------------------|-------------------------------------------------------|
| Initial state          | Show one empty line item row by default               |
| Add button             | "Add Line Item" button below the last row             |
| Remove button          | Trash icon at end of each row; disabled if only 1 row |
| Minimum items          | At least 1 line item required                         |
| Auto-calculation       | totalPrice updates on quantity or unitPrice change     |
| Running total          | Display invoice total below the line items table      |
| Empty row validation   | Validate on blur or submit, not on every keystroke    |
| Mobile layout          | Stack fields vertically on narrow screens             |

### Accessibility

- Each line item row should be in a `<fieldset>` with a legend like "Line Item 1".
- Remove buttons should have `aria-label="Remove line item 1"`.
- The add button should announce to screen readers that a new row was added.

## Payment Status Workflows

### State Machine

```
         ┌──────────┐
         │ PENDING  │
         └────┬─────┘
              │
      ┌───────┴───────┐
      │               │
      ▼               ▼
┌──────────┐   ┌──────────┐
│   PAID   │   │  WAIVED  │
└──────────┘   └──────────┘
```

### UI Rules by Status

| Status  | Badge Color | Available Actions                         | UI Indicators                           |
|---------|-------------|-------------------------------------------|-----------------------------------------|
| PENDING | Yellow/Amber| Mark as Paid, Waive (admin)               | Callout: "This invoice is outstanding"  |
| PAID    | Green       | None                                      | Show paidAt date                        |
| WAIVED  | Gray        | None                                      | Show waivedAt date and waivedReason     |

### Confirmation Dialogs

Both "Mark as Paid" and "Waive" actions require confirmation dialogs to prevent accidental state changes.

**Mark as Paid dialog:**
- Title: "Mark Invoice as Paid"
- Body: "Are you sure you want to mark invoice {invoiceNumber} as paid? This action cannot be undone."
- Buttons: "Cancel" (secondary), "Mark as Paid" (primary, green)

**Waive Invoice dialog:**
- Title: "Waive Invoice"
- Body: "Are you sure you want to waive invoice {invoiceNumber}? The patient will no longer be responsible for these charges."
- Required field: "Reason for waiver" (textarea, required)
- Buttons: "Cancel" (secondary), "Waive Invoice" (primary, destructive/red)

### Optimistic Updates

For status transitions, optimistic updates improve perceived performance:

1. Update the local cache immediately to the expected status.
2. Fire the API request.
3. On success: keep the optimistic state (server response replaces it).
4. On error: roll back to the previous state and show error toast.

```typescript
useMutation({
  mutationFn: (id: string) => api.markPaid(id),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['invoices', id] });
    const previous = queryClient.getQueryData(['invoices', id]);
    queryClient.setQueryData(['invoices', id], (old: Invoice) => ({
      ...old,
      status: 'PAID' as InvoiceStatus,
      paidAt: new Date().toISOString(),
    }));
    return { previous };
  },
  onError: (_err, _id, context) => {
    queryClient.setQueryData(['invoices', id], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  },
});
```

### Cache Invalidation Strategy

After any mutation (create, pay, waive), invalidate related queries:

| Mutation         | Invalidate                                  |
|------------------|---------------------------------------------|
| Create Invoice   | `['invoices']` (list), `['invoices', id]` (detail) |
| Mark as Paid     | `['invoices', id]`, `['invoices']` (list for status badge update) |
| Waive Invoice    | `['invoices', id]`, `['invoices']` (list for status badge update) |

Use `invalidates` in TanStack Query mutation config to automatically handle this.
