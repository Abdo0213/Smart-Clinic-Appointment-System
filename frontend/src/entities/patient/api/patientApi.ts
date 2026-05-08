import { apiClient } from '@/shared/api/client'
import { API_ROUTES } from '@/shared/api/apiRoutes'
import type { PaginatedResponse } from '@/shared/types/api'
import type { Patient, CreatePatientRequest, UpdatePatientRequest, PatientFilters } from '../model/types'

export const patientApi = {
  async getAll(filters: PatientFilters): Promise<PaginatedResponse<Patient>> {
    const { data } = await apiClient.get<PaginatedResponse<Patient>>(API_ROUTES.PATIENTS.LIST, {
      params: filters,
    })
    return data
  },

  async getById(id: string): Promise<Patient> {
    const { data } = await apiClient.get<Patient>(API_ROUTES.PATIENTS.DETAIL(id))
    return data
  },

  async create(payload: CreatePatientRequest): Promise<Patient> {
    const { data } = await apiClient.post<Patient>(API_ROUTES.PATIENTS.CREATE, payload)
    return data
  },

  async update(id: string, payload: UpdatePatientRequest): Promise<Patient> {
    const { data } = await apiClient.put<Patient>(API_ROUTES.PATIENTS.DETAIL(id), payload)
    return data
  },
}
