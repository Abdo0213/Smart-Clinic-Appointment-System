# Frontend Implementation Plan — Smart Clinic Appointment System

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16+ (App Router) |
| UI Library | Shadcn UI + DiceUI (DataTable) |
| Dashboard Auth | Refine (auth provider, access control) |
| Forms | React Hook Form |
| State (Server) | React Query (TanStack Query) |
| State (Client) | Zustand |
| Validation | Zod |
| Architecture | Feature-Sliced Design (FSD) v2.1 |

---

## Project Structure (FSD v2.1)

```
src/
├── app/                          # FSD App Layer — Next.js App Router integration
│   ├── providers/
│   │   ├── QueryProvider.tsx      # React Query provider
│   │   ├── RefineProvider.tsx     # Refine + auth provider setup
│   │   └── ThemeProvider.tsx      # Shadcn theme provider
│   ├── styles/
│   │   └── globals.css
│   ├── layout.tsx                # Root layout with providers
│   └── router.tsx                # Route config with Refine resources
│
├── pages/                        # FSD Pages Layer — route-level compositions
│   ├── login/
│   │   ├── ui/LoginPage.tsx
│   │   └── index.ts
│   ├── register/
│   │   ├── ui/RegisterPage.tsx
│   │   └── index.ts
│   ├── patient-dashboard/
│   │   ├── ui/PatientDashboardPage.tsx
│   │   ├── model/usePatientDashboard.ts
│   │   └── index.ts
│   ├── patient-profile/
│   │   ├── ui/
│   │   │   ├── PatientProfilePage.tsx
│   │   │   └── PatientProfileForm.tsx
│   │   ├── model/schemas.ts
│   │   └── index.ts
│   ├── patient-appointments/
│   │   ├── ui/
│   │   │   ├── PatientAppointmentsPage.tsx
│   │   │   └── AppointmentBookingPage.tsx
│   │   └── index.ts
│   ├── patient-invoices/
│   │   ├── ui/PatientInvoicesPage.tsx
│   │   └── index.ts
│   ├── doctor-dashboard/
│   │   ├── ui/DoctorDashboardPage.tsx
│   │   ├── model/useDoctorDashboard.ts
│   │   └── index.ts
│   ├── doctor-schedule/
│   │   ├── ui/
│   │   │   ├── DoctorSchedulePage.tsx
│   │   │   └── ScheduleConfigForm.tsx
│   │   ├── model/schemas.ts
│   │   └── index.ts
│   ├── doctor-queue/
│   │   ├── ui/DailyQueuePage.tsx
│   │   └── index.ts
│   ├── visit/
│   │   ├── ui/
│   │   │   ├── VisitPage.tsx
│   │   │   └── VisitDetailPage.tsx
│   │   ├── model/schemas.ts
│   │   └── index.ts
│   ├── reception-dashboard/
│   │   ├── ui/ReceptionDashboardPage.tsx
│   │   └── index.ts
│   ├── admin-dashboard/
│   │   ├── ui/AdminDashboardPage.tsx
│   │   ├── model/dashboardStore.ts
│   │   └── index.ts
│   ├── admin-reports/
│   │   ├── ui/
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   └── ReportFilters.tsx
│   │   └── index.ts
│   ├── admin-users/
│   │   ├── ui/
│   │   │   ├── UserManagementPage.tsx
│   │   │   └── CreateUserForm.tsx
│   │   └── index.ts
│   ├── admin-audit/
│   │   ├── ui/AuditLogPage.tsx
│   │   └── index.ts
│   ├── billing/
│   │   ├── ui/
│   │   │   ├── InvoiceListPage.tsx
│   │   │   ├── InvoiceDetailPage.tsx
│   │   │   └── CreateInvoicePage.tsx
│   │   ├── model/schemas.ts
│   │   └── index.ts
│   └── doctor-list/
│       ├── ui/DoctorListPage.tsx
│       └── index.ts
│
├── widgets/                      # FSD Widgets Layer — composite UI blocks
│   ├── header/
│   │   ├── ui/
│   │   │   ├── Header.tsx
│   │   │   └── UserMenu.tsx
│   │   └── index.ts
│   ├── sidebar/
│   │   ├── ui/
│   │   │   └── Sidebar.tsx       # Role-conditional navigation
│   │   ├── model/sidebarConfig.ts
│   │   └── index.ts
│   └── notification-center/
│       ├── ui/
│       │   ├── NotificationCenter.tsx
│       │   └── NotificationBell.tsx
│       ├── model/notificationStore.ts
│       └── index.ts
│
├── features/                     # FSD Features Layer — reusable user interactions
│   ├── auth/
│   │   ├── ui/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── LogoutButton.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── api/
│   │   │   ├── login.ts
│   │   │   └── register.ts
│   │   ├── model/
│   │   │   ├── authStore.ts       # Zustand
│   │   │   ├── schemas.ts         # Zod
│   │   │   └── types.ts
│   │   ├── lib/
│   │   │   └── token.ts
│   │   └── index.ts
│   ├── appointment-booking/
│   │   ├── ui/
│   │   │   ├── AppointmentBookingWizard.tsx
│   │   │   ├── DoctorSlotPicker.tsx
│   │   │   └── WaitlistButton.tsx
│   │   ├── model/
│   │   │   ├── bookingStore.ts    # Zustand
│   │   │   ├── schemas.ts
│   │   │   └── types.ts
│   │   ├── api/
│   │   │   └── bookAppointment.ts
│   │   └── index.ts
│   ├── visit-form/
│   │   ├── ui/
│   │   │   ├── VisitForm.tsx
│   │   │   ├── PrescriptionForm.tsx
│   │   │   ├── SignVisitDialog.tsx
│   │   │   ├── LineItemForm.tsx
│   │   │   └── FollowUpScheduler.tsx
│   │   ├── model/
│   │   │   ├── visitFormStore.ts  # Zustand
│   │   │   ├── schemas.ts
│   │   │   └── types.ts
│   │   ├── api/
│   │   │   ├── createVisit.ts
│   │   │   ├── signVisit.ts
│   │   │   ├── issuePrescription.ts
│   │   │   └── scheduleFollowUp.ts
│   │   └── index.ts
│   └── notifications/
│       ├── ui/
│       │   ├── NotificationList.tsx
│       │   └── NotificationItem.tsx
│       ├── api/
│       │   └── notificationApi.ts  # Stub — blocked by missing endpoints
│       ├── model/
│       │   ├── notificationStore.ts
│       │   └── types.ts
│       └── index.ts
│
├── entities/                     # FSD Entities Layer — business domain models
│   ├── user/
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   └── userQueries.ts    # React Query hooks
│   │   ├── api/
│   │   │   └── userApi.ts
│   │   ├── ui/
│   │   │   ├── UserCard.tsx
│   │   │   └── RoleBadge.tsx
│   │   └── index.ts
│   ├── doctor/
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   └── doctorQueries.ts
│   │   ├── api/
│   │   │   └── doctorApi.ts
│   │   ├── ui/
│   │   │   ├── DoctorCard.tsx
│   │   │   └── DoctorStatusBadge.tsx
│   │   └── index.ts
│   ├── patient/
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   └── patientQueries.ts
│   │   ├── api/
│   │   │   └── patientApi.ts
│   │   ├── ui/
│   │   │   └── PatientCard.tsx
│   │   └── index.ts
│   ├── appointment/
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   └── appointmentQueries.ts
│   │   ├── api/
│   │   │   └── appointmentApi.ts
│   │   ├── ui/
│   │   │   ├── AppointmentCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── AppointmentFilters.tsx
│   │   └── index.ts
│   ├── visit/
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   └── visitQueries.ts
│   │   ├── api/
│   │   │   └── visitApi.ts
│   │   ├── ui/
│   │   │   ├── VisitDetail.tsx
│   │   │   ├── PrescriptionCard.tsx
│   │   │   ├── VisitStatusBadge.tsx
│   │   │   └── PdfDownloadButton.tsx
│   │   └── index.ts
│   ├── invoice/
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   └── invoiceQueries.ts
│   │   ├── api/
│   │   │   └── invoiceApi.ts
│   │   ├── ui/
│   │   │   ├── InvoiceCard.tsx
│   │   │   ├── LineItemsTable.tsx
│   │   │   ├── AmountDisplay.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── index.ts
│   └── schedule/
│       ├── model/
│       │   ├── types.ts
│       │   └── scheduleQueries.ts
│       ├── api/
│       │   └── scheduleApi.ts
│       ├── ui/
│       │   ├── SlotCard.tsx
│       │   └── SlotAvailabilityGrid.tsx
│       └── index.ts
│
└── shared/                       # FSD Shared Layer — infrastructure
    ├── ui/
    │   ├── components/           # Shadcn components (auto-generated)
    │   ├── data-table/           # DiceUI DataTable wrapper
    │   ├── DateRangePicker/
    │   ├── ExportButton/
    │   └── LoadingSpinner/
    ├── api/
    │   ├── client.ts             # Axios instance with interceptors
    │   └── apiRoutes.ts          # Endpoint constants
    ├── lib/
    │   ├── formatDate.ts
    │   ├── formatCurrency.ts
    │   ├── cn.ts                  # clsx + tailwind-merge
    │   └── decodeJwt.ts
    ├── config/
    │   ├── env.ts
    │   └── appConfig.ts
    ├── types/
    │   ├── api.ts                # Common API types (PaginatedResponse, etc.)
    │   └── enums.ts              # AppointmentStatus, InvoiceStatus, Roles, etc.
    └── assets/
        └── logo.svg
```

