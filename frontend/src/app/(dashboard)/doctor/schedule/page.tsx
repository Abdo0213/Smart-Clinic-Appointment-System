'use client'

import { useAuthStore } from '@/features/auth'
import { useGetSchedules, SlotAvailabilityGrid } from '@/entities/schedule'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DoctorSchedulePage() {
  const user = useAuthStore((s) => s.user)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const { data: schedulesData, isLoading } = useGetSchedules(user?.doctorId ?? '')

  const schedules = schedulesData ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Schedule</h1>
      <div className="space-y-2">
        <Label htmlFor="date">Select Date</Label>
        <Input id="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-48" />
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : schedules.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No schedules found.</div>
      ) : (
        <div className="space-y-4">
          {schedules
            .filter((s) => s.date === selectedDate)
            .map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader>
                  <CardTitle className="text-base">{schedule.date}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>Hours: {schedule.startTime} – {schedule.endTime}</div>
                  <div>Slot Duration: {schedule.slotDuration} min</div>
                  <div>Price: EGP {schedule.price}</div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
