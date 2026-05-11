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

    try {
      const response = await apiClient.get<{ downloadUrl: string }>(
        `/admin/reports/export?${params.toString()}`
      );
      
      if (response.data?.downloadUrl) {
        // Open the S3 presigned URL in a new tab to trigger download
        window.open(response.data.downloadUrl, "_blank");
      } else {
        console.error("No download URL received");
      }
    } catch (error) {
      console.error("Failed to export report:", error);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} className={className}>
      <DownloadIcon className="mr-2 size-4" />
      {label}
    </Button>
  );
}
