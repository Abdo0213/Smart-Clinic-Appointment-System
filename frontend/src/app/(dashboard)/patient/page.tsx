'use client'

import { useAuthStore } from '@/features/auth'
import { useGetAppointments } from '@/entities/appointment'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, ClockIcon, CheckCircle2Icon } from 'lucide-react'
import { ROUTE_PATHS } from '@/shared/config/appConfig'
import Link from 'next/link'

export default function PatientDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: appointmentsData } = useGetAppointments({ patientId: user?.patientId ?? '', size: 5 })

  const upcoming = appointmentsData?.content?.filter((a) => a.status === 'BOOKED') ?? []
  const completed = appointmentsData?.content?.filter((a) => a.status === 'COMPLETED') ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.firstName}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcoming.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ClockIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsData?.totalElements ?? 0}</div>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-2">
        <Link href={ROUTE_PATHS.PATIENT_BOOK_APPOINTMENT} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
          Book Appointment
        </Link>
        <Link href={ROUTE_PATHS.PATIENT_APPOINTMENTS} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground">
          View All Appointments
        </Link>
      </div>
    </div>
  )
}
