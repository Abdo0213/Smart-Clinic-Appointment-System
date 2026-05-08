'use client'

import { Badge } from '@/components/ui/badge'
import type { InvoiceStatus } from '../model/types'

interface StatusBadgeProps {
  status: InvoiceStatus
}

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  },
  PAID: {
    label: 'Paid',
    className: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400',
  },
  WAIVED: {
    label: 'Waived',
    className: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400',
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
