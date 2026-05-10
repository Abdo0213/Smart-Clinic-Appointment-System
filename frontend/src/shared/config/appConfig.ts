import type { UserRole } from "@/shared/types/enums";

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
}

export const ROUTE_PATHS = {
  LOGIN: "/login",
  REGISTER: "/register",
  PATIENT_DASHBOARD: "/patient",
  PATIENT_PROFILE: "/patient/profile",
  PATIENT_APPOINTMENTS: "/patient/appointments",
  PATIENT_BOOK_APPOINTMENT: "/patient/appointments/book",
  PATIENT_INVOICES: "/patient/invoices",
  PATIENT_VISITS: "/patient/visits",
  DOCTOR_DASHBOARD: "/doctor",
  DOCTOR_PROFILE: "/doctor/profile",
  DOCTOR_SCHEDULE: "/doctor/schedule",
  DOCTOR_QUEUE: "/doctor/queue",
  DOCTOR_VISITS: "/doctor/visits",
  DOCTOR_VISIT: (id: string) => `/doctor/visits/${id}`,
  DOCTOR_VISIT_CREATE: (appointmentId: string) => `/doctor/visits/new/${appointmentId}`,
  RECEPTION_DASHBOARD: "/reception",
  RECEPTION_PATIENTS: "/reception/patients",
  RECEPTION_APPOINTMENTS: "/reception/appointments",
  RECEPTION_BILLING: "/reception/billing",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_PROFILE: "/admin/profile",
  ADMIN_USERS: "/admin/users",
  ADMIN_DOCTORS: "/admin/doctors",
  ADMIN_PATIENTS: "/admin/patients",
  ADMIN_APPOINTMENTS: "/admin/appointments",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_AUDIT_LOG: "/admin/audit-log",
  ADMIN_BILLING: "/admin/billing",
} as const;

const ROLE_SIDEBAR_ITEMS: Record<UserRole, SidebarItem[]> = {
  Patient: [
    { label: "Dashboard", href: ROUTE_PATHS.PATIENT_DASHBOARD, icon: "LayoutDashboard" },
    { label: "Profile", href: ROUTE_PATHS.PATIENT_PROFILE, icon: "User" },
    { label: "Appointments", href: ROUTE_PATHS.PATIENT_APPOINTMENTS, icon: "Calendar" },
    { label: "Visit History", href: ROUTE_PATHS.PATIENT_VISITS, icon: "FileText" },
    { label: "Invoices", href: ROUTE_PATHS.PATIENT_INVOICES, icon: "Receipt" },
  ],
  Doctor: [
    { label: "Dashboard", href: ROUTE_PATHS.DOCTOR_DASHBOARD, icon: "LayoutDashboard" },
    { label: "My Profile", href: ROUTE_PATHS.DOCTOR_PROFILE, icon: "User" },
    { label: "Schedule", href: ROUTE_PATHS.DOCTOR_SCHEDULE, icon: "Clock" },
    { label: "Daily Queue", href: ROUTE_PATHS.DOCTOR_QUEUE, icon: "Users" },
    { label: "Visit History", href: ROUTE_PATHS.DOCTOR_VISITS, icon: "FileText" },
  ],
  Receptionist: [
    { label: "Dashboard", href: ROUTE_PATHS.RECEPTION_DASHBOARD, icon: "LayoutDashboard" },
    { label: "Patients", href: ROUTE_PATHS.RECEPTION_PATIENTS, icon: "UserCheck" },
    { label: "Appointments", href: ROUTE_PATHS.RECEPTION_APPOINTMENTS, icon: "Calendar" },
    { label: "Billing", href: ROUTE_PATHS.RECEPTION_BILLING, icon: "Receipt" },
  ],
  Admin: [
    { label: "Dashboard", href: ROUTE_PATHS.ADMIN_DASHBOARD, icon: "LayoutDashboard" },
    { label: "Profile", href: ROUTE_PATHS.ADMIN_PROFILE, icon: "User" },
    { label: "Users", href: ROUTE_PATHS.ADMIN_USERS, icon: "UserCog" },
    { label: "Doctors", href: ROUTE_PATHS.ADMIN_DOCTORS, icon: "Stethoscope" },
    { label: "Patients", href: ROUTE_PATHS.ADMIN_PATIENTS, icon: "Users" },
    { label: "Appointments", href: ROUTE_PATHS.ADMIN_APPOINTMENTS, icon: "Calendar" },
    { label: "Billing", href: ROUTE_PATHS.ADMIN_BILLING, icon: "Receipt" },
    { label: "Reports", href: ROUTE_PATHS.ADMIN_REPORTS, icon: "BarChart3" },
    { label: "Audit Log", href: ROUTE_PATHS.ADMIN_AUDIT_LOG, icon: "FileText" },
  ],
};

const ROLE_DEFAULT_REDIRECTS: Record<UserRole, string> = {
  Patient: ROUTE_PATHS.PATIENT_DASHBOARD,
  Doctor: ROUTE_PATHS.DOCTOR_DASHBOARD,
  Receptionist: ROUTE_PATHS.RECEPTION_DASHBOARD,
  Admin: ROUTE_PATHS.ADMIN_DASHBOARD,
};

const ROLE_ALLOWED_PATHS: Record<UserRole, string[]> = {
  Patient: [
    ROUTE_PATHS.PATIENT_DASHBOARD,
    ROUTE_PATHS.PATIENT_PROFILE,
    ROUTE_PATHS.PATIENT_APPOINTMENTS,
    ROUTE_PATHS.PATIENT_BOOK_APPOINTMENT,
    ROUTE_PATHS.PATIENT_INVOICES,
    ROUTE_PATHS.PATIENT_VISITS,
    ROUTE_PATHS.LOGIN,
    ROUTE_PATHS.REGISTER,
  ],
  Doctor: [
    ROUTE_PATHS.DOCTOR_DASHBOARD,
    ROUTE_PATHS.DOCTOR_PROFILE,
    ROUTE_PATHS.DOCTOR_SCHEDULE,
    ROUTE_PATHS.DOCTOR_QUEUE,
    ROUTE_PATHS.DOCTOR_VISITS,
    ROUTE_PATHS.LOGIN,
  ],
  Receptionist: [
    ROUTE_PATHS.RECEPTION_DASHBOARD,
    ROUTE_PATHS.RECEPTION_PATIENTS,
    ROUTE_PATHS.RECEPTION_APPOINTMENTS,
    ROUTE_PATHS.RECEPTION_BILLING,
    ROUTE_PATHS.LOGIN,
  ],
  Admin: [
    ROUTE_PATHS.ADMIN_DASHBOARD,
    ROUTE_PATHS.ADMIN_PROFILE,
    ROUTE_PATHS.ADMIN_USERS,
    ROUTE_PATHS.ADMIN_DOCTORS,
    ROUTE_PATHS.ADMIN_PATIENTS,
    ROUTE_PATHS.ADMIN_APPOINTMENTS,
    ROUTE_PATHS.ADMIN_REPORTS,
    ROUTE_PATHS.ADMIN_AUDIT_LOG,
    ROUTE_PATHS.ADMIN_BILLING,
    ROUTE_PATHS.RECEPTION_DASHBOARD,
    ROUTE_PATHS.RECEPTION_PATIENTS,
    ROUTE_PATHS.RECEPTION_APPOINTMENTS,
    ROUTE_PATHS.RECEPTION_BILLING,
    ROUTE_PATHS.LOGIN,
  ],
};

export {
  ROLE_SIDEBAR_ITEMS,
  ROLE_DEFAULT_REDIRECTS,
  ROLE_ALLOWED_PATHS,
};
