"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useGetAppointments, AppointmentStatusBadge, useUpdateAppointmentStatus } from "@/entities/appointment"
import { useGetPatients, PatientSearchBar } from "@/entities/patient"
import { useGetInvoices, InvoiceStatusBadge, useMarkAsPaid } from "@/entities/invoice"
import { QuickBookDialog } from "@/features/appointment-booking"
import { ROUTE_PATHS } from "@/shared/config/appConfig"
import { formatDate } from "@/shared/lib/formatDate"
import { formatCurrency } from "@/shared/lib/formatCurrency"
import { LoadingSpinner } from "@/shared/ui/loading-spinner/loading-spinner"
import { EmptyState } from "@/shared/ui/empty-state/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CalendarIcon,
  UserPlusIcon,
  UsersIcon,
  ReceiptIcon,
  ClipboardListIcon,
} from "lucide-react"

function getTodayISO() {
  return new Date().toISOString().split("T")[0]
}

export default function ReceptionDashboardPage() {
  const router = useRouter()
  const [patientFilters, setPatientFilters] = useState<{ name?: string; phone?: string }>({})
  const updateStatusMutation = useUpdateAppointmentStatus()
  const markAsPaidMutation = useMarkAsPaid()

  const { data: todayAppointmentsData, isLoading: appointmentsLoading } = useGetAppointments({
    date: getTodayISO(),
    page: 0,
    size: 10,
  })

  const { data: patientsData, isLoading: patientsLoading } = useGetPatients({
    name: patientFilters.name,
    phone: patientFilters.phone,
    page: 0,
    size: 5,
  })

  const { data: invoicesData, isLoading: invoicesLoading } = useGetInvoices({
    status: "PENDING",
    page: 0,
    size: 5,
  })

  const todayAppointments = todayAppointmentsData?.content ?? []
  const pendingInvoices = invoicesData?.data ?? []

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reception Dashboard</h1>
          <p className="text-muted-foreground">Manage your daily operations.</p>
        </div>
        <QuickBookDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push(ROUTE_PATHS.RECEPTION_PATIENTS)}
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <UserPlusIcon className="size-5 text-primary" />
            <CardTitle className="text-sm font-medium">Register Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Add a new patient to the system</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push(ROUTE_PATHS.RECEPTION_APPOINTMENTS)}
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <CalendarIcon className="size-5 text-primary" />
            <CardTitle className="text-sm font-medium">Book Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Schedule an appointment</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push(ROUTE_PATHS.RECEPTION_APPOINTMENTS)}
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <ClipboardListIcon className="size-5 text-primary" />
            <CardTitle className="text-sm font-medium">Manage Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">View and manage today&apos;s queue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s Appointments</CardTitle>
            <Badge variant="outline">{todayAppointments.length} total</Badge>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : todayAppointments.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="No appointments today"
                description="No appointments scheduled for today."
              />
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appt) => (
                  <div className="flex items-center gap-2">
                    <Select
                      defaultValue={appt.status}
                      onValueChange={(newStatus) =>
                        updateStatusMutation.mutate({ id: appt.id, status: newStatus as any })
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue>
                          {appt.status.charAt(0) + appt.status.slice(1).toLowerCase()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REQUESTED">Requested</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="size-5" />
                Patient Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PatientSearchBar onSearch={setPatientFilters} />
              {patientsLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : patientsData?.content?.length ? (
                <div className="mt-3 space-y-2">
                  {patientsData.content.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border p-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-muted-foreground">{p.phone}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`${ROUTE_PATHS.RECEPTION_PATIENTS}/${p.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-center text-sm text-muted-foreground">No patients found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ReceiptIcon className="size-5" />
                Pending Invoices
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push(ROUTE_PATHS.RECEPTION_BILLING)}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : pendingInvoices.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No pending invoices.</p>
              ) : (
                <div className="space-y-2">
                  {pendingInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-lg border p-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{inv.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(inv.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(inv.totalAmount)}</span>
                        <InvoiceStatusBadge status={inv.status} />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsPaidMutation.mutate(inv.id)}
                          disabled={markAsPaidMutation.isPending}
                        >
                          Pay
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  )
}
