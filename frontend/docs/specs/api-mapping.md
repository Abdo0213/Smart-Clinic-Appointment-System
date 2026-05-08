# API Mapping — Smart Clinic Appointment System

Base URL: `http://localhost:8080/api`

All secured endpoints require `Authorization: Bearer <JWT>` header.

---

## 1. Authentication & Identity

| # | Method | Endpoint | Auth | Request Body | Response | Feature |
|---|--------|----------|------|-------------|----------|---------|
| A1 | POST | `/auth/login` | Public | `{ email, password }` | `{ token }` | Auth |
| A2 | POST | `/auth/register` | Public | `{ email, password, firstName, lastName }` | `{ token }` | Auth |
| A3 | POST | `/users` | Admin | `{ firstName, lastName, email, password, role, specialization? }` | `User` | Auth |
| A4 | GET | `/users` | Admin | — | Paginated `User[]` | Auth |
| A5 | GET | `/users/{id}` | Admin | — | `User` | Auth |
| A6 | PUT | `/users/{id}` | Admin | `Partial<User>` | `User` | Auth |
| A7 | DELETE | `/users/{id}` | Admin | — | `void` | Auth |

---

## 2. Doctors & Schedules

| # | Method | Endpoint | Auth | Query Params | Request Body | Response | Feature |
|---|--------|----------|------|-------------|-------------|----------|---------|
| D1 | GET | `/doctors` | Doctor, Admin, Receptionist | `?specialization=&isActive=&page=&size=` | — | Paginated `Doctor[]` | Doctor |
| D2 | GET | `/doctors/{id}` | Doctor, Admin, Receptionist | — | — | `Doctor` | Doctor |
| D3 | PUT | `/doctors/{id}` | Doctor (own), Admin | — | `{ specialization?, bio?, phone? }` | `Doctor` | Doctor |
| D4 | PATCH | `/doctors/{id}/status?isActive=true/false` | Admin | `?isActive=` | — | `Doctor` | Doctor |
| D5 | GET | `/doctors/{id}/schedules` | Doctor, Admin, Receptionist | — | — | `Schedule[]` | Schedule |
| D6 | POST | `/doctors/{id}/schedules` | Doctor (own), Admin | — | `{ date, startTime, endTime, slotDuration, price, breaks[] }` | `Schedule` | Schedule |
| D7 | GET | `/doctors/{id}/slots?date=YYYY-MM-DD` | All roles | `?date=` | — | `{ doctorId, date, slots[] }` | Schedule |

---

## 3. Patients

| # | Method | Endpoint | Auth | Query Params | Request Body | Response | Feature |
|---|--------|----------|------|-------------|-------------|----------|---------|
| P1 | GET | `/patients` | Doctor, Admin, Receptionist | `?name=&phone=&page=&size=` | — | Paginated `Patient[]` | Patient |
| P2 | GET | `/patients/{id}` | Patient (own), Doctor, Admin, Receptionist | — | — | `Patient` | Patient |
| P3 | POST | `/patients` | Patient, Receptionist, Admin | — | `{ firstName, lastName, dateOfBirth, gender, phone, address, bloodType, knownAllergies, emergencyContact, emergencyPhone, insuranceProvider, insuranceNumber }` | `Patient` | Patient |
| P4 | PUT | `/patients/{id}` | Patient (own), Receptionist, Admin | — | `Partial<Patient>` | `Patient` | Patient |

---

## 4. Appointments

| # | Method | Endpoint | Auth | Query Params | Request Body | Response | Feature |
|---|--------|----------|------|-------------|-------------|----------|---------|
| AP1 | GET | `/appointments` | All roles | `?patientId=&doctorId=&date=&status=&page=&size=` | — | Paginated `Appointment[]` | Appointment |
| AP2 | POST | `/appointments` | Patient, Receptionist, Admin | — | `{ patientId, doctorId, slotDate, slotStart, slotEnd }` | `Appointment` | Appointment |
| AP3 | GET | `/appointments/{id}` | All roles | — | — | `Appointment` | Appointment |
| AP4 | PATCH | `/appointments/{id}/status` | Doctor, Receptionist, Admin | — | `{ status }` | `Appointment` | Appointment |
| AP5 | DELETE | `/appointments/{id}` | Patient (own), Receptionist, Admin | — | `{ reason }` | `void` | Appointment |
| AP6 | POST | `/appointments/{id}/waitlist` | Patient, Receptionist, Admin | — | — | `WaitlistEntry` | Appointment |

---

## 5. Visits & Clinical Records

| # | Method | Endpoint | Auth | Request Body | Response | Feature |
|---|--------|----------|------|-------------|----------|---------|
| V1 | GET | `/visits` | Doctor, Admin | Query: `?doctorId=&patientId=&page=&size=` | Paginated `Visit[]` | Visit |
| V2 | POST | `/visits` | Doctor, Admin | `{ appointmentId, chiefComplaint, examinationFindings, assessment, plan, icd10Codes }` | `Visit` | Visit |
| V3 | GET | `/visits/{id}` | Doctor, Admin | — | `Visit` | Visit |
| V4 | POST | `/visits/{id}/sign` | Doctor | `{ additionalItems[] }` | `Visit` | Visit |
| V5 | POST | `/visits/{id}/prescriptions` | Doctor | `{ medicationName, dosage, frequency, durationDays, notes }` | `Prescription` | Visit |
| V6 | POST | `/visits/{id}/follow-up` | Doctor | `{ patientId, doctorId, slotDate, slotStart, slotEnd }` | `Appointment` | Visit |

