'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { prescriptionSchema, type PrescriptionFormData } from '../model/schemas'
import { useVisitFormStore } from '../model/visitFormStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2Icon } from 'lucide-react'

interface PrescriptionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PrescriptionFormData) => void
  isSubmitting?: boolean
}

export function PrescriptionForm({ open, onOpenChange, onSubmit, isSubmitting }: PrescriptionFormProps) {
  const addPrescription = useVisitFormStore((s) => s.addPrescription)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medicationName: '',
      dosage: '',
      frequency: '',
      durationDays: 7,
      notes: '',
    },
  })

  const handleFormSubmit = (data: PrescriptionFormData) => {
    addPrescription({ ...data, notes: data.notes ?? '' })
    onSubmit(data)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Issue Prescription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="medicationName">Medication Name</Label>
            <Input id="medicationName" placeholder="e.g. Amoxicillin" {...register('medicationName')} />
            {errors.medicationName && (
              <p className="text-xs text-destructive">{errors.medicationName.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dosage">Dosage</Label>
            <Input id="dosage" placeholder="e.g. 500mg" {...register('dosage')} />
            {errors.dosage && (
              <p className="text-xs text-destructive">{errors.dosage.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Input id="frequency" placeholder="e.g. Twice daily" {...register('frequency')} />
            {errors.frequency && (
              <p className="text-xs text-destructive">{errors.frequency.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="durationDays">Duration (days)</Label>
            <Input id="durationDays" type="number" min={1} {...register('durationDays', { valueAsNumber: true })} />
            {errors.durationDays && (
              <p className="text-xs text-destructive">{errors.durationDays.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" placeholder="Optional notes" {...register('notes')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Add Prescription
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
