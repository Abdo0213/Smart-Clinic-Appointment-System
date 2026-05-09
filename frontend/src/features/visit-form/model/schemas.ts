import { z } from 'zod'

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').int(),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
})

export const createVisitSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  chiefComplaint: z.string().min(1, 'Chief complaint is required'),
  examinationFindings: z.string().min(1, 'Examination findings are required'),
  assessment: z.string().min(1, 'Assessment is required'),
  plan: z.string().min(1, 'Plan is required'),
  icd10Codes: z.string(),
})

export const prescriptionSchema = z.object({
  medicationName: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  durationDays: z.number().min(1, 'Duration must be at least 1 day').int(),
  notes: z.string().optional(),
})

export const signVisitSchema = z.object({
  additionalItems: z.array(lineItemSchema).min(0),
})

export type CreateVisitFormData = z.infer<typeof createVisitSchema>
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>
export type SignVisitFormData = z.infer<typeof signVisitSchema>
export type LineItemFormData = z.infer<typeof lineItemSchema>
