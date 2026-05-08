# Billing Feature — Data Model

## Invoice

The central entity representing a billable event for a patient visit.

| Field       | Type          | Required | Description                                        |
|-------------|---------------|----------|----------------------------------------------------|
| id          | `string`      | Yes      | Unique invoice identifier (UUID)                   |
| visitId     | `string`      | Yes      | Reference to the associated visit                  |
| patientId   | `string`      | Yes      | Reference to the patient                           |
| appointmentId | `string`    | No       | Reference to the associated appointment            |
| status      | `InvoiceStatus` | Yes    | Current lifecycle status of the invoice            |
| totalAmount | `number`      | Yes      | Sum of all line item totals (in cents or decimal)  |
| lineItems   | `LineItem[]`  | Yes      | Ordered list of billable line items                |
| createdAt   | `string`      | Yes      | ISO 8601 datetime of invoice creation              |
| paidAt      | `string \| null` | No    | ISO 8601 datetime when marked as paid, null otherwise |
| waivedAt    | `string \| null` | No    | ISO 8601 datetime when waived, null otherwise      |
| waivedReason | `string \| null` | No   | Reason for waiver, null if not waived              |
| invoiceNumber | `string`    | Yes      | Human-readable invoice number (e.g., INV-2026-001) |

```typescript
interface Invoice {
  id: string;
  visitId: string;
  patientId: string;
  appointmentId?: string;
  status: InvoiceStatus;
  totalAmount: number;
  lineItems: LineItem[];
  createdAt: string;
  paidAt: string | null;
  waivedAt: string | null;
  waivedReason: string | null;
  invoiceNumber: string;
}
```

## InvoiceStatus

Enumerated type tracking the lifecycle of an invoice.

| Value    | Description                                                  |
|----------|--------------------------------------------------------------|
| PENDING  | Invoice has been created but not yet paid or waived         |
| PAID     | Invoice has been marked as paid                              |
| WAIVED   | Invoice charges have been waived by an administrator         |

```typescript
enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  WAIVED = 'WAIVED',
}
```

### State Transitions

```
PENDING ──→ PAID     (via "Mark as Paid" action)
PENDING ──→ WAIVED   (via "Waive Invoice" action, admin only)
```

- PAID and WAIVED are terminal states; no further transitions are allowed.
- Only PENDING invoices can transition to PAID or WAIVED.

## LineItem

Individual charge within an invoice. Each invoice contains one or more line items.

| Field       | Type     | Required | Description                                |
|-------------|----------|----------|--------------------------------------------|
| description | `string` | Yes      | Description of the service or charge       |
| quantity    | `number` | Yes      | Number of units (must be > 0)             |
| unitPrice   | `number` | Yes      | Price per unit                             |
| totalPrice  | `number` | Yes      | Calculated as quantity × unitPrice         |

```typescript
interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
```

### Invariants

- `totalPrice` must equal `quantity * unitPrice`
- `quantity` must be a positive number (> 0)
- `unitPrice` must be a non-negative number (>= 0)
- `description` must be a non-empty string

## CreateInvoiceRequest

Request payload for creating a new invoice.

| Field         | Type          | Required | Description                              |
|---------------|---------------|----------|------------------------------------------|
| visitId       | `string`      | Yes      | ID of the visit being invoiced           |
| patientId     | `string`      | Yes      | ID of the patient being invoiced         |
| appointmentId | `string`      | No       | ID of the associated appointment         |
| lineItems     | `CreateLineItem[]` | Yes | At least one line item required     |

```typescript
interface CreateInvoiceRequest {
  visitId: string;
  patientId: string;
  appointmentId?: string;
  lineItems: CreateLineItem[];
}
```

## CreateLineItem

Line item payload for invoice creation (totalPrice is calculated server-side).

| Field       | Type     | Required | Description                          |
|-------------|----------|----------|--------------------------------------|
| description | `string` | Yes      | Description of the service or charge |
| quantity    | `number` | Yes      | Number of units (must be > 0)       |
| unitPrice   | `number` | Yes      | Price per unit                       |

```typescript
interface CreateLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}
```

## PaginatedResponse\<T\>

Generic pagination wrapper returned by list endpoints.

| Field      | Type     | Description                        |
|------------|----------|------------------------------------|
| data       | `T[]`    | Array of items for the current page |
| total      | `number` | Total number of items across all pages |
| page       | `number` | Current page number (1-indexed)    |
| size       | `number` | Number of items per page           |
| totalPages | `number` | Total number of pages              |

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
```

## Entity Relationships

```
Patient 1──* Invoice
Visit   1──1 Invoice
Invoice 1──* LineItem
Appointment 1──? Invoice (optional)
```

- A patient can have many invoices.
- A visit has at most one invoice.
- An invoice must have at least one line item.
- An invoice may optionally reference an appointment.
