// Feature: admin-reports
// Public API

export type {
  RevenueReport,
  AppointmentsReport,
  VisitsReport,
  DoctorsReport,
  PatientsReport,
  NoShowReport,
  AuditLogEntry,
  PaginatedAuditLog,
  ReportQueryParams,
  ExportQueryParams,
  AuditLogQueryParams,
  MetricCardData,
} from './model/reportTypes'

export {
  reportFilterSchema,
  auditLogQuerySchema,
  createUserSchema,
  type ReportFilterData,
  type AuditLogQueryData,
  type CreateUserFormData,
} from './model/reportSchemas'

export { reportApi } from './api/reportApi'

export {
  useGetAppointmentReport,
  useGetRevenueReport,
  useGetVisitsReport,
  useGetDoctorsReport,
  useGetPatientsReport,
  useGetNoShowReport,
  useGetAuditLog,
  useExportReport,
} from './api/reportQueries'
