# Admin Feature — Data Models

## Feature Branch: `008-admin`

---

## RevenueReport

Aggregated revenue and collection data for a given period.

```typescript
interface RevenueReport {
  period: {
    from: string; // ISO date YYYY-MM-DD
    to: string;   // ISO date YYYY-MM-DD
  };
  totalBilled: number;     // Sum of all invoice amounts
  totalCollected: number;  // Sum of paid invoices
  totalWaived: number;     // Sum of waived invoices
  pending: number;         // Sum of pending invoices
  records: Array<{
    date: string;          // ISO date YYYY-MM-DD
    billed: number;        // Amount billed on this date
    collected: number;     // Amount collected on this date
  }>;
}
```

**Derivations:**
- `collectionRate = totalCollected / totalBilled * 100` (computed client-side)
- `waivedRate = totalWaived / totalBilled * 100` (computed client-side)

---

## AppointmentsReport

Aggregated appointment statistics with per-doctor breakdown.

```typescript
interface AppointmentsReport {
  totalAppointments: number;
  completed: number;
  cancelled: number;
  noShow: number;
  byDoctor: Array<{
    doctorId: string;
    doctorName: string;
    total: number;                // Total appointments for this doctor
    utilizationPercent: number;   // Percentage of booked slots that were completed
  }>;
}
```

**Derivations:**
- `completionRate = completed / totalAppointments * 100`
- `cancellationRate = cancelled / totalAppointments * 100`
- `noShowRate = noShow / totalAppointments * 100`

---

## VisitsReport (Provisional)

Clinical visit volume report. Response shape not documented by backend — provisional type.

```typescript
interface VisitsReport {
  period: {
    from: string;
    to: string;
  };
  totalVisits: number;
  signedVisits: number;
  unsignedVisits: number;
  byDoctor: Array<{
    doctorId: string;
    doctorName: string;
    visitCount: number;
  }>;
}
```

---

## DoctorsReport (Provisional)

Doctor utilization and statistics. Response shape not documented by backend — provisional type.

```typescript
interface DoctorsReport {
  period: {
    from: string;
    to: string;
  };
  totalDoctors: number;
  activeDoctors: number;
  inactiveDoctors: number;
  doctors: Array<{
    doctorId: string;
    doctorName: string;
    specialization: string;
    appointmentCount: number;
    completedCount: number;
    utilizationPercent: number;
    isActive: boolean;
  }>;
}
```

---

## PatientsReport (Provisional)

Patient demographics report. Response shape not documented by backend — provisional type.

```typescript
interface PatientsReport {
  period: {
    from: string;
    to: string;
  };
  totalPatients: number;
  newPatients: number;
  returningPatients: number;
  byGender: Record<string, number>;
  byInsurance: Array<{
    provider: string;
    count: number;
  }>;
}
```

---

## NoShowReport (Provisional)

No-show rate analysis. Response shape not documented by backend — provisional type.

```typescript
interface NoShowReport {
  period: {
    from: string;
    to: string;
  };
  overallNoShowRate: number;  // Percentage
  totalNoShows: number;
  totalAppointments: number;
  byDoctor: Array<{
    doctorId: string;
    doctorName: string;
    noShowCount: number;
    totalAppointments: number;
    noShowRate: number;       // Percentage
  }>;
  trend: Array<{
    date: string;
    noShowRate: number;       // Percentage for that date
  }>;
}
```

---

## AuditLogEntry

System audit log entry for security and PHI access tracking.

```typescript
interface AuditLogEntry {
  id: string;          // Unique entry identifier
  actor: string;       // User who performed the action (email or name)
  action: string;      // Action performed (e.g., "VIEW", "CREATE", "UPDATE", "DELETE", "LOGIN")
  resource: string;    // Resource type affected (e.g., "Patient", "Invoice", "Visit")
  timestamp: string;   // ISO 8601 datetime
  details: string;     // Additional context (e.g., "Viewed patient record for Jane Smith")
}
```

**Paginated Response:**

```typescript
interface PaginatedAuditLog {
  content: AuditLogEntry[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
```

---

## MetricCardData

Client-side derived data structure for dashboard KPI cards.

```typescript
interface MetricCardData {
  label: string;                         // e.g., "Daily Appointments", "Revenue"
  value: string | number;                // Formatted display value
  trend: "up" | "down" | "neutral";     // Trend direction
  trendValue?: string;                   // e.g., "+12%", "-3%"
  icon: React.ReactNode;                 // Lucide icon component
  loading?: boolean;                     // Show skeleton when true
}
```

---

## ReportQueryParams

Shared query parameters for all report endpoints.

```typescript
interface ReportQueryParams {
  from?: string;   // ISO date YYYY-MM-DD, defaults to 30 days ago
  to?: string;     // ISO date YYYY-MM-DD, defaults to today
}

interface ExportQueryParams extends ReportQueryParams {
  reportType: "appointments" | "revenue" | "visits" | "doctors" | "patients" | "no-show-rate";
}

interface AuditLogQueryParams {
  page?: number;   // Zero-indexed page number, default 0
  size?: number;   // Page size, default 20
}
```

---

## User (for User Management)

Referencing existing User entity from Identity Service.

```typescript
interface User {
  id: string;
  email: string;
  userName: string;
  role: "Admin" | "Doctor" | "Receptionist" | "Patient";
}

interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "Admin" | "Doctor" | "Receptionist" | "Patient";
  specialization?: string;  // Required when role is "Doctor"
}

interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "Admin" | "Doctor" | "Receptionist" | "Patient";
  specialization?: string;
}
```

---

## Zod Validation Schemas

```typescript
import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const reportFilterSchema = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  reportType: z.enum([
    "appointments",
    "revenue",
    "visits",
    "doctors",
    "patients",
    "no-show-rate",
  ]).optional(),
}).refine(
  (data) => {
    if (data.from && data.to) {
      return new Date(data.from) <= new Date(data.to);
    }
    return true;
  },
  { message: "From date must be before or equal to To date", path: ["from"] }
);

export const auditLogQuerySchema = z.object({
  page: z.number().int().min(0).default(0),
  size: z.number().int().min(1).max(100).default(20),
});

export const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["Admin", "Doctor", "Receptionist", "Patient"]),
  specialization: z.string().optional(),
}).refine(
  (data) => {
    if (data.role === "Doctor") {
      return !!data.specialization && data.specialization.length > 0;
    }
    return true;
  },
  { message: "Specialization is required for Doctor role", path: ["specialization"] }
);
```
