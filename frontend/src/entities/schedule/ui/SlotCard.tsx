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
  const formatTime = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
  }

  return (
    <Card
      className={`w-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md ${
        !slot.available ? 'cursor-not-allowed opacity-60 grayscale-[0.5]' : ''
      }`}
      onClick={() => slot.available && onSelect?.(slot)}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="size-4 text-primary" />
            <span>
              {formatTime(slot.start)} – {formatTime(slot.end)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={
              slot.available
                ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
                : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
            }
          >
            {slot.available ? 'Available' : (slot.reason || 'Booked')}
          </Badge>
          {slot.price && (
            <span className="text-xs font-semibold text-muted-foreground">
              ${slot.price}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
