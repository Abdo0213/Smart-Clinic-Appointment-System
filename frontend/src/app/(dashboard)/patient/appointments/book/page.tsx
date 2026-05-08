'use client'

import { AppointmentBookingWizard } from '@/features/appointment-booking'

export default function BookAppointmentPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Book an Appointment</h1>
      <AppointmentBookingWizard />
    </div>
  )
}
