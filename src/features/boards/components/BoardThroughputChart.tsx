import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ThroughputData } from "../hooks/useBoardAnalytics";
import { HelpCircle, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: ThroughputData[];
  isLoading: boolean;
}

export function BoardThroughputChart({ data, isLoading }: Props) {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  const hasData = data.some((d) => d.completed_count > 0);

  const chartData = data.map((d) => ({
    ...d,
    label: formatWeekLabel(d.week_start),
  }));

  const avgThroughput =
    data.length > 0
      ? (
          data.reduce((sum, d) => sum + d.completed_count, 0) / data.length
        ).toFixed(1)
      : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Weekly Throughput
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Number of cards completed each week. Higher throughput means
                  your team is delivering more work.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            Avg: {avgThroughput} cards/week
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <EmptyState />
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  content={(props: any) => {
                    const { active, payload } = props;
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as ThroughputData & {
                      label: string;
                    };
                    return (
                      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
                        <p className="font-medium">{d.label}</p>
                        <p className="text-muted-foreground">
                          {d.week_start} - {d.week_end}
                        </p>
                        <p className="mt-1">
                          <span className="font-medium">
                            {d.completed_count}
                          </span>{" "}
                          cards completed
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="completed_count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatWeekLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function EmptyState() {
  return (
    <div className="h-[300px] flex items-center justify-center text-center">
      <div className="space-y-2">
        <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="text-muted-foreground">No completed cards yet</p>
        <p className="text-sm text-muted-foreground/70">
          Move cards to Done to see throughput data
        </p>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}
