"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { useGetDoctors, useToggleDoctorStatus, DoctorStatusBadge } from "@/entities/doctor"
import type { Doctor } from "@/entities/doctor"
import { useAuthStore } from "@/features/auth"
import type { UserRole } from "@/shared/types/enums"
import { ROUTE_PATHS } from "@/shared/config/appConfig"
import { DataTable } from "@/shared/ui/data-table/data-table"
import { LoadingSpinner } from "@/shared/ui/loading-spinner/loading-spinner"
import { EmptyState } from "@/shared/ui/empty-state/empty-state"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog/confirm-dialog"
import { formatDate } from "@/shared/lib/formatDate"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StethoscopeIcon } from "lucide-react"

const ADMIN_ROLE: UserRole = "Admin"

export default function DoctorListPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const canToggle = user?.role === ADMIN_ROLE

  const [page, setPage] = useState(0)
  const [specializationFilter, setSpecializationFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<"true" | "false" | "">("")

  const { data, isLoading } = useGetDoctors({
    specialization: specializationFilter || undefined,
    isActive: statusFilter === "" ? undefined : statusFilter === "true",
    page,
    size: 10,
  })

  // Fetch all doctors (unfiltered) to populate specialization dropdown options
  const { data: allDoctors } = useGetDoctors({ size: 200 })
  const specializations = useMemo(() => {
    if (!allDoctors?.content) return []
    const unique = [...new Set(allDoctors.content.map((d) => d.specialization).filter(Boolean))]
    return unique.sort()
  }, [allDoctors])

  const toggleStatus = useToggleDoctorStatus()
  const [toggleTarget, setToggleTarget] = useState<Doctor | null>(null)

  const columns: ColumnDef<Doctor>[] = [
    {
      accessorKey: "firstName",
      header: "Name",
      cell: ({ row }) => `Dr. ${row.original.firstName} ${row.original.lastName}`,
    },
    {
      accessorKey: "specialization",
      header: "Specialization",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => <DoctorStatusBadge isActive={row.original.isActive} />,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const doctor = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`${ROUTE_PATHS.ADMIN_DOCTORS}/${doctor.id}`)
              }}
            >
              View
            </Button>
            {canToggle && (
              <Button
                variant={doctor.isActive ? "destructive" : "default"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setToggleTarget(doctor)
                }}
              >
                {doctor.isActive ? "Deactivate" : "Activate"}
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const handleToggle = () => {
    if (!toggleTarget) return
    toggleStatus.mutate(
      { id: toggleTarget.id, isActive: !toggleTarget.isActive },
      { onSuccess: () => setToggleTarget(null) }
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Doctors</h1>

      <div className="flex items-center gap-2">
        <Select
          value={specializationFilter}
          onValueChange={(val) => {
            setSpecializationFilter(val ?? "")
            setPage(0)
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All Specializations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Specializations</SelectItem>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val as "true" | "false" | "")
            setPage(0)
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : !data?.content?.length ? (
        <EmptyState
          icon={StethoscopeIcon}
          title="No doctors found"
          description="Try adjusting your filters."
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.content}
          pagination={{
            page: data.page,
            pageSize: data.size,
            totalPages: data.totalPages,
            onPageChange: setPage,
          }}
        />
      )}

      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={(open: boolean) => {
          if (!open) setToggleTarget(null)
        }}
        title={toggleTarget ? (toggleTarget.isActive ? "Deactivate Doctor" : "Activate Doctor") : ""}
        description={
          toggleTarget
            ? `Are you sure you want to ${toggleTarget.isActive ? "deactivate" : "activate"} Dr. ${toggleTarget.firstName} ${toggleTarget.lastName}?`
            : ""
        }
        confirmLabel={toggleTarget?.isActive ? "Deactivate" : "Activate"}
        variant={toggleTarget?.isActive ? "destructive" : "default"}
        onConfirm={handleToggle}
        isLoading={toggleStatus.isPending}
      />
    </div>
  )
}
