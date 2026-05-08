'use client'

import { useAuthStore } from '@/features/auth'
import { useGetAppointments, AppointmentCard } from '@/entities/appointment'
import { useGetDoctor } from '@/entities/doctor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, UsersIcon, ClockIcon } from 'lucide-react'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'

export default function DoctorDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: doctor } = useGetDoctor(user?.doctorId ?? '')
  const today = new Date().toISOString().split('T')[0]
  const { data: appointmentsData } = useGetAppointments({ doctorId: user?.doctorId ?? '', date: today, size: 50 })

  const appointments = appointmentsData?.content ?? []
  const booked = appointments.filter((a) => a.status === 'BOOKED')
  const arrived = appointments.filter((a) => a.status === 'ARRIVED')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, Dr. {user?.firstName}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booked</CardTitle>
            <ClockIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{booked.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arrived</CardTitle>
            <UsersIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{arrived.length}</div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Today&apos;s Schedule</h2>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No appointments today.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {appointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
