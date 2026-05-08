import { apiClient } from '@/shared/api/client'
import { API_ROUTES } from '@/shared/api/apiRoutes'
import type {
  RevenueReport,
  AppointmentsReport,
  VisitsReport,
  DoctorsReport,
  PatientsReport,
  NoShowReport,
  PaginatedAuditLog,
  ReportQueryParams,
  ExportQueryParams,
  AuditLogQueryParams,
} from '../model/reportTypes'

const reportEndpoints: Record<string, string> = {
  appointments: API_ROUTES.ADMIN.REPORTS_APPOINTMENTS,
  revenue: API_ROUTES.ADMIN.REPORTS_REVENUE,
  visits: API_ROUTES.ADMIN.REPORTS_VISITS,
  doctors: API_ROUTES.ADMIN.REPORTS_DOCTORS,
  patients: API_ROUTES.ADMIN.REPORTS_PATIENTS,
  'no-show-rate': API_ROUTES.ADMIN.REPORTS_NO_SHOW,
}

export const reportApi = {
  getAppointmentReport: async (params?: ReportQueryParams) => {
    const { data } = await apiClient.get<AppointmentsReport>(API_ROUTES.ADMIN.REPORTS_APPOINTMENTS, { params })
    return data
  },

  getRevenueReport: async (params?: ReportQueryParams) => {
    const { data } = await apiClient.get<RevenueReport>(API_ROUTES.ADMIN.REPORTS_REVENUE, { params })
    return data
  },

  getVisitsReport: async (params?: ReportQueryParams) => {
    const { data } = await apiClient.get<VisitsReport>(API_ROUTES.ADMIN.REPORTS_VISITS, { params })
    return data
  },

  getDoctorsReport: async (params?: ReportQueryParams) => {
    const { data } = await apiClient.get<DoctorsReport>(API_ROUTES.ADMIN.REPORTS_DOCTORS, { params })
    return data
  },

  getPatientsReport: async (params?: ReportQueryParams) => {
    const { data } = await apiClient.get<PatientsReport>(API_ROUTES.ADMIN.REPORTS_PATIENTS, { params })
    return data
  },

  getNoShowReport: async (params?: ReportQueryParams) => {
    const { data } = await apiClient.get<NoShowReport>(API_ROUTES.ADMIN.REPORTS_NO_SHOW, { params })
    return data
  },

  getAuditLog: async (params?: AuditLogQueryParams) => {
    const { data } = await apiClient.get<PaginatedAuditLog>(API_ROUTES.ADMIN.AUDIT_LOG, { params })
    return data
  },

  exportReport: async (params: ExportQueryParams) => {
    const { data } = await apiClient.get<Blob>(API_ROUTES.ADMIN.REPORTS_EXPORT, {
      params,
      responseType: 'blob',
    })
    return data
  },
}
