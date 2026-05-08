export type UserRole = "Patient" | "Doctor" | "Receptionist" | "Admin";

export type AppointmentStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "BOOKED"
  | "ARRIVED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type InvoiceStatus = "PENDING" | "PAID" | "WAIVED";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type NotificationType =
  | "APPOINTMENT_REMINDER_24H"
  | "APPOINTMENT_REMINDER_2H"
  | "APPOINTMENT_STATUS_CHANGE"
  | "PRESCRIPTION_READY"
  | "APPOINTMENT_CANCELLED";

export type ReportType =
  | "appointments"
  | "revenue"
  | "visits"
  | "doctors"
  | "patients"
  | "no-show-rate";
