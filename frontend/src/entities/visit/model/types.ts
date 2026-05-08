export interface Prescription {
  id: string
  visitId: string
  medicationName: string
  dosage: string
  frequency: string
  durationDays: number
  notes: string
  createdAt: string
}

export interface BillingLineItem {
  id: string
  visitId: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface BillingLineItemInput {
  description: string
  quantity: number
  unitPrice: number
}

export interface SignVisitRequest {
  additionalItems: BillingLineItemInput[]
}

export interface CreateVisitRequest {
  appointmentId: string
  chiefComplaint: string
  examinationFindings: string
  assessment: string
  plan: string
  icd10Codes: string[]
}

export interface Visit {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  chiefComplaint: string
  examinationFindings: string
  assessment: string
  plan: string
  icd10Codes: string[]
  isSigned: boolean
  signedAt: string | null
  prescriptions: Prescription[]
  createdAt: string
  updatedAt: string
}

export interface VisitFilters {
  doctorId?: string
  patientId?: string
  page?: number
  size?: number
}

export interface IssuePrescriptionRequest {
  medicationName: string
  dosage: string
  frequency: string
  durationDays: number
  notes?: string
}

export interface ScheduleFollowUpRequest {
  date: string
  time: string
  reason: string
}
