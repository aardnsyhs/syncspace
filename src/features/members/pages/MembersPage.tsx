import { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  MoreHorizontal,
  Shield,
  Trash2,
  Loader2,
  Users,
  Mail,
} from "lucide-react";
import { getEcho, initializeEcho } from "@/lib/echo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/features/auth";
import { normalizeAvatarUrl } from "@/lib/avatar-utils";

type TeamRole = "owner" | "admin" | "member" | "viewer";

interface Member {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  role: TeamRole;
}

interface Team {
  id: number;
  name: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRoleLabel(role: TeamRole): string {
  const labels: Record<TeamRole, string> = {
    owner: "Owner",
    admin: "Admin",
    member: "Member",
    viewer: "Viewer",
  };
  return labels[role] || role;
}

function getRoleBadgeColor(role: TeamRole): string {
  const colors: Record<TeamRole, string> = {
    owner: "bg-purple-100 text-purple-800",
    admin: "bg-blue-100 text-blue-800",
    member: "bg-green-100 text-green-800",
    viewer: "bg-gray-100 text-gray-800",
  };
  return colors[role] || "bg-gray-100 text-gray-800";
}

export function MembersPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const json = await api.get<{ data: Team[] }>("/api/teams");
        setTeams(json.data || []);
        if (json.data?.length > 0) {
          setSelectedTeamId(json.data[0].id);
        }
      } catch {
        toast.error("Failed to load teams");
      }
    };

    fetchTeams();
  }, []);

  const fetchMembers = useCallback(async () => {
    if (!selectedTeamId) return;

    setIsLoading(true);
    try {
      const json = await api.get<{ data: Member[] }>(
        `/api/teams/${selectedTeamId}/members`
      );
      setMembers(json.data || []);
    } catch {
      toast.error("Failed to load members");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTeamId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Subscribe to realtime member updates
  useEffect(() => {
    if (!selectedTeamId) return;

    const echo = getEcho() || initializeEcho();
    const channel = echo.private(`team.${selectedTeamId}`);

    channel.listen(
      ".TeamMemberAdded",
      (payload: { member: Member; role: string }) => {
        setMembers((prev) => {
          if (prev.some((m) => m.id === payload.member.id)) return prev;
          return [
            ...prev,
            { ...payload.member, role: payload.role as TeamRole },
          ];
        });
      }
    );

    channel.listen(
      ".TeamMemberUpdated",
      (payload: { member: Member; new_role: string }) => {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === payload.member.id
              ? { ...m, role: payload.new_role as TeamRole }
              : m
          )
        );
      }
    );

    channel.listen(".TeamMemberRemoved", (payload: { user_id: number }) => {
      setMembers((prev) => prev.filter((m) => m.id !== payload.user_id));
    });

    return () => {
      echo.leave(`team.${selectedTeamId}`);
    };
  }, [selectedTeamId]);

  const currentUserRole = members.find((m) => m.id === user?.id)?.role;
  const canManageMembers =
    currentUserRole === "owner" || currentUserRole === "admin";

  const handleInvite = async () => {
    if (!inviteEmail || !selectedTeamId) return;

    setIsSubmitting(true);
    try {
      await api.post(`/api/teams/${selectedTeamId}/members`, {
        email: inviteEmail,
        role: inviteRole,
      });

      toast.success("Member invited successfully!");
      setInviteEmail("");
      setInviteRole("member");
      setInviteOpen(false);

      const json = await api.get<{ data: Member[] }>(
        `/api/teams/${selectedTeamId}/members`
      );
      setMembers(json.data || []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to invite member"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRole = async (memberId: number, newRole: TeamRole) => {
    if (!selectedTeamId) return;

    try {
      await api.put(`/api/teams/${selectedTeamId}/members/${memberId}`, {
        role: newRole,
      });

      toast.success("Role updated!");
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleRemove = async (memberId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    if (!selectedTeamId) return;

    try {
      await api.delete(`/api/teams/${selectedTeamId}/members/${memberId}`);
      toast.success("Member removed!");
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch {
      toast.error("Failed to remove member");
    }
  };

  if (isLoading && members.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your team members and their roles
          </p>
        </div>
        {canManageMembers && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button>
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
                  disabled={isSubmitting || !inviteEmail}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {teams.length > 1 && (
        <div className="flex items-center gap-2">
          <Label>Team:</Label>
          <Select
            value={selectedTeamId?.toString()}
            onValueChange={(v) => setSelectedTeamId(parseInt(v))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                members.filter((m) => m.role === "admin" || m.role === "owner")
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter((m) => m.role === "member").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members found</p>
          ) : (
            <div className="divide-y">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={normalizeAvatarUrl(member.avatar_url)}
                        alt={member.name}
                      />
                      <AvatarFallback>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.name}
                        {member.id === user?.id && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
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
                      member.id !== user?.id &&
                      member.role !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {currentUserRole === "owner" &&
                              member.role !== "admin" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleChangeRole(member.id, "admin")
                                  }
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Make Admin
                                </DropdownMenuItem>
                              )}
                            {member.role !== "member" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(member.id, "member")
                                }
                              >
                                Make Member
                              </DropdownMenuItem>
                            )}
                            {member.role !== "viewer" && (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
