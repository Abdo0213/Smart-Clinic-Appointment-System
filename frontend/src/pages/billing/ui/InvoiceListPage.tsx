'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useGetInvoices, useMarkAsPaid, useWaiveInvoice, INVOICE_STATUS_VALUES, InvoiceStatusBadge } from '@/entities/invoice'
import { useAuthStore } from '@/features/auth/model/authStore'
import { DataTable } from '@/shared/ui/data-table/data-table'
import { SearchBar } from '@/shared/ui/search-bar/search-bar'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog/confirm-dialog'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { EmptyState } from '@/shared/ui/empty-state/empty-state'
import { ROUTE_PATHS } from '@/shared/config/appConfig'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { formatDate } from '@/shared/lib/formatDate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusIcon, DollarSignIcon, BanIcon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Invoice } from '@/entities/invoice'
import type { InvoiceStatus } from '@/shared/types/enums'

export default function InvoiceListPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'Admin'

  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>()
  const [search, setSearch] = useState('')

  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [waiveDialogOpen, setWaiveDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [waiveReason, setWaiveReason] = useState('')

  const { data, isLoading } = useGetInvoices({
    status: statusFilter,
    page,
    size: 10,
  })

  const markAsPaidMutation = useMarkAsPaid()
  const waiveMutation = useWaiveInvoice()

  const handleMarkAsPaid = () => {
    if (!selectedInvoice) return
    markAsPaidMutation.mutate(selectedInvoice.id, {
      onSuccess: () => {
        setPayDialogOpen(false)
        toast.success(`Invoice ${selectedInvoice.invoiceNumber} marked as paid`)
      },
      onError: () => toast.error('Failed to mark invoice as paid'),
    })
  }

  const handleWaive = () => {
    if (!selectedInvoice || !waiveReason.trim()) return
    waiveMutation.mutate(
      { id: selectedInvoice.id, data: { reason: waiveReason.trim() } },
      {
        onSuccess: () => {
          setWaiveDialogOpen(false)
          setWaiveReason('')
          toast.success(`Invoice ${selectedInvoice.invoiceNumber} waived`)
        },
        onError: () => toast.error('Failed to waive invoice'),
      },
    )
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
    },
    {
      accessorKey: 'patientId',
      header: 'Patient',
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => formatCurrency(row.original.totalAmount),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`${ROUTE_PATHS.ADMIN_BILLING}/${invoice.id}`)}
            >
              View
            </Button>
            {invoice.status === 'PENDING' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedInvoice(invoice)
                  setPayDialogOpen(true)
                }}
              >
                <DollarSignIcon className="mr-1 size-3" />
                Pay
              </Button>
            )}
            {isAdmin && invoice.status === 'PENDING' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedInvoice(invoice)
                  setWaiveDialogOpen(true)
                }}
              >
                <BanIcon className="mr-1 size-3" />
                Waive
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const invoices = data?.data ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={() => router.push(`${ROUTE_PATHS.ADMIN_BILLING}/create`)}>
          <PlusIcon className="mr-2 size-4" />
          Create Invoice
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <SearchBar onSearch={setSearch} placeholder="Search invoices..." />
        <Select value={statusFilter ?? 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? undefined : (v as InvoiceStatus))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {INVOICE_STATUS_VALUES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState title="No invoices found" description="Create an invoice to get started." />
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          pagination={{ page, pageSize: 10, totalPages, onPageChange: setPage }}
        />
      )}

      <ConfirmDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        title="Mark as Paid"
        description={`Mark invoice ${selectedInvoice?.invoiceNumber ?? ''} as paid?`}
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
        description={`Waive invoice ${selectedInvoice?.invoiceNumber ?? ''}? This action cannot be undone.`}
        confirmLabel="Waive"
        variant="destructive"
        onConfirm={handleWaive}
        isLoading={waiveMutation.isPending}
      >
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="waive-reason">Reason for waiver</Label>
          <Input
            id="waive-reason"
            placeholder="Enter reason for waiving this invoice"
            value={waiveReason}
            onChange={(e) => setWaiveReason(e.target.value)}
          />
        </div>
      </ConfirmDialog>
    </div>
  )
}
