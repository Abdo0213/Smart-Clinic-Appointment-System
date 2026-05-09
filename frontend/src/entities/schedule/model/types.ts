export interface ScheduleBreak {
  breakStart: string
  breakEnd: string
}

export interface Schedule {
  id: string
  doctorId: string
  date: string
  startTime: string
  endTime: string
  slotDuration: number
  price: number
  breaks: ScheduleBreak[]
}

export interface CreateScheduleRequest {
  date: string
  startTime: string
  endTime: string
  slotDuration: number
  price: number
  breaks: ScheduleBreak[]
}

export interface ScheduleSlot {
  start: string
  end: string
  available: boolean
  price?: number
  reason?: string
}

export interface SlotAvailability {
  doctorId: string
  date: string
  slots: ScheduleSlot[]
}
