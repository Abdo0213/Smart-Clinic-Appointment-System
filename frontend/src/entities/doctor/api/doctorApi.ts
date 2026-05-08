import { apiClient } from '@/shared/api/client'
import { API_ROUTES } from '@/shared/api/apiRoutes'
import type { DoctorFilters, Doctor, UpdateDoctorRequest, DoctorListResponse } from '../model/types'

export const doctorApi = {
  async getAll(filters: DoctorFilters): Promise<DoctorListResponse> {
    const { data } = await apiClient.get<DoctorListResponse>(API_ROUTES.DOCTORS.LIST, {
      params: filters,
    })
    return data
  },

  async getById(id: string): Promise<Doctor> {
    const { data } = await apiClient.get<Doctor>(API_ROUTES.DOCTORS.DETAIL(id))
    return data
  },

  async update(id: string, payload: UpdateDoctorRequest): Promise<Doctor> {
    const { data } = await apiClient.put<Doctor>(API_ROUTES.DOCTORS.DETAIL(id), payload)
    return data
  },

  async toggleStatus(id: string, isActive: boolean): Promise<Doctor> {
    const { data } = await apiClient.patch<Doctor>(API_ROUTES.DOCTORS.STATUS(id), null, {
      params: { isActive },
    })
    return data
  },
}
