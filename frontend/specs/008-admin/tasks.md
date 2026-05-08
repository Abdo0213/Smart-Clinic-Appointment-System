# Admin Feature — Phased Tasks

## Feature Branch: `008-admin`

---

## Phase 1 — Dashboard & Metrics (Days 1-3)

- [x] T1.1 Create FSD directory structure: `src/pages/admin-dashboard/`, `src/pages/admin-reports/`
- [x] T1.2 Create `src/pages/admin-dashboard/model/dashboardStore.ts` — Zustand store → Implemented as local state + React Query hooks with staleTime
- [x] T1.3 Create `src/pages/admin-dashboard/ui/MetricCard.tsx` — renders card with trend arrow (up=green, down=red, neutral=gray)
- [x] T1.4 Create `src/pages/admin-dashboard/ui/AdminDashboardPage.tsx` — 6 MetricCards: Today's Appointments, Completed, Doctor Utilization %, No-Show Rate, Revenue, Pending Invoices
- [x] T1.5 Create `src/shared/ui/DateRangePicker/DateRangePicker.tsx` — date range selector with calendar popover
- [x] T1.6 Add admin route constants to `src/shared/api/apiRoutes.ts`: all ADMIN report/audit/doctor endpoints
- [x] T1.7 Create `src/features/admin-reports/model/reportTypes.ts` — TypeScript interfaces for all report responses
- [x] T1.8 Create `src/features/admin-reports/api/reportQueries.ts` — React Query hooks: all 6 report hooks + useExportReport + useGetAuditLog
- [x] T1.9 Create `src/features/admin-reports/api/reportApi.ts` — Axios functions for all 6 report GET endpoints + export endpoint + audit log
- [x] T1.10 Wire dashboard MetricCards to API hooks with staleTime: 5 minutes
- [x] T1.11 Add loading skeleton states for MetricCards
- [x] T1.12 Add `src/pages/admin-dashboard/index.ts` public API export

---

## Phase 2 — Reports & Charts (Days 4-7)

- [x] T2.1 Create `src/pages/admin-reports/ui/ReportFilters.tsx` — DateRangePicker integrated in ReportsPage header
- [x] T2.2 Create `src/pages/admin-reports/ui/ReportsPage.tsx` — Tabs layout with 6 report types: Appointments, Revenue, Visits, Doctors, Patients, No-Show
- [x] T2.3 Create RevenueChart — LineChart (recharts) showing billed vs collected per date
- [x] T2.4 Create AppointmentChart — BarChart showing completed/cancelled/noShow counts
- [x] T2.5 Create DoctorUtilizationChart — Horizontal BarChart with per-doctor utilization %
- [x] T2.6 Create NoShowRateChart — LineChart showing no-show rate trend
- [x] T2.7 Wire all chart components to their respective React Query hooks via inline useReportsQuery
- [x] T2.8 Add empty state handling for each tab — renders empty dataset gracefully
- [x] T2.9 Add loading spinners for chart rendering while data fetches
- [x] T2.10 Create `src/features/admin-reports/model/reportSchemas.ts` — Zod validation for date format, reportType enum
- [ ] T2.11 Persist report filter state in URL search params — **Deferred (P3)**
- [x] T2.12 Add `src/pages/admin-reports/index.ts` and `src/features/admin-reports/index.ts` public API exports

---

## Phase 3 — CSV Export (Day 8)

- [x] T3.1 Create `src/shared/lib/downloadCsv.ts` — Blob URL creation + programmatic download trigger
- [x] T3.2 Create `src/shared/ui/ExportButton/ExportButton.tsx` — button with loading spinner; calls export API with responseType: 'blob'
- [x] T3.3 Add `useExportReport` mutation hook in `reportQueries.ts` — with auto-download via downloadCsv and toast notifications
- [x] T3.4 Integrate ExportButton into ReportsPage; pass current reportType + date range
- [x] T3.5 Add error toast on export failure using shadcn Sonner
- [x] T3.6 ExportButton exported from `src/shared/ui/export-button/`

---

## Phase 4 — Audit Log (Days 9-10)

- [x] T4.1 Create `src/pages/admin-audit/` directory structure
- [x] T4.2 Create `src/pages/admin-audit/ui/AuditLogTable.tsx` — DataTable with columns: Timestamp, Actor, Action (Badge), Resource, Details; sorted by timestamp desc
- [x] T4.3 Create `src/pages/admin-audit/ui/AuditLogPage.tsx` — page wrapper with heading, search by actor, DateRangePicker, AuditLogTable, pagination
- [x] T4.4 Add `useAuditLog` React Query hook — inline in AuditLogPage; also in features/admin-reports/api/reportQueries.ts
- [x] T4.5 Wire pagination controls to React Query page params
- [x] T4.6 Add empty state: "No audit log entries found"
- [x] T4.7 Add loading spinner for table during fetch
- [x] T4.8 Add `src/pages/admin-audit/index.ts` public API export

