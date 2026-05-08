import { create } from 'zustand'
import type { BookingState, BookingStep } from './types'

interface BookingActions {
  setStep: (step: BookingStep) => void
  selectDoctor: (doctorId: string) => void
  selectDate: (date: string) => void
  selectSlot: (slot: { slotStart: string; slotEnd: string }) => void
  reset: () => void
}

const initialState: BookingState = {
  step: 1,
  selectedDoctorId: null,
  selectedDate: null,
  selectedSlot: null,
}

export const useBookingStore = create<BookingState & BookingActions>()((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  selectDoctor: (doctorId) => set({ selectedDoctorId: doctorId, step: 2 }),
  selectDate: (date) => set({ selectedDate: date, step: 3 }),
  selectSlot: (slot) => set({ selectedSlot: slot, step: 4 }),
  reset: () => set(initialState),
}))
