import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  useBoardAnalyticsSummary,
  useBoardThroughput,
  useBoardCumulativeFlow,
  useBoardAssigneeDistribution,
} from "../hooks/useBoardAnalytics";
import { BoardAnalyticsSummary } from "./BoardAnalyticsSummary";
import { BoardThroughputChart } from "./BoardThroughputChart";
import { BoardCumulativeFlowChart } from "./BoardCumulativeFlowChart";
import { BoardAssigneeChart } from "./BoardAssigneeChart";
import { ArrowLeft, RefreshCw, BarChart3 } from "lucide-react";

interface Props {
  boardId: number;
  boardName: string;
  token: string;
  onBack: () => void;
}

export function BoardAnalyticsPage({
  boardId,
  boardName,
  token,
  onBack,
}: Props) {
  const summary = useBoardAnalyticsSummary(boardId, token);
  const throughput = useBoardThroughput(boardId, token, 6);
  const cumulativeFlow = useBoardCumulativeFlow(boardId, token, 30);
  const assignees = useBoardAssigneeDistribution(boardId, token);

  const handleRefresh = () => {
    summary.refetch();
    throughput.refetch();
    cumulativeFlow.refetch();
    assignees.refetch();
  };

  const isLoading =
    summary.isLoading ||
    throughput.isLoading ||
    cumulativeFlow.isLoading ||
    assignees.isLoading;

  return (
    <div className="min-h-screen bg-background">
      {}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h1 className="text-xl font-semibold">Analytics</h1>
                </div>
                <p className="text-sm text-muted-foreground">{boardName}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="throughput">Throughput</TabsTrigger>
            <TabsTrigger value="flow">Flow</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <BoardAnalyticsSummary
              data={summary.data}
              isLoading={summary.isLoading}
            />
          </TabsContent>

          <TabsContent value="throughput" className="space-y-6">
            <BoardThroughputChart
              data={throughput.data}
              isLoading={throughput.isLoading}
            />
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>What is Throughput?</strong> Throughput measures how
                many cards your team completes per week. A consistent or
                increasing throughput indicates healthy productivity.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="flow" className="space-y-6">
            <BoardCumulativeFlowChart
              data={cumulativeFlow.data}
              isLoading={cumulativeFlow.isLoading}
            />
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Reading the CFD:</strong> Each colored band represents a
                column. If a band widens over time, cards are accumulating there
                (potential bottleneck). Parallel bands indicate smooth,
                consistent flow.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <BoardAssigneeChart
              data={assignees.data}
              isLoading={assignees.isLoading}
            />
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Workload Balance:</strong> This shows how cards are
                distributed among team members. Large imbalances might indicate
                opportunities to redistribute work.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
