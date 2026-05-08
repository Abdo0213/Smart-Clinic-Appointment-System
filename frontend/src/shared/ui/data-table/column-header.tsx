"use client";

import { Column } from "@tanstack/react-table";
import { ArrowUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function ColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: ColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={cn(className)}>{title}</span>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-2 h-8", className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDownIcon className="ml-2 size-4" />
    </Button>
  );
}
