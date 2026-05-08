import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { doctorApi } from '../api/doctorApi'
import type { Doctor, DoctorFilters, DoctorListResponse, UpdateDoctorRequest } from './types'

const doctorsQueryKey = ['doctors'] as const

function isDoctorListResponse(value: unknown): value is DoctorListResponse {
  return (
    !!value &&
    typeof value === 'object' &&
    'content' in value &&
    Array.isArray((value as DoctorListResponse).content)
  )
}

function updateDoctorInList(list: DoctorListResponse, doctorId: string, update: (doctor: Doctor) => Doctor) {
  return {
    ...list,
    content: list.content.map((doctor) => (doctor.id === doctorId ? update(doctor) : doctor)),
  }
}

export function useGetDoctors(filters: DoctorFilters) {
  return useQuery({
    queryKey: [...doctorsQueryKey, filters],
    queryFn: () => doctorApi.getAll(filters),
    placeholderData: keepPreviousData,
  })
}

export function useGetDoctor(id: string) {
  return useQuery({
    queryKey: [...doctorsQueryKey, id],
    queryFn: () => doctorApi.getById(id),
    enabled: !!id,
  })
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDoctorRequest }) =>
      doctorApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: doctorsQueryKey })

      const previousDoctor = queryClient.getQueryData<Doctor>([...doctorsQueryKey, id])
      const previousLists = queryClient.getQueriesData({ queryKey: doctorsQueryKey })

      if (previousDoctor) {
        queryClient.setQueryData<Doctor>([...doctorsQueryKey, id], {
          ...previousDoctor,
          ...data,
        })
      }

      previousLists.forEach(([queryKey, value]) => {
        if (!isDoctorListResponse(value)) return
        queryClient.setQueryData(queryKey, updateDoctorInList(value, id, (doctor) => ({ ...doctor, ...data })))
      })

      return { previousDoctor, previousLists }
    },
    onError: (_error, variables, context) => {
      if (!context) return
      if (context.previousDoctor) {
        queryClient.setQueryData([...doctorsQueryKey, variables.id], context.previousDoctor)
      }
      context.previousLists.forEach(([queryKey, value]) => {
        queryClient.setQueryData(queryKey, value)
      })
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: doctorsQueryKey })
      queryClient.invalidateQueries({ queryKey: [...doctorsQueryKey, variables.id] })
    },
  })
}

export function useToggleDoctorStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      doctorApi.toggleStatus(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: doctorsQueryKey })

      const previousDoctor = queryClient.getQueryData<Doctor>([...doctorsQueryKey, id])
      const previousLists = queryClient.getQueriesData({ queryKey: doctorsQueryKey })

      if (previousDoctor) {
        queryClient.setQueryData<Doctor>([...doctorsQueryKey, id], {
          ...previousDoctor,
          isActive,
        })
      }

      previousLists.forEach(([queryKey, value]) => {
        if (!isDoctorListResponse(value)) return
        queryClient.setQueryData(
          queryKey,
          updateDoctorInList(value, id, (doctor) => ({ ...doctor, isActive }))
        )
      })

      return { previousDoctor, previousLists }
    },
    onError: (_error, variables, context) => {
      if (!context) return
      if (context.previousDoctor) {
        queryClient.setQueryData([...doctorsQueryKey, variables.id], context.previousDoctor)
      }
      context.previousLists.forEach(([queryKey, value]) => {
        queryClient.setQueryData(queryKey, value)
      })
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: doctorsQueryKey })
      queryClient.invalidateQueries({ queryKey: [...doctorsQueryKey, variables.id] })
    },
  })
}
