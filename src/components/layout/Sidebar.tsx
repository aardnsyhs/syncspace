import {
  LayoutDashboard,
  PanelsTopLeft,
  Users,
  Settings,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Workspace Selector */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold">
          S
        </div>
        <div className="flex flex-1 items-center justify-between">
          <span className="font-semibold">Syncspace</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        <NavItem
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Dashboard"
        />
        <NavItem
          icon={<PanelsTopLeft className="h-4 w-4" />}
          label="Boards"
          active
        />
        <NavItem icon={<Users className="h-4 w-4" />} label="Members" />

        <Separator className="my-3" />

        {/* Boards List */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your Boards
            </span>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button variant="ghost" className="w-full justify-start gap-3 px-3">
            <div className="h-3 w-3 rounded-sm bg-blue-500" />
            <span className="truncate">Project Alpha</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 px-3">
            <div className="h-3 w-3 rounded-sm bg-green-500" />
            <span className="truncate">Marketing Campaign</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 px-3">
            <div className="h-3 w-3 rounded-sm bg-purple-500" />
            <span className="truncate">Product Roadmap</span>
          </Button>
        </div>
      </nav>

      {/* Bottom Settings */}
      <div className="border-t p-3">
        <NavItem icon={<Settings className="h-4 w-4" />} label="Settings" />
      </div>
    </aside>
  );
}
