import { apiClient } from '@/shared/api/client'
import { API_ROUTES } from '@/shared/api/apiRoutes'
import type {
  Visit,
  VisitFilters,
  CreateVisitRequest,
  SignVisitRequest,
  Prescription,
  IssuePrescriptionRequest,
  ScheduleFollowUpRequest,
} from '../model/types'
import type { PaginatedResponse } from '@/shared/types/api'

export const visitApi = {
  async getAll(filters: VisitFilters): Promise<PaginatedResponse<Visit>> {
    const { data } = await apiClient.get<PaginatedResponse<Visit>>(API_ROUTES.VISITS.LIST, {
      params: filters,
    })
    return data
  },

  async getById(id: string): Promise<Visit> {
    const { data } = await apiClient.get<Visit>(API_ROUTES.VISITS.DETAIL(id))
    return data
  },

  async create(payload: CreateVisitRequest): Promise<Visit> {
    const { data } = await apiClient.post<Visit>(API_ROUTES.VISITS.LIST, payload)
    return data
  },

  async update(id: string, payload: CreateVisitRequest): Promise<Visit> {
    const { data } = await apiClient.put<Visit>(API_ROUTES.VISITS.DETAIL(id), payload)
    return data
  },

  async sign(id: string, payload: SignVisitRequest): Promise<Visit> {
    const { data } = await apiClient.post<Visit>(API_ROUTES.VISITS.SIGN(id), payload)
    return data
  },

  async issuePrescription(visitId: string, payload: IssuePrescriptionRequest): Promise<Prescription> {
    const { data } = await apiClient.post<Prescription>(
      API_ROUTES.VISITS.PRESCRIPTIONS(visitId),
      payload
    )
    return data
  },

  async scheduleFollowUp(visitId: string, payload: ScheduleFollowUpRequest): Promise<unknown> {
    const { data } = await apiClient.post(API_ROUTES.VISITS.FOLLOW_UP(visitId), payload)
    return data
  },

  async getPrescriptionPdfUrl(visitId: string, prescriptionId: string): Promise<{ downloadUrl: string }> {
    const { data } = await apiClient.get<{ downloadUrl: string }>(
      API_ROUTES.VISITS.PRESCRIPTION_PDF(visitId, prescriptionId)
    )
    return data
  },
  
  async getAllPrescriptionsPdfUrl(visitId: string): Promise<{ downloadUrl: string }> {
    const { data } = await apiClient.get<{ downloadUrl: string }>(
      API_ROUTES.VISITS.ALL_PRESCRIPTIONS_PDF(visitId)
    )
    return data
  },

  async getByAppointmentId(appointmentId: string): Promise<Visit> {
    const { data } = await apiClient.get<Visit>(API_ROUTES.VISITS.BY_APPOINTMENT(appointmentId))
    return data
  },
}
