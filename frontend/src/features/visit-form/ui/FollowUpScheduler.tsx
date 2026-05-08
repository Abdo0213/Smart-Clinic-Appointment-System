'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useGetAvailableSlots } from '@/entities/schedule'
import { useBookAppointment } from '@/entities/appointment'
import { useGetDoctor } from '@/entities/doctor'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Loader2Icon, CalendarIcon } from 'lucide-react'
import { useAuthStore } from '@/features/auth/model/authStore'

interface FollowUpSchedulerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visitId: string
  doctorId: string
  patientId: string
  onScheduled?: () => void
}

export function FollowUpScheduler({
  open,
  onOpenChange,
  visitId,
  doctorId,
  patientId,
  onScheduled,
}: FollowUpSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null)
  const [reason, setReason] = useState('Follow-up appointment')

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const { data: slotData, isLoading: slotsLoading } = useGetAvailableSlots(doctorId, dateStr)
  const bookMutation = useBookAppointment()
  const { data: doctor } = useGetDoctor(doctorId)

  const slots = slotData?.slots?.filter((s) => s.isAvailable) ?? []

  const handleBook = () => {
    if (!selectedSlot || !selectedDate) return

    bookMutation.mutate(
      {
        patientId,
        doctorId,
        slotDate: format(selectedDate, 'yyyy-MM-dd'),
        slotStart: selectedSlot.startTime,
        slotEnd: selectedSlot.endTime,
      },
      {
        onSuccess: () => {
          toast.success('Follow-up appointment booked successfully')
          onScheduled?.()
          onOpenChange(false)
          setSelectedDate(undefined)
          setSelectedSlot(null)
          setReason('Follow-up appointment')
        },
        onError: (error) => {
          const msg = error instanceof Error ? error.message : 'Failed to schedule follow-up'
          toast.error(msg)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Follow-up</DialogTitle>
          <DialogDescription>
            Book a follow-up appointment with {doctor ? `Dr. ${doctor.lastName}` : 'the doctor'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger render={
                <span tabIndex={0}>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 size-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </span>
              } />
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    setSelectedSlot(null)
                  }}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {selectedDate && slotsLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2Icon className="animate-spin size-5" />
            </div>
          )}

          {selectedDate && !slotsLoading && (
            <div className="flex flex-col gap-2">
              <Label>Available Slots</Label>
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No available slots on this date</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {slots.map((slot) => (
                    <Button
                      key={slot.startTime}
                      type="button"
                      variant={selectedSlot?.startTime === slot.startTime ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSlot({ startTime: slot.startTime, endTime: slot.endTime })}
                    >
                      {slot.startTime}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleBook}
            disabled={!selectedSlot || !selectedDate || bookMutation.isPending}
          >
            {bookMutation.isPending && <Loader2Icon className="animate-spin" />}
            Book Follow-up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
