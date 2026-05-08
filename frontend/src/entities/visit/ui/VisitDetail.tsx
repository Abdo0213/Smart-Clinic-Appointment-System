'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { VisitStatusBadge } from './VisitStatusBadge'
import { PrescriptionCard } from './PrescriptionCard'
import type { Visit } from '../model/types'

interface VisitDetailProps {
  visit: Visit
}

export function VisitDetail({ visit }: VisitDetailProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Visit Record</CardTitle>
          <VisitStatusBadge isSigned={visit.isSigned} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 text-sm">
          <div>
            <span className="font-medium">Chief Complaint</span>
            <p className="text-muted-foreground">{visit.chiefComplaint}</p>
          </div>
          <div>
            <span className="font-medium">Examination Findings</span>
            <p className="text-muted-foreground">{visit.examinationFindings}</p>
          </div>
          <div>
            <span className="font-medium">Assessment</span>
            <p className="text-muted-foreground">{visit.assessment}</p>
          </div>
          <div>
            <span className="font-medium">Plan</span>
            <p className="text-muted-foreground">{visit.plan}</p>
          </div>
          {visit.icd10Codes.length > 0 && (
            <div>
              <span className="font-medium">ICD-10 Codes</span>
              <p className="text-muted-foreground">{visit.icd10Codes.join(', ')}</p>
            </div>
          )}
        </div>

        {visit.prescriptions.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="mb-2 font-medium">Prescriptions</h4>
              <div className="flex flex-col gap-2">
                {visit.prescriptions.map((rx) => (
                  <PrescriptionCard key={rx.id} prescription={rx} />
                ))}
              </div>
            </div>
          </>
        )}

        <div className="text-xs text-muted-foreground">
          Created: {visit.createdAt} · Updated: {visit.updatedAt}
          {visit.signedAt && ` · Signed: ${visit.signedAt}`}
        </div>
      </CardContent>
    </Card>
  )
}
