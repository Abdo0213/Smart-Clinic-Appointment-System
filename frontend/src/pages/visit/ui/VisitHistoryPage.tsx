'use client'

import { useAuthStore } from '@/features/auth'
import { VisitHistoryTable } from '@/widgets/visit-history'

export default function VisitHistoryPage() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role
  const patientId = role === 'Patient' ? user?.patientId ?? undefined : undefined
  const doctorId = role === 'Doctor' ? user?.doctorId ?? undefined : undefined

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Visit History</h1>
        <p className="text-sm text-muted-foreground">
          {role === 'Patient'
            ? 'View your clinical visit records'
            : 'View clinical visit records for your patients'}
        </p>
      </div>

      <VisitHistoryTable patientId={patientId} doctorId={doctorId} />
    </div>
  )
}
