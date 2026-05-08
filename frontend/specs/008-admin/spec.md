# Admin Dashboard & Reports — Feature Specification

## Feature Branch

`008-admin`

---

## Overview

The Admin feature provides a comprehensive dashboard and management interface for clinic administrators. It includes operational metrics visualization, aggregated reporting across appointments/revenue/visits/doctors/patients/no-shows, CSV export, audit log viewing, user account management, and doctor activation/deactivation.

---

## User Stories

### P1 — View Dashboard Metrics (US-ADM-01)

As an admin, I can view an operational dashboard with key metrics so that I have a real-time overview of clinic performance.

### P2 — View Appointment Statistics (US-ADM-02)

As an admin, I can view appointment statistics report filtered by date range so that I can understand booking patterns and completion rates.

### P3 — View Revenue Report (US-ADM-03)

As an admin, I can view revenue and collection reports filtered by date range so that I can track financial performance.

### P4 — View Doctor Utilization (US-ADM-05)

As an admin, I can view doctor utilization and stats so that I can identify under/over-utilized doctors.

### P5 — View No-Show Rate (US-ADM-07)

As an admin, I can view no-show rate analysis so that I can identify trends and take corrective action.

### P6 — Export Reports CSV (US-ADM-08)

As an admin, I can export any report to CSV so that I can share or archive data externally.

### P7 — View Audit Log (US-ADM-09)

As an admin, I can view system audit logs so that I can track PHI access and security events.

### P8 — Manage Users (US-ADM-10)

As an admin, I can manage all user accounts (create, update, delete) so that I can control system access and roles.

---

## Acceptance Scenarios

### P1 — Dashboard Metrics

**Scenario: Admin views dashboard with live metrics**
- Given the user is authenticated with Admin role
- When they navigate to `/admin`
- Then the dashboard displays metric cards for daily appointments, doctor utilization percentage, no-show rate, and revenue
- And each card shows the current value with a trend indicator (up/down/neutral)

**Scenario: Dashboard metrics reflect selected date range**
- Given the admin is on the dashboard
- When they change the date range filter
- Then all metric cards and charts update to reflect the new period

**Scenario: Dashboard shows loading state**
- Given the admin navigates to the dashboard
- When report data is being fetched
- Then skeleton cards are displayed for each metric
- And a spinner is shown on each chart area

### P2 — Appointment Statistics

**Scenario: Admin views appointment report**
- Given the admin is on the reports page
- When they select the "Appointments" report type
- Then a chart displaying appointment counts by status (completed, cancelled, no-show) is rendered
- And a breakdown table by doctor is shown

**Scenario: No appointment data for selected period**
- Given the admin selects a date range with no appointments
- When the report loads
- Then a "No data for selected period" empty state is displayed
- And a suggestion to adjust the date range is shown

### P3 — Revenue Report

**Scenario: Admin views revenue report**
- Given the admin is on the reports page
- When they select the "Revenue" report type
- Then a bar/line chart shows total billed, collected, waived, and pending amounts
- And a summary row displays the aggregate totals

**Scenario: Revenue report with date range filter**
- Given the admin is viewing the revenue report
- When they apply a new date range
- Then the chart and totals refresh with the new data

### P4 — Doctor Utilization

**Scenario: Admin views doctor utilization chart**
- Given the admin is on the reports page
- When they select the "Doctors" report type
- Then a horizontal bar chart shows each doctor's utilization percentage
- And doctors below 50% utilization are visually flagged

### P5 — No-Show Rate

**Scenario: Admin views no-show rate analysis**
- Given the admin is on the reports page
- When they select the "No-Show Rate" report type
- Then a trend line chart displays no-show rate over the selected period
- And the overall no-show percentage is prominently displayed

### P6 — Export Reports CSV

**Scenario: Admin exports a report to CSV**
- Given the admin is viewing any report
- When they click the "Export CSV" button
- Then a CSV file is downloaded to their device
- And the file contains the same data visible in the report

**Scenario: CSV export fails**
- Given the admin clicks "Export CSV"
- When the server returns an error
- Then a toast notification displays "Export failed. Please try again."

### P7 — Audit Log

**Scenario: Admin views audit log**
- Given the admin navigates to `/admin/audit-log`
- Then a paginated table displays audit log entries with columns: Actor, Action, Resource, Timestamp, Details
- And the table is sorted by most recent first

**Scenario: Admin paginates through audit log**
- Given the admin is on the audit log page
- When they click "Next" on the pagination control
- Then the next page of entries is loaded and displayed

### P8 — Manage Users

**Scenario: Admin views user list**
- Given the admin navigates to `/admin/users`
- Then a paginated table displays all user accounts with columns: Name, Email, Role, Actions
- And each row has Edit and Delete action buttons

