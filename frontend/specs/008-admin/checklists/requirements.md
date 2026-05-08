# Admin Feature — Requirements Checklist

## Feature Branch: `008-admin`

---

## Functional Requirements

- [x] FR-ADM-01: Dashboard displays 6 KPI metric cards (Today's Appointments, Completed, Doctor Utilization %, No-Show Rate, Revenue, Pending Invoices)
- [x] FR-ADM-02: All reports support date range filtering via `from` and `to` query parameters
- [x] FR-ADM-03: Dashboard metrics support manual refresh with 5-minute React Query cache (staleTime)
- [x] FR-ADM-04: Revenue report shows billed vs collected with LineChart + DataTable
- [x] FR-ADM-05: Appointment report shows totals by status (completed, cancelled, noShow) with BarChart + DataTable
- [x] FR-ADM-06: Doctor utilization displays per-doctor utilization percentage in horizontal BarChart + DataTable
- [x] FR-ADM-07: No-show rate displays trend line over time with LineChart + DataTable
- [x] FR-ADM-08: CSV export triggers browser file download using Blob URL via ExportButton
- [x] FR-ADM-09: Audit log is paginated with configurable page size (default 10) + actor search + date range
- [x] FR-ADM-10: User management supports Create (dialog), Read (table), Update (dialog), Delete (confirm) operations
- [x] FR-ADM-11: Admin can toggle doctor active/inactive status via toggle button + confirmation dialog
- [x] FR-ADM-12: All admin pages wrapped in `<AuthGuard requiredRole="Admin">`
- [ ] FR-ADM-13: Report filters persist in URL search params — **Deferred (P3)**
- [x] FR-ADM-14: Empty state displayed when data unavailable (audit log, user list)
- [x] FR-ADM-15: Loading states displayed during all data fetches (spinner/skeleton)

---

## User Stories Coverage

- [x] US-ADM-01: Admin can view operational dashboard with key metrics
- [x] US-ADM-02: Admin can view appointment statistics report
- [x] US-ADM-03: Admin can view revenue and collection reports
- [x] US-ADM-04: Admin can view clinical visit volume reports (Visits tab)
- [x] US-ADM-05: Admin can view doctor utilization and stats (Doctors tab)
- [x] US-ADM-06: Admin can view patient demographics report (Patients tab)
- [x] US-ADM-07: Admin can view no-show rate analysis (No-Show tab)
- [x] US-ADM-08: Admin can export any report to CSV (ExportButton)
- [x] US-ADM-09: Admin can view system audit logs (AuditLogPage)
- [x] US-ADM-10: Admin can manage all user accounts (UserManagementPage)
- [x] US-ADM-11: Admin can activate/deactivate doctor profiles (toggle button)

---

## API Integration Checklist

- [x] GET /admin/reports/appointments?from=&to= → AppointmentsReport
- [x] GET /admin/reports/revenue?from=&to= → RevenueReport
- [x] GET /admin/reports/visits?from=&to= → VisitsReport
- [x] GET /admin/reports/doctors?from=&to= → DoctorsReport
- [x] GET /admin/reports/patients?from=&to= → PatientsReport
- [x] GET /admin/reports/no-show-rate?from=&to= → NoShowReport
- [x] GET /admin/reports/export?reportType=&from=&to= → CSV blob download
- [x] GET /admin/audit-log?page=&size= → Paginated AuditLogEntry[]
- [x] PATCH /admin/doctors/{id}/status?isActive=true/false → Doctor toggle
- [x] GET /users → Paginated User[]
- [x] POST /users → User
- [x] PUT /users/{id} → User
- [x] DELETE /users/{id} → void

---

## UI States Checklist

- [x] Loading: LoadingSpinner on dashboard; spinner on each report tab
- [x] Empty: "No audit log entries" on audit log; "No users found" on user list
- [x] Error: Toast on export failure; mutation error toasts
- [x] Success: Dashboard loaded with metrics; CSV download; user created/updated/deleted; doctor toggled

---

## Data Validation Checklist

- [x] Report date `from` in YYYY-MM-DD format (Zod schema in reportSchemas.ts)
- [x] Report date `to` in YYYY-MM-DD format (Zod schema)
- [x] `from` must be before or equal to `to` (Zod refine)
- [x] `reportType` enum validated (Zod schema)
- [x] User creation: email valid, password ≥ 8 chars, role valid (Zod schema)
- [x] Doctor creation: specialization required when role is "Doctor" (Zod refine)
- [x] Audit log page ≥ 0, size 1-100 (Zod schema)

---

## Accessibility Checklist

- [x] Metric cards have readable CardTitle labels
- [x] Charts have Tooltip for data values
- [x] Data tables have proper column headers
- [x] Export button has descriptive label text
- [x] Form fields have associated `<Label>` elements with htmlFor
- [x] Dialogs use Dialog component with proper title/description
- [x] Tab order is logical (Tabs component handles focus)
- [x] Color + icon used for trends (not color alone)

---

## Security Checklist

- [x] All admin routes guarded by AuthGuard role check (Admin only)
- [x] JWT token included via apiClient interceptor
- [x] 401 responses handled by auth interceptor
- [x] CSV export requires auth header (apiClient)
- [x] Delete and status toggle require confirmation dialog
- [x] Audit log displayed in DataTable

---

## Cross-Browser / Responsive Checklist

- [x] Dashboard metric cards: 1/2/3-column responsive grid (sm:grid-cols-2 lg:grid-cols-3)
- [x] Charts: ResponsiveContainer with 100% width and fixed height
- [x] Data tables: standard DataTable component
- [x] Export button: visible in report header
- [x] Forms/dialogs: sm:max-w-md constrained on desktop
