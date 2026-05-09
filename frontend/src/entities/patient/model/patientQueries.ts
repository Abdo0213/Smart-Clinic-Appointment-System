import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientApi } from '../api/patientApi'
import type { PatientFilters, CreatePatientRequest, UpdatePatientRequest } from './types'

export function useGetPatients(filters: PatientFilters) {
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: () => patientApi.getAll(filters),
  })
}

export function useGetPatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientApi.getById(id),
    enabled: !!id,
  })
}

export function useGetMe() {
  return useQuery({
    queryKey: ['patients', 'me'],
    queryFn: () => patientApi.getMe(),
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePatientRequest) => patientApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientRequest }) =>
      patientApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patients', variables.id] })
    },
  })
}
