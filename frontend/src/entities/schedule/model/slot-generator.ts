import type { Schedule, ScheduleSlot } from './types'

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function toTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function generateSlots(schedule: Pick<Schedule, 'startTime' | 'endTime' | 'slotDuration' | 'breaks'>) {
  const startMinutes = toMinutes(schedule.startTime)
  const endMinutes = toMinutes(schedule.endTime)
  const duration = schedule.slotDuration

  if (duration <= 0 || startMinutes >= endMinutes) return []

  const breakRanges = schedule.breaks.map((brk) => ({
    start: toMinutes(brk.breakStart),
    end: toMinutes(brk.breakEnd),
  }))

  const slots: ScheduleSlot[] = []
  for (let current = startMinutes; current + duration <= endMinutes; current += duration) {
    const slotStart = current
    const slotEnd = current + duration

    const overlapsBreak = breakRanges.some((brk) => slotStart < brk.end && slotEnd > brk.start)
    if (overlapsBreak) continue

    slots.push({
      startTime: toTime(slotStart),
      endTime: toTime(slotEnd),
      isAvailable: true,
    })
  }

  return slots
}