---

## 6. Billing

| # | Method | Endpoint | Auth | Query Params | Request Body | Response | Feature |
|---|--------|----------|------|-------------|-------------|----------|---------|
| B1 | GET | `/billing/invoices` | Admin, Receptionist | `?patientId=&status=&page=&size=` | — | Paginated `Invoice[]` | Billing |
| B2 | GET | `/billing/invoices/{id}` | Admin, Receptionist, Patient | — | — | `Invoice` | Billing |
| B3 | POST | `/billing/invoices` | Admin, Receptionist | — | `{ visitId, patientId, appointmentId, lineItems[] }` | `Invoice` | Billing |
| B4 | PATCH | `/billing/invoices/{id}/pay` | Admin, Receptionist | — | — | `Invoice` | Billing |
| B5 | PATCH | `/billing/invoices/{id}/waive` | Admin | — | — | `Invoice` | Billing |

---

## 7. Admin Reports & Dashboard

| # | Method | Endpoint | Auth | Query Params | Response | Feature |
|---|--------|----------|------|-------------|----------|---------|
| R1 | GET | `/admin/reports/appointments` | Admin | `?from=&to=` | `AppointmentsReport` | Admin |
| R2 | GET | `/admin/reports/revenue` | Admin | `?from=&to=` | `RevenueReport` | Admin |
| R3 | GET | `/admin/reports/visits` | Admin | `?from=&to=` | `VisitsReport` | Admin |
| R4 | GET | `/admin/reports/doctors` | Admin | `?from=&to=` | `DoctorsReport` | Admin |
| R5 | GET | `/admin/reports/patients` | Admin | `?from=&to=` | `PatientsReport` | Admin |
| R6 | GET | `/admin/reports/no-show-rate` | Admin | `?from=&to=` | `NoShowReport` | Admin |
| R7 | GET | `/admin/reports/export` | Admin | `?reportType=&from=&to=` | CSV file (blob) | Admin |
| R8 | GET | `/admin/audit-log` | Admin | `?page=&size=` | Paginated `AuditLogEntry[]` | Admin |
| R9 | PATCH | `/admin/doctors/{id}/status` | Admin | `?isActive=true/false` | `Doctor` | Admin |

---

## Response Shapes Reference

### Paginated Response (all list endpoints)
```json
{
  "content": [],
  "totalPages": 5,
  "totalElements": 100,
  "size": 20,
  "number": 0,
  "first": true,
  "last": false,
  "empty": false
}
```

### User
```json
{ "id": "uuid", "email": "string", "userName": "string", "role": "Admin|Doctor|Receptionist|Patient" }
```

### Doctor
```json
{ "id": "uuid", "userId": "uuid", "firstName": "string", "lastName": "string", "specialization": "string", "bio": "string", "phone": "string", "isActive": true, "createdAt": "ISO8601" }
```

### Patient
```json
{ "id": "uuid", "firstName": "string", "lastName": "string", "dateOfBirth": "YYYY-MM-DD", "gender": "MALE|FEMALE|OTHER", "phone": "string", "address": "string", "bloodType": "string", "knownAllergies": "string", "emergencyContact": "string", "emergencyPhone": "string", "insuranceProvider": "string", "insuranceNumber": "string", "createdAt": "ISO8601" }
```

### Appointment
```json
{ "id": "uuid", "patientId": "uuid", "doctorId": "uuid", "slotDate": "YYYY-MM-DD", "slotStart": "HH:mm:ss", "slotEnd": "HH:mm:ss", "status": "BOOKED|ARRIVED|COMPLETED|CANCELLED|NO_SHOW", "price": 100.0, "bookedBy": "uuid", "createdAt": "ISO8601" }
```

### Visit
```json
{ "id": "uuid", "appointmentId": "uuid", "patientId": "uuid", "doctorId": "uuid", "chiefComplaint": "string", "examinationFindings": "string", "assessment": "string", "plan": "string", "icd10Codes": "string", "isSigned": true, "signedAt": "ISO8601|null" }
```

### Invoice
```json
{ "id": "uuid", "visitId": "uuid", "patientId": "uuid", "status": "PENDING|PAID|WAIVED", "totalAmount": 150.0, "lineItems": [{ "description": "string", "quantity": 1, "unitPrice": 100.0, "totalPrice": 100.0 }], "createdAt": "ISO8601", "paidAt": "ISO8601|null" }
```

### Slot Availability
```json
{ "doctorId": "uuid", "date": "YYYY-MM-DD", "slots": [{ "startTime": "HH:mm:ss", "endTime": "HH:mm:ss", "isAvailable": true }] }
```

---

## Total Endpoint Count: **32 endpoints**
- Auth & Users: 7
- Doctors & Schedules: 7
- Patients: 4
- Appointments: 6
- Visits: 6
- Billing: 5
- Admin Reports: 9 (includes duplicate doctor status toggle via admin path)
