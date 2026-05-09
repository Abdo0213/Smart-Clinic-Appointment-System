'use client'

import { useState } from 'react'
import { useAuthStore, ChangePasswordForm } from '@/features/auth'
import { useGetMe } from '@/entities/patient'
import { UpdatePatientForm } from '@/features/patient/ui'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { Pencil, ShieldCheck } from 'lucide-react'

export default function PatientProfilePage() {
  const user = useAuthStore((s) => s.user)
  const { data: patient, isLoading } = useGetMe()
  const [isEditOpen, setIsEditOpen] = useState(false)

  if (isLoading) return <LoadingSpinner />
  if (!patient) return <div className="py-8 text-center text-muted-foreground">Patient profile not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button onClick={() => setIsEditOpen(true)} variant="outline" size="sm" className="gap-2">
          <Pencil className="size-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic details and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div><span className="text-muted-foreground">Name:</span> {patient.firstName} {patient.lastName}</div>
            <div><span className="text-muted-foreground">Email:</span> {user?.email}</div>
            <div><span className="text-muted-foreground">Date of Birth:</span> {patient.dateOfBirth}</div>
            <div><span className="text-muted-foreground">Gender:</span> {patient.gender}</div>
            <div><span className="text-muted-foreground">Phone:</span> {patient.phone}</div>
            <div><span className="text-muted-foreground">Blood Type:</span> {patient.bloodType || 'N/A'}</div>
            <div><span className="text-muted-foreground">Address:</span> {patient.address || 'N/A'}</div>
            <div><span className="text-muted-foreground">Insurance:</span> {patient.insuranceProvider || 'N/A'}</div>
            <div><span className="text-muted-foreground">Allergies:</span> {patient.knownAllergies || 'None'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Update your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <UpdatePatientForm 
            patientId={patient.id} 
            email={user?.email}
            onSuccess={() => setIsEditOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
