'use client'

import { useState } from 'react'
import { useAuthStore } from '@/features/auth'
import { useGetInvoices, InvoiceCard, InvoiceStatusBadge } from '@/entities/invoice'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { INVOICE_STATUS_VALUES } from '@/entities/invoice'
import type { InvoiceStatus } from '@/shared/types/enums'

export default function PatientInvoicesPage() {
  const user = useAuthStore((s) => s.user)
  const [status, setStatus] = useState<InvoiceStatus | ''>('')

  const { data, isLoading } = useGetInvoices({
    patientId: user?.patientId ?? '',
    status: status || undefined,
    size: 20,
  })

  const invoices = data?.data ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Invoices</h1>
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
      ) : invoices.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No invoices found.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {invoices.map((inv) => (
            <InvoiceCard key={inv.id} invoice={inv} />
          ))}
        </div>
      )}
    </div>
  )
}
