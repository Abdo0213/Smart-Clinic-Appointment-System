'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import {
  useGetAppointments,
  AppointmentStatusBadge,
  canCancel,
  canReschedule,
} from '@/entities/appointment'
import type { Appointment, AppointmentStatus } from '@/entities/appointment'
import { APPOINTMENT_STATUS_VALUES } from '@/entities/appointment'
import { useGetDoctors } from '@/entities/doctor'
import { StatusUpdateDropdown } from '@/features/appointment-status-update'
import { CancelDialog } from '@/features/appointment-cancel'
import { RescheduleDialog } from '@/features/appointment-reschedule'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/shared/ui/data-table/data-table'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { EmptyState } from '@/shared/ui/empty-state/empty-state'
import { ROUTE_PATHS } from '@/shared/config/appConfig'
import {
  CalendarIcon,
  UsersIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  PlusIcon,
} from 'lucide-react'
import { QuickBookDialog } from '@/features/appointment-booking'

export default function ReceptionDashboardPage() {
  const router = useRouter()
  const today = format(new Date(), 'yyyy-MM-dd')

  // Filters
  const [page, setPage] = useState(0)
  const [dateFilter, setDateFilter] = useState(today)
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('')
  const [doctorFilter, setDoctorFilter] = useState('')

  // Dialog targets
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null)

  // Queries
  const { data: appointmentsData, isLoading: aptLoading } = useGetAppointments({
    date: dateFilter || undefined,
    status: statusFilter || undefined,
    doctorId: doctorFilter || undefined,
    page,
    size: 20,
  })

  const { data: todayStats } = useGetAppointments({ date: today, size: 1 })
  const { data: todayRequestedStats } = useGetAppointments({ date: today, status: 'REQUESTED', size: 1 })
  const { data: todayCompletedStats } = useGetAppointments({ date: today, status: 'CONFIRMED', size: 1 })
  const { data: todayCancelledStats } = useGetAppointments({ date: today, status: 'CANCELLED', size: 1 })
  const { data: doctorsData } = useGetDoctors({})

  const appointments = appointmentsData?.content ?? []
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
    {
      accessorKey: 'slotDate',
      header: 'Date',
    },
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
        return (
          <div className="flex items-center gap-1">
            {canReschedule(appt.status) && (
              <Button variant="outline" size="sm" onClick={() => setRescheduleTarget(appt)}>
                Reschedule
              </Button>
            )}
            {canCancel(appt.status) && (
              <Button variant="outline" size="sm" onClick={() => setCancelTarget(appt)}>
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
        <h1 className="text-2xl font-bold">Reception Dashboard</h1>
        <QuickBookDialog />
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Total</CardTitle>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats?.totalElements ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requested</CardTitle>
            <UsersIcon className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{todayRequestedStats?.totalElements ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle2Icon className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{todayCompletedStats?.totalElements ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <AlertTriangleIcon className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{todayCancelledStats?.totalElements ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(0) }}
          className="w-40"
        />
        <Select
          value={statusFilter}
          onValueChange={(val) => { setStatusFilter(val as AppointmentStatus | ''); setPage(0) }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {APPOINTMENT_STATUS_VALUES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={doctorFilter}
          onValueChange={(val) => { setDoctorFilter(val ?? ''); setPage(0) }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Doctors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Doctors</SelectItem>
            {doctors.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Appointment table */}
      {aptLoading ? (
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
          pagination={{
            page: appointmentsData?.page ?? 0,
            pageSize: 20,
            totalPages: appointmentsData?.totalPages ?? 1,
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
          onOpenChange={(open) => { if (!open) setCancelTarget(null) }}
        />
      )}

      {/* Reschedule Dialog */}
      {rescheduleTarget && (
        <RescheduleDialog
          appointmentId={rescheduleTarget.id}
          doctorId={rescheduleTarget.doctorId}
          currentStatus={rescheduleTarget.status}
          open={!!rescheduleTarget}
          onOpenChange={(open) => { if (!open) setRescheduleTarget(null) }}
        />
      )}
    </div>
  )
}
