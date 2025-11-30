import { useState } from "react";
import { UserPlus, MoreHorizontal, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type TeamRole,
  getRoleLabel,
  getRoleBadgeColor,
  canAssignRole,
} from "@/lib/permissions";
import { normalizeAvatarUrl } from "@/lib/avatar-utils";

interface Member {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  role: TeamRole;
}

interface MembersRolePanelProps {
  members: Member[];
  currentUserId: number;
  currentUserRole: TeamRole;
  onInvite: (email: string, role: TeamRole) => Promise<void>;
  onChangeRole: (userId: number, newRole: TeamRole) => Promise<void>;
  onRemove: (userId: number) => Promise<void>;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MembersRolePanel({
  members,
  currentUserId,
  currentUserRole,
  onInvite,
  onChangeRole,
  onRemove,
}: MembersRolePanelProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("member");
  const [isLoading, setIsLoading] = useState(false);

  const canManageMembers =
    currentUserRole === "owner" || currentUserRole === "admin";

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setIsLoading(true);
    try {
      await onInvite(inviteEmail, inviteRole);
      setInviteEmail("");
      setInviteRole("member");
      setInviteOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (userId: number, newRole: TeamRole) => {
    setIsLoading(true);
    try {
      await onChangeRole(userId, newRole);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setIsLoading(true);
    try {
      await onRemove(userId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Members</h3>
        {canManageMembers && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join this team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(v) => setInviteRole(v as TeamRole)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUserRole === "owner" && (
                        <SelectItem value="admin">Admin</SelectItem>
                      )}
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={isLoading || !inviteEmail}
                >
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="divide-y rounded-lg border">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={normalizeAvatarUrl(member.avatar_url)} alt={member.name} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {member.name}
                  {member.id === currentUserId && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (you)
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeColor(
                  member.role
                )}`}
              >
                {getRoleLabel(member.role)}
              </span>

              {canManageMembers &&
                member.id !== currentUserId &&
                member.role !== "owner" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isLoading}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {}
                      {canAssignRole(currentUserRole, "admin") &&
                        member.role !== "admin" && (
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(member.id, "admin")}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                      {canAssignRole(currentUserRole, "member") &&
                        member.role !== "member" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeRole(member.id, "member")
                            }
                          >
                            Make Member
                          </DropdownMenuItem>
                        )}
                      {canAssignRole(currentUserRole, "viewer") &&
                        member.role !== "viewer" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeRole(member.id, "viewer")
                            }
                          >
                            Make Viewer
                          </DropdownMenuItem>
                        )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleRemove(member.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
