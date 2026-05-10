import type { Gender } from '@/shared/types/enums'

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export interface Patient {
  id: string
  userId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: Gender
  phone: string
  address: string
  bloodType: BloodType | ''
  knownAllergies: string
  emergencyContact: string
  emergencyPhone: string
  insuranceProvider: string
  insuranceNumber: string
  createdAt: string
}

export interface CreatePatientRequest {
  userId?: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: Gender
  phone: string
  address?: string
  bloodType?: BloodType
  knownAllergies?: string
  emergencyContact?: string
  emergencyPhone?: string
  insuranceProvider?: string
  insuranceNumber?: string
}

export interface UpdatePatientRequest {
  userId?: string
  firstName?: string
  lastName?: string
  email?: string
  dateOfBirth?: string
  gender?: Gender
  phone?: string
  address?: string
  bloodType?: BloodType
  knownAllergies?: string
  emergencyContact?: string
  emergencyPhone?: string
  insuranceProvider?: string
  insuranceNumber?: string
}

export interface PatientFilters {
  name?: string
  phone?: string
  page?: number
  size?: number
}
