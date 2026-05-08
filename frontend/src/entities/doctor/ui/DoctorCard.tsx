'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DoctorStatusBadge } from './DoctorStatusBadge'
import type { Doctor } from '../model/types'

interface DoctorCardProps {
  doctor: Doctor
  onClick?: (doctor: Doctor) => void
}

export function DoctorCard({ doctor, onClick }: DoctorCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onClick?.(doctor)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Dr. {doctor.firstName} {doctor.lastName}
          </CardTitle>
          <DoctorStatusBadge isActive={doctor.isActive} />
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <span>{doctor.specialization}</span>
      </CardContent>
    </Card>
  )
}
