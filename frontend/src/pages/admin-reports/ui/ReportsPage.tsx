'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { API_ROUTES } from '@/shared/api/apiRoutes'
import { AuthGuard } from '@/features/auth/ui/AuthGuard'
import { DateRangePicker } from '@/shared/ui/date-range-picker/date-range-picker'
import { ExportButton } from '@/shared/ui/export-button/export-button'
import { DataTable } from '@/shared/ui/data-table/data-table'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { DateRange } from 'react-day-picker'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

interface AppointmentsReport {
  totalAppointments: number
  completed: number
  cancelled: number
  noShow: number
  records: any[]
}

interface RevenueReport {
  totalBilled: number
  totalCollected: number
  records: any[]
}

interface VisitsReport {
  totalVisits: number
  signedVisits: number
  records: any[]
}

interface DoctorUtilization {
  doctorName: string
  utilizationPercent: number
  total: number
}

interface PatientsReport {
  totalPatients: number
  records: any[]
}

interface NoShowReport {
  noShowRate: number
  noShowCount: number
  totalAppointments: number
}

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2']

function useReportsQuery<T>(reportType: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['admin', 'reports', reportType, from, to],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (from) params.from = from
      if (to) params.to = to
      const { data } = await apiClient.get<T>(`${API_ROUTES.ADMIN.REPORTS_APPOINTMENTS.replace('/appointments', `/${reportType}`)}`, { params })
      return data
    },
    enabled: !!from && !!to,
  })
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const from = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined
  const to = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined

  const { data: appointmentData, isLoading: appointmentsLoading } = useReportsQuery<AppointmentsReport>('appointments', from, to)
  const { data: revenueData, isLoading: revenueLoading } = useReportsQuery<RevenueReport>('revenue', from, to)
  const { data: visitData, isLoading: visitsLoading } = useReportsQuery<VisitsReport>('visits', from, to)
  const { data: doctorData, isLoading: doctorsLoading } = useReportsQuery<AppointmentsReport>('appointments', from, to)
  const { data: patientData, isLoading: patientsLoading } = useReportsQuery<PatientsReport>('patients', from, to)
  const { data: noShowData, isLoading: noShowLoading } = useReportsQuery<NoShowReport>('no-show-rate', from, to)

  // Grouping logic for charts
  const getAppointmentStats = () => {
    const records = appointmentData?.records ?? []
    const groups: Record<string, any> = {}
    records.forEach((r) => {
      const date = format(new Date(r.createdAt), 'yyyy-MM-dd')
      if (!groups[date]) groups[date] = { date, completed: 0, cancelled: 0, noShow: 0 }
      if (r.status === 'COMPLETED') groups[date].completed++
      if (r.status === 'CANCELLED') groups[date].cancelled++
      if (r.status === 'NO_SHOW') groups[date].noShow++
    })
    return Object.values(groups).sort((a: any, b: any) => a.date.localeCompare(b.date))
  }

  const getRevenueStats = () => {
    const records = revenueData?.records ?? []
    const groups: Record<string, any> = {}
    records.forEach((r) => {
      const date = format(new Date(r.createdAt), 'yyyy-MM-dd')
      if (!groups[date]) groups[date] = { date, billed: 0, collected: 0 }
      groups[date].billed += r.totalAmount
      if (r.status === 'PAID') groups[date].collected += r.totalAmount
    })
    return Object.values(groups).sort((a: any, b: any) => a.date.localeCompare(b.date))
  }

  const getVisitStats = () => {
    const records = visitData?.records ?? []
    const groups: Record<string, any> = {}
    records.forEach((r) => {
      const date = format(new Date(r.createdAt), 'yyyy-MM-dd')
      if (!groups[date]) groups[date] = { date, total: 0, signed: 0 }
      groups[date].total++
      if (r.isSigned) groups[date].signed++
    })
    return Object.values(groups).sort((a: any, b: any) => a.date.localeCompare(b.date))
  }

  const getPatientStats = () => {
    const records = patientData?.records ?? []
    const groups: Record<string, any> = {}
    records.forEach((r) => {
      const date = format(new Date(r.createdAt), 'yyyy-MM-dd')
      if (!groups[date]) groups[date] = { date, total: 0 }
      groups[date].total++
    })
    return Object.values(groups).sort((a: any, b: any) => a.date.localeCompare(b.date))
  }

  const appointmentColumns: ColumnDef<any>[] = [
    { accessorKey: 'createdAt', header: 'Date', cell: ({ row }) => format(new Date(row.original.createdAt), 'yyyy-MM-dd') },
    { accessorKey: 'patientName', header: 'Patient' },
    { accessorKey: 'doctorName', header: 'Doctor' },
    { accessorKey: 'status', header: 'Status' },
  ]

  const revenueColumns: ColumnDef<any>[] = [
    { accessorKey: 'createdAt', header: 'Date', cell: ({ row }) => format(new Date(row.original.createdAt), 'yyyy-MM-dd') },
    { accessorKey: 'patientName', header: 'Patient' },
    { accessorKey: 'totalAmount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.totalAmount) },
    { accessorKey: 'status', header: 'Status' },
  ]

  const doctorColumns: ColumnDef<DoctorUtilization>[] = [
    { accessorKey: 'doctorName', header: 'Doctor' },
    { accessorKey: 'utilizationPercent', header: 'Utilization %', cell: ({ row }) => `${row.original.utilizationPercent.toFixed(1)}%` },
    { accessorKey: 'total', header: 'Total Appointments' },
  ]

  return (
    <AuthGuard requiredRole="Admin">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reports</h1>
          <div className="flex items-center gap-3">
            <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
            <ExportButton reportType="all" from={from} to={to} />
          </div>
        </div>

        <Tabs defaultValue="appointments">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="visits">Visits</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="noshow">No-Show</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Appointments Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="flex justify-center py-12"><LoadingSpinner /></div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={getAppointmentStats()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#16a34a" name="Completed" />
                      <Bar dataKey="cancelled" fill="#dc2626" name="Cancelled" />
                      <Bar dataKey="noShow" fill="#ea580c" name="No-Show" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <DataTable
              columns={appointmentColumns}
              data={appointmentData?.records ?? []}
              pagination={{ page: 0, pageSize: 20, totalPages: 1, onPageChange: () => {} }}
              isLoading={appointmentsLoading}
            />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <div className="flex justify-center py-12"><LoadingSpinner /></div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={getRevenueStats()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                      <Line type="monotone" dataKey="billed" stroke="#2563eb" name="Billed" />
                      <Line type="monotone" dataKey="collected" stroke="#16a34a" name="Collected" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <DataTable
              columns={revenueColumns}
              data={revenueData?.records ?? []}
              pagination={{ page: 0, pageSize: 20, totalPages: 1, onPageChange: () => {} }}
              isLoading={revenueLoading}
            />
          </TabsContent>

          <TabsContent value="visits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Visits Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {visitsLoading ? (
                  <div className="flex justify-center py-12"><LoadingSpinner /></div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={getVisitStats()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#2563eb" name="Total" />
                      <Bar dataKey="signed" fill="#9333ea" name="Signed" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Doctor Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                {doctorsLoading ? (
                  <div className="flex justify-center py-12"><LoadingSpinner /></div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={appointmentData?.byDoctor ?? []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis dataKey="doctorName" type="category" width={120} />
                      <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
                      <Bar dataKey="utilizationPercent" fill="#9333ea" name="Utilization" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <DataTable
              columns={doctorColumns}
              data={appointmentData?.byDoctor ?? []}
              pagination={{ page: 0, pageSize: 20, totalPages: 1, onPageChange: () => {} }}
              isLoading={appointmentsLoading}
            />
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Patient Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {patientsLoading ? (
                  <div className="flex justify-center py-12"><LoadingSpinner /></div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={getPatientStats()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#0891b2" name="New Patients" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <DataTable
              columns={[
                { accessorKey: 'createdAt', header: 'Date', cell: ({ row }) => format(new Date(row.original.createdAt), 'yyyy-MM-dd') },
                { accessorKey: 'firstName', header: 'First Name' },
                { accessorKey: 'lastName', header: 'Last Name' },
                { accessorKey: 'gender', header: 'Gender' },
              ]}
              data={patientData?.records ?? []}
              pagination={{ page: 0, pageSize: 20, totalPages: 1, onPageChange: () => {} }}
              isLoading={patientsLoading}
            />
          </TabsContent>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{noShowData?.noShowRate.toFixed(1)}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">No-Show Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{noShowData?.noShowCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{noShowData?.totalAppointments}</div>
                </CardContent>
              </Card>
            </div>
        </Tabs>
      </div>
    </AuthGuard>
  )
}
