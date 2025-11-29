import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PanelsTopLeft,
  Users,
  Settings,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { WorkspaceSelector } from "@/components/WorkspaceSelector";

interface Board {
  id: number;
  name: string;
  color: string | null;
}

interface Team {
  id: number;
  name: string;
  boards: Board[];
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 px-3",
            active && "bg-accent"
          )}
          onClick={onClick}
        >
          {icon}
          <span className="truncate">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchTeams = async () => {
    try {
      const json = await api.get<{ data: Team[] }>("/api/teams");
      setTeams(json.data || []);
    } catch {
      console.error("Failed to fetch teams");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;

    const teamId = teams[0]?.id;
    if (!teamId) return;

    setIsCreating(true);
    try {
      const json = await api.post<{ data: { id: number } }>(
        `/api/teams/${teamId}/boards`,
        { name: newBoardName }
      );

      toast.success("Board created!");
      setIsCreateOpen(false);
      setNewBoardName("");
      await fetchTeams();
      navigate(`/app/boards/${json.data.id}`);
    } catch {
      toast.error("Failed to create board");
    } finally {
      setIsCreating(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isBoardActive = (boardId: number) =>
    location.pathname === `/app/boards/${boardId}`;

  const allBoards = teams.flatMap((team) => team.boards || []);

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <WorkspaceSelector />

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        <NavItem
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Dashboard"
          active={isActive("/app")}
          onClick={() => navigate("/app")}
        />
        <NavItem
          icon={<PanelsTopLeft className="h-4 w-4" />}
          label="Boards"
          active={isActive("/app/boards")}
          onClick={() => navigate("/app/boards")}
        />
        <NavItem
          icon={<Users className="h-4 w-4" />}
          label="Members"
          active={isActive("/app/members")}
          onClick={() => navigate("/app/members")}
        />

        <Separator className="my-3" />

        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your Boards
            </span>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Board</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="board-name">Board Name</Label>
                    <Input
                      id="board-name"
                      placeholder="Enter board name"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateBoard();
                      }}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCreateBoard}
                    disabled={isCreating || !newBoardName.trim()}
                  >
                    {isCreating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Board
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : allBoards.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No boards yet
            </p>
          ) : (
            allBoards.map((board) => (
              <Button
                key={board.id}
                variant={isBoardActive(board.id) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 px-3",
                  isBoardActive(board.id) && "bg-accent"
                )}
                onClick={() => navigate(`/app/boards/${board.id}`)}
              >
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: board.color || "#3b82f6" }}
                />
                <span className="truncate">{board.name}</span>
              </Button>
            ))
          )}
        </div>
      </nav>

      <div className="border-t p-3">
        <NavItem
          icon={<Settings className="h-4 w-4" />}
          label="Settings"
          active={isActive("/app/settings")}
          onClick={() => navigate("/app/settings")}
        />
      </div>
    </aside>
  );
}
