# Visit API Contracts

Base URL: `/api/v1`

## List Visits

```
GET /visits?doctorId=&patientId=&page=&size=
```

### Query Parameters

| Parameter | Type   | Required | Description                  |
|-----------|--------|----------|------------------------------|
| doctorId  | string | No       | Filter by doctor ID          |
| patientId | string | No       | Filter by patient ID         |
| page      | number | No       | Page number (default: 0)     |
| size      | number | No       | Page size (default: 20)      |

### Response 200

```json
{
  "content": [
    {
      "id": "v-001",
      "appointmentId": "a-001",
      "patientId": "p-001",
      "doctorId": "d-001",
      "chiefComplaint": "Persistent headache for 5 days",
      "examinationFindings": "Tenderness in frontal sinus area, no neurological deficits",
      "assessment": "Tension-type headache",
      "plan": "Rest, hydration, OTC analgesics, follow-up in 1 week",
      "icd10Codes": ["G44.209"],
      "isSigned": true,
      "signedAt": "2026-04-15T11:30:00Z",
      "prescriptions": [
        {
          "id": "rx-001",
          "visitId": "v-001",
          "medicationName": "Ibuprofen",
          "dosage": "400mg",
          "frequency": "Every 6 hours as needed",
          "durationDays": 7,
          "notes": "Take with food",
          "createdAt": "2026-04-15T11:20:00Z"
        }
      ],
      "createdAt": "2026-04-15T10:00:00Z",
      "updatedAt": "2026-04-15T11:30:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

## Create Visit

```
POST /visits
```

### Request Body

```json
{
  "appointmentId": "a-001",
  "chiefComplaint": "Persistent headache for 5 days",
  "examinationFindings": "Tenderness in frontal sinus area",
  "assessment": "Tension-type headache",
  "plan": "Rest, hydration, OTC analgesics",
  "icd10Codes": ["G44.209"]
}
```

### Response 201

```json
{
  "id": "v-002",
  "appointmentId": "a-001",
  "patientId": "p-001",
  "doctorId": "d-001",
  "chiefComplaint": "Persistent headache for 5 days",
  "examinationFindings": "Tenderness in frontal sinus area",
  "assessment": "Tension-type headache",
  "plan": "Rest, hydration, OTC analgesics",
  "icd10Codes": ["G44.209"],
  "isSigned": false,
  "signedAt": null,
  "prescriptions": [],
  "createdAt": "2026-04-15T10:00:00Z",
  "updatedAt": "2026-04-15T10:00:00Z"
}
```

### Response 400

```json
{
  "error": "VALIDATION_ERROR",
  "message": "chiefComplaint is required",
  "fields": ["chiefComplaint"]
}
```

### Response 409

```json
{
  "error": "CONFLICT",
  "message": "A visit already exists for appointment a-001"
}
```

## Get Visit

```
GET /visits/{id}
```

### Path Parameters

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| id        | string | Yes      | Visit ID       |

### Response 200

```json
{
  "id": "v-001",
  "appointmentId": "a-001",
  "patientId": "p-001",
  "doctorId": "d-001",
  "chiefComplaint": "Persistent headache for 5 days",
  "examinationFindings": "Tenderness in frontal sinus area, no neurological deficits",
  "assessment": "Tension-type headache",
  "plan": "Rest, hydration, OTC analgesics, follow-up in 1 week",
  "icd10Codes": ["G44.209"],
  "isSigned": true,
  "signedAt": "2026-04-15T11:30:00Z",
  "prescriptions": [
    {
      "id": "rx-001",
      "visitId": "v-001",
      "medicationName": "Ibuprofen",
      "dosage": "400mg",
      "frequency": "Every 6 hours as needed",
      "durationDays": 7,
      "notes": "Take with food",
      "createdAt": "2026-04-15T11:20:00Z"
    }
  ],
  "createdAt": "2026-04-15T10:00:00Z",
  "updatedAt": "2026-04-15T11:30:00Z"
}
```

### Response 404

```json
{
  "error": "NOT_FOUND",
  "message": "Visit not found"
}
```

## Sign Visit

```
POST /visits/{id}/sign
```

### Path Parameters

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| id        | string | Yes      | Visit ID       |

### Request Body

```json
{
  "additionalItems": [
    {
      "description": "X-Ray - Skull",
      "quantity": 1,
      "unitPrice": 150.00
    }
  ]
}
```

### Response 200

```json
{
  "id": "v-001",
  "appointmentId": "a-001",
  "patientId": "p-001",
  "doctorId": "d-001",
  "chiefComplaint": "Persistent headache for 5 days",
  "examinationFindings": "Tenderness in frontal sinus area, no neurological deficits",
  "assessment": "Tension-type headache",
  "plan": "Rest, hydration, OTC analgesics, follow-up in 1 week",
  "icd10Codes": ["G44.209"],
  "isSigned": true,
  "signedAt": "2026-04-15T11:30:00Z",
  "prescriptions": [
    {
      "id": "rx-001",
      "visitId": "v-001",
      "medicationName": "Ibuprofen",
      "dosage": "400mg",
      "frequency": "Every 6 hours as needed",
      "durationDays": 7,
      "notes": "Take with food",
      "createdAt": "2026-04-15T11:20:00Z"
    }
  ],
  "createdAt": "2026-04-15T10:00:00Z",
  "updatedAt": "2026-04-15T11:30:00Z"
}
```

### Response 400

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Visit is already signed",
  "fields": []
}
```

### Response 422

```json
{
  "error": "UNPROCESSABLE_ENTITY",
  "message": "Cannot sign visit: required fields missing",
  "fields": ["assessment", "plan"]
}
```

## Add Prescription

```
POST /visits/{id}/prescriptions
```

### Path Parameters

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| id        | string | Yes      | Visit ID       |

### Request Body

```json
{
  "medicationName": "Amoxicillin",
  "dosage": "500mg",
  "frequency": "Three times daily",
  "durationDays": 10,
  "notes": "Complete full course"
}
```

### Response 201

```json
{
  "id": "rx-002",
  "visitId": "v-001",
  "medicationName": "Amoxicillin",
  "dosage": "500mg",
  "frequency": "Three times daily",
  "durationDays": 10,
  "notes": "Complete full course",
  "createdAt": "2026-04-15T11:25:00Z"
}
```

### Response 403

```json
{
  "error": "FORBIDDEN",
  "message": "Cannot add prescriptions to a signed visit"
}
```

## Schedule Follow-up

```
POST /visits/{id}/follow-up
```

### Path Parameters

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| id        | string | Yes      | Visit ID       |

### Request Body

```json
{
  "date": "2026-04-22",
  "time": "09:00",
  "reason": "Follow-up for tension headache"
}
```

### Response 201

```json
{
  "id": "a-050",
  "patientId": "p-001",
  "doctorId": "d-001",
  "date": "2026-04-22",
  "time": "09:00",
  "status": "scheduled",
  "reason": "Follow-up for tension headache",
  "sourceVisitId": "v-001",
  "createdAt": "2026-04-15T11:35:00Z"
}
```

### Response 400

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Follow-up date must be in the future",
  "fields": ["date"]
}
```

## Download Prescription PDF

```
GET /visits/{id}/prescriptions/pdf
```

### Response 200

```json
{
  "downloadUrl": "https://s3.amazonaws.com/bucket/prescriptions/rx-v001.pdf?X-Amz-Expires=900&X-Amz-Signature=...",
  "expiresAt": "2026-04-15T12:05:00Z"
}
```

### Response 404

```json
{
  "error": "NOT_FOUND",
  "message": "No prescriptions found for this visit"
}
```
