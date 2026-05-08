#!/bin/bash
cat << 'INNER_EOF' > src/pages/patient-list/ui/PatientListPage.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { useGetPatients, PatientSearchBar } from "@/entities/patient"
import type { Patient } from "@/entities/patient"
import { useAuthStore } from "@/features/auth"
import { ROUTE_PATHS } from "@/shared/config/appConfig"
import type { UserRole } from "@/shared/types/enums"
import { DataTable } from "@/shared/ui/data-table/data-table"
import { LoadingSpinner } from "@/shared/ui/loading-spinner/loading-spinner"
import { EmptyState } from "@/shared/ui/empty-state/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusIcon, UserIcon } from "lucide-react"
import { RegisterPatientForm } from "@/features/patient/ui/RegisterPatientForm"

const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => \`\${row.original.firstName} \${row.original.lastName}\`,
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "dateOfBirth",
    header: "DOB",
  },
  {
    accessorKey: "bloodType",
    header: "Blood Type",
    cell: ({ row }) =>
      row.original.bloodType ? (
        <Badge variant="outline">{row.original.bloodType}</Badge>
      ) : (
        "—"
      ),
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => row.original.gender.charAt(0) + row.original.gender.slice(1).toLowerCase(),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
]

const ADMIN_ROLES: UserRole[] = ["Admin", "Receptionist"]

export default function PatientListPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<{ name?: string; phone?: string }>({})
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  const { data, isLoading } = useGetPatients({
    name: filters.name,
    phone: filters.phone,
    page,
    size: 10,
  })

  const canCreate = user?.role ? ADMIN_ROLES.includes(user.role) : false

  const handleRowClick = (patient: Patient) => {
    router.push(\`/patients/\${patient.id}\`)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patients</h1>
        {canCreate && (
          <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-1 size-4" />
                Register Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Patient</DialogTitle>
              </DialogHeader>
              <RegisterPatientForm onSuccess={() => setIsRegisterOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <PatientSearchBar onSearch={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : !data?.content?.length ? (
        <EmptyState
          icon={UserIcon}
          title="No patients found"
          description="Try adjusting your search criteria."
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.content}
          pagination={{
            page: data.number,
            pageSize: data.size,
            totalPages: data.totalPages,
            onPageChange: setPage,
          }}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  )
}
INNER_EOF
