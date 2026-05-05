# 🏥 Smart Clinic Appointment System - Frontend API Guide

Welcome to the Smart Clinic API Documentation. This guide details all the endpoints exposed through the **API Gateway** for frontend integration.

## 🚀 Base URL
All requests must be directed to the API Gateway:
`http://localhost:8080/api`

---

## 🔐 Authentication & Identity
Managed by the **Identity Service**.

### 1. Register a New Patient
*Used by patients to sign up.*
- **Endpoint:** `POST /auth/register`
- **Access:** Public
- **Request Body:**
```json
{
    "email": "patient@example.com",
    "password": "StrongPassword123!",
    "firstName": "John",
    "lastName": "Doe"
}
```

### 2. Login
*Get a JWT token for subsequent requests.*
- **Endpoint:** `POST /auth/login`
- **Access:** Public
- **Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password"
}
```
- **Response:**
```json
{
    "token": "eyJhbGci..."
}
```

### 3. User Management (Admin Only)
- **Get All Users:** `GET /users`
- **Get User by ID:** `GET /users/{id}`
- **Create User (Staff/Doctor):** `POST /users`
- **Update User:** `PUT /users/{id}`
- **Delete User:** `DELETE /users/{id}`

---

## 👨‍⚕️ Doctors
- **Base Path:** `/doctors`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| **GET** | `/doctors` | List all doctors (supports `specialization`, `isActive` filters) | Admin, Doctor, Receptionist |
| **GET** | `/doctors/{id}` | Get doctor profile details | Admin, Doctor, Receptionist |
| **PUT** | `/doctors/{id}` | Update doctor profile | Admin, Doctor |
| **PATCH**| `/doctors/{id}/status` | Activate/Deactivate doctor (`?isActive=true/false`) | Admin |
| **GET** | `/doctors/{id}/schedules` | Get doctor's weekly/daily schedules | Admin, Doctor, Receptionist |
| **POST** | `/doctors/{id}/schedules` | Create new schedule slots | Admin, Doctor |
| **GET** | `/doctors/{id}/slots` | Get available slots for a specific date (`?date=YYYY-MM-DD`) | Admin, Doctor, Receptionist, Patient |

---

## 👥 Patients
- **Base Path:** `/patients`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| **GET** | `/patients` | List patients (supports `name`, `phone` search) | Admin, Doctor, Receptionist |
| **GET** | `/patients/{id}` | Get patient demographic data | Admin, Doctor, Receptionist, Patient |
| **POST** | `/patients` | Create/Update patient profile | Admin, Receptionist, Patient |
| **PUT** | `/patients/{id}` | Update patient details | Admin, Receptionist, Patient |

---

## 📅 Appointments
- **Base Path:** `/appointments`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| **GET** | `/appointments` | List appointments (filter by `patientId`, `doctorId`, `date`, `status`) | Admin, Doctor, Receptionist, Patient |
| **POST** | `/appointments` | Book a new appointment | Admin, Receptionist, Patient |
| **GET** | `/appointments/{id}` | Get appointment details | Admin, Doctor, Receptionist, Patient |
| **PATCH**| `/appointments/{id}/status`| Update status (e.g., ARRIVED, COMPLETED) | Admin, Doctor, Receptionist |
| **DELETE**| `/appointments/{id}` | Cancel an appointment | Admin, Receptionist, Patient |
| **POST** | `/appointments/{id}/waitlist` | Add patient to waitlist for a full slot | Admin, Receptionist, Patient |

---

## 🩺 Visits (Clinical Records)
- **Base Path:** `/visits`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| **GET** | `/visits` | List clinical visits | Admin, Doctor |
| **POST** | `/visits` | Start/Create a new visit record | Admin, Doctor |
| **GET** | `/visits/{id}` | Get full visit record including notes | Admin, Doctor |
| **POST** | `/visits/{id}/sign` | Finalize and sign visit (Lock record) | Doctor |
| **POST** | `/visits/{id}/prescriptions` | Issue a prescription during visit | Doctor |
| **POST** | `/visits/{id}/follow-up` | Schedule a follow-up visit | Doctor |

---

## 💳 Billing
- **Base Path:** `/billing`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| **GET** | `/billing/invoices` | List invoices (filter by `patientId`, `status`) | Admin, Receptionist |
| **GET** | `/billing/invoices/{id}` | Get invoice details | Admin, Receptionist, Patient |
| **PATCH**| `/billing/invoices/{id}/pay` | Mark invoice as paid | Admin, Receptionist |
| **PATCH**| `/billing/invoices/{id}/waive` | Waive an invoice (Admin only) | Admin |

---

## 📊 Admin Dashboard & Reports
- **Base Path:** `/admin`
- **Restriction:** Only accessible with **Admin** role.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/admin/reports/appointments` | Aggregated appointment statistics |
| **GET** | `/admin/reports/revenue` | Revenue and collection reports |
| **GET** | `/admin/reports/visits` | Clinical visit volume reports |
| **GET** | `/admin/reports/doctors` | Doctor utilization and stats |
| **GET** | `/admin/reports/patients` | Patient demographics report |
| **GET** | `/admin/reports/no-show-rate` | Analysis of missed appointments |
| **GET** | `/admin/reports/export` | Export reports to CSV (`?reportType=...`) |
| **GET** | `/admin/audit-log` | View system audit logs (Security tracking) |
| **PATCH**| `/admin/doctors/{id}/status` | Activate/Deactivate doctor profile |