---

## Route Map (Next.js App Router + Refine)

```
/login                          → pages/login
/register                       → pages/register

# Patient Routes
/patient                        → pages/patient-dashboard
/patient/profile                → pages/patient-profile
/patient/appointments           → pages/patient-appointments
/patient/appointments/book      → pages/patient-appointments (booking wizard)
/patient/invoices               → pages/patient-invoices

# Doctor Routes
/doctor                         → pages/doctor-dashboard
/doctor/profile                 → pages/doctor-profile (edit)
/doctor/schedule                → pages/doctor-schedule
/doctor/queue                   → pages/doctor-queue
/doctor/visits/:id              → pages/visit (create/edit)

# Receptionist Routes
/reception                      → pages/reception-dashboard
/reception/patients             → pages/patient-list (shared)
/reception/appointments         → pages/appointment-list (shared)
/reception/billing              → pages/billing

# Admin Routes
/admin                          → pages/admin-dashboard
/admin/users                    → pages/admin-users
/admin/doctors                  → pages/doctor-list
/admin/patients                 → pages/patient-list (shared)
/admin/appointments             → pages/appointment-list (shared)
/admin/reports                  → pages/admin-reports
/admin/audit-log                → pages/admin-audit
/admin/billing                  → pages/billing
```

---

## Refine Integration Plan

