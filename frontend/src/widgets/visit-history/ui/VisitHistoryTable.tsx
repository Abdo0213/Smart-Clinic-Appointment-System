'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { useGetVisits, VisitStatusBadge } from '@/entities/visit'
import type { Visit, VisitFilters } from '@/entities/visit'
import { DataTable } from '@/shared/ui/data-table/data-table'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { EmptyState } from '@/shared/ui/empty-state/empty-state'
import { formatDate } from '@/shared/lib/formatDate'
import { FileTextIcon, PillIcon } from 'lucide-react'

interface VisitHistoryTableProps {
  patientId?: string
  doctorId?: string
}

export function VisitHistoryTable({ patientId, doctorId }: VisitHistoryTableProps) {
  const router = useRouter()
  const [page, setPage] = useState(0)

  const filters: VisitFilters = {
    patientId,
    doctorId,
    page,
    size: 10,
  }

  const { data, isLoading } = useGetVisits(filters)
  const visits = data?.content ?? []

  const columns: ColumnDef<Visit>[] = [
    {
      accessorKey: 'chiefComplaint',
      header: 'Chief Complaint',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileTextIcon className="size-4 text-muted-foreground" />
          <span className="max-w-xs truncate">{row.original.chiefComplaint}</span>
        </div>
      ),
    },
    {
      accessorKey: 'assessment',
      header: 'Assessment',
      cell: ({ row }) => (
        <span className="max-w-xs truncate text-muted-foreground">
          {row.original.assessment}
        </span>
      ),
    },
    {
      accessorKey: 'icd10Codes',
      header: 'ICD-10',
      cell: ({ row }) =>
        row.original.icd10Codes.length > 0
          ? row.original.icd10Codes.join(', ')
          : '—',
    },
    {
      accessorKey: 'prescriptions',
      header: 'Rx',
      cell: ({ row }) =>
        row.original.prescriptions.length > 0 ? (
          <span className="flex items-center gap-1">
            <PillIcon className="size-3" />
            {row.original.prescriptions.length}
          </span>
        ) : (
          '—'
        ),
    },
    {
      accessorKey: 'isSigned',
      header: 'Status',
      cell: ({ row }) => <VisitStatusBadge isSigned={row.original.isSigned} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (visits.length === 0) {
    return (
      <EmptyState
        icon={FileTextIcon}
        title="No visit records"
        description="No visit records found for the selected filters."
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={visits}
      pagination={{
        page: data?.number ?? 0,
        pageSize: 10,
        totalPages: data?.totalPages ?? 1,
        onPageChange: setPage,
      }}
    />
  )
}
