import { useState, useCallback, useEffect } from "react";
import { Plus, Settings, Globe, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";

// Components
import { BoardFiltersBar } from "../components/BoardFiltersBar";
import { BoardSettingsPanel } from "../components/BoardSettingsPanel";
import { CreateBoardDialog } from "../components/CreateBoardDialog";
import { CardDetailDialog } from "@/features/cards/components/CardDetailDialog";
import { CardQuickInfo } from "@/features/cards/components/CardQuickInfo";
import { ActivityFeed } from "../components/ActivityFeed";
import { OnlineUsers } from "../components/OnlineUsers";
import { DroppableColumn } from "../components/DroppableColumn";

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

  // Drag state
  const [activeCard, setActiveCard] = useState<{
    id: number;
    title: string;
    description: string | null;
    due_date: string | null;
    labels: Array<{ id: number; name: string; color: string }>;
    column_id: number;
  } | null>(null);

  // Team members state
  const [teamMembers, setTeamMembers] = useState<
    Array<{ id: number; name: string; avatar_url?: string }>
  >([]);

  // Get token from localStorage
  const token = localStorage.getItem("token") || "";
  const boardId = propBoardId || 1;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
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

  // Fetch team members when board is loaded
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!board?.team_id || !token) return;

      try {
        const res = await fetch(
          `${API_URL}/api/teams/${board.team_id}/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (res.ok) {
          const json = await res.json();
          setTeamMembers(json.data || []);
        }
      } catch {
        console.error("Failed to fetch team members");
      }
    };

    fetchTeamMembers();
  }, [board?.team_id, token]);

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

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const cardData = active.data.current?.card;
    if (cardData) {
      setActiveCard(cardData);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Extract card ID from "card-123" format
    const cardId = parseInt(activeId.replace("card-", ""));

    // Determine target column
    let targetColumnId: number | null = null;

    if (overId.startsWith("column-")) {
      targetColumnId = parseInt(overId.replace("column-", ""));
    } else if (overId.startsWith("card-")) {
      // Dropped on another card - get its column
      const overCard = cards.find(
        (c) => c.id === parseInt(overId.replace("card-", ""))
      );
      if (overCard) {
        targetColumnId = overCard.column_id;
      }
    }

    if (!targetColumnId) return;

    // Find current card
    const currentCard = cards.find((c) => c.id === cardId);
    if (!currentCard || currentCard.column_id === targetColumnId) return;

    // Move card via API
    try {
      const res = await fetch(`${API_URL}/api/cards/${cardId}/move`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          column_id: targetColumnId,
          position: 0,
        }),
      });

      if (!res.ok) throw new Error("Failed to move card");

      refetchCards();
    } catch {
      toast.error("Failed to move card");
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto p-4">
            <div className="flex gap-4 h-full">
              {columns.map((column) => (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  cards={cardsByColumn[column.id] || []}
                  token={token}
                  canManage={canManage}
                  hasActiveFilters={hasActiveFilters}
                  isAddingCard={addingCardToColumn === column.id}
                  newCardTitle={newCardTitle}
                  isCreatingCard={isCreatingCard}
                  onCardClick={(cardId) => setSelectedCardId(cardId)}
                  onUpdate={refetchCards}
                  onAddCardStart={() => setAddingCardToColumn(column.id)}
                  onAddCardCancel={() => {
                    setAddingCardToColumn(null);
                    setNewCardTitle("");
                  }}
                  onCardTitleChange={setNewCardTitle}
                  onCreateCard={() => handleCreateCard(column.id)}
                />
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

          {/* Drag Overlay */}
          <DragOverlay>
            {activeCard && (
              <div className="bg-background rounded-lg border p-3 shadow-lg w-72 opacity-90">
                <CardQuickInfo
                  labels={activeCard.labels}
                  dueDate={activeCard.due_date}
                />
                <h4 className="text-sm font-medium mt-1">{activeCard.title}</h4>
              </div>
            )}
          </DragOverlay>
        </DndContext>

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
        teamMembers={teamMembers}
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
