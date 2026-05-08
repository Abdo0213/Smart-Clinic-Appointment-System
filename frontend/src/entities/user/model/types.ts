import type { UserRole } from "@/shared/types/enums";

export interface User {
  id: string;
  email: string;
  userName: string;
  role: UserRole;
}
