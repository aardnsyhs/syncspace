import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AnalyticsSummary } from "../hooks/useBoardAnalytics";
import {
  CheckCircle2,
  Clock,
  Layers,
  TrendingUp,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

interface Props {
  data: AnalyticsSummary | null;
  isLoading: boolean;
}

export function BoardAnalyticsSummary({ data, isLoading }: Props) {
  if (isLoading) {
    return <SummarySkeleton />;
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  const wipWarning = data.wip_count > 10;

  return (
    <div className="space-y-6">
      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Cards"
          value={data.total_cards}
          icon={<Layers className="h-4 w-4 text-muted-foreground" />}
          tooltip="Total number of cards on this board"
        />
        <MetricCard
          title="Completed (7 days)"
          value={data.completed_last_7_days}
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
          tooltip="Cards moved to Done in the last 7 days"
        />
        <MetricCard
          title="Avg Cycle Time"
          value={
            data.avg_cycle_time_days ? `${data.avg_cycle_time_days} days` : "—"
          }
          icon={<Clock className="h-4 w-4 text-blue-500" />}
          tooltip="Average time from when work starts on a card until it's done (last 30 days)"
        />
        <MetricCard
          title="Avg Lead Time"
          value={
            data.avg_lead_time_days ? `${data.avg_lead_time_days} days` : "—"
          }
          icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
          tooltip="Average time from card creation to completion (last 30 days)"
        />
      </div>

      {}
      {wipWarning && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">
            High WIP detected ({data.wip_count} cards in progress). Consider
            limiting work-in-progress to improve flow.
          </span>
        </div>
      )}

      {}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            Cards per Column
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Distribution of cards across columns. Look for bottlenecks
                    where cards pile up.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.columns.map((col) => {
              const percentage =
                data.total_cards > 0
                  ? (col.card_count / data.total_cards) * 100
                  : 0;

              return (
                <div key={col.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{col.name}</span>
                    <span className="text-muted-foreground">
                      {col.card_count}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              30-Day Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cards Completed</span>
                <span className="font-medium">
                  {data.completed_last_30_days}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Work in Progress</span>
                <span className="font-medium">{data.wip_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  tooltip,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  tooltip: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {title}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
