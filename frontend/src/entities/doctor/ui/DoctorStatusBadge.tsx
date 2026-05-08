'use client'

import { Badge } from '@/components/ui/badge'

interface DoctorStatusBadgeProps {
  isActive: boolean
}

export function DoctorStatusBadge({ isActive }: DoctorStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
          : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
      }
    >
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  )
}
