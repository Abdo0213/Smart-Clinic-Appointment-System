import { format, format as fnsFormat } from "date-fns";

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return fnsFormat(d, "MMM d, yyyy");
}

export function formatDateTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return fnsFormat(d, "MMM d, yyyy h:mm a");
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return fnsFormat(d, "h:mm a");
}

export { format };
