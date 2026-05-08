'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { AmountDisplay } from './AmountDisplay'
import type { Invoice } from '../model/types'

interface InvoiceCardProps {
  invoice: Invoice
  onClick?: (invoice: Invoice) => void
}

export function InvoiceCard({ invoice, onClick }: InvoiceCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onClick?.(invoice)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{invoice.invoiceNumber}</CardTitle>
          <StatusBadge status={invoice.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
        <span>Patient: {invoice.patientId}</span>
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">
            <AmountDisplay amount={invoice.totalAmount} />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
