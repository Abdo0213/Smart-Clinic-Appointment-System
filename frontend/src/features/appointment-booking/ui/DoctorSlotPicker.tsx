'use client'

import { useState } from 'react'
import { useBookingStore } from '../model/bookingStore'
import { useGetDoctors } from '@/entities/doctor'
import { useGetAvailableSlots, SlotAvailabilityGrid } from '@/entities/schedule'
import { DoctorCard } from '@/entities/doctor'
import { useAuthStore } from '@/features/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, ChevronLeft } from 'lucide-react'
import { format } from 'date-fns'
import type { Doctor } from '@/entities/doctor/model/types'
import type { ScheduleSlot } from '@/entities/schedule/model/types'

export function DoctorSlotPicker() {
  const { step, selectedDoctorId, selectedDate, selectedSlot, setStep, selectDoctor, selectDate, selectSlot, reset } = useBookingStore()
  const [specializationFilter, setSpecializationFilter] = useState<string>('')
  const user = useAuthStore((s) => s.user)
  const { data: doctorsData, isLoading: doctorsLoading } = useGetDoctors({ specialization: specializationFilter || undefined, isActive: true })
  const { data: slotData, isLoading: slotsLoading } = useGetAvailableSlots(selectedDoctorId ?? '', selectedDate ?? '')

  const doctors = doctorsData?.content ?? []
  const specializations = [...new Set(doctors.map((d: Doctor) => d.specialization))]

  const handleDoctorSelect = (doctor: Doctor) => {
    selectDoctor(doctor.id)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      selectDate(format(date, 'yyyy-MM-dd'))
    }
  }

  const handleSlotSelect = (slot: ScheduleSlot) => {
    if (slot.isAvailable) {
      selectSlot({ slotStart: slot.startTime, slotEnd: slot.endTime })
    }
  }

  const selectedDoctor = doctors.find((d: Doctor) => d.id === selectedDoctorId)

  const steps = [
    { number: 1, label: 'Select Doctor' },
    { number: 2, label: 'Select Date' },
    { number: 3, label: 'Select Slot' },
    { number: 4, label: 'Confirm' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center">
            <div className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${step >= s.number ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {s.number}
            </div>
            <span className={`ml-2 hidden text-sm sm:inline ${step >= s.number ? 'text-foreground' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && <div className="mx-3 h-px w-8 bg-border sm:w-12" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <Select value={specializationFilter} onValueChange={(v) => setSpecializationFilter(v ?? '')}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Specializations</SelectItem>
              {specializations.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {doctorsLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading doctors...</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor: Doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} onClick={handleDoctorSelect} />
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              <ChevronLeft className="size-4" />
              Back
            </Button>
            <span className="text-sm text-muted-foreground">
              Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
            </span>
          </div>
          <div className="flex justify-center">
            <Popover>
              <PopoverTrigger render={<Button variant="outline" className="w-64 justify-start gap-2" />}>
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
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
              <ChevronLeft className="size-4" />
              Back
            </Button>
            <span className="text-sm text-muted-foreground">
              Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName} &middot; {selectedDate}
            </span>
          </div>
          {slotsLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading slots...</div>
          ) : slotData ? (
            <SlotAvailabilityGrid slotAvailability={slotData} onSelectSlot={handleSlotSelect} />
          ) : (
            <div className="py-8 text-center text-muted-foreground">No slots available.</div>
          )}
        </div>
      )}

      {step === 4 && selectedDoctor && selectedDate && selectedSlot && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
              <ChevronLeft className="size-4" />
              Back
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor</span>
                <span>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialization</span>
                <span>{selectedDoctor.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span>{selectedSlot.slotStart} – {selectedSlot.slotEnd}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
