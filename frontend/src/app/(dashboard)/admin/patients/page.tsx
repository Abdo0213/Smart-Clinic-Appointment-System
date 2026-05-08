'use client'

import { useState } from 'react'
import { useGetPatients } from '@/entities/patient'
import { DataTable } from '@/shared/ui/data-table/data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { Patient } from '@/entities/patient'

export default function PatientListPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useGetPatients({ page, size: 20 })
  const patients = data?.content ?? []

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'gender', header: 'Gender' },
    { accessorKey: 'dateOfBirth', header: 'Date of Birth' },
    { accessorKey: 'insuranceProvider', header: 'Insurance' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Patients</h1>
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={patients}
          pagination={{ page, pageSize: 20, totalPages: data?.totalPages ?? 1, onPageChange: setPage }}
        />
      )}
    </div>
  )
}
