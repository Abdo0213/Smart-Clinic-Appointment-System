import { Card, CardContent } from "@/components/ui/card";
import { RoleBadge } from "@/entities/user/ui/RoleBadge";
import type { User } from "@/entities/user/model/types";

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{user.userName}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
        <RoleBadge role={user.role} />
      </CardContent>
    </Card>
  );
}
