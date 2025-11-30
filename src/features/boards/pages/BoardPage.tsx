import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Settings,
  Globe,
  X,
  Loader2,
  BarChart3,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/features/auth/store/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { BoardAnalyticsDialog } from "../components/BoardAnalyticsDialog";

// Hooks
import { useBoardChannel } from "../hooks/useBoardChannel";
import { useBoardFilters } from "../hooks/useBoardFilters";
import { useBoardLabels } from "@/features/cards/hooks/useBoardLabels";
import { useBoardPresence } from "../hooks/useBoardPresence";
import { useBoardActivities } from "../hooks/useBoardActivities";

// API
import { api } from "@/lib/api";

// Types
import type {
  CardEventPayload,
  CardDeletedPayload,
  CardMovedPayload,
  ColumnEventPayload,
  ColumnDeletedPayload,
} from "../types";

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
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [board, setBoard] = useState<BoardData | null>(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Handle card query param from notification click
  useEffect(() => {
    const cardParam = searchParams.get("card");
    if (cardParam) {
      const cardId = parseInt(cardParam);
      if (!isNaN(cardId)) {
        setSelectedCardId(cardId);
        // Clear the query param after opening
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);
  const [showActivity, setShowActivity] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

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
  const fetchBoard = useCallback(async () => {
    setIsLoadingBoard(true);
    try {
      const json = await api.get<{ data: BoardData }>(`/api/boards/${boardId}`);
      setBoard(json.data);
    } catch {
      toast.error("Failed to load board");
    } finally {
      setIsLoadingBoard(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  // Fetch team members when board is loaded
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!board?.team_id) return;

      try {
        const json = await api.get<{
          data: Array<{ id: number; name: string; avatar_url?: string }>;
        }>(`/api/teams/${board.team_id}/members`);
        setTeamMembers(json.data || []);
      } catch {
        console.error("Failed to fetch team members");
      }
    };

    fetchTeamMembers();
  }, [board?.team_id]);

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
    if (!newCardTitle.trim()) return;

    setIsCreatingCard(true);
    try {
      await api.post(`/api/columns/${columnId}/cards`, { title: newCardTitle });
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
    if (!newColumnName.trim()) return;

    setIsCreatingColumn(true);
    try {
      await api.post(`/api/boards/${boardId}/columns`, { name: newColumnName });
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
      await api.put(`/api/cards/${cardId}/move`, {
        column_id: targetColumnId,
        position: 0,
      });
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
    <div className="h-full flex flex-col -m-4 md:-m-6">
      {/* Board Header */}
      <div className="px-3 md:px-4 py-2 md:py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          {/* Board Color Indicator */}
          {board.color && (
            <div
              className="w-3 h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: board.color }}
            />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-semibold truncate">
                {board.name}
              </h1>
              {board.is_public && (
                <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center gap-1 flex-shrink-0">
                  <Globe className="h-3 w-3" />
                  Public
                </span>
              )}
            </div>
            {board.description && (
              <p className="text-sm text-muted-foreground truncate hidden md:block">
                {board.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 overflow-x-auto">
          <OnlineUsers members={onlineMembers} />

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="sm:hidden">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowActivity(!showActivity)}>
                Activity
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAnalytics(true)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop Buttons */}
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={() => setShowActivity(!showActivity)}
          >
            Activity
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={() => setShowAnalytics(true)}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
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
              <div className="w-64 md:w-72 flex-shrink-0">
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
        currentUserId={user?.id || 0}
        isOpen={selectedCardId !== null}
        onClose={() => setSelectedCardId(null)}
        onCardUpdated={refetchCards}
        teamMembers={teamMembers}
      />

      {/* Board Settings Panel */}
      <BoardSettingsPanel
        boardId={boardId}
        boardName={board.name}
        boardDescription={board.description}
        boardColor={board.color}
        teamId={teamId}
        isPublic={board.is_public}
        publicUrl={board.public_url}
        token={token}
        canManage={canManage}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onBoardUpdated={fetchBoard}
      />

      {/* Board Analytics Dialog */}
      <BoardAnalyticsDialog
        boardId={boardId}
        boardName={board.name}
        token={token}
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
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
