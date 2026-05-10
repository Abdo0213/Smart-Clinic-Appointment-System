import { apiClient } from "@/shared/api/client"
import { API_ROUTES } from "@/shared/api/apiRoutes"

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Invoice {
  id: string
  visitId: string
  patientId: string
  patientName: string
  invoiceNumber: string
  status: 'PENDING' | 'PAID' | 'WAIVED'
  totalAmount: number
  lineItems: LineItem[]
  createdAt: string
  paidAt?: string
}

export const billingApi = {
  async getInvoiceByVisitId(visitId: string): Promise<Invoice> {
    const { data } = await apiClient.get<Invoice>(API_ROUTES.BILLING.BY_VISIT(visitId))
    return data
  },
}
