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
  // Uses semantic Tailwind classes that respect the design token system.
  // Swap these for your own palette if you change the brand colours.
  const colors: Record<TeamRole, string> = {
    owner:  "bg-primary/15 text-primary border border-primary/20",
    admin:  "bg-secondary text-secondary-foreground border border-border",
    member: "bg-muted text-muted-foreground border border-border",
    viewer: "bg-muted/50 text-muted-foreground border border-border",
  };
  return colors[role];
}
