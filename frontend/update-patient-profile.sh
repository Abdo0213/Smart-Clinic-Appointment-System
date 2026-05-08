#!/bin/bash
cat << 'INNER_EOF' > src/pages/patient-profile/ui/PatientProfilePage.tsx
"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useAuthStore } from "@/features/auth"
import { useGetPatient } from "@/entities/patient"
import { LoadingSpinner } from "@/shared/ui/loading-spinner/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PencilIcon, CalendarIcon, ActivityIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UpdatePatientForm } from "@/features/patient/ui/UpdatePatientForm"

export default function PatientProfilePage() {
  const params = useParams<{ id?: string }>()
  const user = useAuthStore((s) => s.user)
  const patientId = params.id as string
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)

  const { data: patient, isLoading, isError } = useGetPatient(patientId)

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError || !patient) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-semibold text-destructive">Error Loading Patient</h2>
        <p className="text-muted-foreground">The requested patient could not be found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patient Profile</h1>
        <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PencilIcon className="mr-2 size-4" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Update Patient Profile</DialogTitle>
            </DialogHeader>
            <UpdatePatientForm patientId={patientId} onSuccess={() => setIsUpdateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">First Name</p>
                <p>{patient.firstName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                <p>{patient.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p>{patient.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p>{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p>{patient.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p>{patient.address || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blood Type</p>
                <p>{patient.bloodType ? <Badge variant="outline">{patient.bloodType}</Badge> : "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Known Allergies</p>
                <p>{patient.knownAllergies || "None reported"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                <p>{patient.emergencyContact || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emergency Phone</p>
                <p>{patient.emergencyPhone || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Insurance Provider</p>
                <p>{patient.insuranceProvider || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Insurance Number</p>
                <p>{patient.insuranceNumber || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="appointments" className="mt-8">
        <TabsList>
          <TabsTrigger value="appointments">
            <CalendarIcon className="mr-2 size-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="visits">
            <ActivityIcon className="mr-2 size-4" />
            Visits
          </TabsTrigger>
        </TabsList>
        <TabsContent value="appointments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                <p>Appointments table will be displayed here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="visits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                <p>Visits table will be displayed here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
INNER_EOF
