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
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ExportButton({
  reportType,
  from,
  to,
  fileName,
  label = "Export CSV",
  size = "default",
  className,
}: ExportButtonProps) {
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ reportType });
      if (from) params.set("dateFrom", from);
      if (to) params.set("dateTo", to);

      const endpoint = reportType === "all" ? "/admin/reports/export-all" : "/admin/reports/export";
      const response = await apiClient.get(`${endpoint}?${params.toString()}`);

      // If backend returns a JSON with downloadUrl (New PDF logic)
      if (response.data?.downloadUrl) {
        window.open(response.data.downloadUrl, "_blank");
        return;
      }

      // Fallback/Legacy: Handle as Blob (CSV logic)
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `${reportType}-report.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <Button variant="outline" size={size} onClick={handleExport} className={className}>
      <DownloadIcon className="mr-2 size-4" />
      {label}
    </Button>
  );
}
