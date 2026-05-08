'use client'

import { Badge } from '@/components/ui/badge'
import type { AppointmentStatus } from '../model/types'

interface StatusBadgeProps {
  status: AppointmentStatus
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  BOOKED: {
    label: 'Booked',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  },
  ARRIVED: {
    label: 'Arrived',
    className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
  },
  NO_SHOW: {
    label: 'No Show',
    className: 'border-gray-500/30 bg-gray-500/10 text-gray-700 dark:text-gray-400',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
