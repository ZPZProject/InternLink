import type { UserRole } from "@v1/supabase/types";
import { Badge } from "@v1/ui/badge";
import { cn } from "@v1/ui/cn";

const roleVariants = {
  student: "blue",
  employer: "amber",
  supervisor: "violet",
  admin: "red",
} as const;

export function RoleBadge({
  role,
  className,
}: {
  role: UserRole;
  className?: string;
}) {
  const variant = roleVariants[role];

  return (
    <Badge variant={variant} size="sm" className={cn("capitalize", className)}>
      {role}
    </Badge>
  );
}
