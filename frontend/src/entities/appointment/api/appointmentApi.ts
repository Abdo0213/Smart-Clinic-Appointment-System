import { apiClient } from '@/shared/api/client'
import { API_ROUTES } from '@/shared/api/apiRoutes'
import type {
  Appointment,
  AppointmentFilters,
  AppointmentListResponse,
  BookAppointmentRequest,
  CancelAppointmentRequest,
  RescheduleAppointmentRequest,
  WaitlistEntry,
} from '../model/types'
import type { AppointmentStatus } from '../model/types'

export const appointmentApi = {
  async getAll(filters: AppointmentFilters): Promise<AppointmentListResponse> {
    const { data } = await apiClient.get<AppointmentListResponse>(API_ROUTES.APPOINTMENTS.LIST, {
      params: filters,
    })
    return data
  },

  async getById(id: string): Promise<Appointment> {
    const { data } = await apiClient.get<Appointment>(API_ROUTES.APPOINTMENTS.DETAIL(id))
    return data
  },

  async create(payload: BookAppointmentRequest): Promise<Appointment> {
    const { data } = await apiClient.post<Appointment>(API_ROUTES.APPOINTMENTS.LIST, payload)
    return data
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const { data } = await apiClient.patch<Appointment>(
      API_ROUTES.APPOINTMENTS.STATUS(id),
      { status }
    )
    return data
  },

  async cancel(id: string, reason: string): Promise<void> {
    const payload: CancelAppointmentRequest = { reason }
    await apiClient.delete(API_ROUTES.APPOINTMENTS.DETAIL(id), { data: payload })
  },

  async joinWaitlist(id: string): Promise<WaitlistEntry> {
    const { data } = await apiClient.post<WaitlistEntry>(
      API_ROUTES.APPOINTMENTS.WAITLIST(id)
    )
    return data
  },

  async reschedule(id: string, payload: RescheduleAppointmentRequest): Promise<Appointment> {
    const { data } = await apiClient.post<Appointment>(
      API_ROUTES.APPOINTMENTS.RESCHEDULE(id),
      payload
    )
    return data
  },
}