### Auth Provider

```typescript
// src/features/auth/model/refineAuthProvider.ts
import { useAuthStore } from "./authStore";

export const authProvider = {
  login: async ({ email, password }) => {
    const { login } = useAuthStore.getState();
    await login(email, password);
  },
  logout: async () => {
    const { logout } = useAuthStore.getState();
    await logout();
  },
  checkAuth: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    return isAuthenticated ? Promise.resolve() : Promise.reject();
  },
  checkError: async (error) => {
    if (error?.status === 401) {
      useAuthStore.getState().logout();
      return Promise.reject();
    }
    return Promise.resolve();
  },
  getPermissions: async () => {
    const { user } = useAuthStore.getState();
    return user?.role || null;
  },
  getIdentity: async () => {
    const { user } = useAuthStore.getState();
    return user;
  },
};
```

### Access Control Provider

```typescript
// src/features/auth/model/refineAccessControl.ts
const roleRoutes = {
  Patient: ["/patient", "/login", "/register"],
  Doctor: ["/doctor", "/login"],
  Receptionist: ["/reception", "/login"],
  Admin: ["/admin", "/reception", "/doctor", "/patient", "/login"],
};

export const accessControlProvider = {
  can: async ({ action, resource, params }) => {
    const { user } = useAuthStore.getState();
    const role = user?.role;
    // Check if current role can access the resource
    // Return { can: true/false }
  },
};
```

### Refine Resources

```typescript
// src/app/router.tsx
const resources = [
  { name: "patients", list: "/admin/patients", show: "/patient/profile" },
  { name: "doctors", list: "/admin/doctors", show: "/doctor/profile" },
  { name: "appointments", list: "/admin/appointments" },
  { name: "visits", list: "/doctor/visits" },
  { name: "invoices", list: "/admin/billing" },
  { name: "users", list: "/admin/users" },
  { name: "reports", list: "/admin/reports" },
  { name: "audit-log", list: "/admin/audit-log" },
];
```

---

## State Management Strategy

### React Query (Server State)

Used for ALL data fetched from the API. Each entity defines its own query hooks:

