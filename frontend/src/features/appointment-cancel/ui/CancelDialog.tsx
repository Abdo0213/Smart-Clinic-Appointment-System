'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCancelAppointment, canCancel } from '@/entities/appointment'
import type { AppointmentStatus } from '@/entities/appointment'

interface CancelDialogProps {
  appointmentId: string
  currentStatus: AppointmentStatus
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MIN_REASON_LENGTH = 5

export function CancelDialog({
  appointmentId,
  currentStatus,
  open,
  onOpenChange,
}: CancelDialogProps) {
  const [reason, setReason] = useState('')
  const cancelAppointment = useCancelAppointment()
  const isReasonValid = reason.trim().length >= MIN_REASON_LENGTH

  const handleCancel = () => {
    if (!isReasonValid) return
    cancelAppointment.mutate(
      { id: appointmentId, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success('Appointment cancelled successfully')
          setReason('')
          onOpenChange(false)
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : 'Failed to cancel appointment'
          toast.error(message)
        },
      }
    )
  }

  const handleClose = () => {
    setReason('')
    onOpenChange(false)
  }

  if (!canCancel(currentStatus)) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Please provide a reason for cancelling this appointment. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="cancel-reason">Reason</Label>
          <Input
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter cancellation reason (min 5 characters)..."
          />
          {reason.length > 0 && !isReasonValid && (
            <p className="text-xs text-destructive">
              Reason must be at least {MIN_REASON_LENGTH} characters
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={cancelAppointment.isPending}
          >
            Go Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={!isReasonValid || cancelAppointment.isPending}
          >
            {cancelAppointment.isPending ? 'Cancelling...' : 'Cancel Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
