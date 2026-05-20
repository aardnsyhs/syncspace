/**
 * BoardPage
 * =========
 * Data-fetching shell for the Kanban board view.
 *
 * This page is responsible for:
 *   - Loading board metadata and team members from the API
 *   - Subscribing to real-time board events via `useBoardChannel`
 *   - Providing all mutation callbacks to `<KanbanBoard />`
 *   - Rendering the page chrome (header, filters, settings panel, dialogs)
 *
 * The `<KanbanBoard />` component below this layer is purely presentational
 * and can be used independently with any data source.
 */

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Settings,
  Globe,
  Loader2,
  BarChart3,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/features/auth/store/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { BoardFiltersBar } from "../components/BoardFiltersBar";
import { BoardSettingsPanel } from "../components/BoardSettingsPanel";
import { CreateBoardDialog } from "../components/CreateBoardDialog";
import { CardDetailDialog } from "@/features/cards/components/CardDetailDialog";
import { ActivityFeed } from "../components/ActivityFeed";
import { OnlineUsers } from "../components/OnlineUsers";
import { BoardAnalyticsDialog } from "../components/BoardAnalyticsDialog";
import { KanbanBoard } from "../components/KanbanBoard";

import { useBoardChannel } from "../hooks/useBoardChannel";
import { useBoardFilters } from "../hooks/useBoardFilters";
import { useBoardLabels } from "@/features/cards/hooks/useBoardLabels";
import { useBoardPresence } from "../hooks/useBoardPresence";
import { useBoardActivities } from "../hooks/useBoardActivities";

import { api } from "@/lib/api";
import { TOKEN_KEY } from "@/lib/constants";

import type {
  CardEventPayload,
  CardDeletedPayload,
  CardMovedPayload,
  ColumnEventPayload,
  ColumnDeletedPayload,
} from "../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BoardPage({ boardId: propBoardId }: BoardPageProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [board, setBoard] = useState<BoardData | null>(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [teamMembers, setTeamMembers] = useState<
    Array<{ id: number; name: string; avatar_url?: string }>
  >([]);

  const token = localStorage.getItem(TOKEN_KEY) ?? "";
  const boardId = propBoardId ?? 1;
  const teamId = board?.team_id ?? 1;
  const canManage = true;

  // Open card detail from URL param (e.g. /app/boards/1?card=42)
  useEffect(() => {
    const cardParam = searchParams.get("card");
    if (cardParam) {
      const cardId = parseInt(cardParam);
      if (!isNaN(cardId)) {
        setSelectedCardId(cardId);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  // ── Data hooks ─────────────────────────────────────────────────────────────
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
  const { activities, isLoading: isLoadingActivities } = useBoardActivities(boardId);

  // ── Board metadata ─────────────────────────────────────────────────────────
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

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!board?.team_id) return;
      try {
        const json = await api.get<{
          data: Array<{ id: number; name: string; avatar_url?: string }>;
        }>(`/api/teams/${board.team_id}/members`);
        setTeamMembers(json.data ?? []);
      } catch {
        console.error("Failed to fetch team members");
      }
    };
    fetchTeamMembers();
  }, [board?.team_id]);

  // ── Real-time event handlers ───────────────────────────────────────────────
  const handleColumnCreated  = useCallback((_p: ColumnEventPayload)  => refetchCards(), [refetchCards]);
  const handleColumnUpdated  = useCallback((_p: ColumnEventPayload)  => refetchCards(), [refetchCards]);
  const handleColumnDeleted  = useCallback((_p: ColumnDeletedPayload) => refetchCards(), [refetchCards]);
  const handleCardCreated    = useCallback((_p: CardEventPayload)    => refetchCards(), [refetchCards]);
  const handleCardUpdated    = useCallback((_p: CardEventPayload)    => refetchCards(), [refetchCards]);
  const handleCardMoved      = useCallback((_p: CardMovedPayload)    => refetchCards(), [refetchCards]);
  const handleCardDeleted    = useCallback(
    (p: CardDeletedPayload) => {
      refetchCards();
      if (selectedCardId === p.card_id) setSelectedCardId(null);
    },
    [refetchCards, selectedCardId]
  );

  useBoardChannel(boardId, {
    onColumnCreated:  handleColumnCreated,
    onColumnUpdated:  handleColumnUpdated,
    onColumnDeleted:  handleColumnDeleted,
    onCardCreated:    handleCardCreated,
    onCardUpdated:    handleCardUpdated,
    onCardDeleted:    handleCardDeleted,
    onCardMoved:      handleCardMoved,
  });

  // ── KanbanBoard mutation callbacks ────────────────────────────────────────

  const handleCardMove = useCallback(
    async (cardId: number, toColumnId: number, position: number) => {
      try {
        await api.put(`/api/cards/${cardId}/move`, {
          column_id: toColumnId,
          position,
        });
        refetchCards();
      } catch {
        toast.error("Failed to move card");
      }
    },
    [refetchCards]
  );

  const handleToggleCardComplete = useCallback(
    async (cardId: number, isCompleted: boolean) => {
      try {
        await api.put(`/api/cards/${cardId}`, { is_completed: isCompleted });
        refetchCards();
      } catch {
        toast.error("Failed to update card");
      }
    },
    [refetchCards]
  );

  const handleCreateCard = useCallback(
    async (columnId: number, title: string) => {
      try {
        await api.post(`/api/columns/${columnId}/cards`, { title });
        toast.success("Card created!");
        refetchCards();
      } catch {
        toast.error("Failed to create card");
      }
    },
    [refetchCards]
  );

  const handleCreateColumn = useCallback(
    async (name: string) => {
      try {
        await api.post(`/api/boards/${boardId}/columns`, { name });
        toast.success("Column created!");
        refetchCards();
      } catch {
        toast.error("Failed to create column");
      }
    },
    [boardId, refetchCards]
  );

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoadingBoard) return <BoardPageSkeleton />;

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col -m-4 md:-m-6">
      {/* ── Page header ── */}
      <div className="px-3 md:px-4 py-2 md:py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          {board.color && (
            <div
              className="w-3 h-10 rounded-full shrink-0"
              style={{ backgroundColor: board.color }}
            />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-semibold truncate">
                {board.name}
              </h1>
              {board.is_public && (
                <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full flex items-center gap-1 shrink-0">
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

        <div className="flex items-center gap-1 md:gap-2 shrink-0 overflow-x-auto">
          <OnlineUsers members={onlineMembers} />

          {/* Mobile overflow menu */}
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
            onBoardCreated={() => toast.success("Board created!")}
          />
        </div>
      </div>

      {/* ── Filters bar ── */}
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

      {/* ── Board canvas ── */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-x-auto p-4">
          <KanbanBoard
            columns={columns}
            cards={cards}
            canManage={canManage}
            hasActiveFilters={hasActiveFilters}
            token={token}
            onCardClick={(cardId) => setSelectedCardId(cardId)}
            onCardMove={handleCardMove}
            onToggleCardComplete={handleToggleCardComplete}
            onCreateCard={handleCreateCard}
            onCreateColumn={handleCreateColumn}
            onColumnUpdate={refetchCards}
          />
        </div>

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

      {/* ── Dialogs & panels ── */}
      <CardDetailDialog
        cardId={selectedCardId}
        boardId={boardId}
        token={token}
        currentUserId={user?.id ?? 0}
        isOpen={selectedCardId !== null}
        onClose={() => setSelectedCardId(null)}
        onCardUpdated={refetchCards}
        teamMembers={teamMembers}
      />

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

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

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
          <div key={i} className="w-72 shrink-0">
            <Skeleton className="h-10 w-full mb-2" />
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-24 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
