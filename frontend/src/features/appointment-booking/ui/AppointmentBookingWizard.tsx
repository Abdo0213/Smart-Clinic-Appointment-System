'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useBookingStore } from '../model/bookingStore'
import { useBookAppointment } from '../api/bookAppointment'
import { DoctorSlotPicker } from './DoctorSlotPicker'
import { useAuthStore } from '@/features/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { ROUTE_PATHS } from '@/shared/config/appConfig'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import type { Appointment } from '@/entities/appointment'

interface AppointmentBookingWizardProps {
  patientId?: string
}

export function AppointmentBookingWizard({ patientId: initialPatientId }: AppointmentBookingWizardProps) {
  const { step, selectedDoctorId, selectedDate, selectedSlot, reset } = useBookingStore()
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const bookAppointment = useBookAppointment()
  const [bookingResult, setBookingResult] = useState<Appointment | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)

  const patientId = initialPatientId || user?.patientId

  const handleConfirm = async () => {
    if (!patientId || !selectedDoctorId || !selectedDate || !selectedSlot) return

    setBookingError(null)
    try {
      const result = await bookAppointment.mutateAsync({
        patientId,
        doctorId: selectedDoctorId,
        slotDate: selectedDate,
        slotStart: selectedSlot.slotStart,
        slotEnd: selectedSlot.slotEnd,
      })
      setBookingResult(result)
      toast.success('Appointment booked successfully!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to book appointment. The slot may no longer be available.'
      setBookingError(message)
      toast.error(message)
    }
  }

  if (bookingResult) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <CheckCircle2 className="size-12 text-green-600" />
        <h2 className="text-xl font-semibold">Appointment Booked!</h2>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Booking Confirmation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Doctor</span>
              <span>{bookingResult.doctorName ?? bookingResult.doctorId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{bookingResult.slotDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span>{bookingResult.slotStart} – {bookingResult.slotEnd}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span>{bookingResult.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span>{formatCurrency(bookingResult.price)}</span>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button onClick={() => { reset(); setBookingResult(null); setBookingError(null) }}>
            Book Another
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const target = user?.role === 'Admin' ? ROUTE_PATHS.ADMIN_APPOINTMENTS :
                            user?.role === 'Receptionist' ? ROUTE_PATHS.RECEPTION_APPOINTMENTS : 
                            ROUTE_PATHS.PATIENT_APPOINTMENTS;
              router.push(target);
            }}
          >
            View Appointments
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DoctorSlotPicker />
      {bookingError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {bookingError}
        </div>
      )}
      {step === 4 && (
        <div className="flex justify-end gap-2">
          <Button onClick={handleConfirm} disabled={bookAppointment.isPending}>
            {bookAppointment.isPending ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      )}
    </div>
  )
}
