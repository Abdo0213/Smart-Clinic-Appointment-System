import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentApi } from '@/entities/appointment/api/appointmentApi'
import type { BookAppointmentRequest, AppointmentStatus } from '@/entities/appointment/model/types'

export function useBookAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BookAppointmentRequest) => appointmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      appointmentApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useUpdateStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentApi.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.id] })
    },
  })
}

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: (id: string) => appointmentApi.joinWaitlist(id),
  })
}
