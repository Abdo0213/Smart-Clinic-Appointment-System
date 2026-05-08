"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/shared/api/client";

interface ExportButtonProps {
  reportType: string;
  from?: string;
  to?: string;
  fileName?: string;
  label?: string;
  className?: string;
}

export function ExportButton({
  reportType,
  from,
  to,
  fileName,
  label = "Export CSV",
  className,
}: ExportButtonProps) {
  const handleExport = async () => {
    const params = new URLSearchParams({ reportType });
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const response = await apiClient.get(`/admin/reports/export?${params.toString()}`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || `${reportType}-report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={handleExport} className={className}>
      <DownloadIcon className="mr-2 size-4" />
      {label}
    </Button>
  );
}
