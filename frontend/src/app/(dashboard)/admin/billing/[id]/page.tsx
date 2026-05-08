'use client'

import InvoiceDetailPage from '@/pages/billing/ui/InvoiceDetailPage'
import { useParams } from 'next/navigation'

export default function AdminInvoiceDetailPage() {
  const params = useParams()
  const id = params.id as string
  return <InvoiceDetailPage invoiceId={id} />
}
