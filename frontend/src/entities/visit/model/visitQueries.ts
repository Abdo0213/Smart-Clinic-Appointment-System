import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { visitApi } from '../api/visitApi'
import type {
  Visit,
  VisitFilters,
  CreateVisitRequest,
  SignVisitRequest,
  IssuePrescriptionRequest,
  ScheduleFollowUpRequest,
} from './types'

export function useGetVisits(filters: VisitFilters) {
  return useQuery({
    queryKey: ['visits', filters],
    queryFn: () => visitApi.getAll(filters),
  })
}

export function useGetVisit(id: string) {
  return useQuery({
    queryKey: ['visits', id],
    queryFn: () => visitApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateVisit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVisitRequest) => visitApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] })
    },
  })
}

export function useSignVisit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SignVisitRequest }) =>
      visitApi.sign(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visits'] })
      queryClient.invalidateQueries({ queryKey: ['visits', variables.id] })
    },
  })
}

export function useIssuePrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: IssuePrescriptionRequest }) =>
      visitApi.issuePrescription(visitId, data),
    onMutate: async ({ visitId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['visits', visitId] })
      const previousVisit = queryClient.getQueryData<Visit>(['visits', visitId])
      if (previousVisit) {
        const optimisticPrescription = {
          id: `temp-${Date.now()}`,
          visitId,
          medicationName: data.medicationName,
          dosage: data.dosage,
          frequency: data.frequency,
          durationDays: data.durationDays,
          notes: data.notes ?? '',
          createdAt: new Date().toISOString(),
        }
        queryClient.setQueryData<Visit>(['visits', visitId], {
          ...previousVisit,
          prescriptions: [...previousVisit.prescriptions, optimisticPrescription],
        })
      }
      return { previousVisit }
    },
    onError: (_error, variables, context) => {
      if (context?.previousVisit) {
        queryClient.setQueryData(['visits', variables.visitId], context.previousVisit)
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visits', variables.visitId] })
    },
  })
}

export function useScheduleFollowUp() {
  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: ScheduleFollowUpRequest }) =>
      visitApi.scheduleFollowUp(visitId, data),
  })
}
