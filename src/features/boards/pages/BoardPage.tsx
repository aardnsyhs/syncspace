import { useState, useCallback, useEffect } from "react";
import { Plus, Settings, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Components
import { BoardFiltersBar } from "../components/BoardFiltersBar";
import { ColumnHeader } from "../components/ColumnHeader";
import { BoardSettingsPanel } from "../components/BoardSettingsPanel";
import { CreateBoardDialog } from "../components/CreateBoardDialog";
import { CardDetailDialog } from "@/features/cards/components/CardDetailDialog";
import { CardQuickInfo } from "@/features/cards/components/CardQuickInfo";
import { ActivityFeed } from "../components/ActivityFeed";
import { OnlineUsers } from "../components/OnlineUsers";

// Hooks
import { useBoardChannel } from "../hooks/useBoardChannel";
import { useBoardFilters } from "../hooks/useBoardFilters";
import { useBoardLabels } from "@/features/cards/hooks/useBoardLabels";
import { useBoardPresence } from "../hooks/useBoardPresence";
import { useBoardActivities } from "../hooks/useBoardActivities";

// Types
import type {
  CardEventPayload,
  CardDeletedPayload,
  CardMovedPayload,
  ColumnEventPayload,
  ColumnDeletedPayload,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL;

// Demo auth - in real app, this would come from auth context
const DEMO_TOKEN = localStorage.getItem("token") || "";

interface BoardData {
  id: number;
  team_id: number;
  name: string;
  description: string | null;
  color: string | null;
  is_public: boolean;
  public_token: string | null;
  public_url: string | null;
}

export function BoardPage() {
  // State
  const [board, setBoard] = useState<BoardData | null>(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  // For demo - would come from route params or context
  const boardId = 1;
  const teamId = 1;
  const token = DEMO_TOKEN;
  const canManage = true; // Would check RBAC

  // Hooks
  const {
    filters,
    setSearch,
    setAssigneeId,
    setLabels,
    setDue,
    setMyCards,
    clearFilters,
    hasActiveFilters,
    cards,
    columns,
    isLoading: isLoadingCards,
    refetch: refetchCards,
  } = useBoardFilters(boardId, token);

  const { labels: boardLabels } = useBoardLabels(boardId, token);
  const { members: onlineMembers } = useBoardPresence(boardId);
  const { activities, isLoading: isLoadingActivities } = useBoardActivities(
    boardId,
    token
  );

  // Fetch board data
  useEffect(() => {
    const fetchBoard = async () => {
      if (!token) return;

      setIsLoadingBoard(true);
      try {
        const res = await fetch(`${API_URL}/api/boards/${boardId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch board");

        const json = await res.json();
        setBoard(json.data);
      } catch {
        toast.error("Failed to load board");
      } finally {
        setIsLoadingBoard(false);
      }
    };

    fetchBoard();
  }, [boardId, token]);

  // Real-time handlers
  const handleColumnCreated = useCallback(
    (_payload: ColumnEventPayload) => {
      refetchCards();
    },
    [refetchCards]
  );

  const handleColumnUpdated = useCallback(
    (_payload: ColumnEventPayload) => {
      refetchCards();
    },
    [refetchCards]
  );

  const handleColumnDeleted = useCallback(
    (_payload: ColumnDeletedPayload) => {
      refetchCards();
    },
    [refetchCards]
  );

  const handleCardCreated = useCallback(
    (_payload: CardEventPayload) => {
      refetchCards();
    },
    [refetchCards]
  );

  const handleCardUpdated = useCallback(
    (_payload: CardEventPayload) => {
      refetchCards();
    },
    [refetchCards]
  );

  const handleCardDeleted = useCallback(
    (_payload: CardDeletedPayload) => {
      refetchCards();
      if (selectedCardId === _payload.card_id) {
        setSelectedCardId(null);
      }
    },
    [refetchCards, selectedCardId]
  );

  const handleCardMoved = useCallback(
    (_payload: CardMovedPayload) => {
      refetchCards();
    },
    [refetchCards]
  );

  // Subscribe to real-time updates
  useBoardChannel(boardId, {
    onColumnCreated: handleColumnCreated,
    onColumnUpdated: handleColumnUpdated,
    onColumnDeleted: handleColumnDeleted,
    onCardCreated: handleCardCreated,
    onCardUpdated: handleCardUpdated,
    onCardDeleted: handleCardDeleted,
    onCardMoved: handleCardMoved,
  });

  // Group cards by column
  const cardsByColumn = cards.reduce((acc, card) => {
    if (!acc[card.column_id]) acc[card.column_id] = [];
    acc[card.column_id].push(card);
    return acc;
  }, {} as Record<number, typeof cards>);

  // Team members for filter (would come from API)
  const teamMembers = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
  ];

  if (isLoadingBoard) {
    return <BoardPageSkeleton />;
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{board.name}</h1>
              {board.is_public && (
                <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Public
                </span>
              )}
            </div>
            {board.description && (
              <p className="text-sm text-muted-foreground">
                {board.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <OnlineUsers members={onlineMembers} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActivity(!showActivity)}
          >
            Activity
          </Button>

          {canManage && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}

          <CreateBoardDialog
            teamId={teamId}
            token={token}
            onBoardCreated={() => {
              toast.success("Board created!");
            }}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <BoardFiltersBar
        filters={filters}
        onSearchChange={setSearch}
        onAssigneeChange={setAssigneeId}
        onLabelsChange={setLabels}
        onDueChange={setDue}
        onMyCardsChange={setMyCards}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        teamMembers={teamMembers}
        boardLabels={boardLabels}
        isLoading={isLoadingCards}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Board Columns */}
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 h-full">
            {columns.map((column) => (
              <div
                key={column.id}
                className={`w-72 flex-shrink-0 flex flex-col rounded-lg ${
                  column.wip_exceeded
                    ? "bg-red-50 dark:bg-red-900/10"
                    : "bg-muted/30"
                }`}
              >
                <ColumnHeader
                  columnId={column.id}
                  name={column.name}
                  cardCount={column.card_count}
                  wipLimit={column.wip_limit}
                  wipExceeded={column.wip_exceeded}
                  token={token}
                  canEdit={canManage}
                  onUpdate={refetchCards}
                />

                {/* Cards */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {(cardsByColumn[column.id] || []).map((card) => (
                    <div
                      key={card.id}
                      className="bg-background rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCardId(card.id)}
                    >
                      <CardQuickInfo
                        labels={card.labels}
                        dueDate={card.due_date}
                      />
                      <h4 className="text-sm font-medium mt-1">{card.title}</h4>
                      {card.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {card.description}
                        </p>
                      )}
                    </div>
                  ))}

                  {(cardsByColumn[column.id] || []).length === 0 && (
                    <div className="flex h-20 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground">
                      {hasActiveFilters ? "No matching cards" : "No cards"}
                    </div>
                  )}
                </div>

                {/* Add Card */}
                <div className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add card
                  </Button>
                </div>
              </div>
            ))}

            {/* Add Column */}
            <div className="w-72 flex-shrink-0">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Add column
              </Button>
            </div>
          </div>
        </div>

        {/* Activity Sidebar */}
        {showActivity && (
          <div className="w-80 border-l bg-background overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Activity</h3>
              <ActivityFeed
                activities={activities}
                isLoading={isLoadingActivities}
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Detail Dialog */}
      <CardDetailDialog
        cardId={selectedCardId}
        boardId={boardId}
        token={token}
        isOpen={selectedCardId !== null}
        onClose={() => setSelectedCardId(null)}
        onCardUpdated={refetchCards}
      />

      {/* Board Settings Panel */}
      <BoardSettingsPanel
        boardId={boardId}
        boardName={board.name}
        teamId={teamId}
        isPublic={board.is_public}
        publicUrl={board.public_url}
        token={token}
        canManage={canManage}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onBoardUpdated={() => {
          // Refetch board data
        }}
      />
    </div>
  );
}

function BoardPageSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64 mt-1" />
      </div>
      <div className="p-4 border-b">
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="flex-1 p-4 flex gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-72 flex-shrink-0">
            <Skeleton className="h-10 w-full mb-2" />
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-24 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
