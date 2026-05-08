import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { appointmentApi } from '../api/appointmentApi'
import type {
  Appointment,
  AppointmentFilters,
  AppointmentListResponse,
  BookAppointmentRequest,
  RescheduleAppointmentRequest,
  AppointmentStatus,
} from './types'

export function useGetAppointments(filters: AppointmentFilters) {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => appointmentApi.getAll(filters),
    placeholderData: keepPreviousData,
  })
}

export function useGetAppointment(id: string) {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => appointmentApi.getById(id),
    enabled: !!id,
  })
}

/**
 * Doctor daily queue — polls every 30 seconds for live updates.
 */
export function useDoctorQueue(doctorId: string, date: string) {
  return useQuery({
    queryKey: ['appointments', 'queue', doctorId, date],
    queryFn: () => appointmentApi.getAll({ doctorId, date, size: 50 }),
    enabled: !!doctorId && !!date,
    refetchInterval: 30_000,
  })
}

export function useBookAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BookAppointmentRequest) => appointmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['appointments'] })
      const previousAppointment = queryClient.getQueryData<Appointment>(['appointments', id])
      if (previousAppointment) {
        queryClient.setQueryData<Appointment>(['appointments', id], {
          ...previousAppointment,
          status,
        })
      }
      return { previousAppointment }
    },
    onError: (_error, variables, context) => {
      if (context?.previousAppointment) {
        queryClient.setQueryData(['appointments', variables.id], context.previousAppointment)
      }
    },
    onSettled: () => {
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

export function useRescheduleAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & RescheduleAppointmentRequest) =>
      appointmentApi.reschedule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: (id: string) => appointmentApi.joinWaitlist(id),
  })
}

