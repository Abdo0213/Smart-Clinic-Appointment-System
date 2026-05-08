import type { AppointmentStatus } from '@/shared/types/enums'

export type { AppointmentStatus }

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  slotDate: string
  slotStart: string
  slotEnd: string
  status: AppointmentStatus
  price: number
  bookedBy: string
  cancelReason?: string
  createdAt: string
  updatedAt?: string
  patientName?: string
  doctorName?: string
}

export interface BookAppointmentRequest {
  patientId: string
  doctorId: string
  slotDate: string
  slotStart: string
  slotEnd: string
}

export interface CancelAppointmentRequest {
  reason: string
}

export interface AppointmentFilters {
  patientId?: string
  doctorId?: string
  date?: string
  status?: AppointmentStatus
  page?: number
  size?: number
}

export interface AppointmentListResponse {
  content: Appointment[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface RescheduleAppointmentRequest {
  slotDate: string
  slotStart: string
  slotEnd: string
}

export interface WaitlistEntry {
  id: string
  appointmentId: string | null
  patientId: string
  doctorId: string
  slotDate: string
  slotStart: string
  slotEnd: string
  position: number
  status: 'PENDING' | 'NOTIFIED' | 'FULFILLED' | 'EXPIRED'
  createdAt: string
}

export const APPOINTMENT_STATUS_VALUES: AppointmentStatus[] = [
  'BOOKED',
  'ARRIVED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]
