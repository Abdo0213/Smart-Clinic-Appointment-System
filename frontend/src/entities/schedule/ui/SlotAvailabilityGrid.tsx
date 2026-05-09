'use client'

import type { SlotAvailability } from '../model/types'
import { SlotCard } from './SlotCard'

interface SlotAvailabilityGridProps {
  slotAvailability: SlotAvailability
  onSelectSlot?: (slot: SlotAvailability['slots'][number]) => void
}

export function SlotAvailabilityGrid({ slotAvailability, onSelectSlot }: SlotAvailabilityGridProps) {
  if (!slotAvailability.slots.length) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No slots available for this date.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {slotAvailability.slots.map((slot) => (
        <SlotCard key={`${slot.start}-${slot.end}`} slot={slot} onSelect={onSelectSlot} />
      ))}
    </div>
  )
}
