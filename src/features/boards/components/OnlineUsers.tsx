import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PresenceMember } from "../hooks/useBoardPresence";

interface OnlineUsersProps {
  members: PresenceMember[];
  maxDisplay?: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function OnlineUsers({ members, maxDisplay = 4 }: OnlineUsersProps) {
  const displayMembers = members.slice(0, maxDisplay);
  const remainingCount = members.length - maxDisplay;

  if (members.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{members.length} online</span>
      </div>

      <div className="flex -space-x-2">
        {displayMembers.map((member) => (
          <Tooltip key={member.id}>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src={member.avatar_url} alt={member.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{member.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-xs bg-muted">
                  +{remainingCount}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{remainingCount} more online</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
