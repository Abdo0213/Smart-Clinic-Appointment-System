'use client'

import { useParams } from 'next/navigation'
import { useGetVisit, VisitDetail, VisitStatusBadge, PrescriptionCard, PdfDownloadButton } from '@/entities/visit'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { EmptyState } from '@/shared/ui/empty-state/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LockIcon } from 'lucide-react'
import { formatDateTime } from '@/shared/lib/formatDate'

export default function VisitDetailPage() {
  const params = useParams<{ id: string }>()
  const visitId = params.id

  const { data: visit, isLoading, isError } = useGetVisit(visitId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError || !visit) {
    return (
      <EmptyState title="Visit not found" description="The requested visit record could not be loaded." />
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Visit Record</h1>
        <div className="flex items-center gap-3">
          <VisitStatusBadge isSigned={visit.isSigned} />
          <PdfDownloadButton visitId={visit.id} />
        </div>
      </div>

      {visit.isSigned && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="flex items-center gap-2 py-3">
            <LockIcon className="size-4 text-green-600" />
            <span className="text-sm text-green-700">
              This visit has been signed and locked on {formatDateTime(visit.signedAt)}
            </span>
          </CardContent>
        </Card>
      )}

      <VisitDetail visit={visit} />

      {visit.prescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prescriptions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {visit.prescriptions.map((rx) => (
              <PrescriptionCard key={rx.id} prescription={rx} />
            ))}
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">
        Visit ID: {visit.id} · Created: {formatDateTime(visit.createdAt)} · Updated: {formatDateTime(visit.updatedAt)}
      </div>
    </div>
  )
}
