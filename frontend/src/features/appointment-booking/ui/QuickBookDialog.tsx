"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CalendarPlusIcon, UserIcon } from "lucide-react"
import { AppointmentBookingWizard } from "./AppointmentBookingWizard"
import { PatientSearchSelect } from "@/entities/patient"
import { Label } from "@/components/ui/label"
import { useBookingStore } from "../model/bookingStore"

export function QuickBookDialog() {
  const [open, setOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const { reset } = useBookingStore()

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSelectedPatientId(null)
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <CalendarPlusIcon className="size-4" />
            Quick Book
          </Button>
        }
      />
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Appointment Booking</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {!selectedPatientId ? (
            <div className="space-y-4 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserIcon className="size-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 1: Select Patient</h3>
                <p className="text-sm text-muted-foreground">Search for an existing patient to start booking.</p>
              </div>
              <div className="mx-auto max-w-sm text-left">
                <Label className="mb-2 block">Patient Name</Label>
                <PatientSearchSelect 
                  onSelect={(id) => setSelectedPatientId(id)} 
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserIcon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Selected Patient</p>
                    <p className="font-semibold">Patient ID: {selectedPatientId.split('-')[0]}...</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedPatientId(null); reset(); }}>
                  Change Patient
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <AppointmentBookingWizard patientId={selectedPatientId} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
