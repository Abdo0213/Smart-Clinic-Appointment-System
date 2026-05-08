'use client'

import { useAuthStore } from '@/features/auth'
import { useGetPatient } from '@/entities/patient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'

export default function PatientProfilePage() {
  const user = useAuthStore((s) => s.user)
  const { data: patient, isLoading } = useGetPatient(user?.patientId ?? '')

  if (isLoading) return <LoadingSpinner />
  if (!patient) return <div className="py-8 text-center text-muted-foreground">Patient profile not found.</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">Name:</span> {patient.firstName} {patient.lastName}</div>
          <div><span className="text-muted-foreground">Date of Birth:</span> {patient.dateOfBirth}</div>
          <div><span className="text-muted-foreground">Gender:</span> {patient.gender}</div>
          <div><span className="text-muted-foreground">Phone:</span> {patient.phone}</div>
          <div><span className="text-muted-foreground">Blood Type:</span> {patient.bloodType || 'N/A'}</div>
          <div><span className="text-muted-foreground">Address:</span> {patient.address || 'N/A'}</div>
          <div><span className="text-muted-foreground">Insurance:</span> {patient.insuranceProvider || 'N/A'}</div>
          <div><span className="text-muted-foreground">Allergies:</span> {patient.knownAllergies || 'None'}</div>
        </CardContent>
      </Card>
    </div>
  )
}
