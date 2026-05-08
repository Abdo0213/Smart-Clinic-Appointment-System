'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  useGetAppointments,
  AppointmentFilters as AppointmentFiltersUI,
  AppointmentStatusBadge,
  canCancel,
} from '@/entities/appointment'
import type { Appointment, AppointmentStatus } from '@/entities/appointment'
import { useGetDoctors } from '@/entities/doctor'
import { StatusUpdateDropdown } from '@/features/appointment-status-update'
import { CancelDialog } from '@/features/appointment-cancel'
import { DataTable } from '@/shared/ui/data-table/data-table'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { EmptyState } from '@/shared/ui/empty-state/empty-state'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'

export default function AdminAppointmentsPage() {
  const [filters, setFilters] = useState<{ date?: string; status?: AppointmentStatus; doctorId?: string }>({})
  const [page, setPage] = useState(0)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)

  const { data: doctorsData } = useGetDoctors({})
  const { data, isLoading } = useGetAppointments({ ...filters, page, size: 20 })
  const appointments = data?.content ?? []
  const doctors = doctorsData?.content?.map((d) => ({ id: d.id, name: `Dr. ${d.firstName} ${d.lastName}` })) ?? []

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => row.original.patientName ?? row.original.patientId,
    },
    {
      accessorKey: 'doctorName',
      header: 'Doctor',
      cell: ({ row }) => row.original.doctorName ?? row.original.doctorId,
    },
    { accessorKey: 'slotDate', header: 'Date' },
    {
      accessorKey: 'slotStart',
      header: 'Time',
      cell: ({ row }) => `${row.original.slotStart} – ${row.original.slotEnd}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <AppointmentStatusBadge status={row.original.status} />,
    },
    {
      id: 'statusUpdate',
      header: 'Update',
      cell: ({ row }) => (
        <StatusUpdateDropdown
          appointmentId={row.original.id}
          currentStatus={row.original.status}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const appt = row.original
        if (!canCancel(appt.status)) return null
        return (
          <Button variant="outline" size="sm" onClick={() => setCancelTarget(appt)}>
            Cancel
          </Button>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Appointments</h1>
      <AppointmentFiltersUI
        onFilterChange={(f) => { setFilters(f); setPage(0) }}
        doctors={doctors}
      />
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No appointments found"
          description="No appointments match the current filters."
        />
      ) : (
        <DataTable
          columns={columns}
          data={appointments}
          pagination={{ page, pageSize: 20, totalPages: data?.totalPages ?? 1, onPageChange: setPage }}
        />
      )}

      {cancelTarget && (
        <CancelDialog
          appointmentId={cancelTarget.id}
          currentStatus={cancelTarget.status}
          open={!!cancelTarget}
          onOpenChange={(open) => { if (!open) setCancelTarget(null) }}
        />
      )}
    </div>
  )
}
