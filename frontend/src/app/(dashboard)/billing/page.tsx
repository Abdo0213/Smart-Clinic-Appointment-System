'use client'

import { useState } from 'react'
import { useGetInvoices, InvoiceStatusBadge, AmountDisplay } from '@/entities/invoice'
import { INVOICE_STATUS_VALUES } from '@/entities/invoice'
import { DataTable } from '@/shared/ui/data-table/data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ColumnDef } from '@tanstack/react-table'
import type { Invoice, InvoiceStatus } from '@/entities/invoice'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { formatDate } from '@/shared/lib/formatDate'

export default function InvoiceListPage() {
  const [status, setStatus] = useState<InvoiceStatus | ''>('')
  const [page, setPage] = useState(0)
  const { data, isLoading } = useGetInvoices({ status: status || undefined, page, size: 20 })

  const invoices = data?.data ?? []

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: 'invoiceNumber', header: 'Invoice #' },
    { accessorKey: 'patientId', header: 'Patient' },
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
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>
      <Select value={status} onValueChange={(v) => setStatus(v as InvoiceStatus | '')}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          {INVOICE_STATUS_VALUES.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          pagination={{ page, pageSize: 20, totalPages: data?.totalPages ?? 1, onPageChange: setPage }}
        />
      )}
    </div>
  )
}
