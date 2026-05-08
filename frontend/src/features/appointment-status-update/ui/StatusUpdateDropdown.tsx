'use client'

import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useUpdateAppointmentStatus,
  getValidNextStatuses,
} from '@/entities/appointment'
import type { AppointmentStatus } from '@/entities/appointment'

interface StatusUpdateDropdownProps {
  appointmentId: string
  currentStatus: AppointmentStatus
  disabled?: boolean
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  BOOKED: 'Booked',
  ARRIVED: 'Arrived',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
}

export function StatusUpdateDropdown({
  appointmentId,
  currentStatus,
  disabled,
}: StatusUpdateDropdownProps) {
  const updateStatus = useUpdateAppointmentStatus()
  const validNextStatuses = getValidNextStatuses(currentStatus)

  if (validNextStatuses.length === 0) {
    return null
  }

  const handleChange = (newStatus: string | null) => {
    if (!newStatus) return
    updateStatus.mutate(
      { id: appointmentId, status: newStatus as AppointmentStatus },
      {
        onSuccess: () => {
          toast.success(`Status updated to ${STATUS_LABELS[newStatus as AppointmentStatus]}`)
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : 'Failed to update status'
          toast.error(message)
        },
      }
    )
  }

  return (
    <Select onValueChange={handleChange} disabled={disabled || updateStatus.isPending}>
      <SelectTrigger className="h-8 w-36">
        <SelectValue placeholder="Update status" />
      </SelectTrigger>
      <SelectContent>
        {validNextStatuses.map((status) => (
          <SelectItem key={status} value={status}>
            {STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
