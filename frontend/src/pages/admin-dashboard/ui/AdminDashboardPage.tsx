'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { API_ROUTES } from '@/shared/api/apiRoutes'
import { useAuthStore } from '@/features/auth/model/authStore'
import { AuthGuard } from '@/features/auth/ui/AuthGuard'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import {
  CalendarCheckIcon,
  CheckCircleIcon,
  ActivityIcon,
  UserXIcon,
  DollarSignIcon,
  ReceiptIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: { value: number; label: string }
}

function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            {trend.value > 0 ? (
              <TrendingUpIcon className="size-3 text-green-600" />
            ) : trend.value < 0 ? (
              <TrendingDownIcon className="size-3 text-red-600" />
            ) : (
              <MinusIcon className="size-3 text-muted-foreground" />
            )}
            <span className={trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-muted-foreground'}>
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface AppointmentsReport {
  todayTotal: number
  todayCompleted: number
  todayCancelled: number
  todayNoShow: number
}

interface RevenueReport {
  todayRevenue: number
  monthRevenue: number
  pendingCount: number
}

interface DoctorUtilizationReport {
  averageUtilization: number
  noShowRate: number
}

function useAppointmentsReport() {
  return useQuery({
    queryKey: ['admin', 'reports', 'appointments', 'today'],
    queryFn: async () => {
      const { data } = await apiClient.get<AppointmentsReport>(API_ROUTES.ADMIN.REPORTS_APPOINTMENTS, {
        params: { from: new Date().toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
      })
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

function useRevenueReport() {
  return useQuery({
    queryKey: ['admin', 'reports', 'revenue', 'today'],
    queryFn: async () => {
      const { data } = await apiClient.get<RevenueReport>(API_ROUTES.ADMIN.REPORTS_REVENUE, {
        params: { from: new Date().toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
      })
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

function useDoctorUtilization() {
  return useQuery({
    queryKey: ['admin', 'reports', 'doctors', 'utilization'],
    queryFn: async () => {
      const { data } = await apiClient.get<DoctorUtilizationReport>(API_ROUTES.ADMIN.REPORTS_DOCTORS, {
        params: { from: new Date().toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
      })
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export default function AdminDashboardPage() {
  const { data: appointments, isLoading: appointmentsLoading } = useAppointmentsReport()
  const { data: revenue, isLoading: revenueLoading } = useRevenueReport()
  const { data: utilization, isLoading: utilizationLoading } = useDoctorUtilization()

  const isLoading = appointmentsLoading || revenueLoading || utilizationLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <AuthGuard requiredRole="Admin">
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Today's Appointments"
            value={appointments?.todayTotal ?? 0}
            icon={<CalendarCheckIcon className="size-5 text-blue-500" />}
            trend={{ value: 0, label: 'vs yesterday' }}
          />
          <MetricCard
            title="Today's Completed"
            value={appointments?.todayCompleted ?? 0}
            icon={<CheckCircleIcon className="size-5 text-green-500" />}
            trend={{ value: 0, label: 'vs yesterday' }}
          />
          <MetricCard
            title="Doctor Utilization"
            value={`${(utilization?.averageUtilization ?? 0).toFixed(1)}%`}
            icon={<ActivityIcon className="size-5 text-purple-500" />}
            trend={{ value: 0, label: 'vs last week' }}
          />
          <MetricCard
            title="No-Show Rate"
            value={`${(utilization?.noShowRate ?? 0).toFixed(1)}%`}
            icon={<UserXIcon className="size-5 text-orange-500" />}
            trend={{ value: 0, label: 'vs last week' }}
          />
          <MetricCard
            title="Today's Revenue"
            value={formatCurrency(revenue?.todayRevenue ?? 0)}
            icon={<DollarSignIcon className="size-5 text-emerald-500" />}
            trend={{ value: 0, label: 'vs yesterday' }}
          />
          <MetricCard
            title="Pending Invoices"
            value={revenue?.pendingCount ?? 0}
            icon={<ReceiptIcon className="size-5 text-yellow-500" />}
          />
        </div>
      </div>
    </AuthGuard>
  )
}
