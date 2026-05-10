import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/shared/lib/formatDate'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { ReceiptIcon, UserIcon, CalendarIcon } from 'lucide-react'
import type { Invoice } from '../model/types'

interface InvoiceCardProps {
  invoice: Invoice
  onClick?: (invoice: Invoice) => void
}

export function InvoiceCard({ invoice, onClick }: InvoiceCardProps) {
  const statusColors: Record<string, string> = {
    PAID: 'bg-green-500 text-white border-none',
    PENDING: 'border-2 border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30',
    WAIVED: 'border-2 border-slate-400 text-slate-500 bg-slate-50 dark:bg-slate-900/30'
  }

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-primary/10 bg-gradient-to-br from-card to-muted/30"
      onClick={() => onClick?.(invoice)}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <ReceiptIcon className="size-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-black tracking-tight">
              {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
            </CardTitle>
          </div>
          <Badge className={`font-bold rounded-full text-[10px] px-2.5 py-0.5 ${statusColors[invoice.status] || ''}`}>
            {invoice.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <UserIcon className="size-3.5" />
            <span className="text-xs font-bold truncate">
              {invoice.patientName || `Patient #${invoice.patientId.slice(0, 8)}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="size-3.5" />
            <span className="text-xs font-medium">
              {formatDate(invoice.createdAt)}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-primary/5 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Amount Due
          </span>
          <span className="text-lg font-black text-primary tabular-nums">
            {formatCurrency(invoice.totalAmount)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
