'use client'

import { Card, CardContent } from '@/components/ui/card'
import { VisitStatusBadge } from './VisitStatusBadge'
import { formatDate } from '@/shared/lib/formatDate'
import { FileTextIcon, PillIcon } from 'lucide-react'
import type { Visit } from '../model/types'

interface VisitCardProps {
  visit: Visit
  onClick?: () => void
}

export function VisitCard({ visit, onClick }: VisitCardProps) {
  return (
    <Card
      className={onClick ? 'cursor-pointer transition-colors hover:bg-accent/50' : ''}
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <FileTextIcon className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{visit.chiefComplaint}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(visit.createdAt)}
              {visit.icd10Codes && ` · ${visit.icd10Codes}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {visit.prescriptions && visit.prescriptions.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <PillIcon className="size-3" />
              {visit.prescriptions.length}
            </span>
          )}
          <VisitStatusBadge isSigned={visit.isSigned} />
        </div>
      </CardContent>
    </Card>
  )
}
