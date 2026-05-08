'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Pill } from 'lucide-react'
import type { Prescription } from '../model/types'

interface PrescriptionCardProps {
  prescription: Prescription
}

export function PrescriptionCard({ prescription }: PrescriptionCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1">
        <div className="flex items-center gap-2 font-medium">
          <Pill className="size-4 text-muted-foreground" />
          {prescription.medicationName}
        </div>
        <div className="text-sm text-muted-foreground">
          {prescription.dosage} · {prescription.frequency} · {prescription.durationDays} days
        </div>
        {prescription.notes && (
          <div className="text-xs text-muted-foreground">{prescription.notes}</div>
        )}
      </CardContent>
    </Card>
  )
}
