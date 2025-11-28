import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AssigneeData } from "../hooks/useBoardAnalytics";
import { HelpCircle, Users } from "lucide-react";

interface Props {
  data: AssigneeData[];
  isLoading: boolean;
}

export function BoardAssigneeChart({ data, isLoading }: Props) {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Cards by Assignee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  const totalCards = data.reduce((sum, d) => sum + d.card_count, 0);
  const sortedData = [...data].sort((a, b) => b.card_count - a.card_count);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Cards by Assignee
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Distribution of cards across team members. Helps identify
                  workload balance.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedData.map((item) => {
            const percentage =
              totalCards > 0 ? (item.card_count / totalCards) * 100 : 0;
            const initials = item.assignee_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div key={item.assignee_id ?? "unassigned"} className="space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={item.assignee_avatar ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {item.assignee_id ? initials : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">
                        {item.assignee_name}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {item.card_count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="py-8 flex items-center justify-center text-center">
      <div className="space-y-2">
        <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="text-muted-foreground">No cards on this board</p>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
