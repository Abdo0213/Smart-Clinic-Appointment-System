import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceApi } from '../api/invoiceApi'
import type { InvoiceFilters, CreateInvoiceRequest, WaiveInvoiceRequest } from './types'

export function useGetInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => invoiceApi.getAll(filters),
  })
}

export function useGetInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoiceApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) => invoiceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useMarkAsPaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => invoiceApi.markAsPaid(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', id] })
    },
  })
}

export function useWaiveInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WaiveInvoiceRequest }) =>
      invoiceApi.waive(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] })
    },
  })
}
