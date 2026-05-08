'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useGetInvoice, useMarkAsPaid, useWaiveInvoice, InvoiceStatusBadge, LineItemsTable, AmountDisplay } from '@/entities/invoice'
import { useAuthStore } from '@/features/auth/model/authStore'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog/confirm-dialog'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { EmptyState } from '@/shared/ui/empty-state/empty-state'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { formatDateTime } from '@/shared/lib/formatDate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeftIcon, DollarSignIcon, BanIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'Admin'

  const { data: invoice, isLoading, isError } = useGetInvoice(params.id)

  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [waiveDialogOpen, setWaiveDialogOpen] = useState(false)
  const [waiveReason, setWaiveReason] = useState('')

  const markAsPaidMutation = useMarkAsPaid()
  const waiveMutation = useWaiveInvoice()

  const handleMarkAsPaid = () => {
    if (!invoice) return
    markAsPaidMutation.mutate(invoice.id, {
      onSuccess: () => {
        setPayDialogOpen(false)
        toast.success(`Invoice ${invoice.invoiceNumber} marked as paid`)
      },
      onError: () => toast.error('Failed to mark invoice as paid'),
    })
  }

  const handleWaive = () => {
    if (!invoice || !waiveReason.trim()) return
    waiveMutation.mutate(
      { id: invoice.id, data: { reason: waiveReason.trim() } },
      {
        onSuccess: () => {
          setWaiveDialogOpen(false)
          setWaiveReason('')
          toast.success(`Invoice ${invoice.invoiceNumber} waived`)
        },
        onError: () => toast.error('Failed to waive invoice'),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError || !invoice) {
    return <EmptyState title="Invoice not found" description="The requested invoice could not be loaded." />
  }

  return (
    <div className="container mx-auto max-w-4xl py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
          <p className="text-sm text-muted-foreground">Created {formatDateTime(invoice.createdAt)}</p>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Details</CardTitle>
            <div className="flex items-center gap-2">
              {invoice.status === 'PENDING' && (
                <Button variant="outline" onClick={() => setPayDialogOpen(true)}>
                  <DollarSignIcon className="mr-2 size-4" />
                  Mark as Paid
                </Button>
              )}
              {isAdmin && invoice.status === 'PENDING' && (
                <Button variant="outline" onClick={() => setWaiveDialogOpen(true)}>
                  <BanIcon className="mr-2 size-4" />
                  Waive
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Patient ID</span>
              <p className="font-medium">{invoice.patientId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Visit ID</span>
              <p className="font-medium">{invoice.visitId}</p>
            </div>
            {invoice.appointmentId && (
              <div>
                <span className="text-muted-foreground">Appointment ID</span>
                <p className="font-medium">{invoice.appointmentId}</p>
              </div>
            )}
            {invoice.paidAt && (
              <div>
                <span className="text-muted-foreground">Paid At</span>
                <p className="font-medium">{formatDateTime(invoice.paidAt)}</p>
              </div>
            )}
            {invoice.waivedAt && (
              <div>
                <span className="text-muted-foreground">Waived At</span>
                <p className="font-medium">{formatDateTime(invoice.waivedAt)}</p>
              </div>
            )}
            {invoice.waivedReason && (
              <div>
                <span className="text-muted-foreground">Waiver Reason</span>
                <p className="font-medium">{invoice.waivedReason}</p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h4 className="mb-3 font-medium">Line Items</h4>
            <LineItemsTable lineItems={invoice.lineItems} />
          </div>

          <Separator />

          <div className="flex justify-end">
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <p className="text-2xl font-bold">
                <AmountDisplay amount={invoice.totalAmount} />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        title="Mark as Paid"
        description={`Mark invoice ${invoice.invoiceNumber} as paid?`}
        confirmLabel="Confirm Payment"
        onConfirm={handleMarkAsPaid}
        isLoading={markAsPaidMutation.isPending}
      />

      <ConfirmDialog
        open={waiveDialogOpen}
        onOpenChange={(open) => {
          setWaiveDialogOpen(open)
          if (!open) setWaiveReason('')
        }}
        title="Waive Invoice"
        description={`Waive invoice ${invoice.invoiceNumber}? This action cannot be undone.`}
        confirmLabel="Waive"
        variant="destructive"
        onConfirm={handleWaive}
        isLoading={waiveMutation.isPending}
      >
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="waive-reason-detail">Reason for waiver</Label>
          <Input
            id="waive-reason-detail"
            placeholder="Enter reason for waiving this invoice"
            value={waiveReason}
            onChange={(e) => setWaiveReason(e.target.value)}
          />
        </div>
      </ConfirmDialog>
    </div>
  )
}
