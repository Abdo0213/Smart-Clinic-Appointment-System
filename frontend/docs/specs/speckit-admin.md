# SpecKit: Admin Dashboard & Reports

## Feature Name
Admin — Dashboard, Reports, User Management, Audit Log

## Description
Admin dashboard with operational metrics, aggregated reports (appointments, revenue, visits, doctors, patients, no-show rate), CSV export, user management, doctor activation/deactivation, and system audit log viewing.

## User Stories

- **US-ADM-01**: As an admin, I can view an operational dashboard with key metrics (daily appointments, doctor utilization, no-show rate, revenue).
- **US-ADM-02**: As an admin, I can view appointment statistics report.
- **US-ADM-03**: As an admin, I can view revenue and collection reports.
- **US-ADM-04**: As an admin, I can view clinical visit volume reports.
- **US-ADM-05**: As an admin, I can view doctor utilization and stats.
- **US-ADM-06**: As an admin, I can view patient demographics report.
- **US-ADM-07**: As an admin, I can view no-show rate analysis.
- **US-ADM-08**: As an admin, I can export any report to CSV.
- **US-ADM-09**: As an admin, I can view system audit logs (PHI access tracking).
- **US-ADM-10**: As an admin, I can manage all user accounts (create, update, delete).
- **US-ADM-11**: As an admin, I can activate/deactivate doctor profiles.

## UI States

| State | Description |
|---|---|
| **Loading** | Skeleton cards on dashboard; spinner on report generation |
| **Empty** | "No data for selected period" on reports |
| **Error** | Toast on report fetch failure; chart error fallback |
| **Success** | Dashboard loaded with live metrics; CSV downloaded |

## Components (Atomic Breakdown)

| Component | Type | Description |
|---|---|---|
| `DashboardPage` | Organism | Main dashboard with metric cards and charts |
| `MetricCard` | Molecule | Single KPI display (icon, value, label, trend) |
| `RevenueChart` | Molecule | Bar/line chart for revenue over time |
| `AppointmentChart` | Molecule | Chart for appointment counts by status |
| `DoctorUtilizationChart` | Molecule | Chart showing doctor utilization percentages |
| `NoShowRateChart` | Molecule | Chart for no-show rate trend |
| `ReportPage` | Organism | Dedicated page for each report type |
| `ReportFilters` | Molecule | Date range picker, report type selector |
| `ExportButton` | Atom | Button to trigger CSV export |
| `AuditLogTable` | Organism | DataTable (DiceUI) of audit log entries |
| `UserManagementTable` | Organism | DataTable of users with CRUD actions |
| `DateRangePicker` | Molecule | Select start/end date for report filtering |

## Data Models

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

interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
  details: string;
}

interface ReportQueryParams {
  from?: string;
  to?: string;
  reportType?: string;
}
```

## API Integration

| Action | Method | Endpoint | Auth | Request | Response |
|---|---|---|---|---|---|
| Appointment Stats | GET | `/admin/reports/appointments` | Admin | `?from=&to=` | `AppointmentsReport` |
| Revenue Report | GET | `/admin/reports/revenue` | Admin | `?from=&to=` | `RevenueReport` |
| Visit Volume Report | GET | `/admin/reports/visits` | Admin | `?from=&to=` | `VisitsReport` |
| Doctor Utilization | GET | `/admin/reports/doctors` | Admin | `?from=&to=` | `DoctorsReport` |
| Patient Demographics | GET | `/admin/reports/patients` | Admin | `?from=&to=` | `PatientsReport` |
| No-Show Rate | GET | `/admin/reports/no-show-rate` | Admin | `?from=&to=` | `NoShowReport` |
| Export Report CSV | GET | `/admin/reports/export?reportType=...` | Admin | `?reportType=&from=&to=` | CSV file (download) |
| Audit Log | GET | `/admin/audit-log` | Admin | `?page=&size=` | Paginated `AuditLogEntry[]` |
| Toggle Doctor Status | PATCH | `/admin/doctors/{id}/status` | Admin | `?isActive=true/false` | `Doctor` |

## State Management

- **React Query**: `useGetAppointmentReport(params)`, `useGetRevenueReport(params)`, `useGetVisitsReport(params)`, `useGetDoctorsReport(params)`, `useGetPatientsReport(params)`, `useGetNoShowReport(params)`, `useGetAuditLog(params)`, `useExportReport(params)`
- **Zustand**: `useDashboardStore` — holds selected date range, refresh interval
- **URL state**: Report filters in search params

## Validation Rules (Zod)

```typescript
const reportFilterSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reportType: z.enum([
    "appointments",
    "revenue",
    "visits",
    "doctors",
    "patients",
    "no-show-rate",
  ]).optional(),
});
```

## Edge Cases

1. **No data for period**: Reports return empty — show "No data" state with suggestion to adjust date range.
2. **CSV export handling**: Response is a file download — use `responseType: 'blob'` in Axios, trigger browser download with `URL.createObjectURL`.
3. **Date range validation**: `from` must be before `to` — client-side validation.
4. **Dashboard caching**: Reports should be cached with React Query (staleTime: 5 minutes) to avoid excessive API calls.
5. **Audit log size**: Could be very large — pagination is essential.
6. **Doctor status duplicate endpoint**: `PATCH /admin/doctors/{id}/status` and `PATCH /doctors/{id}/status` both exist — prefer admin endpoint for admin actions.
7. **Report response shapes unclear**: Some report response shapes are not documented (VisitsReport, DoctorsReport, PatientsReport, NoShowReport) — need backend clarification or will need to be discovered at integration time.
8. **Real-time dashboard**: Dashboard data has latency — no WebSocket. Consider manual refresh or auto-refresh interval.

## FSD Placement

```
src/
  pages/
    admin-dashboard/
      ui/
        AdminDashboardPage.tsx
        MetricCard.tsx
      model/
        dashboardStore.ts
      index.ts
    admin-reports/
      ui/
        ReportsPage.tsx
        RevenueChart.tsx
        AppointmentChart.tsx
        DoctorUtilizationChart.tsx
        NoShowRateChart.tsx
        ReportFilters.tsx
      api/
        reportApi.ts
      index.ts
    admin-audit/
      ui/
        AuditLogPage.tsx
        AuditLogTable.tsx
      index.ts
    admin-users/
      ui/
        UserManagementPage.tsx
        UserManagementTable.tsx
        CreateUserForm.tsx
      index.ts
  shared/
    ui/
      DateRangePicker/
      ExportButton/
```
