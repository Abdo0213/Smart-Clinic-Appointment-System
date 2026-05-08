'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import type { Appointment } from '../model/types'

interface AppointmentCardProps {
  appointment: Appointment
  onClick?: (appointment: Appointment) => void
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onClick?.(appointment)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            {appointment.doctorName ?? appointment.doctorId}
          </CardTitle>
          <StatusBadge status={appointment.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
        <span>{appointment.slotDate}</span>
        <span>
          {appointment.slotStart} – {appointment.slotEnd}
        </span>
        <span>{appointment.patientName ?? appointment.patientId}</span>
      </CardContent>
    </Card>
  )
}
