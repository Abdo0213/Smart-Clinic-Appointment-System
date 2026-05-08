# Patient Data Model

## Patient

```typescript
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  phone: string;
  address: string;
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "";
  knownAllergies: string;
  emergencyContact: string;
  emergencyPhone: string;
  insuranceProvider: string;
  insuranceNumber: string;
  createdAt: string;
}
```

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| id | string (UUID) | Auto-generated | UUID v4 | Unique identifier |
| firstName | string | Yes | 1–100 chars | Patient's first name |
| lastName | string | Yes | 1–100 chars | Patient's last name |
| dateOfBirth | string | Yes | ISO 8601 date, must be in the past | Date of birth |
| gender | enum | Yes | male, female, other | Gender |
| phone | string | Yes | E.164 or local format, 7–15 digits | Contact phone number |
| address | string | No | 0–500 chars | Residential address |
| bloodType | enum | No | A+, A-, B+, B-, AB+, AB-, O+ | Blood type |
| knownAllergies | string | No | 0–1000 chars | Known medical allergies |
| emergencyContact | string | No | 0–100 chars | Emergency contact name |
| emergencyPhone | string | No | 7–15 digits | Emergency contact phone |
| insuranceProvider | string | No | 0–200 chars | Insurance company name |
| insuranceNumber | string | No | 0–50 chars | Insurance policy number |
| createdAt | string | Auto-generated | ISO 8601 datetime | Record creation timestamp |

## CreatePatientRequest

```typescript
interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  phone: string;
  address?: string;
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  knownAllergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}
```

## UpdatePatientRequest

```typescript
interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  phone?: string;
  address?: string;
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  knownAllergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}
```

## PatientListResponse

```typescript
interface PatientListResponse {
  content: Patient[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

| Field | Type | Description |
|---|---|---|
| content | Patient[] | Array of patient records for the current page |
| page | number | Current page number (0-indexed) |
| size | number | Number of records per page |
| totalElements | number | Total number of matching records |
| totalPages | number | Total number of pages |
| last | boolean | Whether this is the last page |

## Enum Values

### Gender

| Value | Label |
|---|---|
| male | Male |
| female | Female |
| other | Other |

### BloodType

| Value | Label |
|---|---|
| A+ | A+ |
| A- | A- |
| B+ | B+ |
| B- | B- |
| AB+ | AB+ |
| AB- | AB- |
| O+ | O+ |
| O- | O- |
