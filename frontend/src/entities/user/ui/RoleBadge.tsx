import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/shared/types/enums";

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  Patient: {
    label: "Patient",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  Doctor: {
    label: "Doctor",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  Receptionist: {
    label: "Receptionist",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  Admin: {
    label: "Admin",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
};

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role] || roleConfig.Patient;
  return (
    <Badge variant="outline" className={cn(config.className, "border-transparent", className)}>
      {config.label}
    </Badge>
  );
}
