"use client"

import { useAuthStore } from "@/features/auth"
import { useGetPatient } from "@/entities/patient"
import { useGetAppointments } from "@/entities/appointment"
import { ROUTE_PATHS } from "@/shared/config/appConfig"
import { LoadingSpinner } from "@/shared/ui/loading-spinner/loading-spinner"
import { formatDate } from "@/shared/lib/formatDate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/shared/ui/empty-state/empty-state"
import { useRouter } from "next/navigation"
import { CalendarIcon, UserIcon, ReceiptIcon, PlusIcon } from "lucide-react"

export default function PatientDashboardPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const patientId = user?.patientId ?? ""

  const { data: patient, isLoading: patientLoading } = useGetPatient(patientId)
  const { data: appointmentsData, isLoading: appointmentsLoading } = useGetAppointments({
    patientId,
    page: 0,
    size: 3,
  })

  const upcomingAppointments = appointmentsData?.content?.filter(
    (a) => a.status === "BOOKED"
  ) ?? []

  if (patientLoading) {
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
          Welcome, {patient ? `${patient.firstName} ${patient.lastName}` : user?.firstName ?? "Patient"}
        </h1>
        <p className="text-muted-foreground">Here&apos;s your dashboard overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push(ROUTE_PATHS.PATIENT_BOOK_APPOINTMENT)}
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <PlusIcon className="size-5 text-primary" />
            <CardTitle className="text-sm font-medium">Book Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Schedule a new appointment</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push(ROUTE_PATHS.PATIENT_PROFILE)}
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <UserIcon className="size-5 text-primary" />
            <CardTitle className="text-sm font-medium">View Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Manage your personal details</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push(ROUTE_PATHS.PATIENT_INVOICES)}
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <ReceiptIcon className="size-5 text-primary" />
            <CardTitle className="text-sm font-medium">View Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Check your billing records</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Appointments</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push(ROUTE_PATHS.PATIENT_APPOINTMENTS)}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No upcoming appointments"
              description="Book an appointment to get started."
              actionLabel="Book Now"
              onAction={() => router.push(ROUTE_PATHS.PATIENT_BOOK_APPOINTMENT)}
            />
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{appt.doctorName ?? `Dr. ${appt.doctorId}`}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(appt.slotDate)} &middot; {appt.slotStart} – {appt.slotEnd}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400">
                    Booked
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
