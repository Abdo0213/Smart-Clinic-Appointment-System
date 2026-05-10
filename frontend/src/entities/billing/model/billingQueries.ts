import { useQuery } from '@tanstack/react-query'
import { billingApi } from '../api/billingApi'

export const billingKeys = {
  all: ['billing'] as const,
  byVisit: (visitId: string) => [...billingKeys.all, 'visit', visitId] as const,
}

export const useGetInvoiceByVisit = (visitId: string) => {
  return useQuery({
    queryKey: billingKeys.byVisit(visitId),
    queryFn: () => billingApi.getInvoiceByVisitId(visitId),
    enabled: !!visitId,
    retry: false, // Don't retry if not found, it's expected for some visits
  })
}
