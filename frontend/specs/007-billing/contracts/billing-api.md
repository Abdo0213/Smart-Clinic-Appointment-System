# Billing API Contracts

Base URL: `/billing`

All endpoints require authentication. Patient-scoped endpoints additionally verify the requested resource belongs to the authenticated patient.

## GET /billing/invoices

Retrieve a paginated list of invoices with optional filters.

### Request

| Parameter  | Type     | Location | Required | Description                        |
|------------|----------|----------|----------|------------------------------------|
| patientId  | `string` | query    | No       | Filter by patient ID               |
| status     | `string` | query    | No       | Filter by InvoiceStatus (PENDING, PAID, WAIVED) |
| page       | `number` | query    | No       | Page number, default: 1            |
| size       | `number` | query    | No       | Items per page, default: 20        |

```
GET /billing/invoices?patientId=abc123&status=PENDING&page=1&size=20
```

### Response — 200 OK

```json
{
  "data": [
    {
      "id": "inv-001",
      "visitId": "visit-042",
      "patientId": "pat-007",
      "appointmentId": "appt-123",
      "status": "PENDING",
      "totalAmount": 350.00,
      "lineItems": [
        {
          "description": "General Consultation",
          "quantity": 1,
          "unitPrice": 150.00,
          "totalPrice": 150.00
        },
        {
          "description": "Blood Test - CBC",
          "quantity": 2,
          "unitPrice": 100.00,
          "totalPrice": 200.00
        }
      ],
      "createdAt": "2026-04-15T09:30:00Z",
      "paidAt": null,
      "waivedAt": null,
      "waivedReason": null,
      "invoiceNumber": "INV-2026-001"
    }
  ],
  "total": 45,
  "page": 1,
  "size": 20,
  "totalPages": 3
}
```

### Error Responses

| Status | Condition                       |
|--------|---------------------------------|
| 400    | Invalid query parameter values  |
| 401    | Missing or invalid authentication |
| 403    | Insufficient permissions         |

---

## GET /billing/invoices/{id}

Retrieve a single invoice by ID.

### Request

| Parameter | Type     | Location | Required | Description       |
|-----------|----------|----------|----------|-------------------|
| id        | `string` | path     | Yes      | Invoice ID        |

```
GET /billing/invoices/inv-001
```

### Response — 200 OK

```json
{
  "id": "inv-001",
  "visitId": "visit-042",
  "patientId": "pat-007",
  "appointmentId": "appt-123",
  "status": "PENDING",
  "totalAmount": 350.00,
  "lineItems": [
    {
      "description": "General Consultation",
      "quantity": 1,
      "unitPrice": 150.00,
      "totalPrice": 150.00
    },
    {
      "description": "Blood Test - CBC",
      "quantity": 2,
      "unitPrice": 100.00,
      "totalPrice": 200.00
    }
  ],
  "createdAt": "2026-04-15T09:30:00Z",
  "paidAt": null,
  "waivedAt": null,
  "waivedReason": null,
  "invoiceNumber": "INV-2026-001"
}
```

### Error Responses

| Status | Condition                       |
|--------|---------------------------------|
| 401    | Missing or invalid authentication |
| 403    | Patient accessing another patient's invoice |
| 404    | Invoice not found               |

---

## POST /billing/invoices

Create a new invoice.

### Request

| Field         | Type               | Required | Description                    |
|---------------|--------------------|----------|--------------------------------|
| visitId       | `string`           | Yes      | ID of the visit being invoiced |
| patientId     | `string`           | Yes      | ID of the patient              |
| appointmentId | `string`           | No       | ID of the associated appointment |
| lineItems     | `CreateLineItem[]` | Yes      | At least one line item         |

```json
POST /billing/invoices

{
  "visitId": "visit-042",
  "patientId": "pat-007",
  "appointmentId": "appt-123",
  "lineItems": [
    {
      "description": "General Consultation",
      "quantity": 1,
      "unitPrice": 150.00
    },
    {
      "description": "Blood Test - CBC",
      "quantity": 2,
      "unitPrice": 100.00
    }
  ]
}
```

### Response — 201 Created

