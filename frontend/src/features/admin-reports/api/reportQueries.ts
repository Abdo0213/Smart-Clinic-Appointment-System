import { useQuery, useMutation } from '@tanstack/react-query'
import { reportApi } from './reportApi'
import type { ReportQueryParams, AuditLogQueryParams, ExportQueryParams } from '../model/reportTypes'
import { downloadCsv } from '@/shared/lib/downloadCsv'
import { toast } from 'sonner'

export function useGetAppointmentReport(params?: ReportQueryParams) {
  return useQuery({
    queryKey: ['admin', 'reports', 'appointments', params],
    queryFn: () => reportApi.getAppointmentReport(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetRevenueReport(params?: ReportQueryParams) {
  return useQuery({
    queryKey: ['admin', 'reports', 'revenue', params],
    queryFn: () => reportApi.getRevenueReport(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetVisitsReport(params?: ReportQueryParams) {
  return useQuery({
    queryKey: ['admin', 'reports', 'visits', params],
    queryFn: () => reportApi.getVisitsReport(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetDoctorsReport(params?: ReportQueryParams) {
  return useQuery({
    queryKey: ['admin', 'reports', 'doctors', params],
    queryFn: () => reportApi.getDoctorsReport(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetPatientsReport(params?: ReportQueryParams) {
  return useQuery({
    queryKey: ['admin', 'reports', 'patients', params],
    queryFn: () => reportApi.getPatientsReport(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetNoShowReport(params?: ReportQueryParams) {
  return useQuery({
    queryKey: ['admin', 'reports', 'no-show-rate', params],
    queryFn: () => reportApi.getNoShowReport(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetAuditLog(params?: AuditLogQueryParams) {
  return useQuery({
    queryKey: ['admin', 'audit-log', params],
    queryFn: () => reportApi.getAuditLog(params),
  })
}

export function useExportReport() {
  return useMutation({
    mutationFn: (params: ExportQueryParams) => reportApi.exportReport(params),
    onSuccess: (blob, variables) => {
      downloadCsv(blob, `${variables.reportType}-report.csv`)
      toast.success('Report exported successfully')
    },
    onError: () => {
      toast.error('Export failed. Please try again.')
    },
  })
}
