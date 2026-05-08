"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { useAuthStore } from "@/features/auth"
import { useGetInvoices, InvoiceStatusBadge } from "@/entities/invoice"
import type { Invoice, InvoiceStatus } from "@/entities/invoice"
import { INVOICE_STATUS_VALUES } from "@/entities/invoice"
import { ROUTE_PATHS } from "@/shared/config/appConfig"
import { DataTable } from "@/shared/ui/data-table/data-table"
import { LoadingSpinner } from "@/shared/ui/loading-spinner/loading-spinner"
import { EmptyState } from "@/shared/ui/empty-state/empty-state"
import { formatDate } from "@/shared/lib/formatDate"
import { formatCurrency } from "@/shared/lib/formatCurrency"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReceiptIcon } from "lucide-react"

export default function PatientInvoicesPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const patientId = user?.patientId ?? ""

  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("")

  const { data, isLoading } = useGetInvoices({
    patientId,
    status: statusFilter || undefined,
    page,
    size: 10,
  })

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.totalAmount),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`${ROUTE_PATHS.PATIENT_INVOICES}/${row.original.id}`)}
        >
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">My Invoices</h1>

      <div className="flex items-center gap-2">
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val as InvoiceStatus | "")
            setPage(0)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {INVOICE_STATUS_VALUES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : !data?.data?.length ? (
        <EmptyState
          icon={ReceiptIcon}
          title="No invoices found"
          description="You don't have any invoices yet."
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.data}
          pagination={{
            page: data.page,
            pageSize: data.size,
            totalPages: data.totalPages,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  )
}
