'use client'

import { useGetVisit, useSignVisit, useIssuePrescription, useScheduleFollowUp, VisitDetail, PrescriptionCard, VisitStatusBadge, PdfDownloadButton } from '@/entities/visit'
import { useGetAppointment } from '@/entities/appointment'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { useParams } from 'next/navigation'

export default function VisitPage() {
  const params = useParams()
  const appointmentId = params.appointmentId as string

  const { data: appointment, isLoading: aptLoading } = useGetAppointment(appointmentId)
  const visitId = appointment?.id ?? ''

  const { data: visit, isLoading: visitLoading } = useGetVisit(visitId)

  if (aptLoading || visitLoading) return <LoadingSpinner />

  if (!visit) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Visit</h1>
        <p className="text-muted-foreground">No visit record found for this appointment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Visit Details</h1>
        <PdfDownloadButton visitId={visit.id} />
      </div>
      <VisitDetail visit={visit} />
      {visit.prescriptions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Prescriptions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {visit.prescriptions.map((rx) => (
              <PrescriptionCard key={rx.id} prescription={rx} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
