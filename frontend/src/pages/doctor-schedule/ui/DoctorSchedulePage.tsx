"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuthStore } from "@/features/auth"
import { useGetSchedules, useCreateSchedule, useGetAvailableSlots, SlotAvailabilityGrid } from "@/entities/schedule"
import type { ScheduleBreak } from "@/entities/schedule"
import { LoadingSpinner } from "@/shared/ui/loading-spinner/loading-spinner"
import { EmptyState } from "@/shared/ui/empty-state/empty-state"
import { formatDate } from "@/shared/lib/formatDate"
import { formatCurrency } from "@/shared/lib/formatCurrency"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, PlusIcon, TrashIcon, AlertCircleIcon } from "lucide-react"
import { toast } from "sonner"

const scheduleSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => {
      const today = new Date().toISOString().split("T")[0]
      return val >= today
    }, "Date must be today or in the future"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  slotDuration: z.number().min(5, "Minimum 5 minutes").max(120, "Maximum 120 minutes"),
  price: z.number().min(0, "Price must be positive"),
}).refine((data) => data.startTime < data.endTime, {
  message: "Start time must be before end time",
  path: ["endTime"],
})

type ScheduleFormData = z.infer<typeof scheduleSchema>

/** Validate that a break falls within the schedule working hours */
function isBreakWithinHours(brk: ScheduleBreak, startTime: string, endTime: string): boolean {
  return brk.breakStart >= startTime && brk.breakEnd <= endTime
}

/** Validate that a break's start is before its end */
function isBreakValid(brk: ScheduleBreak): boolean {
  return brk.breakStart < brk.breakEnd
}

/** Check if two breaks overlap */
function breaksOverlap(a: ScheduleBreak, b: ScheduleBreak): boolean {
  return a.breakStart < b.breakEnd && a.breakEnd > b.breakStart
}

/** Find overlapping break pairs */
function findBreakOverlaps(breaks: ScheduleBreak[]): [number, number][] {
  const overlaps: [number, number][] = []
  for (let i = 0; i < breaks.length; i++) {
    for (let j = i + 1; j < breaks.length; j++) {
      if (breaksOverlap(breaks[i], breaks[j])) {
        overlaps.push([i, j])
      }
    }
  }
  return overlaps
}

export default function DoctorSchedulePage() {
  const user = useAuthStore((s) => s.user)
  const doctorId = user?.doctorId ?? ""

  const { data: schedules, isLoading: schedulesLoading } = useGetSchedules(doctorId)
  const createSchedule = useCreateSchedule()

  const [previewDate, setPreviewDate] = useState("")
  const { data: slotAvailability, isLoading: slotsLoading } = useGetAvailableSlots(doctorId, previewDate)

  const [breaks, setBreaks] = useState<ScheduleBreak[]>([])
  const [breakErrors, setBreakErrors] = useState<string[]>([])

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      date: "",
      startTime: "",
      endTime: "",
      slotDuration: 30,
      price: 0,
    },
  })

  const addBreak = () => {
    setBreaks([...breaks, { breakStart: "", breakEnd: "" }])
    setBreakErrors([])
  }

  const removeBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index))
    setBreakErrors([])
  }

  const updateBreak = (index: number, field: keyof ScheduleBreak, value: string) => {
    const updated = [...breaks]
    updated[index] = { ...updated[index], [field]: value }
    setBreaks(updated)
    setBreakErrors([])
  }

  /** Validate breaks against each other and the schedule time window */
  function validateBreaks(formData: ScheduleFormData): boolean {
    const filledBreaks = breaks.filter((b) => b.breakStart && b.breakEnd)
    const errors: string[] = []

    filledBreaks.forEach((brk, i) => {
      if (!isBreakValid(brk)) {
        errors.push(`Break ${i + 1}: Start time must be before end time`)
      }
      if (!isBreakWithinHours(brk, formData.startTime, formData.endTime)) {
        errors.push(`Break ${i + 1}: Must fall within working hours (${formData.startTime}–${formData.endTime})`)
      }
    })

    const overlaps = findBreakOverlaps(filledBreaks)
    overlaps.forEach(([i, j]) => {
      errors.push(`Break ${i + 1} and Break ${j + 1} overlap`)
    })

    setBreakErrors(errors)
    return errors.length === 0
  }

  const onSubmit = (data: ScheduleFormData) => {
    if (!validateBreaks(data)) return

    createSchedule.mutate(
      {
        doctorId,
        data: {
          ...data,
          breaks: breaks.filter((b) => b.breakStart && b.breakEnd),
        },
      },
      {
        onSuccess: () => {
          toast.success("Schedule created successfully")
          form.reset()
          setBreaks([])
          setBreakErrors([])
        },
        onError: (error: unknown) => {
          const status =
            error && typeof error === "object" && "response" in error
              ? (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status
              : undefined
          const message =
            error && typeof error === "object" && "response" in error
              ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
              : undefined

          if (status === 409) {
            toast.error("A schedule already exists for this date. Please choose a different date.")
          } else {
            toast.error(message || "Failed to create schedule")
          }
        },
      }
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Schedule Management</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create New Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...form.register("date")} />
                {form.formState.errors.date && (
                  <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" {...form.register("startTime")} />
                  {form.formState.errors.startTime && (
                    <p className="text-xs text-destructive">{form.formState.errors.startTime.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" {...form.register("endTime")} />
                  {form.formState.errors.endTime && (
                    <p className="text-xs text-destructive">{form.formState.errors.endTime.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slot Duration (min)</Label>
                  <Input
                    type="number"
                    {...form.register("slotDuration", { valueAsNumber: true })}
                  />
                  {form.formState.errors.slotDuration && (
                    <p className="text-xs text-destructive">{form.formState.errors.slotDuration.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Price (EGP)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register("price", { valueAsNumber: true })}
                  />
                  {form.formState.errors.price && (
                    <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between">
                  <Label>Breaks</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addBreak}>
                    <PlusIcon className="mr-1 size-3" />
                    Add Break
                  </Button>
                </div>
                <div className="mt-2 space-y-2">
                  {breaks.map((brk, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={brk.breakStart}
                        onChange={(e) => updateBreak(idx, "breakStart", e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={brk.breakEnd}
                        onChange={(e) => updateBreak(idx, "breakEnd", e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeBreak(idx)}>
                        <TrashIcon className="size-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                {breakErrors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {breakErrors.map((err, i) => (
                      <p key={i} className="flex items-center gap-1 text-xs text-destructive">
                        <AlertCircleIcon className="size-3" />
                        {err}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={createSchedule.isPending}>
                {createSchedule.isPending ? "Creating..." : "Create Schedule"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Existing Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : !schedules?.length ? (
                <EmptyState
                  icon={CalendarIcon}
                  title="No schedules yet"
                  description="Create your first schedule to get started."
                />
              ) : (
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{formatDate(schedule.date)}</p>
                        <Badge variant="outline">{formatCurrency(schedule.price)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {schedule.startTime} – {schedule.endTime} &middot; {schedule.slotDuration} min slots
                      </p>
                      {schedule.breaks.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {schedule.breaks.map((b, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              Break: {b.breakStart}–{b.breakEnd}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Slots Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>Select Date</Label>
                <Input
                  type="date"
                  value={previewDate}
                  onChange={(e) => setPreviewDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              {slotsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : slotAvailability && previewDate ? (
                <SlotAvailabilityGrid slotAvailability={slotAvailability} />
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Select a date to preview available slots.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
