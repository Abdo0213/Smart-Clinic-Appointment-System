import { z } from 'zod'
import { APPOINTMENT_STATUS_VALUES } from '@/entities/appointment/model/types'

export const bookAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  slotDate: z.string().min(1, 'Date is required'),
  slotStart: z.string().min(1, 'Start time is required'),
  slotEnd: z.string().min(1, 'End time is required'),
})

export type BookAppointmentFormData = z.infer<typeof bookAppointmentSchema>

export const cancelAppointmentSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required').max(500, 'Reason must be under 500 characters'),
})

export type CancelAppointmentFormData = z.infer<typeof cancelAppointmentSchema>

export const statusUpdateSchema = z.object({
  status: z.enum(APPOINTMENT_STATUS_VALUES, {
    message: 'Status is required',
  }),
})

export type StatusUpdateFormData = z.infer<typeof statusUpdateSchema>