**Scenario: Admin creates a new user**
- Given the admin is on the user management page
- When they click "Create User" and fill out the form with valid data
- Then the new user appears in the user list
- And a success toast is displayed

**Scenario: Admin deactivates a doctor**
- Given the admin is viewing the user or doctor list
- When they toggle a doctor's active status to inactive
- Then the doctor's status badge updates to "Inactive"
- And a confirmation toast is displayed

---

## Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| FR-ADM-01 | Dashboard must display 4 KPI metric cards: Daily Appointments, Doctor Utilization %, No-Show Rate, Revenue | P1 |
| FR-ADM-02 | All reports must support date range filtering via `from` and `to` query parameters | P1 |
| FR-ADM-03 | Dashboard metrics must auto-refresh or support manual refresh with 5-minute React Query cache | P1 |
| FR-ADM-04 | Revenue report must show totalBilled, totalCollected, totalWaived, pending with chart | P2 |
| FR-ADM-05 | Appointment report must show totals by status and breakdown by doctor | P2 |
| FR-ADM-06 | Doctor utilization must display per-doctor utilization percentage | P2 |
| FR-ADM-07 | No-show rate must display trend over time with overall percentage | P2 |
| FR-ADM-08 | CSV export must trigger a browser file download using Blob URL | P2 |
| FR-ADM-09 | Audit log must be paginated with configurable page size | P2 |
| FR-ADM-10 | User management must support Create, Read, Update, Delete operations | P2 |
| FR-ADM-11 | Admin can toggle doctor active/inactive status | P2 |
| FR-ADM-12 | All admin endpoints require Admin role authorization | P1 |
| FR-ADM-13 | Report filters must be persisted in URL search params | P3 |
| FR-ADM-14 | Empty state must be shown when report data is unavailable for selected period | P1 |
| FR-ADM-15 | Loading skeleton states must be shown during data fetch | P1 |

---

## Key Entities

### RevenueReport

```typescript
interface RevenueReport {
  period: { from: string; to: string };
  totalBilled: number;
  totalCollected: number;
  totalWaived: number;
  pending: number;
  records: Array<{
    date: string;
    billed: number;
    collected: number;
  }>;
}
```

### AppointmentsReport

```typescript
interface AppointmentsReport {
  totalAppointments: number;
  completed: number;
  cancelled: number;
  noShow: number;
  byDoctor: Array<{
    doctorId: string;
    doctorName: string;
    total: number;
    utilizationPercent: number;
  }>;
}
```

### AuditLogEntry

```typescript
interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
  details: string;
}
```

### MetricCard Data

```typescript
interface MetricCardData {
  label: string;
  value: string | number;
  trend: "up" | "down" | "neutral";
  trendValue?: string;
  icon: React.ReactNode;
}
```

### ReportQueryParams

```typescript
interface ReportQueryParams {
  from?: string;
  to?: string;
  reportType?: "appointments" | "revenue" | "visits" | "doctors" | "patients" | "no-show-rate";
}
```

---

## Success Criteria

1. Admin dashboard loads within 2 seconds with all 4 metric cards populated
2. All 6 report types render correctly with date range filtering
3. CSV export downloads a valid CSV file matching the displayed report data
4. Audit log table paginates correctly with 20 items per page default
5. User CRUD operations complete and reflect changes in the table immediately
6. Doctor status toggle updates without page refresh
7. All admin pages are inaccessible to non-Admin roles (redirect to login/dashboard)
8. Empty states are displayed when no data is available
9. Loading skeletons are shown during all data fetches
10. Report date filters persist in URL search params for shareable links

---

## Assumptions

1. The backend API returns the exact shapes documented in `FRONTEND_API_GUIDE.md` for RevenueReport and AppointmentsReport
2. VisitsReport, DoctorsReport, PatientsReport, and NoShowReport response shapes are not fully documented and may need discovery at integration time — frontend will define provisional types
3. Audit log entries are returned in the standard paginated response format `{ content: AuditLogEntry[], totalPages, totalElements, ... }`
4. CSV export endpoint returns a raw binary blob with `Content-Type: text/csv`
5. The Admin role is the only role authorized to access `/admin/*` endpoints
6. Dashboard data has no real-time WebSocket feed — polling or manual refresh is the strategy
7. User management endpoints (`/users`) are served by the Identity Service through the API Gateway
8. Doctor status toggle via `PATCH /admin/doctors/{id}/status` is preferred over `PATCH /doctors/{id}/status` for admin actions
9. Date range defaults to "last 30 days" if no filter is provided
10. React Query staleTime of 5 minutes is acceptable for dashboard/report data freshness
