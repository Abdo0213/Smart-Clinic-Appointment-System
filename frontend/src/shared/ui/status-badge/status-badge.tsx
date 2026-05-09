"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_COLOR_MAP: Record<string, string> = {
  // BOOKED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  // ARRIVED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  // NO_SHOW: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  WAIVED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  INACTIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  colorMap?: Record<string, string>;
}

export function StatusBadge({ status, className, colorMap }: StatusBadgeProps) {
  const resolvedMap = colorMap || STATUS_COLOR_MAP;
  const colorClass = resolvedMap[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium", colorClass, className)}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
