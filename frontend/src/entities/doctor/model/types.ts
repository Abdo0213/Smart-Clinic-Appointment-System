export interface Doctor {
  id: string
  userId: string
  firstName: string
  lastName: string
  specialization: string
  bio: string
  phone: string
  isActive: boolean
  createdAt: string
}

export interface DoctorFilters {
  specialization?: string
  isActive?: boolean
  page?: number
  size?: number
}

export interface UpdateDoctorRequest {
  specialization?: string
  bio?: string
  phone?: string
}

export interface DoctorListResponse {
  content: Doctor[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
