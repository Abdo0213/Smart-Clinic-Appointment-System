import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleApi } from '../api/scheduleApi'
import type { CreateScheduleRequest } from './types'

export function useGetSchedules(doctorId: string) {
  return useQuery({
    queryKey: ['schedules', doctorId],
    queryFn: () => scheduleApi.getSchedules(doctorId),
    enabled: !!doctorId,
  })
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ doctorId, data }: { doctorId: string; data: CreateScheduleRequest }) =>
      scheduleApi.createSchedule(doctorId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.doctorId] })
      queryClient.invalidateQueries({ queryKey: ['slots', variables.doctorId] })
    },
  })
}

export function useGetAvailableSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: ['slots', doctorId, date],
    queryFn: () => scheduleApi.getAvailableSlots(doctorId, date),
    enabled: !!doctorId && !!date,
    staleTime: 30 * 1000, // 30 seconds — slots don't change frequently
  })
}
