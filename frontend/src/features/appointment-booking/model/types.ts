export type BookingStep = 1 | 2 | 3 | 4

export interface BookingState {
  step: BookingStep
  selectedDoctorId: string | null
  selectedDate: string | null
  selectedSlot: { slotStart: string; slotEnd: string } | null
}
