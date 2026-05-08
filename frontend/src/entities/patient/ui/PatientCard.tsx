'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Patient } from '../model/types'

interface PatientCardProps {
  patient: Patient
  onClick?: (patient: Patient) => void
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onClick?.(patient)}
    >
      <CardHeader>
        <CardTitle>
          {patient.firstName} {patient.lastName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
        <span>{patient.phone}</span>
        {patient.bloodType && (
          <Badge variant="outline" className="w-fit">
            {patient.bloodType}
          </Badge>
        )}
        <span>{patient.dateOfBirth}</span>
      </CardContent>
    </Card>
  )
}
