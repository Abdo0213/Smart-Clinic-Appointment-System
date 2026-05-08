"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { useAuthStore } from "@/features/auth"
import {
  useGetAppointments,
  AppointmentStatusBadge,
  canCancel,
  canReschedule,
} from "@/entities/appointment"
import type { Appointment, AppointmentStatus } from "@/entities/appointment"
import { APPOINTMENT_STATUS_VALUES } from "@/entities/appointment"
import { CancelDialog } from "@/features/appointment-cancel"
import { RescheduleDialog } from "@/features/appointment-reschedule"
import { ROUTE_PATHS } from "@/shared/config/appConfig"
import { DataTable } from "@/shared/ui/data-table/data-table"
import { LoadingSpinner } from "@/shared/ui/loading-spinner/loading-spinner"
import { EmptyState } from "@/shared/ui/empty-state/empty-state"
import { formatDate } from "@/shared/lib/formatDate"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, PlusIcon } from "lucide-react"

export default function PatientAppointmentsPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const patientId = user?.patientId ?? ""

  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "">("")
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null)

  const { data, isLoading } = useGetAppointments({
    patientId,
    status: statusFilter || undefined,
    page,
    size: 10,
  })

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "doctorName",
      header: "Doctor",
      cell: ({ row }) => row.original.doctorName ?? row.original.doctorId,
    },
    {
      accessorKey: "slotDate",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.slotDate),
    },
    {
      accessorKey: "slotStart",
      header: "Time",
      cell: ({ row }) => `${row.original.slotStart} – ${row.original.slotEnd}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <AppointmentStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const appt = row.original
        return (
          <div className="flex items-center gap-1">
            {canReschedule(appt.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRescheduleTarget(appt)}
              >
                Reschedule
              </Button>
            )}
            {canCancel(appt.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelTarget(appt)}
              >
                Cancel
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <Button onClick={() => router.push(ROUTE_PATHS.PATIENT_BOOK_APPOINTMENT)}>
          <PlusIcon className="mr-1 size-4" />
          Book New Appointment
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val as AppointmentStatus | "")
            setPage(0)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {APPOINTMENT_STATUS_VALUES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : !data?.content?.length ? (
        <EmptyState
          icon={CalendarIcon}
          title="No appointments found"
          description="Book your first appointment to get started."
          actionLabel="Book Now"
          onAction={() => router.push(ROUTE_PATHS.PATIENT_BOOK_APPOINTMENT)}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.content}
          pagination={{
            page: data.page,
            pageSize: data.size,
            totalPages: data.totalPages,
            onPageChange: setPage,
          }}
        />
      )}

      {/* Cancel Dialog */}
      {cancelTarget && (
        <CancelDialog
          appointmentId={cancelTarget.id}
          currentStatus={cancelTarget.status}
          open={!!cancelTarget}
          onOpenChange={(open) => {
            if (!open) setCancelTarget(null)
          }}
        />
      )}

      {/* Reschedule Dialog */}
      {rescheduleTarget && (
        <RescheduleDialog
          appointmentId={rescheduleTarget.id}
          doctorId={rescheduleTarget.doctorId}
          currentStatus={rescheduleTarget.status}
          open={!!rescheduleTarget}
          onOpenChange={(open) => {
            if (!open) setRescheduleTarget(null)
          }}
        />
      )}
    </div>
  )
}
