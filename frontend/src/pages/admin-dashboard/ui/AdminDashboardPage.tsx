'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { API_ROUTES } from '@/shared/api/apiRoutes'
import { useAuthStore } from '@/features/auth/model/authStore'
import { AuthGuard } from '@/features/auth/ui/AuthGuard'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { Button } from '@/components/ui/button'
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

interface DashboardSummary {
  appointments: {
    total: number
    confirmed: number
    pending: number
    cancelled: number
  }
  revenue: {
    totalBilled: number
    pendingCollected: number
  }
  staff: {
    activeDoctors: number
    totalDoctors: number
  }
}

function useDashboardSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'summary', from, to],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardSummary>(API_ROUTES.ADMIN.DASHBOARD, {
        params: { from, to },
      })
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export default function AdminDashboardPage() {
  const [dateFrom, setDateFrom] = useState<string>(new Date().toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().split('T')[0])

  const { data: summary, isLoading } = useDashboardSummary(dateFrom || undefined, dateTo || undefined)

  const handleClearRange = () => {
    setDateFrom('')
    setDateTo('')
  }

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          
          <div className="flex flex-wrap items-center gap-2 bg-muted/50 p-2 rounded-lg border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">From:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-background border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">To:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-background border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearRange} className="h-8 text-xs">
              Get All
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total Appointments"
            value={summary?.appointments.total ?? 0}
            icon={<CalendarCheckIcon className="size-5 text-blue-500" />}
          />
          <MetricCard
            title="Confirmed Appointments"
            value={summary?.appointments.confirmed ?? 0}
            icon={<CheckCircleIcon className="size-5 text-green-500" />}
          />
          <MetricCard
            title="Active Doctors"
            value={`${summary?.staff.activeDoctors ?? 0} / ${summary?.staff.totalDoctors ?? 0}`}
            icon={<ActivityIcon className="size-5 text-purple-500" />}
          />
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(summary?.revenue.totalBilled ?? 0)}
            icon={<DollarSignIcon className="size-5 text-emerald-500" />}
          />
          <MetricCard
            title="Pending Revenue"
            value={formatCurrency(summary?.revenue.pendingCollected ?? 0)}
            icon={<ReceiptIcon className="size-5 text-yellow-500" />}
          />
          <MetricCard
            title="Cancelled"
            value={summary?.appointments.cancelled ?? 0}
            icon={<UserXIcon className="size-5 text-red-500" />}
          />
        </div>
      </div>
    </AuthGuard>
  )
}
