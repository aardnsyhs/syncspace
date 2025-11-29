import { useState, useCallback, useEffect } from "react";
import { Plus, Settings, Globe, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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

interface BoardPageProps {
  boardId?: number;
}

export function BoardPage({ boardId: propBoardId }: BoardPageProps) {
  // State
  const [board, setBoard] = useState<BoardData | null>(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  // Add Card state
  const [addingCardToColumn, setAddingCardToColumn] = useState<number | null>(
    null
  );
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  // Add Column state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);

  // Get token from localStorage
  const token = localStorage.getItem("token") || "";
  const boardId = propBoardId || 1;
  const teamId = board?.team_id || 1;
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
  const { activities, isLoading: isLoadingActivities } =
    useBoardActivities(boardId);

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

  // Create new card
  const handleCreateCard = async (columnId: number) => {
    if (!newCardTitle.trim() || !token) return;

    setIsCreatingCard(true);
    try {
      const res = await fetch(`${API_URL}/api/columns/${columnId}/cards`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newCardTitle }),
      });

      if (!res.ok) throw new Error("Failed to create card");

      toast.success("Card created!");
      setNewCardTitle("");
      setAddingCardToColumn(null);
      refetchCards();
    } catch {
      toast.error("Failed to create card");
    } finally {
      setIsCreatingCard(false);
    }
  };

  // Create new column
  const handleCreateColumn = async () => {
    if (!newColumnName.trim() || !token) return;

    setIsCreatingColumn(true);
    try {
      const res = await fetch(`${API_URL}/api/boards/${boardId}/columns`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newColumnName }),
      });

      if (!res.ok) throw new Error("Failed to create column");

      toast.success("Column created!");
      setNewColumnName("");
      setIsAddingColumn(false);
      refetchCards();
    } catch {
      toast.error("Failed to create column");
    } finally {
      setIsCreatingColumn(false);
    }
  };

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
                  {addingCardToColumn === column.id ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter card title..."
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateCard(column.id);
                          if (e.key === "Escape") {
                            setAddingCardToColumn(null);
                            setNewCardTitle("");
                          }
                        }}
                        autoFocus
                        disabled={isCreatingCard}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleCreateCard(column.id)}
                          disabled={isCreatingCard || !newCardTitle.trim()}
                        >
                          {isCreatingCard && (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setAddingCardToColumn(null);
                            setNewCardTitle("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setAddingCardToColumn(column.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add card
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Column */}
            <div className="w-72 flex-shrink-0">
              {isAddingColumn ? (
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <Input
                    placeholder="Enter column name..."
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateColumn();
                      if (e.key === "Escape") {
                        setIsAddingColumn(false);
                        setNewColumnName("");
                      }
                    }}
                    autoFocus
                    disabled={isCreatingColumn}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateColumn}
                      disabled={isCreatingColumn || !newColumnName.trim()}
                    >
                      {isCreatingColumn && (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      )}
                      Add Column
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnName("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsAddingColumn(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add column
                </Button>
              )}
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
