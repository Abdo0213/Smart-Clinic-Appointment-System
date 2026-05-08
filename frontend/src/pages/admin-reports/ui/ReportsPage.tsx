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

interface AppointmentStat {
  date: string
  completed: number
  cancelled: number
  noShow: number
}

interface RevenueStat {
  date: string
  billed: number
  collected: number
}

interface VisitStat {
  date: string
  total: number
  signed: number
}

interface DoctorUtilization {
  doctorName: string
  utilization: number
  totalAppointments: number
  completedAppointments: number
}

interface PatientStat {
  date: string
  newPatients: number
  returning: number
}

interface NoShowStat {
  date: string
  rate: number
  total: number
  noShows: number
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

  const { data: appointmentStats, isLoading: appointmentsLoading } = useReportsQuery<AppointmentStat[]>('appointments', from, to)
  const { data: revenueStats, isLoading: revenueLoading } = useReportsQuery<RevenueStat[]>('revenue', from, to)
  const { data: visitStats, isLoading: visitsLoading } = useReportsQuery<VisitStat[]>('visits', from, to)
  const { data: doctorStats, isLoading: doctorsLoading } = useReportsQuery<DoctorUtilization[]>('doctors', from, to)
  const { data: patientStats, isLoading: patientsLoading } = useReportsQuery<PatientStat[]>('patients', from, to)
  const { data: noShowStats, isLoading: noShowLoading } = useReportsQuery<NoShowStat[]>('no-show-rate', from, to)

  const appointmentColumns: ColumnDef<AppointmentStat>[] = [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'completed', header: 'Completed' },
    { accessorKey: 'cancelled', header: 'Cancelled' },
    { accessorKey: 'noShow', header: 'No-Show' },
  ]

  const revenueColumns: ColumnDef<RevenueStat>[] = [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'billed', header: 'Billed', cell: ({ row }) => formatCurrency(row.original.billed) },
    { accessorKey: 'collected', header: 'Collected', cell: ({ row }) => formatCurrency(row.original.collected) },
  ]

  const doctorColumns: ColumnDef<DoctorUtilization>[] = [
    { accessorKey: 'doctorName', header: 'Doctor' },
    { accessorKey: 'utilization', header: 'Utilization %', cell: ({ row }) => `${row.original.utilization.toFixed(1)}%` },
    { accessorKey: 'totalAppointments', header: 'Total Appts' },
    { accessorKey: 'completedAppointments', header: 'Completed' },
  ]

  const patientColumns: ColumnDef<PatientStat>[] = [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'newPatients', header: 'New' },
    { accessorKey: 'returning', header: 'Returning' },
  ]

  const noShowColumns: ColumnDef<NoShowStat>[] = [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'rate', header: 'Rate %', cell: ({ row }) => `${row.original.rate.toFixed(1)}%` },
    { accessorKey: 'total', header: 'Total' },
    { accessorKey: 'noShows', header: 'No-Shows' },
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
                    <BarChart data={appointmentStats ?? []}>
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
              data={appointmentStats ?? []}
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
                    <LineChart data={revenueStats ?? []}>
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
              data={revenueStats ?? []}
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
                    <BarChart data={visitStats ?? []}>
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
                    <BarChart data={doctorStats ?? []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis dataKey="doctorName" type="category" width={120} />
                      <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
                      <Bar dataKey="utilization" fill="#9333ea" name="Utilization" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <DataTable
              columns={doctorColumns}
              data={doctorStats ?? []}
              pagination={{ page: 0, pageSize: 20, totalPages: 1, onPageChange: () => {} }}
              isLoading={doctorsLoading}
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
                    <BarChart data={patientStats ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="newPatients" fill="#0891b2" name="New" />
                      <Bar dataKey="returning" fill="#2563eb" name="Returning" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <DataTable
              columns={patientColumns}
              data={patientStats ?? []}
              pagination={{ page: 0, pageSize: 20, totalPages: 1, onPageChange: () => {} }}
              isLoading={patientsLoading}
            />
          </TabsContent>

          <TabsContent value="noshow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">No-Show Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {noShowLoading ? (
                  <div className="flex justify-center py-12"><LoadingSpinner /></div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={noShowStats ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis unit="%" />
                      <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
                      <Line type="monotone" dataKey="rate" stroke="#ea580c" name="No-Show Rate" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <DataTable
              columns={noShowColumns}
              data={noShowStats ?? []}
              pagination={{ page: 0, pageSize: 20, totalPages: 1, onPageChange: () => {} }}
              isLoading={noShowLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}
