import type { ReportType } from '@/shared/types/enums'

/** Revenue report response */
export interface RevenueReport {
  period: { from: string; to: string }
  totalBilled: number
  totalCollected: number
  totalWaived: number
  pending: number
  records: Array<{
    date: string
    billed: number
    collected: number
  }>
}

/** Appointment statistics response */
export interface AppointmentsReport {
  totalAppointments: number
  completed: number
  cancelled: number
  noShow: number
  byDoctor: Array<{
    doctorId: string
    doctorName: string
    total: number
    utilizationPercent: number
  }>
}

/** Clinical visit volume response (provisional) */
export interface VisitsReport {
  period: { from: string; to: string }
  totalVisits: number
  signedVisits: number
  unsignedVisits: number
  byDoctor: Array<{
    doctorId: string
    doctorName: string
    visitCount: number
  }>
}

/** Doctor utilization response (provisional) */
export interface DoctorsReport {
  period: { from: string; to: string }
  totalDoctors: number
  activeDoctors: number
  inactiveDoctors: number
  doctors: Array<{
    doctorId: string
    doctorName: string
    specialization: string
    appointmentCount: number
    completedCount: number
    utilizationPercent: number
    isActive: boolean
  }>
}

/** Patient demographics response (provisional) */
export interface PatientsReport {
  period: { from: string; to: string }
  totalPatients: number
  newPatients: number
  returningPatients: number
  byGender: Record<string, number>
  byInsurance: Array<{
    provider: string
    count: number
  }>
}

/** No-show rate response (provisional) */
export interface NoShowReport {
  period: { from: string; to: string }
  overallNoShowRate: number
  totalNoShows: number
  totalAppointments: number
  byDoctor: Array<{
    doctorId: string
    doctorName: string
    noShowCount: number
    totalAppointments: number
    noShowRate: number
  }>
  trend: Array<{
    date: string
    noShowRate: number
  }>
}

/** Audit log entry */
export interface AuditLogEntry {
  id: string
  actor: string
  action: string
  resource: string
  timestamp: string
  details: string
}

/** Paginated audit log response */
export interface PaginatedAuditLog {
  content: AuditLogEntry[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

/** Shared query params for report endpoints */
export interface ReportQueryParams {
  from?: string
  to?: string
}

/** Export query params */
export interface ExportQueryParams extends ReportQueryParams {
  reportType: ReportType
}

/** Audit log query params */
export interface AuditLogQueryParams {
  page?: number
  size?: number
}

/** Dashboard metric card data */
export interface MetricCardData {
  label: string
  value: string | number
  trend: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon: React.ReactNode
  loading?: boolean
}
