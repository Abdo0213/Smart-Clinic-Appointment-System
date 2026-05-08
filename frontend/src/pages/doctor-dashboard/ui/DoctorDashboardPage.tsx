"use client"

import { useAuthStore } from "@/features/auth"
import { useGetDoctor } from "@/entities/doctor"
import { useGetAppointments, AppointmentStatusBadge } from "@/entities/appointment"
import { ROUTE_PATHS } from "@/shared/config/appConfig"
import { formatDate } from "@/shared/lib/formatDate"
import { LoadingSpinner } from "@/shared/ui/loading-spinner/loading-spinner"
import { EmptyState } from "@/shared/ui/empty-state/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CalendarIcon, ClockIcon, UsersIcon, StethoscopeIcon } from "lucide-react"

function getTodayISO() {
  return new Date().toISOString().split("T")[0]
}

export default function DoctorDashboardPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const doctorId = user?.doctorId ?? ""

  const { data: doctor, isLoading: doctorLoading } = useGetDoctor(doctorId)
  const { data: appointmentsData, isLoading: appointmentsLoading } = useGetAppointments({
    doctorId,
    date: getTodayISO(),
    page: 0,
    size: 50,
  })

  const todayAppointments = appointmentsData?.content ?? []
  const bookedToday = todayAppointments.filter((a) => a.status === "BOOKED" || a.status === "ARRIVED")

  if (doctorLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : user?.firstName ?? "Doctor"}
        </h1>
        <p className="text-muted-foreground">Here&apos;s your dashboard for today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <CalendarIcon className="size-5 text-primary" />
            <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todayAppointments.length}</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push(ROUTE_PATHS.DOCTOR_SCHEDULE)}
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <ClockIcon className="size-5 text-primary" />
            <CardTitle className="text-sm font-medium">View Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Manage your availability</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push(ROUTE_PATHS.DOCTOR_QUEUE)}
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <UsersIcon className="size-5 text-primary" />
            <CardTitle className="text-sm font-medium">View Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">See today&apos;s patient queue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <StethoscopeIcon className="size-5 text-primary" />
            <CardTitle className="text-sm font-medium">Start Visit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{bookedToday.length} patients waiting</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today&apos;s Queue</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push(ROUTE_PATHS.DOCTOR_QUEUE)}>
            Full View
          </Button>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : todayAppointments.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No appointments today"
              description="Your schedule is clear for today."
            />
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{appt.patientName ?? appt.patientId}</p>
                    <p className="text-sm text-muted-foreground">
                      {appt.slotStart} – {appt.slotEnd}
                    </p>
                  </div>
                  <AppointmentStatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
