import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, Layers } from "lucide-react";
import { BoardAnalyticsSummary } from "./BoardAnalyticsSummary";
import { BoardThroughputChart } from "./BoardThroughputChart";
import { BoardCumulativeFlowChart } from "./BoardCumulativeFlowChart";
import { BoardAssigneeChart } from "./BoardAssigneeChart";
import {
  useBoardAnalyticsSummary,
  useBoardThroughput,
  useBoardCumulativeFlow,
  useBoardAssigneeDistribution,
} from "../hooks/useBoardAnalytics";

interface Props {
  boardId: number;
  boardName: string;
  token: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BoardAnalyticsDialog({
  boardId,
  boardName,
  token,
  isOpen,
  onClose,
}: Props) {
  const { data: summaryData, isLoading: summaryLoading } =
    useBoardAnalyticsSummary(isOpen ? boardId : null, token);
  const { data: throughputData, isLoading: throughputLoading } =
    useBoardThroughput(isOpen ? boardId : null, token);
  const { data: cumulativeData, isLoading: cumulativeLoading } =
    useBoardCumulativeFlow(isOpen ? boardId : null, token);
  const { data: assigneeData, isLoading: assigneeLoading } =
    useBoardAssigneeDistribution(isOpen ? boardId : null, token);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics - {boardName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="summary" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary" className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="throughput" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Throughput</span>
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Flow</span>
            </TabsTrigger>
            <TabsTrigger value="assignees" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-4">
            <BoardAnalyticsSummary
              data={summaryData}
              isLoading={summaryLoading}
            />
          </TabsContent>

          <TabsContent value="throughput" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Weekly throughput shows how many cards were completed each week.
                A consistent throughput indicates predictable delivery.
              </p>
              <BoardThroughputChart
                data={throughputData}
                isLoading={throughputLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value="flow" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Cumulative flow diagram shows how cards move through columns
                over time. Look for widening bands which indicate bottlenecks.
              </p>
              <BoardCumulativeFlowChart
                data={cumulativeData}
                isLoading={cumulativeLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value="assignees" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Distribution of cards across team members. Helps identify
                workload balance.
              </p>
              <BoardAssigneeChart
                data={assigneeData}
                isLoading={assigneeLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
