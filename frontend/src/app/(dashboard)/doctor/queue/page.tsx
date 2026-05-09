'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useAuthStore } from '@/features/auth'
import { useDoctorQueue, AppointmentStatusBadge } from '@/entities/appointment'
import { StatusUpdateDropdown } from '@/features/appointment-status-update'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { EmptyState } from '@/shared/ui/empty-state/empty-state'
import { CalendarIcon, ClockIcon, StethoscopeIcon } from 'lucide-react'

export default function DailyQueuePage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const isToday = date === format(new Date(), 'yyyy-MM-dd')

  const { data, isLoading } = useDoctorQueue(user?.doctorId ?? '', date)

  const appointments = data?.content ?? []
  // Sort by slotStart time for queue ordering
  const sortedAppointments = [...appointments].sort((a, b) =>
    a.slotStart.localeCompare(b.slotStart)
  )

  // Summary counts
  const summary = {
    total: sortedAppointments.length,
    requested: sortedAppointments.filter((a) => a.status === 'REQUESTED').length,
    // arrived: sortedAppointments.filter((a) => a.status === 'ARRIVED').length,
    confirmed: sortedAppointments.filter((a) => a.status === 'CONFIRMED').length,
    completed: sortedAppointments.filter((a) => a.status === 'COMPLETED').length,
    cancelled: sortedAppointments.filter((a) => a.status === 'CANCELLED').length,
    // noShow: sortedAppointments.filter((a) => a.status === 'NO_SHOW').length,
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Queue</h1>
          <p className="text-sm text-muted-foreground">
            {isToday ? "Today's appointments" : `Appointments for ${date}`}
            {isToday && ' · Auto-refreshes every 30s'}
          </p>
        </div>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-40"
        />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: 'Total', value: summary.total, color: 'text-foreground' },
          { label: 'Requested', value: summary.requested, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Confirmed', value: summary.confirmed, color: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Completed', value: summary.completed, color: 'text-green-600 dark:text-green-400' },
          { label: 'Cancelled', value: summary.cancelled, color: 'text-gray-600 dark:text-gray-400' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-3 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : sortedAppointments.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No appointments"
          description={isToday ? 'No patients in queue for today.' : `No appointments found for ${date}.`}
        />
      ) : (
        <div className="space-y-3">
          {sortedAppointments.map((apt, index) => (
            <Card key={apt.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <span className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{apt.patientName ?? apt.patientId}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ClockIcon className="size-3" />
                      {apt.slotStart} – {apt.slotEnd}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AppointmentStatusBadge status={apt.status} />
                  {(apt.status === 'REQUESTED' || apt.status === 'CONFIRMED' || apt.status === 'COMPLETED') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push(`/doctor/visits/new/${apt.id}`)}
                    >
                      <StethoscopeIcon className="mr-2 size-4" />
                      {apt.status === 'COMPLETED' ? 'View Visit' : 'Start Visit'}
                    </Button>
                  )}
                  <StatusUpdateDropdown
                    appointmentId={apt.id}
                    currentStatus={apt.status}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
