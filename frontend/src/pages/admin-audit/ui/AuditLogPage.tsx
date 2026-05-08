'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { API_ROUTES } from '@/shared/api/apiRoutes'
import { AuthGuard } from '@/features/auth/ui/AuthGuard'
import { DataTable } from '@/shared/ui/data-table/data-table'
import { SearchBar } from '@/shared/ui/search-bar/search-bar'
import { DateRangePicker } from '@/shared/ui/date-range-picker/date-range-picker'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { EmptyState } from '@/shared/ui/empty-state/empty-state'
import { formatDateTime } from '@/shared/lib/formatDate'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@tanstack/react-table'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'

interface AuditLogEntry {
  id: string
  timestamp: string
  actor: string
  action: string
  resource: string
  details: string
}

interface AuditLogResponse {
  content: AuditLogEntry[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

function useAuditLog(params: { from?: string; to?: string; actor?: string; page: number; size: number }) {
  return useQuery({
    queryKey: ['admin', 'audit-log', params],
    queryFn: async () => {
      const { data } = await apiClient.get<AuditLogResponse>(API_ROUTES.ADMIN.AUDIT_LOG, { params })
      return data
    },
  })
}

export default function AuditLogPage() {
  const [page, setPage] = useState(0)
  const [actorSearch, setActorSearch] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const from = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined
  const to = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined

  const { data, isLoading } = useAuditLog({
    from,
    to,
    actor: actorSearch || undefined,
    page,
    size: 10,
  })

  const columns: ColumnDef<AuditLogEntry>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => formatDateTime(row.original.timestamp),
    },
    {
      accessorKey: 'actor',
      header: 'Actor',
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: 'resource',
      header: 'Resource',
    },
    {
      accessorKey: 'details',
      header: 'Details',
      cell: ({ row }) => (
        <span className="max-w-[300px] truncate block text-sm text-muted-foreground">
          {row.original.details}
        </span>
      ),
    },
  ]

  const entries = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <AuthGuard requiredRole="Admin">
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-2xl font-bold">Audit Log</h1>

        <div className="flex items-center gap-4">
          <SearchBar onSearch={setActorSearch} placeholder="Search by actor..." className="max-w-sm" />
          <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState title="No audit log entries" description="Audit log entries will appear here." />
        ) : (
          <DataTable
            columns={columns}
            data={entries}
            pagination={{ page, pageSize: 10, totalPages, onPageChange: setPage }}
          />
        )}
      </div>
    </AuthGuard>
  )
}
