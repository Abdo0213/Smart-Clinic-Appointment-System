# Smart Clinic - Frontend API Documentation

This document outlines the core endpoints to be used by the Frontend application. All requests must be routed through the API Gateway at `http://localhost:8080`.

## Base URL
`http://localhost:8080/api`

---

## 1. Authentication (Public)

### Register Patient
* **URL:** `POST /auth/register`
* **Purpose:** Registers a new user and automatically creates a blank patient profile.
* **Body:**
```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "patient1@clinic.com",
    "password": "Password123!"
}
```
* **Response (200 OK):**
```json
{
    "message": "User registered and patient profile created successfully!",
    "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Login
* **URL:** `POST /auth/login`
* **Body:**
```json
{
    "email": "patient1@clinic.com",
    "password": "Password123!"
}
```
* **Response (200 OK):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
> **Note:** Include this token in the `Authorization` header as `Bearer <token>` for all subsequent requests.

---

## 2. Admin Capabilities

### Create Doctor (Or Receptionist)
* **URL:** `POST /users`
* **Auth:** Admin Token Required
* **Purpose:** Creates a user account and *automatically* initializes the Doctor profile in the system.
* **Body:**
```json
{
    "firstName": "Gregory",
    "lastName": "House",
    "specialization": "Diagnostic Medicine",
    "email": "doctor123@clinic.com",
    "password": "Password123!",
    "role": "Doctor"
}
```
* **Response (201 Created):** Returns the User object.

---

## 3. Patient Capabilities

### Get Patient Profile
* **URL:** `GET /patients/{id}`
* **Auth:** Any valid token
* **Response (200 OK):**
```json
{
    "userId": "...",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "Unknown",
    ...
}
```

### Update Patient Profile
* **URL:** `PUT /patients/{id}`
* **Auth:** Patient Token
* **Body:**
```json
{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "gender": "MALE",
    "phone": "+20 100 123 4567",
    "address": "12 Nile St, Cairo",
    "bloodType": "O+",
    "knownAllergies": "Penicillin",
    "emergencyContact": "Jane Doe",
    "emergencyPhone": "+20 100 987 6543",
    "insuranceProvider": "AllianzEgypt",
    "insuranceNumber": "AE-2024-9876"
}
```

### Book Appointment
* **URL:** `POST /appointments`
* **Auth:** Patient/Doctor/Admin Token
* **Body:**
```json
{
    "patientId": "b2c3d4e5-...",
    "doctorId": "d4e5f6g7-...",
    "slotDate": "2026-04-20",
    "slotStart": "10:00:00",
    "slotEnd": "10:30:00"
}
```

---

## 4. Doctor Capabilities

### Add Schedule
* **URL:** `POST /doctors/{doctorId}/schedules`
* **Auth:** Doctor/Admin Token
* **Body:**
```json
{
    "date": "2026-04-27",
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "slotDuration": 30,
    "price": 100.0,
    "breaks": [
        {
            "breakStart": "12:00:00",
            "breakEnd": "13:00:00"
        }
    ]
}
```

### Create Visit (Clinical Encounter)
* **URL:** `POST /visits`
* **Auth:** Doctor/Admin Token
* **Body:**
```json
{
  "appointmentId": "f6g7h8i9-...",
  "chiefComplaint": "Chest pain, shortness of breath",
  "examinationFindings": "BP 140/90, HR 88 bpm, clear lungs",
  "assessment": "Hypertension stage 2",
  "plan": "Lifestyle modification + Amlodipine 5mg daily",
  "icd10Codes": "I10"
}
```

### Sign Visit (Adds Billing Items)
* **URL:** `POST /visits/{visitId}/sign`
* **Auth:** Doctor Token
* **Body:**
```json
{
  "additionalItems": [
    {
      "description": "X-Ray - Chest",
      "quantity": 1,
      "unitPrice": 50.0
    }
  ]
}
```

### Issue Prescription
* **URL:** `POST /visits/{visitId}/prescriptions`
* **Auth:** Doctor Token
* **Body:**
```json
{
  "medicationName": "Amlodipine",
  "dosage": "5mg",
  "frequency": "Once daily",
  "durationDays": 30,
  "notes": "Take in the morning with food"
}
```

---

## 5. Billing & Receptionist

### Get Patient Invoices
* **URL:** `GET /billing/invoices?patientId={patientId}`
* **Auth:** Receptionist/Admin
* **Response (200 OK):** Paginated list of invoices.

### Mark Invoice as Paid
* **URL:** `PATCH /billing/invoices/{invoiceId}/pay`
* **Auth:** Receptionist/Admin
* **Body:** Empty

### Create Custom Invoice
* **URL:** `POST /billing/invoices`
* **Auth:** Receptionist/Admin
* **Body:**
```json
{
    "visitId": "...",
    "patientId": "...",
    "appointmentId": "...",
    "lineItems": [
        {
            "description": "Consultation Fee",
            "quantity": 1,
            "unitPrice": 500.00
        }
    ]
}
```