```typescript
// Pattern: entities/{entity}/model/{entity}Queries.ts
export const useGetDoctors = (filters: DoctorFilters) =>
  useQuery({
    queryKey: ["doctors", filters],
    queryFn: () => doctorApi.getAll(filters),
  });

export const useCreateDoctor = () =>
  useMutation({
    mutationFn: doctorApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctors"] }),
  });
```

### Zustand (Client State)

Used ONLY for:
1. **Auth state** — `authStore` (user, token, isAuthenticated)
2. **Multi-step form state** — `bookingStore`, `visitFormStore`
3. **UI state** — `sidebarStore`, `notificationStore`
4. **Dashboard filters** — `dashboardStore`

### React Hook Form + Zod

Used for ALL forms. Zod schemas defined per feature/page. Integration pattern:

```typescript
const form = useForm({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: "", password: "" },
});
```

---

## Shared API Client Setup

```typescript
// src/shared/api/client.ts
import axios from "axios";
import { useAuthStore } from "@/features/auth";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## Implementation Phases

### Phase 1 — Foundation (Week 1-2)
- [ ] Project scaffolding (Next.js 16, Shadcn, DiceUI)
- [ ] FSD folder structure setup
- [ ] Shared API client + interceptors
- [ ] Auth feature (login, register, authStore, Refine provider)
- [ ] Route guards + role-based routing
- [ ] Layout components (Header, Sidebar)

### Phase 2 — Core Entities (Week 3-4)
- [ ] Patient profile CRUD
- [ ] Doctor profile + schedule management
- [ ] Slot availability display
- [ ] Appointment booking wizard
- [ ] Appointment list + status management

### Phase 3 — Clinical Workflow (Week 5-6)
- [ ] Visit form (structured fields)
- [ ] Prescription creation
- [ ] Visit signing + billing integration
- [ ] Follow-up scheduling
- [ ] Prescription PDF download (blocked by missing endpoint)

### Phase 4 — Billing & Admin (Week 7-8)
- [ ] Invoice list + detail
- [ ] Payment + waive actions
- [ ] Admin dashboard (metrics)
- [ ] Admin reports + charts
- [ ] Audit log viewer
- [ ] User management CRUD
- [ ] CSV export

### Phase 5 — Polish & Notifications (Week 9-10)
- [ ] Notification center (blocked by missing endpoints — stub first)
- [ ] Waitlist UI (blocked by missing endpoint)
- [ ] Error handling refinement
- [ ] Loading states + skeletons
- [ ] Empty states
- [ ] Responsive design
- [ ] E2E testing

---

## Reusability Suggestions

| Component | Reused By | Strategy |
|-----------|-----------|----------|
| `DataTable` (DiceUI) | All list pages | Shared wrapper in `shared/ui/data-table/` with standardized pagination, sorting, filtering |
| `StatusBadge` | Appointments, Invoices, Visits | Generic `StatusBadge` in `shared/ui/` accepting color map |
| `DateRangePicker` | Reports, Appointment filters | Shared component |
| `AuthGuard` | All protected routes | Feature-level export, used in layout |
| `SearchBar` | Patient list, Doctor list | Generic search component in `shared/ui/` |
| `ConfirmDialog` | Cancel, Sign, Waive, Delete | Shared `ConfirmDialog` in `shared/ui/` |
| `FormSection` | Patient form, Doctor form, Visit form | Shared form layout component |
| `EmptyState` | All list pages | Shared component with icon, title, description |
| `ErrorBoundary` | App-level | Shared error boundary wrapper |

---

## Key Technical Decisions

1. **Next.js App Router** — Use server components for static shell, client components for interactive features
2. **Refine** — Used ONLY for auth provider, access control, and resource definitions. NOT used for data fetching (React Query instead) to avoid coupling
3. **DiceUI DataTable** — Use for all table views with built-in sorting, pagination, and filtering
4. **Zustand over Context** — Simpler API, no provider nesting, works well with React Query
5. **Zod schemas colocated** — Each feature/page defines its own schemas, not shared globally
6. **API types from backend** — Generate types from API responses rather than maintaining separate type definitions. Consider `openapi-typescript` if backend provides OpenAPI spec
7. **Token storage** — `localStorage` for MVP (no httpOnly cookie support in backend). Migrate to cookie-based auth when backend supports it
8. **Polling for notifications** — 30s interval via React Query `refetchInterval`. Upgrade to SSE/WebSocket when backend supports it
