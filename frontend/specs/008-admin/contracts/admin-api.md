# Admin API Contracts

Base URL: `http://localhost:8080/api`

All endpoints require `Authorization: Bearer <JWT>` with **Admin** role.

---

## GET /admin/reports/appointments

Aggregated appointment statistics.

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | `string` | No | Start date (YYYY-MM-DD). Defaults to 30 days ago |
| `to` | `string` | No | End date (YYYY-MM-DD). Defaults to today |

### Response — `200 OK`

```json
{
  "totalAppointments": 500,
  "completed": 400,
  "cancelled": 50,
  "noShow": 50,
  "byDoctor": [
    {
      "doctorId": "uuid-string",
      "doctorName": "Dr. John Smith",
      "total": 100,
      "utilizationPercent": 85.0
    }
  ]
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | Missing or invalid JWT |
| `403` | Non-admin role |

---

## GET /admin/reports/revenue

Revenue and collection reports.

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | `string` | No | Start date (YYYY-MM-DD) |
| `to` | `string` | No | End date (YYYY-MM-DD) |

### Response — `200 OK`

```json
{
  "period": {
    "from": "2026-01-01",
    "to": "2026-12-31"
  },
  "totalBilled": 50000.00,
  "totalCollected": 45000.00,
  "totalWaived": 1000.00,
  "pending": 4000.00,
  "records": [
    {
      "date": "2026-01-15",
      "billed": 1500.00,
      "collected": 1350.00
    }
  ]
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | Missing or invalid JWT |
| `403` | Non-admin role |

---

## GET /admin/reports/visits

Clinical visit volume reports.

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | `string` | No | Start date (YYYY-MM-DD) |
| `to` | `string` | No | End date (YYYY-MM-DD) |

### Response — `200 OK`

> **Note:** Response shape is provisional — backend has not documented this endpoint's response structure.

```json
{
  "period": { "from": "2026-01-01", "to": "2026-12-31" },
  "totalVisits": 320,
  "signedVisits": 280,
  "unsignedVisits": 40,
  "byDoctor": [
    {
      "doctorId": "uuid-string",
      "doctorName": "Dr. Smith",
      "visitCount": 80
    }
  ]
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | Missing or invalid JWT |
| `403` | Non-admin role |

---

## GET /admin/reports/doctors

Doctor utilization and statistics.

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | `string` | No | Start date (YYYY-MM-DD) |
| `to` | `string` | No | End date (YYYY-MM-DD) |

### Response — `200 OK`

> **Note:** Response shape is provisional — backend has not documented this endpoint's response structure.

```json
{
  "period": { "from": "2026-01-01", "to": "2026-12-31" },
  "totalDoctors": 10,
  "activeDoctors": 8,
  "inactiveDoctors": 2,
  "doctors": [
    {
      "doctorId": "uuid-string",
      "doctorName": "Dr. Smith",
      "specialization": "Cardiology",
      "appointmentCount": 100,
      "completedCount": 85,
      "utilizationPercent": 85.0,
      "isActive": true
    }
  ]
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | Missing or invalid JWT |
| `403` | Non-admin role |

---

## GET /admin/reports/patients

Patient demographics report.

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | `string` | No | Start date (YYYY-MM-DD) |
| `to` | `string` | No | End date (YYYY-MM-DD) |

### Response — `200 OK`

> **Note:** Response shape is provisional — backend has not documented this endpoint's response structure.

```json
{
  "period": { "from": "2026-01-01", "to": "2026-12-31" },
  "totalPatients": 250,
  "newPatients": 45,
  "returningPatients": 205,
  "byGender": { "Male": 120, "Female": 125, "Other": 5 },
  "byInsurance": [
    { "provider": "HealthCare Inc", "count": 80 }
  ]
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | Missing or invalid JWT |
| `403` | Non-admin role |

---

## GET /admin/reports/no-show-rate

No-show rate analysis.

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | `string` | No | Start date (YYYY-MM-DD) |
| `to` | `string` | No | End date (YYYY-MM-DD) |

### Response — `200 OK`

> **Note:** Response shape is provisional — backend has not documented this endpoint's response structure.

```json
{
  "period": { "from": "2026-01-01", "to": "2026-12-31" },
  "overallNoShowRate": 10.0,
  "totalNoShows": 50,
  "totalAppointments": 500,
  "byDoctor": [
    {
      "doctorId": "uuid-string",
      "doctorName": "Dr. Smith",
      "noShowCount": 5,
      "totalAppointments": 100,
      "noShowRate": 5.0
    }
  ],
  "trend": [
    {
      "date": "2026-01-15",
      "noShowRate": 8.5
    }
  ]
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | Missing or invalid JWT |
| `403` | Non-admin role |

---

## GET /admin/reports/export

Export a report to CSV format as a downloadable file.

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `reportType` | `string` | Yes | One of: `appointments`, `revenue`, `visits`, `doctors`, `patients`, `no-show-rate` |
| `from` | `string` | No | Start date (YYYY-MM-DD) |
| `to` | `string` | No | End date (YYYY-MM-DD) |

### Response — `200 OK`

- **Content-Type:** `text/csv`
- **Content-Disposition:** `attachment; filename="{reportType}-report.csv"`
- **Body:** Raw CSV binary blob

### Frontend Handling

```typescript
const response = await apiClient.get("/admin/reports/export", {
  params: { reportType, from, to },
  responseType: "blob",
});

const url = URL.createObjectURL(response.data);
const link = document.createElement("a");
link.href = url;
link.download = `${reportType}-report.csv`;
link.click();
URL.revokeObjectURL(url);
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `400` | Missing or invalid `reportType` |
| `401` | Missing or invalid JWT |
| `403` | Non-admin role |

---

## GET /admin/audit-log

View system audit logs (security and PHI access tracking).

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | `number` | No | Zero-indexed page number. Default: `0` |
| `size` | `number` | No | Page size. Default: `20` |

### Response — `200 OK`

```json
{
  "content": [
    {
      "id": "uuid-string",
      "actor": "admin@clinic.com",
      "action": "VIEW",
      "resource": "Patient",
      "timestamp": "2026-05-07T10:30:00",
      "details": "Viewed patient record for Jane Smith"
    }
  ],
  "totalPages": 25,
  "totalElements": 500,
  "size": 20,
  "number": 0,
  "first": true,
  "last": false,
  "empty": false
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | Missing or invalid JWT |
| `403` | Non-admin role |

---

## PATCH /admin/doctors/{id}/status

Activate or deactivate a doctor profile. This is the admin-specific endpoint (preferred over `PATCH /doctors/{id}/status`).

### Path Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Doctor UUID |

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `isActive` | `boolean` | Yes | `true` to activate, `false` to deactivate |

### Request Body

None.

### Response — `200 OK`

```json
{
  "id": "uuid",
  "userId": "auth-uuid",
  "firstName": "John",
  "lastName": "Doe",
  "specialization": "Cardiology",
  "bio": "Experienced cardiologist...",
  "phone": "+1234567890",
  "isActive": false,
  "createdAt": "2026-05-05T12:00:00"
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | Missing or invalid JWT |
| `403` | Non-admin role |
| `404` | Doctor not found |

---

## User Management Endpoints

User CRUD is served via the Identity Service through the API Gateway.

### GET /users

List all users (paginated).

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | `number` | No | Zero-indexed page. Default: `0` |
| `size` | `number` | No | Page size. Default: `20` |

Response: Standard paginated `User[]`.

### POST /users

Create a new user (staff/doctor).

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@clinic.com",
  "password": "StrongPassword123!",
  "role": "Doctor",
  "specialization": "Neurology"
}
```

Response: `201 Created` → `User`

### PUT /users/{id}

Update user details.

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@clinic.com",
  "role": "Doctor",
  "specialization": "Cardiology"
}
```

Response: `200 OK` → `User`

### DELETE /users/{id}

Delete a user.

Response: `204 No Content`
