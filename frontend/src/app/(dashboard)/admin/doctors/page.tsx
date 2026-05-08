'use client'

import { useState } from 'react'
import { useGetDoctors, DoctorStatusBadge } from '@/entities/doctor'
import { DataTable } from '@/shared/ui/data-table/data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { Doctor } from '@/entities/doctor'

export default function DoctorListPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useGetDoctors({ page, size: 20 })
  const doctors = data?.content ?? []

  const columns: ColumnDef<Doctor>[] = [
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => `Dr. ${row.original.firstName} ${row.original.lastName}`,
    },
    { accessorKey: 'specialization', header: 'Specialization' },
    { accessorKey: 'phone', header: 'Phone' },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => <DoctorStatusBadge isActive={row.original.isActive} />,
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Doctors</h1>
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={doctors}
          pagination={{ page, pageSize: 20, totalPages: data?.totalPages ?? 1, onPageChange: setPage }}
        />
      )}
    </div>
  )
}
