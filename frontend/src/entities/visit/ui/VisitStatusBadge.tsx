'use client'

import { Badge } from '@/components/ui/badge'
import { Lock, Pencil } from 'lucide-react'

interface VisitStatusBadgeProps {
  isSigned: boolean
}

export function VisitStatusBadge({ isSigned }: VisitStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={
        isSigned
          ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
          : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
      }
    >
      {isSigned ? (
        <Lock className="size-3" />
      ) : (
        <Pencil className="size-3" />
      )}
      {isSigned ? 'Signed' : 'Unsigned'}
    </Badge>
  )
}
