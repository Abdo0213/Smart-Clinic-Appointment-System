# SpecKit: Doctor & Schedule Management

## Feature Name
Doctor — Profile, Schedule Configuration, Slot Availability

## Description
Doctor profile management, weekly schedule configuration (working hours, breaks, slot duration), and available slot querying for appointment booking. Doctors manage their own schedules; admins can activate/deactivate doctors and manage schedules.

## User Stories

- **US-DOC-01**: As a doctor, I can view and update my profile (specialization, bio, phone).
- **US-DOC-02**: As a doctor, I can configure my weekly availability (working hours, break times, slot duration, price per slot).
- **US-DOC-03**: As a doctor, I can view my schedules.
- **US-DOC-04**: As a patient/receptionist, I can view available slots for a doctor on a specific date.
- **US-DOC-05**: As an admin, I can activate or deactivate a doctor profile.
- **US-DOC-06**: As an admin, I can view all doctors and filter by specialization and active status.
- **US-DOC-07**: As a receptionist, I can view doctor schedules for appointment coordination.

## UI States

| State | Description |
|---|---|
| **Loading** | Skeleton on doctor profile; spinner on schedule save |
| **Empty** | "No schedules configured" for doctor; "No doctors found" on list |
| **Error** | Inline validation; toast for scheduling conflicts or server errors |
| **Success** | Schedule saved confirmation; profile updated toast |

## Components (Atomic Breakdown)

| Component | Type | Description |
|---|---|---|
| `DoctorProfileForm` | Organism | Edit form for doctor profile (specialization, bio, phone) |
| `DoctorProfileCard` | Organism | Read-only doctor profile display |
| `DoctorListTable` | Organism | DataTable (DiceUI) with specialization/active filters |
| `ScheduleConfigForm` | Organism | Form to add schedule: date, start/end time, slot duration, price, breaks |
| `ScheduleCalendar` | Organism | Weekly/monthly calendar view of doctor's schedules |
| `SlotAvailabilityGrid` | Organism | Grid of available/booked slots for a given date |
| `SlotCard` | Molecule | Individual slot display (time, availability status) |
| `BreakTimeInput` | Molecule | Input pair for break start/end times |
| `DoctorStatusToggle` | Atom | Active/Inactive toggle (admin only) |

## Data Models

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
  createdAt: string;
}

interface ScheduleSlot {
  startTime: string;   // "HH:mm:ss"
  endTime: string;     // "HH:mm:ss"
  isAvailable: boolean;
}

interface SlotAvailability {
  doctorId: string;
  date: string;         // "YYYY-MM-DD"
  slots: ScheduleSlot[];
}

interface ScheduleBreak {
  breakStart: string;   // "HH:mm:ss"
  breakEnd: string;     // "HH:mm:ss"
}

interface CreateScheduleRequest {
  date: string;          // "YYYY-MM-DD"
  startTime: string;     // "HH:mm:ss"
  endTime: string;       // "HH:mm:ss"
  slotDuration: number;  // minutes
  price: number;
  breaks: ScheduleBreak[];
}

interface DoctorListResponse {
  content: Doctor[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
```

## API Integration

| Action | Method | Endpoint | Auth | Request | Response |
|---|---|---|---|---|---|
| List Doctors | GET | `/doctors` | Doctor, Admin, Receptionist | `?specialization=&isActive=&page=&size=` | `DoctorListResponse` |
| Get Doctor by ID | GET | `/doctors/{id}` | Doctor, Admin, Receptionist | — | `Doctor` |
| Update Doctor Profile | PUT | `/doctors/{id}` | Doctor (own), Admin | `Partial<Doctor>` | `Doctor` |
| Activate/Deactivate Doctor | PATCH | `/doctors/{id}/status?isActive=true/false` | Admin | — | `Doctor` |
| Get Doctor Schedules | GET | `/doctors/{id}/schedules` | Doctor, Admin, Receptionist | — | `Schedule[]` |
| Create Schedule | POST | `/doctors/{id}/schedules` | Doctor (own), Admin | `CreateScheduleRequest` | `Schedule` |
| Get Available Slots | GET | `/doctors/{id}/slots?date=YYYY-MM-DD` | All roles | `?date=` | `SlotAvailability` |

## State Management

- **React Query**: `useGetDoctors(filters)`, `useGetDoctor(id)`, `useGetSchedules(doctorId)`, `useGetAvailableSlots(doctorId, date)`, `useCreateSchedule()`, `useUpdateDoctor()`, `useToggleDoctorStatus()`
- **Zustand**: Selected date state for slot picker
- **URL state**: Specialization filter, active filter, pagination in search params

## Validation Rules (Zod)

```typescript
const scheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format"),
  slotDuration: z.number().min(15, "Minimum 15 minutes").max(120, "Maximum 2 hours"),
  price: z.number().min(0, "Price must be non-negative"),
  breaks: z.array(z.object({
    breakStart: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
    breakEnd: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  })).optional(),
}).refine(data => data.startTime < data.endTime, {
  message: "Start time must be before end time",
});

const doctorProfileSchema = z.object({
  specialization: z.string().min(2, "Specialization required"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  phone: z.string().min(10, "Valid phone required"),
});
```

## Edge Cases

1. **Schedule overlap**: Doctor creates schedule that overlaps existing schedule — backend should reject, show error.
2. **Past date schedule**: Creating schedule for a past date — client-side validation to warn, but allow (backend decides).
3. **Break outside working hours**: Break time not within startTime/endTime — validate client-side.
4. **Deactivated doctor with existing appointments**: Admin deactivates doctor — existing appointments remain, but no new bookings allowed.
5. **No slots available**: All slots booked or no schedule for date — show "No availability" message.
6. **Slot generation logic**: Client does NOT generate slots — `GET /doctors/{id}/slots?date=` returns generated slots from backend.
7. **Schedule update**: No PUT endpoint for updating existing schedule — must delete and recreate (or is missing endpoint).

## FSD Placement

```
src/
  entities/
    doctor/
      model/
        types.ts
        doctorQueries.ts
      api/
        doctorApi.ts
      ui/
        DoctorCard.tsx
        DoctorStatusBadge.tsx
      index.ts
    schedule/
      model/
        types.ts
        scheduleQueries.ts
      api/
        scheduleApi.ts
      ui/
        SlotCard.tsx
        SlotAvailabilityGrid.tsx
      index.ts
  pages/
    doctor-profile/
      ui/
        DoctorProfilePage.tsx
        DoctorProfileForm.tsx
      model/
        schemas.ts
      index.ts
    doctor-schedule/
      ui/
        DoctorSchedulePage.tsx
        ScheduleConfigForm.tsx
        ScheduleCalendar.tsx
      model/
        schemas.ts
      index.ts
    doctor-list/
      ui/
        DoctorListPage.tsx
        DoctorListTable.tsx
      index.ts
```