---

## Phase 5 — User Management (Days 11-13)

- [x] T5.1 Create `src/pages/admin-users/` directory structure
- [x] T5.2 Create `src/pages/admin-users/ui/UserManagementTable.tsx` — DataTable with columns: Email, Name, Role (RoleBadge), Actions (Edit, Delete, Doctor Toggle)
- [x] T5.3 Create `src/pages/admin-users/ui/CreateUserForm.tsx` — Dialog form with fields: firstName, lastName, email, password, role (select), specialization (conditional for Doctor); validated with Zod
- [x] T5.4 Create `src/pages/admin-users/ui/UserManagementPage.tsx` — page with heading, "Create User" button, search bar, DataTable
- [x] T5.5 Add React Query hooks: `useGetUsers`, `useCreateUser`, `useUpdateUser`, `useDeleteUser` — inline in UserManagementPage
- [x] T5.6 Add Axios functions: getAll, create, update, delete via apiClient calls
- [x] T5.7 Add `useToggleDoctorStatus` mutation hook — calls `PATCH /admin/doctors/{id}/status?isActive=true/false`
- [x] T5.8 Add doctor status toggle button in UserManagementTable for Doctor-role rows; confirmation dialog before toggle
- [x] T5.9 Wire form submission to `useCreateUser` mutation; close dialog on success, show toast
- [x] T5.10 Wire edit to `useUpdateUser` mutation; pre-populate form with existing data via EditUserForm
- [x] T5.11 Wire delete to `useDeleteUser` mutation; confirmation dialog before delete
- [x] T5.12 Add success/error toasts for all CRUD operations (create, update, delete, toggle)
- [x] T5.13 Add `src/pages/admin-users/index.ts` public API export

---

## Phase 6 — Integration & Polish (Days 14-15)

- [x] T6.1 Verify role guard: all admin pages wrapped in `<AuthGuard requiredRole="Admin">`
- [x] T6.2 ErrorBoundary — pages have loading/error states
- [x] T6.3 Responsive layout: dashboard grid 1/2/3 column responsive; reports full-width tabs
- [x] T6.4 Keyboard navigation: tab order through forms/dialogs
- [x] T6.5 Accessibility: metric cards with readable titles, charts with tooltips, table headers
- [ ] T6.6 Test CSV export with all 6 report types — **Deferred (requires running backend)**
- [ ] T6.7 Test audit log pagination — **Deferred (requires running backend)**
- [ ] T6.8 Test user CRUD against real API — **Deferred (requires running backend)**
- [ ] T6.9 Test doctor status toggle — **Deferred (requires running backend)**
- [ ] T6.10 Integration test against backend API with real data — **Deferred (requires running backend)**
- [x] T6.11 React Query devtools available in development mode (already configured in QueryProvider)
- [x] T6.12 Final code review and cleanup — TypeScript passes with zero new errors

---

## Summary

- **Completed**: 50/55 tasks (91%)
- **Deferred**: 5 tasks
  - T2.11: URL search params persistence for report filters (P3)
  - T6.6–T6.10: Integration testing (requires running backend)

## Implementation Notes

### Architecture
- **Pages layer**: `admin-dashboard/`, `admin-reports/`, `admin-audit/`, `admin-users/` — each with ui/ and barrel index.ts
- **Features layer**: `admin-reports/` — types, schemas, API, query hooks
- **Shared layer**: DateRangePicker, ExportButton, downloadCsv, ReportType enum
- **App routes**: Thin wrappers delegating to pages-layer components

### Key Files
| Layer | Files |
|-------|-------|
| Pages | `src/pages/admin-dashboard/ui/AdminDashboardPage.tsx` — 6 MetricCards + trend indicators |
| Pages | `src/pages/admin-reports/ui/ReportsPage.tsx` — 6-tab recharts dashboard |
| Pages | `src/pages/admin-audit/ui/AuditLogPage.tsx` — DataTable + search + DateRangePicker |
| Pages | `src/pages/admin-users/ui/UserManagementPage.tsx` — Full CRUD + doctor toggle |
| Features | `src/features/admin-reports/` — Types, schemas, API, query hooks |
| Shared | `src/shared/ui/date-range-picker/`, `src/shared/ui/export-button/`, `src/shared/lib/downloadCsv.ts` |
| App Routes | `src/app/(dashboard)/admin/` — 4 route wrappers |
