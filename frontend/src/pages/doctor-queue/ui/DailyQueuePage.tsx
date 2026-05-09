"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/features/auth"
import { useGetAppointments, useUpdateAppointmentStatus, AppointmentStatusBadge } from "@/entities/appointment"
import type { Appointment, AppointmentStatus } from "@/entities/appointment"
import { ROUTE_PATHS } from "@/shared/config/appConfig"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog/confirm-dialog"
import { LoadingSpinner } from "@/shared/ui/loading-spinner/loading-spinner"
import { EmptyState } from "@/shared/ui/empty-state/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarIcon, StethoscopeIcon } from "lucide-react"

function getTodayISO() {
  return new Date().toISOString().split("T")[0]
}

export default function DailyQueuePage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const doctorId = user?.doctorId ?? ""

  const [selectedDate, setSelectedDate] = useState(getTodayISO())
  const { data: appointmentsData, isLoading } = useGetAppointments({
    doctorId,
    date: selectedDate,
    page: 0,
    size: 100,
  })

  const updateStatus = useUpdateAppointmentStatus()

  const [confirmAction, setConfirmAction] = useState<{
    appointment: Appointment
    status: AppointmentStatus
  } | null>(null)

  const appointments = appointmentsData?.content ?? []

  const handleStatusUpdate = () => {
    if (!confirmAction) return
    updateStatus.mutate(
      { id: confirmAction.appointment.id, status: confirmAction.status },
      { onSuccess: () => setConfirmAction(null) }
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daily Queue</h1>
        <div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No appointments for this date"
          description="There are no appointments scheduled."
        />
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <Card key={appt.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">
                      {appt.slotStart}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{appt.patientName ?? appt.patientId}</p>
                    <p className="text-sm text-muted-foreground">
                      {appt.slotStart} – {appt.slotEnd}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <AppointmentStatusBadge status={appt.status} />

                  {appt.status === "REQUESTED" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(ROUTE_PATHS.DOCTOR_VISIT(appt.id))
                      }
                    >
                      <StethoscopeIcon className="mr-1 size-4" />
                      Start Visit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open: boolean) => {
          if (!open) setConfirmAction(null)
        }}
        title="Update Appointment Status"
        description={
          confirmAction
            ? `Change status of ${confirmAction.appointment.patientName ?? "patient"}'s appointment to ${confirmAction.status.replace(/_/g, " ")}?`
            : ""
        }
        confirmLabel="Confirm"
        onConfirm={handleStatusUpdate}
        isLoading={updateStatus.isPending}
      />
    </div>
  )
}
