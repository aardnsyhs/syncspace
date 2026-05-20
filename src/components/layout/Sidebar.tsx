import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { TOKEN_KEY } from "@/lib/constants";
import { toast } from "sonner";
import { WorkspaceSelector } from "@/components/WorkspaceSelector";
import { BoardTemplatePicker } from "@/features/boards/components/BoardTemplatePicker";
import { useBoardTemplates } from "@/features/boards/hooks/useBoardTemplates";
import { useTeam } from "@/features/team";

interface Board {
  id: number;
  name: string;
  color: string | null;
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

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { selectedTeam, isLoading, refreshTeams } = useTeam();

  const token = localStorage.getItem(TOKEN_KEY) ?? "";
  const {
    templates,
    isLoading: templatesLoading,
    createBoardFromTemplate,
  } = useBoardTemplates(token);

  const teamId = selectedTeam?.id;
  const boards: Board[] = (selectedTeam?.boards as Board[]) || [];

  const handleSelectTemplate = async (
    templateId: number,
    name: string,
    description?: string
  ) => {
    if (!teamId) return;

    const board = await createBoardFromTemplate(
      teamId,
      templateId,
      name,
      description
    );
    toast.success("Board created from template!");
    setIsCreateOpen(false);
    await refreshTeams();
    navigate(`/app/boards/${board.id}`);
  };

  const handleCreateBlank = async (name: string, description?: string) => {
    if (!teamId) return;

    const json = await api.post<{ data: { id: number } }>(
      `/api/teams/${teamId}/boards`,
      { name, description }
    );

    toast.success("Board created!");
    setIsCreateOpen(false);
    await refreshTeams();
    navigate(`/app/boards/${json.data.id}`);
  };

  const isActive = (path: string) => location.pathname === path;
  const isBoardActive = (boardId: number) =>
    location.pathname === `/app/boards/${boardId}`;

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <WorkspaceSelector />

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        <NavItem
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Dashboard"
          active={isActive("/app")}
          onClick={() => handleNavigate("/app")}
        />
        <NavItem
          icon={<PanelsTopLeft className="h-4 w-4" />}
          label="Boards"
          active={isActive("/app/boards")}
          onClick={() => handleNavigate("/app/boards")}
        />
        <NavItem
          icon={<Users className="h-4 w-4" />}
          label="Members"
          active={isActive("/app/members")}
          onClick={() => handleNavigate("/app/members")}
        />

        <Separator className="my-3" />

        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your Boards
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setIsCreateOpen(true)}
              disabled={!teamId}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : boards.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No boards yet
            </p>
          ) : (
            boards.map((board) => (
              <Button
                key={board.id}
                variant={isBoardActive(board.id) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 px-3",
                  isBoardActive(board.id) && "bg-accent"
                )}
                onClick={() => handleNavigate(`/app/boards/${board.id}`)}
              >
                <div
                  className="h-3 w-3 rounded-sm flex-shrink-0"
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
          onClick={() => handleNavigate("/app/settings")}
        />
      </div>

      <BoardTemplatePicker
        templates={templates}
        isLoading={templatesLoading}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        onCreateBlank={handleCreateBlank}
      />
    </aside>
  );
}
