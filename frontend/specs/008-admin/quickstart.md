# Admin Feature — Quickstart

## Feature Branch: `008-admin`

---

## Prerequisites

- Node.js 18+
- Next.js 16+ with App Router configured
- Shadcn UI + DiceUI installed
- React Query (TanStack Query) configured
- Zustand installed
- Auth system operational (login flow, JWT token in `authStore`)
- `src/shared/api/client.ts` Axios instance with JWT interceptor

---

## Setup

### 1. Create FSD directories

```bash
mkdir -p src/pages/admin-dashboard/ui src/pages/admin-dashboard/model
mkdir -p src/pages/admin-reports/ui src/pages/admin-reports/api
mkdir -p src/pages/admin-audit/ui
mkdir -p src/pages/admin-users/ui
mkdir -p src/features/admin-reports/ui src/features/admin-reports/api src/features/admin-reports/model
mkdir -p src/shared/ui/DateRangePicker src/shared/ui/ExportButton
```

### 2. Install chart library

```bash
npm install recharts
```

### 3. Add admin route constants

Append to `src/shared/api/apiRoutes.ts`:

```typescript
export const ADMIN = {
  REPORTS_APPOINTMENTS: "/admin/reports/appointments",
  REPORTS_REVENUE: "/admin/reports/revenue",
  REPORTS_VISITS: "/admin/reports/visits",
  REPORTS_DOCTORS: "/admin/reports/doctors",
  REPORTS_PATIENTS: "/admin/reports/patients",
  REPORTS_NO_SHOW_RATE: "/admin/reports/no-show-rate",
  REPORTS_EXPORT: "/admin/reports/export",
  AUDIT_LOG: "/admin/audit-log",
  DOCTORS_STATUS: (id: string) => `/admin/doctors/${id}/status`,
} as const;
```

### 4. Add routes to Next.js App Router + Refine

```typescript
// Route map additions:
"/admin"          → pages/admin-dashboard
"/admin/reports"  → pages/admin-reports
"/admin/audit-log" → pages/admin-audit
"/admin/users"    → pages/admin-users
```

---

## Quick Implementation Order

1. **Types & API layer** — `reportTypes.ts`, `reportApi.ts`, `reportQueries.ts`
2. **Dashboard** — `dashboardStore.ts`, `MetricCard.tsx`, `AdminDashboardPage.tsx`
3. **Shared UI** — `DateRangePicker`, `ExportButton`, `downloadCsv.ts`
4. **Reports** — `ReportFilters.tsx`, chart components, `ReportsPage.tsx`
5. **Audit Log** — `AuditLogTable.tsx`, `AuditLogPage.tsx`
6. **User Management** — `UserManagementTable.tsx`, `CreateUserForm.tsx`, `UserManagementPage.tsx`

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/features/admin-reports/model/reportTypes.ts` | All TypeScript interfaces for report responses |
| `src/features/admin-reports/api/reportApi.ts` | Axios calls for all admin report endpoints |
| `src/features/admin-reports/api/reportQueries.ts` | React Query hooks for reports |
| `src/features/admin-reports/model/reportSchemas.ts` | Zod validation schemas |
| `src/pages/admin-dashboard/model/dashboardStore.ts` | Zustand store for date range + refresh |
| `src/shared/lib/downloadCsv.ts` | CSV blob download utility |
| `src/shared/api/apiRoutes.ts` | API endpoint constants |

---

## Environment Variables

No new environment variables required. Uses existing:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## Testing the Feature

1. Login as Admin user
2. Navigate to `/admin` — verify 4 metric cards render
3. Navigate to `/admin/reports` — select each report type, verify chart renders
4. Click "Export CSV" — verify file downloads
5. Navigate to `/admin/audit-log` — verify paginated table renders
6. Navigate to `/admin/users` — create, edit, delete a user; toggle doctor status

---

## Common Patterns

### React Query Hook for Reports

```typescript
export const useGetRevenueReport = (params: ReportQueryParams) =>
  useQuery({
    queryKey: ["admin", "reports", "revenue", params],
    queryFn: () => reportApi.getRevenueReport(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
```

### CSV Export

```typescript
export const useExportReport = () =>
  useMutation({
    mutationFn: (params: ExportQueryParams) =>
      apiClient.get(ADMIN.REPORTS_EXPORT, {
        params: { reportType: params.reportType, from: params.from, to: params.to },
        responseType: "blob",
      }),
    onSuccess: (response, variables) => {
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${variables.reportType}-report.csv`;
      link.click();
      URL.revokeObjectURL(url);
    },
  });
```

### Date Range Defaults

```typescript
const defaultFrom = new Date();
defaultFrom.setDate(defaultFrom.getDate() - 30);
const defaultTo = new Date();
```
