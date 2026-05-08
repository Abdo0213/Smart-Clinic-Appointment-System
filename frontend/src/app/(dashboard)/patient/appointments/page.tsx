'use client'

import { useState } from 'react'
import { useAuthStore } from '@/features/auth'
import { useGetAppointments, useCancelAppointment, AppointmentCard, AppointmentStatusBadge, AppointmentFilters as AppointmentFiltersUI } from '@/entities/appointment'
import { useGetDoctors } from '@/entities/doctor'
import { cancelAppointmentSchema } from '@/features/appointment-booking'
import type { CancelAppointmentFormData } from '@/features/appointment-booking'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ROUTE_PATHS } from '@/shared/config/appConfig'
import Link from 'next/link'
import type { Appointment, AppointmentStatus } from '@/entities/appointment'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export default function PatientAppointmentsPage() {
  const user = useAuthStore((s) => s.user)
  const [filters, setFilters] = useState<{ date?: string; status?: AppointmentStatus; doctorId?: string }>({})
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const cancelMutation = useCancelAppointment()
  const { data: doctorsData } = useGetDoctors({})

  const { data, isLoading } = useGetAppointments({
    patientId: user?.patientId ?? '',
    ...filters,
    size: 20,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<CancelAppointmentFormData>({
    resolver: zodResolver(cancelAppointmentSchema),
  })

  const onCancelSubmit = (formData: CancelAppointmentFormData) => {
    if (!cancelTarget) return
    cancelMutation.mutate({ id: cancelTarget.id, reason: formData.reason }, { onSuccess: () => setCancelTarget(null) })
  }

  const appointments = data?.content ?? []
  const doctors = doctorsData?.content?.map((d) => ({ id: d.id, name: `Dr. ${d.firstName} ${d.lastName}` })) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <Link href={ROUTE_PATHS.PATIENT_BOOK_APPOINTMENT} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
          Book New
        </Link>
      </div>
      <AppointmentFiltersUI onFilterChange={setFilters} doctors={doctors} />
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No appointments found.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {appointments.map((apt) => (
            <div key={apt.id} className="relative">
              <AppointmentCard appointment={apt} />
              {apt.status === 'BOOKED' && (
                <Button variant="destructive" size="sm" className="mt-2" onClick={() => setCancelTarget(apt)}>
                  Cancel
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCancelSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for cancellation</Label>
              <Input id="reason" {...register('reason')} />
              {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCancelTarget(null)}>Keep Appointment</Button>
              <Button type="submit" variant="destructive" disabled={cancelMutation.isPending}>
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
