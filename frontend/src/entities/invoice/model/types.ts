import type { InvoiceStatus } from '@/shared/types/enums'

export type { InvoiceStatus }

export const INVOICE_STATUS_VALUES: InvoiceStatus[] = ['PENDING', 'PAID', 'WAIVED']

export interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface CreateLineItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface Invoice {
  id: string
  visitId: string
  patientId: string
  appointmentId?: string
  status: InvoiceStatus
  totalAmount: number
  lineItems: LineItem[]
  createdAt: string
  paidAt: string | null
  waivedAt: string | null
  waivedReason: string | null
  invoiceNumber: string
}

export interface CreateInvoiceRequest {
  visitId: string
  patientId: string
  appointmentId?: string
  lineItems: CreateLineItem[]
}

export interface InvoiceFilters {
  patientId?: string
  status?: InvoiceStatus
  page?: number
  size?: number
}

export interface InvoiceListResponse {
  data: Invoice[]
  total: number
  page: number
  size: number
  totalPages: number
}

export interface WaiveInvoiceRequest {
  reason: string
}
