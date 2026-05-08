import { apiClient } from '@/shared/api/client'
import { API_ROUTES } from '@/shared/api/apiRoutes'
import type {
  Invoice,
  InvoiceFilters,
  InvoiceListResponse,
  CreateInvoiceRequest,
  WaiveInvoiceRequest,
} from '../model/types'

export const invoiceApi = {
  async getAll(filters: InvoiceFilters): Promise<InvoiceListResponse> {
    const { data } = await apiClient.get<InvoiceListResponse>(API_ROUTES.BILLING.INVOICES, {
      params: filters,
    })
    return data
  },

  async getById(id: string): Promise<Invoice> {
    const { data } = await apiClient.get<Invoice>(API_ROUTES.BILLING.INVOICE_DETAIL(id))
    return data
  },

  async create(payload: CreateInvoiceRequest): Promise<Invoice> {
    const { data } = await apiClient.post<Invoice>(API_ROUTES.BILLING.INVOICES, payload)
    return data
  },

  async markAsPaid(id: string): Promise<Invoice> {
    const { data } = await apiClient.patch<Invoice>(API_ROUTES.BILLING.PAY(id))
    return data
  },

  async waive(id: string, payload: WaiveInvoiceRequest): Promise<Invoice> {
    const { data } = await apiClient.patch<Invoice>(API_ROUTES.BILLING.WAIVE(id), payload)
    return data
  },
}
