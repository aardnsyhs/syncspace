export type TeamRole = "owner" | "admin" | "member" | "viewer";

export interface Permission {
  canManageTeam: boolean;
  canManageMembers: boolean;
  canDeleteTeam: boolean;
  canManageBoards: boolean;
  canEditContent: boolean;
  canViewBoards: boolean;
  canComment: boolean;
}

export function getPermissions(role: TeamRole | null): Permission {
  if (!role) {
    return {
      canManageTeam: false,
      canManageMembers: false,
      canDeleteTeam: false,
      canManageBoards: false,
      canEditContent: false,
      canViewBoards: false,
      canComment: false,
    };
  }

  const permissions: Record<TeamRole, Permission> = {
    owner: {
      canManageTeam: true,
      canManageMembers: true,
      canDeleteTeam: true,
      canManageBoards: true,
      canEditContent: true,
      canViewBoards: true,
      canComment: true,
    },
    admin: {
      canManageTeam: true,
      canManageMembers: true,
      canDeleteTeam: false,
      canManageBoards: true,
      canEditContent: true,
      canViewBoards: true,
      canComment: true,
    },
    member: {
      canManageTeam: false,
      canManageMembers: false,
      canDeleteTeam: false,
      canManageBoards: false,
      canEditContent: true,
      canViewBoards: true,
      canComment: true,
    },
    viewer: {
      canManageTeam: false,
      canManageMembers: false,
      canDeleteTeam: false,
      canManageBoards: false,
      canEditContent: false,
      canViewBoards: true,
      canComment: true,
    },
  };

  return permissions[role];
}

export function canAssignRole(
  currentRole: TeamRole,
  targetRole: TeamRole
): boolean {
  if (currentRole === "owner") return true;
  if (currentRole === "admin") {
    return targetRole !== "owner" && targetRole !== "admin";
  }
  return false;
}

export function getRoleLabel(role: TeamRole): string {
  const labels: Record<TeamRole, string> = {
    owner: "Owner",
    admin: "Admin",
    member: "Member",
    viewer: "Viewer",
  };
  return labels[role];
}

export function getRoleBadgeColor(role: TeamRole): string {
  const colors: Record<TeamRole, string> = {
    owner:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    member: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    viewer: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };
  return colors[role];
}
