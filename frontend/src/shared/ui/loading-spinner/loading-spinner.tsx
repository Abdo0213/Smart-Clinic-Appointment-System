"use client";

import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  return (
    <Loader2Icon className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)} />
  );
}
