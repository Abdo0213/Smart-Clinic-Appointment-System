# Admin Feature — Implementation Plan (FSD Structure)

## Feature Branch

`008-admin`

---

## FSD Page Layer Structure

```
src/pages/
  admin-dashboard/
    ui/
      AdminDashboardPage.tsx         # Main dashboard layout with metric cards + charts
      MetricCard.tsx                 # KPI card: icon, value, label, trend arrow
    model/
      dashboardStore.ts             # Zustand — selected date range, refresh interval
    index.ts                        # Public API: AdminDashboardPage
  admin-reports/
    ui/
      ReportsPage.tsx               # Report type selector + chart/table area
      RevenueChart.tsx              # Bar/line chart for revenue over time
      AppointmentChart.tsx          # Pie/bar chart for appointment status breakdown
      DoctorUtilizationChart.tsx    # Horizontal bar chart per-doctor utilization
      NoShowRateChart.tsx           # Line chart for no-show rate trend
      ReportFilters.tsx             # DateRangePicker + report type dropdown
    api/
      reportApi.ts                  # Axios calls for all report endpoints + export
    index.ts                        # Public API: ReportsPage, ReportFilters
  admin-audit/
    ui/
      AuditLogPage.tsx              # Audit log page with paginated DataTable
      AuditLogTable.tsx             # DiceUI DataTable for audit log entries
    index.ts                        # Public API: AuditLogPage
  admin-users/
    ui/
      UserManagementPage.tsx        # User list with CRUD actions
      UserManagementTable.tsx       # DiceUI DataTable for users
      CreateUserForm.tsx            # Dialog/sheet form for creating/editing users
    index.ts                        # Public API: UserManagementPage
```

---

## FSD Features Layer (Reusable Interactions)

```
src/features/
  admin-reports/
    ui/
      ExportButton.tsx              # CSV export trigger button with loading state
    api/
      reportQueries.ts             # React Query hooks for all report endpoints
      exportReport.ts              # Blob download logic
    model/
      reportSchemas.ts             # Zod schemas for report filter params
      reportTypes.ts               # TypeScript interfaces for report responses
    index.ts
```

---

## FSD Entities Layer (Business Domain)

```
src/entities/
  user/
    model/
      types.ts                     # User interface
      userQueries.ts               # useGetUsers, useCreateUser, useUpdateUser, useDeleteUser
    api/
      userApi.ts                   # CRUD Axios calls
    ui/
      UserCard.tsx
      RoleBadge.tsx
    index.ts

  doctor/  (existing — extend)
    api/
      doctorApi.ts                 # Add: PATCH /admin/doctors/{id}/status
    model/
      doctorQueries.ts             # Add: useToggleDoctorStatus mutation
```

---

## FSD Shared Layer (Infrastructure)

```
src/shared/
  ui/
    DateRangePicker/               # Reusable date range selector component
      DateRangePicker.tsx
      index.ts
    ExportButton/                  # Reusable export button
      ExportButton.tsx
      index.ts
    data-table/                    # DiceUI DataTable wrapper (existing)
  api/
    apiRoutes.ts                   # Add admin route constants:
                                  #   ADMIN_REPORTS_APPOINTMENTS, ADMIN_REPORTS_REVENUE, etc.
  lib/
    formatCurrency.ts              # Currency formatting for revenue displays
    formatDate.ts                  # Date formatting for report periods
    downloadCsv.ts                 # Blob URL creation + programmatic download trigger
  types/
    api.ts                         # PaginatedResponse<T> (existing)
    enums.ts                       # ReportType enum
```

---

## Route Configuration

```
/admin                    → pages/admin-dashboard   (AdminDashboardPage)
/admin/reports            → pages/admin-reports     (ReportsPage)
/admin/audit-log          → pages/admin-audit       (AuditLogPage)
/admin/users              → pages/admin-users       (UserManagementPage)
```

---

## Component Dependency Graph

```
AdminDashboardPage
  ├── MetricCard (×4)
  ├── AppointmentChart
  │     └── ReportFilters
  ├── RevenueChart
  └── dashboardStore (Zustand)

ReportsPage
  ├── ReportFilters
  │     └── DateRangePicker (shared)
  ├── RevenueChart
  ├── AppointmentChart
  ├── DoctorUtilizationChart
  ├── NoShowRateChart
  └── ExportButton (shared)
        └── downloadCsv (shared/lib)

AuditLogPage
  ├── AuditLogTable
  │     └── DataTable (shared/ui/data-table)

UserManagementPage
  ├── UserManagementTable
  │     ├── DataTable (shared/ui/data-table)
  │     ├── RoleBadge (entities/user)
  │     └── CreateUserForm (dialog)
  └── CreateUserForm
        └── React Hook Form + Zod
```

---

## Implementation Phases

### Phase 1 — Dashboard & Metrics (Days 1-3)

1. Set up FSD page directories: `admin-dashboard/`, `admin-reports/`
2. Create `dashboardStore.ts` (Zustand) for date range + refresh interval
3. Build `MetricCard` component (icon, value, label, trend)
4. Build `AdminDashboardPage` with 4 metric cards
5. Wire up React Query hooks for appointment stats + revenue (dashboard KPIs)
6. Add `DateRangePicker` to shared UI
7. Add skeleton loading states for metric cards

### Phase 2 — Reports & Charts (Days 4-7)

1. Build `ReportFilters` component (date range + report type dropdown)
2. Build `ReportsPage` with tab/route-based report type switching
3. Build `RevenueChart` (bar/line with recharts)
4. Build `AppointmentChart` (pie/bar with recharts)
5. Build `DoctorUtilizationChart` (horizontal bar)
6. Build `NoShowRateChart` (trend line)
7. Create `reportApi.ts` with all 6 report endpoint calls
8. Create `reportQueries.ts` with React Query hooks
9. Wire reports page to API with loading/empty/error states
10. Persist report filters in URL search params

### Phase 3 — CSV Export (Day 8)

1. Build `downloadCsv.ts` shared utility (Blob URL + programmatic click)
2. Build `ExportButton` component with loading state
3. Wire export endpoint with `responseType: 'blob'`
4. Add error handling with toast on export failure

### Phase 4 — Audit Log (Days 9-10)

1. Set up `admin-audit/` page directory
2. Build `AuditLogTable` using DiceUI DataTable wrapper
3. Build `AuditLogPage` with pagination controls
4. Wire to `GET /admin/audit-log?page=&size=` with React Query
5. Add empty state for no log entries

### Phase 5 — User Management (Days 11-13)

1. Set up `admin-users/` page directory
2. Build `UserManagementTable` using DiceUI DataTable
3. Build `CreateUserForm` as dialog with React Hook Form + Zod
4. Wire CRUD operations to `/users` endpoints
5. Add doctor status toggle via `PATCH /admin/doctors/{id}/status`
6. Add confirmation dialog for delete and status toggle actions
7. Add success/error toast notifications

### Phase 6 — Integration & Polish (Days 14-15)

1. Role guard verification — non-admin redirect
2. Error boundary wrapping on all admin pages
3. Responsive layout testing
4. Keyboard navigation and accessibility audit
5. Final integration test with backend API