---

## 📦 Common Response Formats

### Paginated Results (Spring Services)
Endpoints returning multiple items (e.g., `GET /doctors`, `GET /patients`) use this structure:
```json
{
    "content": [ ... ],
    "totalPages": 5,
    "totalElements": 100,
    "size": 20,
    "number": 0,
    "first": true,
    "last": false,
    "empty": false
}
```

---

## 🔐 Authentication & Identity

### User Object Shape
```json
{
    "id": "uuid-string",
    "email": "user@example.com",
    "userName": "user@example.com",
    "role": "Admin"
}
```

---

## 👨‍⚕️ Doctors

### Doctor Profile Shape
```json
{
    "id": "uuid",
    "userId": "auth-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "specialization": "Cardiology",
    "bio": "Experienced cardiologist...",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2026-05-05T12:00:00"
}
```

### Slot Shape
```json
{
    "doctorId": "uuid",
    "date": "2026-04-20",
    "slots": [
        {
            "startTime": "09:00:00",
            "endTime": "09:30:00",
            "isAvailable": true
        }
    ]
}
```

---

## 👥 Patients

### Patient Profile Shape
```json
{
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "dateOfBirth": "1990-01-01",
    "gender": "Female",
    "phone": "+1987654321",
    "address": "123 Main St, City",
    "bloodType": "A+",
    "knownAllergies": "Penicillin",
    "emergencyContact": "John Smith",
    "emergencyPhone": "+1122334455",
    "insuranceProvider": "HealthCare Inc",
    "insuranceNumber": "HC-123456",
    "createdAt": "2026-05-01T10:00:00"
}
```

---

## 📅 Appointments

### Appointment Shape
```json
{
    "id": "uuid",
    "patientId": "uuid",
    "doctorId": "uuid",
    "slotDate": "2026-04-20",
    "slotStart": "09:00:00",
    "slotEnd": "09:30:00",
    "status": "BOOKED", // BOOKED, ARRIVED, COMPLETED, CANCELLED, NO_SHOW
    "price": 100.0,
    "bookedBy": "uuid",
    "createdAt": "2026-05-03T15:00:00"
}
```

---

## 🩺 Visits

### Visit Record Shape
```json
{
    "id": "uuid",
    "appointmentId": "uuid",
    "patientId": "uuid",
    "doctorId": "uuid",
    "chiefComplaint": "Back pain",
    "examinationFindings": "Tenderness in L4-L5...",
    "assessment": "Muscle strain",
    "plan": "Rest and physical therapy",
    "icd10Codes": "M54.5",
    "isSigned": true,
    "signedAt": "2026-05-05T14:30:00"
}
```

---

## 💳 Billing

### Invoice Shape
```json
{
    "id": "uuid",
    "visitId": "uuid",
    "patientId": "uuid",
    "status": "PENDING", // PENDING, PAID, WAIVED
    "totalAmount": 150.00,
    "lineItems": [
        {
            "description": "Consultation Fee",
            "quantity": 1,
            "unitPrice": 100.00,
            "totalPrice": 100.00
        }
    ],
    "createdAt": "2026-05-05T15:00:00",
    "paidAt": null
}
```

---

## 📊 Admin Dashboard & Reports

### Report Examples
Admin reports return specialized aggregated data.

**Revenue Report:**
```json
{
    "period": { "from": "2026-01-01", "to": "2026-12-31" },
    "totalBilled": 50000.00,
    "totalCollected": 45000.00,
    "totalWaived": 1000.00,
    "pending": 4000.00,
    "records": [ ... ]
}
```

**Appointments Report:**
```json
{
    "totalAppointments": 500,
    "completed": 400,
    "cancelled": 50,
    "noShow": 50,
    "byDoctor": [
        { "doctorId": "uuid", "doctorName": "Dr. Smith", "total": 100, "utilizationPercent": 85.0 }
    ]
}
```

---

## 🛠 Header Information
All secured requests (anything except `/auth/login` and `/auth/register`) **must** include the JWT token:

**Header Name:** `Authorization`  
**Value Format:** `Bearer <YOUR_JWT_TOKEN>`

> [!TIP]
> The API Gateway automatically extracts your User ID from the token and passes it to internal services. You don't need to send `userId` in most request bodies if you are the logged-in user.
