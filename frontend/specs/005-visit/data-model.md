# Visit Feature — Data Model

## Visit

```typescript
interface Visit {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  chiefComplaint: string;
  examinationFindings: string;
  assessment: string;
  plan: string;
  icd10Codes: string[];
  isSigned: boolean;
  signedAt: string | null;
  prescriptions: Prescription[];
  createdAt: string;
  updatedAt: string;
}
```

| Field                 | Type               | Required | Description                                      |
|-----------------------|--------------------|----------|--------------------------------------------------|
| id                    | string (UUID)      | Yes      | Unique visit identifier                           |
| appointmentId         | string (UUID)      | Yes      | Linked appointment                                |
| patientId             | string (UUID)      | Yes      | Patient who the visit belongs to                  |
| doctorId              | string (UUID)      | Yes      | Doctor who created the visit                      |
| chiefComplaint        | string             | Yes      | Patient's primary complaint                       |
| examinationFindings   | string             | Yes      | Physical examination observations                 |
| assessment            | string             | Yes      | Clinical assessment / diagnosis summary           |
| plan                  | string             | Yes      | Treatment plan                                    |
| icd10Codes            | string[]           | No       | List of ICD-10 diagnostic codes                   |
| isSigned              | boolean            | Yes      | Whether the visit has been finalized              |
| signedAt              | string (ISO 8601)  | No       | Timestamp when the visit was signed               |
| prescriptions         | Prescription[]     | No       | Prescriptions issued during the visit             |
| createdAt             | string (ISO 8601)  | Yes      | Record creation timestamp                         |
| updatedAt             | string (ISO 8601)  | Yes      | Record last update timestamp                      |

## Prescription

```typescript
interface Prescription {
  id: string;
  visitId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  notes: string;
  createdAt: string;
}
```

| Field           | Type               | Required | Description                                |
|-----------------|--------------------|----------|--------------------------------------------|
| id              | string (UUID)      | Yes      | Unique prescription identifier              |
| visitId         | string (UUID)      | Yes      | Parent visit                                |
| medicationName  | string             | Yes      | Name of the medication                      |
| dosage          | string             | Yes      | Dosage amount (e.g., "500mg")              |
| frequency       | string             | Yes      | Dosing frequency (e.g., "Twice daily")     |
| durationDays    | number             | Yes      | Number of days for the prescription         |
| notes           | string             | No       | Additional instructions or notes            |
| createdAt       | string (ISO 8601)  | Yes      | Record creation timestamp                   |

## SignVisitRequest

```typescript
interface SignVisitRequest {
  additionalItems: BillingLineItemInput[];
}

interface BillingLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}
```

| Field                        | Type     | Required | Description                                  |
|------------------------------|----------|----------|----------------------------------------------|
| additionalItems              | array    | No       | Extra billable items to add during signing   |
| additionalItems[].description| string   | Yes      | Description of the billing item              |
| additionalItems[].quantity   | number   | Yes      | Quantity of the item                         |
| additionalItems[].unitPrice  | number   | Yes      | Price per unit                               |

## BillingLineItem

```typescript
interface BillingLineItem {
  id: string;
  visitId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
```

| Field        | Type          | Required | Description                          |
|--------------|---------------|----------|--------------------------------------|
| id           | string (UUID) | Yes      | Unique billing item identifier       |
| visitId      | string (UUID) | Yes      | Parent visit                         |
| description  | string        | Yes      | Description of the billing item      |
| quantity     | number        | Yes      | Quantity of the item                 |
| unitPrice    | number        | Yes      | Price per unit                       |
| totalPrice   | number        | Yes      | Computed: quantity * unitPrice       |

## CreateVisitRequest

```typescript
interface CreateVisitRequest {
  appointmentId: string;
  chiefComplaint: string;
  examinationFindings: string;
  assessment: string;
  plan: string;
  icd10Codes: string[];
}
```

| Field               | Type     | Required | Description                                |
|---------------------|----------|----------|--------------------------------------------|
| appointmentId       | string   | Yes      | The appointment to create the visit from   |
| chiefComplaint      | string   | Yes      | Patient's primary complaint                |
| examinationFindings | string   | Yes      | Physical examination observations          |
| assessment          | string   | Yes      | Clinical assessment / diagnosis summary    |
| plan                | string   | Yes      | Treatment plan                             |
| icd10Codes          | string[] | No       | ICD-10 diagnostic codes                    |

## Enum: VisitStatus (derived)

| Value  | Condition                    |
|--------|------------------------------|
| draft  | isSigned === false           |
| signed | isSigned === true            |
