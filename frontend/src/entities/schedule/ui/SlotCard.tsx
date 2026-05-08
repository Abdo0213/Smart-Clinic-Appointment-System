'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import type { ScheduleSlot } from '../model/types'

interface SlotCardProps {
  slot: ScheduleSlot
  onSelect?: (slot: ScheduleSlot) => void
}

export function SlotCard({ slot, onSelect }: SlotCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-shadow hover:shadow-md ${
        !slot.isAvailable ? 'cursor-not-allowed opacity-50' : ''
      }`}
      onClick={() => slot.isAvailable && onSelect?.(slot)}
    >
      <CardContent className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="size-4 text-muted-foreground" />
          <span>
            {slot.startTime} – {slot.endTime}
          </span>
        </div>
        <Badge
          variant="outline"
          className={
            slot.isAvailable
              ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
          }
        >
          {slot.isAvailable ? 'Available' : 'Booked'}
        </Badge>
      </CardContent>
    </Card>
  )
}
