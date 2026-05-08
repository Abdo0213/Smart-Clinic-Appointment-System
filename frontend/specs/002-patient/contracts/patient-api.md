# Patient API Contracts

Base URL: `http://localhost:8080/api`

## POST /patients

Create a new patient profile.

### Request

```
POST /patients
Content-Type: application/json
```

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "phone": "+1234567890",
  "address": "123 Main St, Springfield",
  "bloodType": "O+",
  "knownAllergies": "Penicillin",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "+1234567891",
  "insuranceProvider": "HealthCo",
  "insuranceNumber": "HC-12345"
}
```

### Response — 201 Created

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "phone": "+1234567890",
  "address": "123 Main St, Springfield",
  "bloodType": "O+",
  "knownAllergies": "Penicillin",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "+1234567891",
  "insuranceProvider": "HealthCo",
  "insuranceNumber": "HC-12345",
  "createdAt": "2026-05-07T10:30:00Z"
}
```

### Response — 400 Bad Request

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "firstName", "message": "First name is required" },
    { "field": "phone", "message": "Invalid phone number format" }
  ]
}
```

### Response — 422 Unprocessable Entity

```json
{
  "message": "A patient with this phone number already exists",
  "errors": [
    { "field": "phone", "message": "Phone number must be unique" }
  ]
}
```

---

## GET /patients/{id}

Retrieve a single patient by ID.

### Request

```
GET /patients/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Response — 200 OK

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "phone": "+1234567890",
  "address": "123 Main St, Springfield",
  "bloodType": "O+",
  "knownAllergies": "Penicillin",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "+1234567891",
  "insuranceProvider": "HealthCo",
  "insuranceNumber": "HC-12345",
  "createdAt": "2026-05-07T10:30:00Z"
}
```

### Response — 404 Not Found

```json
{
  "message": "Patient not found"
}
```

---

## GET /patients

Retrieve a paginated, filtered list of patients.

### Request

```
GET /patients?name=John&phone=&page=0&size=10
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| name | string | No | "" | Filter by firstName or lastName (partial match, case-insensitive) |
| phone | string | No | "" | Filter by phone (partial match) |
| page | number | No | 0 | Page number (0-indexed) |
| size | number | No | 10 | Page size (10, 20, or 50) |

### Response — 200 OK

```json
{
  "content": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-05-15",
      "gender": "male",
      "phone": "+1234567890",
      "address": "123 Main St, Springfield",
      "bloodType": "O+",
      "knownAllergies": "Penicillin",
      "emergencyContact": "Jane Doe",
      "emergencyPhone": "+1234567891",
      "insuranceProvider": "HealthCo",
      "insuranceNumber": "HC-12345",
      "createdAt": "2026-05-07T10:30:00Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

### Empty Result — 200 OK

```json
{
  "content": [],
  "page": 0,
  "size": 10,
  "totalElements": 0,
  "totalPages": 0,
  "last": true
}
```

---

## PUT /patients/{id}

Update an existing patient profile.

### Request

```
PUT /patients/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Content-Type: application/json
```

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1987654321",
  "address": "456 Oak Ave, Shelbyville",
  "knownAllergies": "Penicillin, Aspirin"
}
```

### Response — 200 OK

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "phone": "+1987654321",
  "address": "456 Oak Ave, Shelbyville",
  "bloodType": "O+",
  "knownAllergies": "Penicillin, Aspirin",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "+1234567891",
  "insuranceProvider": "HealthCo",
  "insuranceNumber": "HC-12345",
  "createdAt": "2026-05-07T10:30:00Z"
}
```

### Response — 400 Bad Request

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "phone", "message": "Invalid phone number format" }
  ]
}
```

### Response — 404 Not Found

```json
{
  "message": "Patient not found"
}
```

### Response — 403 Forbidden

```json
{
  "message": "You do not have permission to edit this patient profile"
}
```
