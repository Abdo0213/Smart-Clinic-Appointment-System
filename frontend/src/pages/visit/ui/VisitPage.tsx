'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useCreateVisit, useSignVisit, useIssuePrescription, useScheduleFollowUp } from '@/entities/visit'
import { useGetAppointment } from '@/entities/appointment'
import { VisitForm, PrescriptionForm, SignVisitDialog, FollowUpScheduler } from '@/features/visit-form'
import { useVisitFormStore } from '@/features/visit-form/model/visitFormStore'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PillIcon, FileCheckIcon, CalendarPlusIcon, SaveIcon, Trash2Icon } from 'lucide-react'
import type { CreateVisitFormData, PrescriptionFormData } from '@/features/visit-form'

export default function VisitPage() {
  const params = useParams()
  const appointmentId = (params.appointmentId ?? params.id) as string

  const { data: appointment, isLoading: appointmentLoading } = useGetAppointment(appointmentId)
  const createVisitMutation = useCreateVisit()
  const signVisitMutation = useSignVisit()
  const issuePrescriptionMutation = useIssuePrescription()
  const scheduleFollowUpMutation = useScheduleFollowUp()

  const [prescriptionOpen, setPrescriptionOpen] = useState(false)
  const [signDialogOpen, setSignDialogOpen] = useState(false)
  const [followUpOpen, setFollowUpOpen] = useState(false)
  const [createdVisitId, setCreatedVisitId] = useState<string | null>(null)

  const prescriptions = useVisitFormStore((s) => s.prescriptions)
  const removePrescription = useVisitFormStore((s) => s.removePrescription)

  const handleSaveVisit = (data: CreateVisitFormData) => {
    createVisitMutation.mutate(data, {
      onSuccess: (visit) => {
        setCreatedVisitId(visit.id)
        toast.success('Visit record created successfully')
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : 'Failed to create visit'
        toast.error(message)
      },
    })
  }

  const handleIssuePrescription = (data: PrescriptionFormData) => {
    if (!createdVisitId) return
    issuePrescriptionMutation.mutate(
      { visitId: createdVisitId, data },
      {
        onSuccess: () => toast.success('Prescription added successfully'),
        onError: (error) => {
          const msg = error instanceof Error ? error.message : 'Failed to add prescription'
          toast.error(msg)
        },
      }
    )
  }

  const handleSignVisit = (additionalItems: { description: string; quantity: number; unitPrice: number }[]) => {
    if (!createdVisitId) return
    signVisitMutation.mutate(
      { id: createdVisitId, data: { additionalItems } },
      {
        onSuccess: () => {
          useVisitFormStore.getState().reset()
          toast.success('Visit signed and locked successfully')
        },
        onError: (error) => {
          const msg = error instanceof Error ? error.message : 'Failed to sign visit'
          toast.error(msg)
        },
      },
    )
  }

  const handleScheduleFollowUp = () => {}

  if (appointmentLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const isVisitCreated = !!createdVisitId

  return (
    <div className="container mx-auto max-w-4xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visit Workspace</h1>
          {appointment && (
            <p className="text-sm text-muted-foreground">
              Appointment: {appointment.slotDate} · {appointment.slotStart} - {appointment.slotEnd}
            </p>
          )}
        </div>
        {isVisitCreated && (
          <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-700">
            Visit Saved
          </Badge>
        )}
      </div>

      <VisitForm appointmentId={appointmentId} onSubmit={handleSaveVisit} isSubmitting={createVisitMutation.isPending} />

      <div className="flex gap-3">
        <Button
          type="submit"
          form="visit-form"
          disabled={createVisitMutation.isPending || isVisitCreated}
        >
          <SaveIcon className="mr-2 size-4" />
          Save Visit
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setPrescriptionOpen(true)}
          disabled={!isVisitCreated || signVisitMutation.isSuccess}
        >
          <PillIcon className="mr-2 size-4" />
          Issue Prescription
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setSignDialogOpen(true)}
          disabled={!isVisitCreated || signVisitMutation.isSuccess}
        >
          <FileCheckIcon className="mr-2 size-4" />
          Sign Visit
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setFollowUpOpen(true)}
          disabled={!isVisitCreated}
        >
          <CalendarPlusIcon className="mr-2 size-4" />
          Schedule Follow-up
        </Button>
      </div>

      {prescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prescriptions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {prescriptions.map((rx, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{rx.medicationName}</p>
                  <p className="text-sm text-muted-foreground">
                    {rx.dosage} · {rx.frequency} · {rx.durationDays} days
                  </p>
                  {rx.notes && <p className="text-xs text-muted-foreground">{rx.notes}</p>}
                </div>
                {!isVisitCreated || !signVisitMutation.isSuccess ? (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePrescription(i)}>
                    <Trash2Icon className="size-4 text-destructive" />
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <PrescriptionForm
        open={prescriptionOpen}
        onOpenChange={setPrescriptionOpen}
        onSubmit={handleIssuePrescription}
        isSubmitting={issuePrescriptionMutation.isPending}
      />

      <SignVisitDialog
        open={signDialogOpen}
        onOpenChange={setSignDialogOpen}
        onConfirm={handleSignVisit}
        isSubmitting={signVisitMutation.isPending}
      />

      <FollowUpScheduler
        open={followUpOpen}
        onOpenChange={setFollowUpOpen}
        visitId={createdVisitId ?? ''}
        doctorId={appointment?.doctorId ?? ''}
        patientId={appointment?.patientId ?? ''}
      />
    </div>
  )
}
