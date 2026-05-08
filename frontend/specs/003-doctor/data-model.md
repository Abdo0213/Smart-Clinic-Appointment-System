# Doctor Feature — Data Model

## Doctor

Represents a doctor's professional profile linked to a user account.

```typescript
interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  bio: string;
  phone: string;
  isActive: boolean;
  createdAt: string; // ISO 8601
}
```

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| id | string | yes | UUID, read-only | Unique doctor identifier |
| userId | string | yes | UUID, read-only | Reference to the auth user |
| firstName | string | yes | read-only | From user service, displayed only |
| lastName | string | yes | read-only | From user service, displayed only |
| specialization | string | yes | max 100 chars | Medical specialization |
| bio | string | no | max 2000 chars | Professional biography |
| phone | string | yes | E.164 or local format | Contact phone number |
| isActive | boolean | yes | default: true | Admin-controlled active status |
| createdAt | string | yes | ISO 8601, read-only | Account creation timestamp |

---

## CreateScheduleRequest

Payload for creating a new schedule entry for a doctor on a specific date.

```typescript
interface CreateScheduleRequest {
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  slotDuration: number; // minutes
  price: number;
  breaks: ScheduleBreak[];
}
```

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| date | string | yes | YYYY-MM-DD, must be today or future | The date this schedule applies to |
| startTime | string | yes | HH:mm, must be before endTime | Working hours start |
| endTime | string | yes | HH:mm, must be after startTime | Working hours end |
| slotDuration | number | yes | 5–120 minutes | Duration of each appointment slot |
| price | number | yes | >= 0 | Price per slot in clinic currency |
| breaks | ScheduleBreak[] | no | Must fall within startTime–endTime | Break periods within the schedule |

---

## SlotAvailability

Generated time slots with availability status for a doctor on a given date.

```typescript
interface SlotAvailability {
  doctorId: string;
  date: string; // YYYY-MM-DD
  slots: Slot[];
}

interface Slot {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isAvailable: boolean;
}
```

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| doctorId | string | yes | UUID | The doctor these slots belong to |
| date | string | yes | YYYY-MM-DD | The date these slots apply to |
| slots | Slot[] | yes | non-empty if schedule exists | Generated time slots |
| slots[].startTime | string | yes | HH:mm | Slot start time |
| slots[].endTime | string | yes | HH:mm | Slot end time |
| slots[].isAvailable | boolean | yes | — | True if slot is not booked |

---

## ScheduleBreak

A break period within a schedule. Breaks are nested within `CreateScheduleRequest`.

```typescript
interface ScheduleBreak {
  breakStart: string; // HH:mm
  breakEnd: string;   // HH:mm
}
```

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| breakStart | string | yes | HH:mm, >= schedule startTime | Break start time |
| breakEnd | string | yes | HH:mm, <= schedule endTime, > breakStart | Break end time |

---

## PaginatedResponse<T>

Generic pagination wrapper used by the doctor list endpoint.

```typescript
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
```

| Field | Type | Description |
|---|---|---|
| content | T[] | Array of items for the current page |
| totalElements | number | Total number of items across all pages |
| totalPages | number | Total number of pages |
| page | number | Current page number (0-indexed) |
| size | number | Number of items per page |
