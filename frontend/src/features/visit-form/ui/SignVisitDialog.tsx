'use client'

import { useState } from 'react'
import { useVisitFormStore } from '../model/visitFormStore'
import { LineItemForm } from './LineItemForm'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog/confirm-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PlusIcon, Loader2Icon } from 'lucide-react'
import { formatCurrency } from '@/shared/lib/formatCurrency'

interface SignVisitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (additionalItems: { description: string; quantity: number; unitPrice: number }[]) => void
  isSubmitting?: boolean
}

export function SignVisitDialog({ open, onOpenChange, onConfirm, isSubmitting }: SignVisitDialogProps) {
  const additionalItems = useVisitFormStore((s) => s.additionalItems)
  const addAdditionalItem = useVisitFormStore((s) => s.addAdditionalItem)
  const removeAdditionalItem = useVisitFormStore((s) => s.removeAdditionalItem)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalAmount = additionalItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const handleConfirmSign = () => {
    setConfirmOpen(true)
  }

  const handleFinalConfirm = () => {
    const items = additionalItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }))
    onConfirm(items)
    setConfirmOpen(false)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sign Visit</DialogTitle>
            <DialogDescription>Add any additional billing items before signing. Once signed, the visit record will be locked.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Additional Billing Items</h4>
              <Button type="button" variant="outline" size="sm" onClick={addAdditionalItem}>
                <PlusIcon className="mr-1 size-4" />
                Add Item
              </Button>
            </div>
            {additionalItems.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No additional billing items</p>
            )}
            <div className="flex flex-col gap-3">
              {additionalItems.map((_, index) => (
                <LineItemForm
                  key={index}
                  index={index}
                  onRemove={() => removeAdditionalItem(index)}
                />
              ))}
            </div>
            {additionalItems.length > 0 && (
              <div className="flex justify-end border-t pt-3">
                <span className="text-sm font-medium">Additional Total: {formatCurrency(totalAmount)}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmSign} disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Confirm &amp; Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Signing"
        description="Are you sure you want to sign this visit? This action cannot be undone."
        confirmLabel="Sign Visit"
        variant="destructive"
        onConfirm={handleFinalConfirm}
        isLoading={isSubmitting}
      />
    </>
  )
}