Returns the created Invoice with server-generated fields (`id`, `invoiceNumber`, `status`, `totalAmount`, `createdAt`, computed `totalPrice` on line items).

```json
{
  "id": "inv-001",
  "visitId": "visit-042",
  "patientId": "pat-007",
  "appointmentId": "appt-123",
  "status": "PENDING",
  "totalAmount": 350.00,
  "lineItems": [
    {
      "description": "General Consultation",
      "quantity": 1,
      "unitPrice": 150.00,
      "totalPrice": 150.00
    },
    {
      "description": "Blood Test - CBC",
      "quantity": 2,
      "unitPrice": 100.00,
      "totalPrice": 200.00
    }
  ],
  "createdAt": "2026-05-07T10:00:00Z",
  "paidAt": null,
  "waivedAt": null,
  "waivedReason": null,
  "invoiceNumber": "INV-2026-042"
}
```

### Error Responses

| Status | Condition                                     |
|--------|-----------------------------------------------|
| 400    | Validation error (missing required fields, invalid data) |
| 401    | Missing or invalid authentication             |
| 403    | Non-admin attempting to create invoice        |
| 409    | Invoice already exists for the given visitId  |

---

## PATCH /billing/invoices/{id}/pay

Mark an invoice as paid. Only PENDING invoices can be marked as paid.

### Request

| Parameter | Type     | Location | Required | Description  |
|-----------|----------|----------|----------|--------------|
| id        | `string` | path     | Yes      | Invoice ID   |

```
PATCH /billing/invoices/inv-001/pay
```

No request body required.

### Response — 200 OK

```json
{
  "id": "inv-001",
  "visitId": "visit-042",
  "patientId": "pat-007",
  "appointmentId": "appt-123",
  "status": "PAID",
  "totalAmount": 350.00,
  "lineItems": [
    {
      "description": "General Consultation",
      "quantity": 1,
      "unitPrice": 150.00,
      "totalPrice": 150.00
    },
    {
      "description": "Blood Test - CBC",
      "quantity": 2,
      "unitPrice": 100.00,
      "totalPrice": 200.00
    }
  ],
  "createdAt": "2026-04-15T09:30:00Z",
  "paidAt": "2026-05-07T14:22:00Z",
  "waivedAt": null,
  "waivedReason": null,
  "invoiceNumber": "INV-2026-001"
}
```

### Error Responses

| Status | Condition                                     |
|--------|-----------------------------------------------|
| 400    | Invoice is not in PENDING status              |
| 401    | Missing or invalid authentication             |
| 403    | Non-admin attempting to mark as paid          |
| 404    | Invoice not found                             |

---

## PATCH /billing/invoices/{id}/waive

Waive an invoice. Only PENDING invoices can be waived. Admin role required.

### Request

| Parameter | Type     | Location | Required | Description         |
|-----------|----------|----------|----------|---------------------|
| id        | `string` | path     | Yes      | Invoice ID          |

```json
PATCH /billing/invoices/inv-002/waive

{
  "reason": "Financial hardship - approved by Dr. Smith"
}
```

| Field  | Type     | Required | Description                  |
|--------|----------|----------|------------------------------|
| reason | `string` | Yes      | Explanation for the waiver   |

### Response — 200 OK

```json
{
  "id": "inv-002",
  "visitId": "visit-055",
  "patientId": "pat-012",
  "appointmentId": null,
  "status": "WAIVED",
  "totalAmount": 200.00,
  "lineItems": [
    {
      "description": "Follow-up Consultation",
      "quantity": 1,
      "unitPrice": 200.00,
      "totalPrice": 200.00
    }
  ],
  "createdAt": "2026-04-20T11:00:00Z",
  "paidAt": null,
  "waivedAt": "2026-05-07T15:00:00Z",
  "waivedReason": "Financial hardship - approved by Dr. Smith",
  "invoiceNumber": "INV-2026-002"
}
```

### Error Responses

| Status | Condition                                     |
|--------|-----------------------------------------------|
| 400    | Invoice is not in PENDING status              |
| 400    | Reason is empty or missing                    |
| 401    | Missing or invalid authentication             |
| 403    | Non-admin attempting to waive invoice         |
| 404    | Invoice not found                             |
