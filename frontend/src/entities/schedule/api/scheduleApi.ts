import { apiClient } from '@/shared/api/client'
import { API_ROUTES } from '@/shared/api/apiRoutes'
import type { Schedule, CreateScheduleRequest, SlotAvailability } from '../model/types'

export const scheduleApi = {
  async getSchedules(doctorId: string): Promise<Schedule[]> {
    const { data } = await apiClient.get<Schedule[]>(API_ROUTES.DOCTORS.SCHEDULES(doctorId))
    return data
  },

  async createSchedule(doctorId: string, payload: CreateScheduleRequest): Promise<Schedule> {
    const { data } = await apiClient.post<Schedule>(
      API_ROUTES.DOCTORS.SCHEDULES(doctorId),
      payload
    )
    return data
  },

  async getAvailableSlots(doctorId: string, date: string): Promise<SlotAvailability> {
    const { data } = await apiClient.get<SlotAvailability>(API_ROUTES.DOCTORS.SLOTS(doctorId), {
      params: { date },
    })
    return data
  },
}
