'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useRescheduleAppointment,
  canReschedule,
} from '@/entities/appointment'
import { useGetAvailableSlots, SlotAvailabilityGrid } from '@/entities/schedule'
import type { AppointmentStatus } from '@/entities/appointment'
import type { ScheduleSlot } from '@/entities/schedule/model/types'

interface RescheduleDialogProps {
  appointmentId: string
  doctorId: string
  currentStatus: AppointmentStatus
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RescheduleDialog({
  appointmentId,
  doctorId,
  currentStatus,
  open,
  onOpenChange,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<{ slotStart: string; slotEnd: string } | null>(null)

  const rescheduleAppointment = useRescheduleAppointment()
  const { data: slotData, isLoading: slotsLoading } = useGetAvailableSlots(
    doctorId,
    selectedDate
  )

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(format(date, 'yyyy-MM-dd'))
      setSelectedSlot(null)
    }
  }

  const handleSlotSelect = (slot: ScheduleSlot) => {
    if (slot.isAvailable) {
      setSelectedSlot({ slotStart: slot.startTime, slotEnd: slot.endTime })
    }
  }

  const handleReschedule = () => {
    if (!selectedDate || !selectedSlot) return
    rescheduleAppointment.mutate(
      {
        id: appointmentId,
        slotDate: selectedDate,
        slotStart: selectedSlot.slotStart,
        slotEnd: selectedSlot.slotEnd,
      },
      {
        onSuccess: () => {
          toast.success('Appointment rescheduled successfully')
          handleClose()
        },
        onError: (error) => {
          const message = error instanceof Error
            ? error.message
            : 'Failed to reschedule. The slot may no longer be available.'
          toast.error(message)
        },
      }
    )
  }

  const handleClose = () => {
    setSelectedDate('')
    setSelectedSlot(null)
    onOpenChange(false)
  }

  if (!canReschedule(currentStatus)) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time slot for this appointment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date picker */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Select new date</p>
            <Popover>
              <PopoverTrigger render={<Button variant="outline" className="w-full justify-start gap-2" />}>
                <CalendarIcon className="size-4" />
                {selectedDate ? format(new Date(selectedDate), 'PPP') : 'Pick a date'}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate ? new Date(selectedDate) : undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Slot picker */}
          {selectedDate && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Select new time slot</p>
              {slotsLoading ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Loading available slots...
                </div>
              ) : slotData ? (
                <SlotAvailabilityGrid
                  slotAvailability={slotData}
                  onSelectSlot={handleSlotSelect}
                />
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No slots available for this date.
                </div>
              )}
            </div>
          )}

          {/* Selected slot confirmation */}
          {selectedSlot && (
            <div className="rounded-md border bg-muted/50 p-3 text-sm">
              <p className="font-medium">New slot selected:</p>
              <p className="text-muted-foreground">
                {selectedDate} &middot; {selectedSlot.slotStart} – {selectedSlot.slotEnd}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={rescheduleAppointment.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!selectedDate || !selectedSlot || rescheduleAppointment.isPending}
          >
            {rescheduleAppointment.isPending ? 'Rescheduling...' : 'Confirm Reschedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
