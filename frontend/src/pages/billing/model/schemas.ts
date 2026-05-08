import { z } from 'zod'

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').int(),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
})

export const createInvoiceSchema = z.object({
  visitId: z.string().min(1, 'Visit is required'),
  patientId: z.string().min(1, 'Patient is required'),
  appointmentId: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
})

export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>
export type BillingLineItemFormData = z.infer<typeof lineItemSchema>
