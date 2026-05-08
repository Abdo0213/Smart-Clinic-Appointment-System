"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  isLoading?: boolean;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  searchPlaceholder?: string;
  searchKey?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  isLoading,
  onSortingChange,
  onColumnFiltersChange,
  searchPlaceholder,
  searchKey,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    onColumnFiltersChange: (updater) => {
      const newFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
      onColumnFiltersChange?.(newFilters);
    },
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center">
          <Input
            placeholder={searchPlaceholder || "Search..."}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Page {pagination.page + 1} of {pagination.totalPages}
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
