import { useMemo } from "react";
import {
  getPermissions,
  type TeamRole,
  type Permission,
} from "@/lib/permissions";

interface UsePermissionsReturn extends Permission {
  role: TeamRole | null;
}

export function usePermissions(role: TeamRole | null): UsePermissionsReturn {
  const permissions = useMemo(() => getPermissions(role), [role]);

  return {
    role,
    ...permissions,
  };
}
