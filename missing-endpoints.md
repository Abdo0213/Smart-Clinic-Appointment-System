# Missing Endpoints — Smart Clinic Appointment System

Endpoints required by the frontend that do NOT exist in the Postman collection or API guide.

---

## 1. Auth — Current User Profile

**Feature:** Auth  
**Endpoint:** Get Current User  
**Suggested Method:** GET  
**Suggested URL:** `/auth/me`  
**Request:** None (uses JWT from Authorization header)  
**Suggested Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "Doctor",
  "firstName": "John",
  "lastName": "Doe",
  "doctorId": "uuid | null",
  "patientId": "uuid | null"
}
```
**Why it's needed:** After login, the frontend receives only a JWT token. There is no endpoint to fetch the current user's profile, role, or linked entity IDs (doctorId, patientId). The frontend needs this to:
- Determine which dashboard to show (role-based routing)
- Know the user's `doctorId` or `patientId` for subsequent API calls
- Display the user's name in the header
- Currently, the only way to get user info is `GET /users/{id}`, but the user doesn't know their own ID from the JWT alone (would need to decode the JWT, which is fragile).

---

## 2. Auth — Refresh Token

**Feature:** Auth  
**Endpoint:** Refresh JWT Token  
**Suggested Method:** POST  
**Suggested URL:** `/auth/refresh`  
**Request:**
```json
{
  "refreshToken": "string"
}
```
**Suggested Response:**
```json
{
  "token": "new-jwt-string",
  "refreshToken": "new-refresh-token-string"
}
```
**Why it's needed:** Requirements specify "JWT + rotating refresh token." The login endpoint returns only an access token with no refresh token. Without a refresh mechanism, the user is logged out when the access token expires. The frontend needs:
- A refresh token returned on login
- An endpoint to exchange refresh token for new access token
- This is critical for session persistence

---

## 3. Auth — Logout / Token Revocation

**Feature:** Auth  
**Endpoint:** Logout (Revoke Token)  
**Suggested Method:** POST  
**Suggested URL:** `/auth/logout`  
**Request:** None (uses JWT from Authorization header)  
**Suggested Response:** `204 No Content`  
**Why it's needed:** Requirements mention "Redis revocation list" and "revoked JWT returning 401 immediately." There is no endpoint for the frontend to call logout that would add the token to the revocation list. Currently, logout can only clear client-side storage, but the token remains valid server-side.

---

## 4. Auth — Account Lockout Status

**Feature:** Auth  
**Endpoint:** Check Account Lockout Status  
**Suggested Method:** GET  
**Suggested URL:** `/auth/lockout-status?email=...`  
**Request:** Query param: `email`  
**Suggested Response:**
```json
{
  "isLocked": true,
  "lockedUntil": "2026-05-07T12:00:00Z",
  "failedAttempts": 5
}
```
**Why it's needed:** Requirements specify "account lockout after 5 failed attempts." The frontend needs to show users why their login failed (wrong password vs. account locked) and when the account will unlock. Currently, the login endpoint returns a generic error with no lockout information.

---

## 5. Patient — Get Current Patient Profile

**Feature:** Patient  
**Endpoint:** Get Current Patient's Own Profile  
**Suggested Method:** GET  
**Suggested URL:** `/patients/me`  
**Request:** None (uses JWT)  
**Suggested Response:** `Patient` object  
**Why it's needed:** Patients need to view their own profile, but currently must know their `patientId` to call `GET /patients/{id}`. There is no way for a patient to discover their own patientId without first calling a "current user" endpoint. This is a convenience alias that significantly simplifies the patient experience.

---

## 6. Patient — Get Patient's Own Invoices

**Feature:** Billing  
**Endpoint:** Get Invoices for Current Patient  
**Suggested Method:** GET  
**Suggested URL:** `/billing/invoices/me` or `/patients/me/invoices`  
**Request:** None (uses JWT); Query: `?status=&page=&size=`  
**Suggested Response:** Paginated `Invoice[]`  
**Why it's needed:** The API guide states patients can view invoices (`GET /billing/invoices/{id}`), but `GET /billing/invoices` is restricted to Admin/Receptionist. There is no way for a patient to list their own invoices. A patient would need to know specific invoice IDs, which they cannot discover.

---

## 7. Doctor — Get Current Doctor Profile

**Feature:** Doctor  
**Endpoint:** Get Current Doctor's Own Profile  
**Suggested Method:** GET  
**Suggested URL:** `/doctors/me`  
**Request:** None (uses JWT)  
**Suggested Response:** `Doctor` object  
**Why it's needed:** Same issue as patients — doctors need to view/edit their own profile but must know their `doctorId`. Without a "current user" endpoint that returns `doctorId`, there is no way for a doctor to discover their own ID.

---

## 8. Doctor — Update/Delete Schedule

**Feature:** Doctor/Schedule  
**Endpoint:** Update Schedule  
**Suggested Method:** PUT  
**Suggested URL:** `/doctors/{doctorId}/schedules/{scheduleId}`  
**Request:**
```json
{
  "date": "YYYY-MM-DD",
  "startTime": "HH:mm:ss",
  "endTime": "HH:mm:ss",
  "slotDuration": 30,
  "price": 100.0,
  "breaks": []
}
```
**Suggested Response:** `Schedule` object  
**Why it's needed:** Doctors can create schedules (`POST /doctors/{id}/schedules`) but there is no endpoint to update or delete an existing schedule. If a doctor makes a mistake or needs to modify availability, they currently have no way to do so. This is a critical workflow gap.

---

## 9. Doctor — Delete Schedule

**Feature:** Doctor/Schedule  
**Endpoint:** Delete Schedule  
**Suggested Method:** DELETE  
**Suggested URL:** `/doctors/{doctorId}/schedules/{scheduleId}`  
**Request:** None  
**Suggested Response:** `204 No Content`  
**Why it's needed:** No way to remove a schedule that was created in error or is no longer relevant. Without this, schedules accumulate indefinitely.

---

## 10. Appointment — Reschedule Appointment

**Feature:** Appointment  
**Endpoint:** Reschedule Appointment  
**Suggested Method:** PATCH  
**Suggested URL:** `/appointments/{id}/reschedule`  
**Request:**
```json
{
  "newSlotDate": "YYYY-MM-DD",
  "newSlotStart": "HH:mm:ss",
  "newSlotEnd": "HH:mm:ss"
}
```
**Suggested Response:** `Appointment` object  
**Why it's needed:** Requirements mention "rescheduling" as a core feature of the Appointment Service. Currently, the only way to reschedule is to cancel the existing appointment and create a new one, which loses the appointment history and audit trail.

---

## 11. Notification — List Notifications

**Feature:** Notification  
**Endpoint:** Get User Notifications  
**Suggested Method:** GET  
**Suggested URL:** `/notifications`  
**Request:** Query: `?page=&size=&isRead=`  
**Suggested Response:**
```json
{
  "content": [
    {
      "id": "uuid",
      "type": "APPOINTMENT_REMINDER_24H",
      "title": "Appointment Reminder",
      "message": "You have an appointment tomorrow at 10:00 AM",
      "isRead": false,
      "createdAt": "ISO8601",
      "metadata": {}
    }
  ],
  "totalPages": 1,
  "totalElements": 5,
  "size": 20,
  "number": 0,
  "first": true,
  "last": true,
  "empty": false
}
```
**Why it's needed:** Requirements specify appointment reminders and status change alerts. There are zero notification endpoints in the API. The frontend notification center cannot function without these.

---

## 12. Notification — Mark Notification as Read

**Feature:** Notification  
**Endpoint:** Mark Notification Read  
**Suggested Method:** PATCH  
**Suggested URL:** `/notifications/{id}/read`  
**Request:** None  
**Suggested Response:** `Notification` object  
**Why it's needed:** Users need to mark individual notifications as read to manage their notification center.

---

## 13. Notification — Mark All Notifications as Read

**Feature:** Notification  
**Endpoint:** Mark All Notifications Read  
**Suggested Method:** PATCH  
**Suggested URL:** `/notifications/read-all`  
**Request:** None  
**Suggested Response:** `{ "updatedCount": 5 }`  
**Why it's needed:** Standard UX pattern — "Mark all as read" button.

---

## 14. Notification — Unread Count

**Feature:** Notification  
**Endpoint:** Get Unread Notification Count  
**Suggested Method:** GET  
**Suggested URL:** `/notifications/unread-count`  
**Request:** None  
**Suggested Response:**
```json
{ "count": 3 }
```
**Why it's needed:** Badge count on notification bell icon. Without this, the frontend must fetch all notifications and count client-side.

---

## 15. Visit — Get Prescription PDF Download URL

**Feature:** Visit  
**Endpoint:** Get Prescription PDF Pre-signed URL  
**Suggested Method:** GET  
**Suggested URL:** `/visits/{id}/prescriptions/{prescriptionId}/pdf`  
**Request:** None  
**Suggested Response:**
```json
{
  "downloadUrl": "https://s3.amazonaws.com/bucket/prescription.pdf?X-Amz-Signature=...",
  "expiresAt": "ISO8601"
}
```
**Why it's needed:** Requirements specify prescriptions are stored in S3 and downloaded via pre-signed URLs. There is no endpoint for the frontend to obtain the pre-signed URL. The frontend cannot directly construct S3 URLs — they must be generated server-side with valid signatures.

---

## 16. Visit — List Prescriptions for a Visit

**Feature:** Visit  
**Endpoint:** Get All Prescriptions for a Visit  
**Suggested Method:** GET  
**Suggested URL:** `/visits/{id}/prescriptions`  
**Request:** None  
**Suggested Response:**
```json
[
  {
    "id": "uuid",
    "medicationName": "Amlodipine",
    "dosage": "5mg",
    "frequency": "Once daily",
    "durationDays": 30,
    "notes": "Take in the morning",
    "createdAt": "ISO8601"
  }
]
```
**Why it's needed:** Prescriptions are created via `POST /visits/{id}/prescriptions` but there is no GET endpoint to list or retrieve them. After creating a prescription, there is no way to display it. The Visit response shape does not include prescriptions.

---

## 17. Patient — Visit History

**Feature:** Visit  
**Endpoint:** Get Patient's Visit History  
**Suggested Method:** GET  
**Suggested URL:** `/patients/{id}/visits` or add `patientId` filter to `GET /visits`  
**Request:** Query: `?page=&size=`  
**Suggested Response:** Paginated `Visit[]`  
**Why it's needed:** `GET /visits` currently only supports `doctorId` filter (based on Postman collection). Patients need to see their own visit history. While the API guide mentions `GET /visits` with a `patientId` filter, the Postman collection only tests with `doctorId`. If `patientId` filter already works on `GET /visits`, this can be removed from missing endpoints — needs backend confirmation.

---

## 18. Waitlist — Query Waitlist Position

**Feature:** Appointment  
**Endpoint:** Get Waitlist Status for Appointment  
**Suggested Method:** GET  
**Suggested URL:** `/appointments/{id}/waitlist`  
**Request:** None  
**Suggested Response:**
```json
{
  "position": 2,
  "estimatedSlotTime": "HH:mm:ss",
  "entries": [
    { "patientId": "uuid", "position": 1, "createdAt": "ISO8601" }
  ]
}
```
**Why it's needed:** Patients can join a waitlist via `POST /appointments/{id}/waitlist`, but there is no way to check their position or get notified when a slot opens. The frontend cannot display waitlist status without this endpoint.

---

## 19. Admin — Dashboard Summary (Aggregated)

**Feature:** Admin  
**Endpoint:** Get Dashboard Summary  
**Suggested Method:** GET  
**Suggested URL:** `/admin/dashboard`  
**Request:** Query: `?date=YYYY-MM-DD`  
**Suggested Response:**
```json
{
  "todayAppointments": 12,
  "todayCompleted": 8,
  "todayCancelled": 1,
  "todayNoShow": 0,
  "averageUtilization": 78.5,
  "noShowRate": 8.2,
  "todayRevenue": 4500.00,
  "pendingInvoices": 15,
  "totalPatients": 230,
  "activeDoctors": 5
}
```
**Why it's needed:** The admin dashboard needs a single endpoint to fetch all key metrics at once. Currently, the frontend would need to make 6+ separate API calls (`/admin/reports/appointments`, `/admin/reports/revenue`, etc.) just to populate the dashboard cards. A single aggregated endpoint reduces latency and simplifies the UI.

---

## Summary: 19 Missing Endpoints

| Priority | Endpoint | Feature | Impact |
|----------|----------|---------|--------|
| **P0 — Critical** | `GET /auth/me` | Auth | Cannot determine user role/identity after login |
| **P0 — Critical** | `POST /auth/refresh` | Auth | Cannot maintain sessions beyond token expiry |
| **P0 — Critical** | `GET /visits/{id}/prescriptions/{prescriptionId}/pdf` | Visit | Cannot download prescription PDFs |
| **P0 — Critical** | `GET /visits/{id}/prescriptions` | Visit | Cannot display created prescriptions |
| **P1 — High** | `POST /auth/logout` | Auth | Token not revoked server-side on logout |
| **P1 — High** | `GET /billing/invoices/me` | Billing | Patients cannot see their invoices |
| **P1 — High** | `PUT /doctors/{id}/schedules/{scheduleId}` | Schedule | Cannot modify existing schedules |
| **P1 — High** | `DELETE /doctors/{id}/schedules/{scheduleId}` | Schedule | Cannot remove schedules |
| **P1 — High** | `PATCH /appointments/{id}/reschedule` | Appointment | Cannot reschedule (reqs specify this) |
| **P1 — High** | `GET /admin/dashboard` | Admin | Dashboard requires 6+ API calls |
| **P2 — Medium** | `GET /patients/me` | Patient | Convenience — can workaround with `/auth/me` |
| **P2 — Medium** | `GET /doctors/me` | Doctor | Convenience — can workaround with `/auth/me` |
| **P2 — Medium** | `GET /notifications` | Notification | No notification functionality |
| **P2 — Medium** | `PATCH /notifications/{id}/read` | Notification | No notification management |
| **P2 — Medium** | `PATCH /notifications/read-all` | Notification | No notification management |
| **P2 — Medium** | `GET /notifications/unread-count` | Notification | No notification badge |
| **P2 — Medium** | `GET /appointments/{id}/waitlist` | Appointment | Cannot show waitlist position |
| **P3 — Low** | `GET /auth/lockout-status` | Auth | Can show generic error instead |
| **P3 — Low** | `GET /patients/{id}/visits` | Visit | May already work via `GET /visits?patientId=` |
