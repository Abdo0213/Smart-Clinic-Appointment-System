"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useGetPatient } from "@/entities/patient"
import { useGetAppointments, AppointmentStatusBadge } from "@/entities/appointment"
import { PencilIcon, CalendarIcon, ActivityIcon, LockIcon, EyeIcon } from "lucide-react"
import { VisitDetailsDialog, useGetVisits, VisitStatusBadge } from "@/entities/visit"
import { LoadingSpinner } from "@/shared/ui/loading-spinner/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UpdatePatientForm } from "@/features/patient/ui/UpdatePatientForm"
import { ChangePasswordForm } from "@/features/auth/ui/ChangePasswordForm"
import { useAuthStore } from "@/features/auth"
import { DataTable } from "@/shared/ui/data-table/data-table"
import { EmptyState } from "@/shared/ui/empty-state/empty-state"
import type { ColumnDef } from "@tanstack/react-table"
import type { Appointment } from "@/entities/appointment"
import type { Visit } from "@/entities/visit"
import { formatDate, formatDateTime } from "@/shared/lib/formatDate"

export default function PatientProfilePage() {
  const params = useParams<{ id?: string }>()
  const patientId = params.id as string
  const user = useAuthStore((s) => s.user)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { data: patient, isLoading, isError } = useGetPatient(patientId)
  const [appointmentsPage, setAppointmentsPage] = useState(0)
  const [visitsPage, setVisitsPage] = useState(0)

  const { data: appointments, isLoading: appointmentsLoading } = useGetAppointments({
    patientId,
    page: appointmentsPage,
    size: 10,
  })
  const { data: visits, isLoading: visitsLoading } = useGetVisits({
    patientId,
    page: visitsPage,
    size: 10,
  })

  const handleViewVisit = (visit: Visit) => {
    setSelectedVisit(visit)
    setIsDetailsOpen(true)
  }

  const appointmentColumns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "slotDate",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.slotDate),
    },
    {
      accessorKey: "slotStart",
      header: "Time",
      cell: ({ row }) => `${row.original.slotStart} - ${row.original.slotEnd}`,
    },
    {
      accessorKey: "doctorName",
      header: "Doctor",
      cell: ({ row }) => row.original.doctorName ?? row.original.doctorId,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <AppointmentStatusBadge status={row.original.status} />,
    },
  ]

  const visitColumns: ColumnDef<Visit>[] = [
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      accessorKey: "doctorId",
      header: "Doctor",
      cell: ({ row }) => row.original.doctorId,
    },
    {
      accessorKey: "isSigned",
      header: "Status",
      cell: ({ row }) => <VisitStatusBadge isSigned={row.original.isSigned} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleViewVisit(row.original)}
          className="gap-2"
        >
          <EyeIcon className="size-4" />
          View
        </Button>
      ),
    },
  ]

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
          <DialogTrigger
            render={
              <Button variant="outline">
                <PencilIcon className="mr-2 size-4" />
                Edit Profile
              </Button>
            }
          />
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Update Patient Profile</DialogTitle>
            </DialogHeader>
            <UpdatePatientForm 
              patientId={patientId} 
              email={user?.id === patient.userId ? user.email : undefined} 
              onSuccess={() => setIsUpdateOpen(false)} 
            />
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
          <TabsTrigger value="security">
            <LockIcon className="mr-2 size-4" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <LoadingSpinner size="lg" />
                </div>
              ) : !appointments?.content?.length ? (
                <EmptyState
                  icon={CalendarIcon}
                  title="No appointments found"
                  description="This patient has no appointments yet."
                />
              ) : (
                <DataTable
                  columns={appointmentColumns}
                  data={appointments.content}
                  pagination={{
                    page: appointments.page,
                    pageSize: appointments.size,
                    totalPages: appointments.totalPages,
                    onPageChange: setAppointmentsPage,
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="visits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical Visits</CardTitle>
            </CardHeader>
            <CardContent>
              {visitsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <LoadingSpinner size="lg" />
                </div>
              ) : !visits?.content?.length ? (
                <EmptyState
                  icon={ActivityIcon}
                  title="No visits found"
                  description="This patient has no visit records yet."
                />
              ) : (
                <DataTable
                  columns={visitColumns}
                  data={visits.content}
                  pagination={{
                    page: visits.number,
                    pageSize: visits.size,
                    totalPages: visits.totalPages,
                    onPageChange: setVisitsPage,
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security & Password</CardTitle>
            </CardHeader>
            <CardContent className="max-w-md">
              <p className="text-sm text-muted-foreground mb-4">
                Update your password to keep your account secure.
              </p>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <VisitDetailsDialog 
        visit={selectedVisit} 
        open={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen} 
      />
    </div>
  )
}
