import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CumulativeFlowData } from "../hooks/useBoardAnalytics";
import { HelpCircle, Layers } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: CumulativeFlowData | null;
  isLoading: boolean;
}

// Color palette for columns
const COLORS = [
  "hsl(220, 70%, 50%)", // Blue
  "hsl(280, 70%, 50%)", // Purple
  "hsl(340, 70%, 50%)", // Pink
  "hsl(40, 70%, 50%)", // Orange
  "hsl(160, 70%, 50%)", // Teal
  "hsl(100, 70%, 50%)", // Green
];

export function BoardCumulativeFlowChart({ data, isLoading }: Props) {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data || data.data.length === 0 || data.columns.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Cumulative Flow Diagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  // Transform data for stacked area chart
  const chartData = data.data.map((day) => {
    const row: Record<string, string | number> = {
      date: day.date,
      label: formatDateLabel(day.date),
    };
    data.columns.forEach((col) => {
      row[`col_${col.id}`] = day.columns[col.id] || 0;
    });
    return row;
  });

  // Sort columns by position (reversed for stacking order)
  const sortedColumns = [...data.columns].sort(
    (a, b) => b.position - a.position
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Cumulative Flow Diagram
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Shows how cards flow through columns over time. Widening bands
                  indicate bottlenecks. Parallel bands show smooth flow.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <RechartsTooltip
                content={({
                  active,
                  payload,
                  label,
                }: {
                  active?: boolean;
                  payload?: readonly {
                    dataKey?: string;
                    color?: string;
                    value?: number;
                  }[];
                  label?: string | number;
                }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
                      <p className="font-medium mb-2">{label}</p>
                      {[...payload].reverse().map((entry, idx) => {
                        const col = data.columns.find(
                          (c) => `col_${c.id}` === entry.dataKey
                        );
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span>{col?.name}:</span>
                            <span className="font-medium">{entry.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />
              {sortedColumns.map((col, idx) => (
                <Area
                  key={col.id}
                  type="monotone"
                  dataKey={`col_${col.id}`}
                  stackId="1"
                  stroke={COLORS[idx % COLORS.length]}
                  fill={COLORS[idx % COLORS.length]}
                  fillOpacity={0.6}
                  name={col.name}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {data.columns.map((col, idx) => (
            <div key={col.id} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor:
                    COLORS[data.columns.length - 1 - (idx % COLORS.length)],
                }}
              />
              <span>{col.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function EmptyState() {
  return (
    <div className="h-[300px] flex items-center justify-center text-center">
      <div className="space-y-2">
        <Layers className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="text-muted-foreground">No flow data available</p>
        <p className="text-sm text-muted-foreground/70">
          Add cards and move them through columns to see the flow
        </p>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}
