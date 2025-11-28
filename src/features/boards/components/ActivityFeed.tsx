import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  Pencil,
  ArrowRight,
  UserPlus,
  MessageSquare,
  Columns,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Activity } from "../hooks/useBoardActivities";

interface ActivityFeedProps {
  activities: Activity[];
  isLoading: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getActivityIcon(type: string, entity?: string) {
  if (entity === "column") {
    return <Columns className="h-4 w-4" />;
  }
  if (entity === "comment" || type === "commented") {
    return <MessageSquare className="h-4 w-4" />;
  }

  switch (type) {
    case "created":
      return <Plus className="h-4 w-4" />;
    case "updated":
      return <Pencil className="h-4 w-4" />;
    case "moved":
      return <ArrowRight className="h-4 w-4" />;
    case "assigned":
    case "unassigned":
      return <UserPlus className="h-4 w-4" />;
    default:
      return <Pencil className="h-4 w-4" />;
  }
}

function getActivityMessage(activity: Activity): string {
  const { type, data } = activity;
  const entity = data.entity || "card";

  if (entity === "column") {
    if (data.action === "deleted") {
      return `deleted column "${data.column_name}"`;
    }
    if (type === "created") {
      return `created column "${data.column_name}"`;
    }
    return `updated column "${data.column_name}"`;
  }

  if (entity === "comment" || type === "commented") {
    return `commented on "${data.card_title}"`;
  }

  if (entity === "card") {
    if (data.action === "deleted") {
      return `deleted card "${data.card_title}" from ${data.column_name}`;
    }

    switch (type) {
      case "created":
        return `created card "${data.card_title}" in ${data.column_name}`;
      case "moved":
        return `moved "${data.card_title}" from ${data.from_column} to ${data.to_column}`;
      case "assigned":
        return `assigned ${data.assignee_name} to "${data.card_title}"`;
      case "unassigned":
        return `unassigned "${data.card_title}"`;
      case "updated":
        return `updated "${data.card_title}"`;
      default:
        return `updated "${data.card_title}"`;
    }
  }

  return "performed an action";
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        Loading activities...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No activity yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage
                src={activity.user.avatar_url}
                alt={activity.user.name}
              />
              <AvatarFallback className="text-xs">
                {getInitials(activity.user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {activity.user.name}
                </span>
                <span className="text-muted-foreground">
                  {getActivityIcon(activity.type, activity.data.entity)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getActivityMessage(activity)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
