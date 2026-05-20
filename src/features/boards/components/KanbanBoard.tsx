/**
 * KanbanBoard
 * ===========
 * A fully self-contained, prop-driven Kanban board with drag-and-drop support.
 *
 * This component is intentionally "dumb" — it owns no data-fetching logic and
 * makes no API calls. All mutations are delegated to callback props so buyers
 * can wire it to any backend without touching this file.
 *
 * ─── Minimal usage example ──────────────────────────────────────────────────
 *
 * <KanbanBoard
 *   columns={columns}
 *   cards={cards}
 *   onCardMove={async (cardId, toColumnId) => { ... }}
 *   onCardClick={(cardId) => setSelectedCard(cardId)}
 *   onCreateCard={async (columnId, title) => { ... }}
 *   onCreateColumn={async (name) => { ... }}
 * />
 *
 * ─── Prop reference ─────────────────────────────────────────────────────────
 * See `KanbanBoardProps` below for the full typed interface.
 */

import { useState } from "react";
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
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardQuickInfo } from "@/features/cards/components/CardQuickInfo";
import { DroppableColumn } from "./DroppableColumn";

// ---------------------------------------------------------------------------
// Shared data types — exported so callers can import them directly
// ---------------------------------------------------------------------------

export interface KanbanCardLabel {
  id: number;
  name: string;
  color: string;
}

/** A card as it appears on the board surface (not the full card detail). */
export interface KanbanCard {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed?: boolean;
  labels: KanbanCardLabel[];
  column_id: number;
}

/** A column as returned by the board filters API. */
export interface KanbanColumn {
  id: number;
  name: string;
  card_count: number;
  wip_limit: number | null;
  wip_exceeded: boolean;
}

// ---------------------------------------------------------------------------
// Props interface
// ---------------------------------------------------------------------------

export interface KanbanBoardProps {
  // ── Data ──────────────────────────────────────────────────────────────────

  /** Ordered list of columns to render. */
  columns: KanbanColumn[];

  /** All cards for this board. The component groups them by `column_id`. */
  cards: KanbanCard[];

  // ── Permissions ───────────────────────────────────────────────────────────

  /**
   * Whether the current user can create/edit/delete columns and cards.
   * When `false`, the "Add card" and "Add column" buttons are hidden and
   * column settings are disabled.
   * @default true
   */
  canManage?: boolean;

  /**
   * Pass `true` when a filter is active so empty columns show
   * "No matching cards" instead of "No cards".
   * @default false
   */
  hasActiveFilters?: boolean;

  // ── Callbacks — card interactions ─────────────────────────────────────────

  /**
   * Called when the user clicks a card to open its detail view.
   * @param cardId - The ID of the clicked card.
   */
  onCardClick: (cardId: number) => void;

  /**
   * Called when the user drags a card to a different column.
   * The parent is responsible for persisting the move (API call).
   *
   * @param cardId       - The card being moved.
   * @param toColumnId   - The destination column.
   * @param position     - The target position index (0 = top).
   */
  onCardMove: (cardId: number, toColumnId: number, position: number) => Promise<void>;

  /**
   * Called when the user clicks the complete/incomplete toggle on a card.
   * @param cardId      - The card to update.
   * @param isCompleted - The new completion state.
   */
  onToggleCardComplete?: (cardId: number, isCompleted: boolean) => Promise<void>;

  /**
   * Called when the user submits the inline "Add card" form.
   * @param columnId - The column to add the card to.
   * @param title    - The card title entered by the user.
   */
  onCreateCard: (columnId: number, title: string) => Promise<void>;

  // ── Callbacks — column interactions ───────────────────────────────────────

  /**
   * Called when the user submits the inline "Add column" form.
   * @param name - The column name entered by the user.
   */
  onCreateColumn: (name: string) => Promise<void>;

  /**
   * Called after a column is renamed or its WIP limit is changed.
   * Typically triggers a data refetch in the parent.
   */
  onColumnUpdate: () => void;

  // ── Token (passed to ColumnWipSettings for its PATCH request) ─────────────

  /**
   * The Sanctum bearer token. Required by `ColumnWipSettings` to authenticate
   * its PATCH request. Will be removed in a future version when all mutations
   * are lifted to callback props.
   */
  token: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KanbanBoard({
  columns,
  cards,
  canManage = true,
  hasActiveFilters = false,
  onCardClick,
  onCardMove,
  onToggleCardComplete,
  onCreateCard,
  onCreateColumn,
  onColumnUpdate,
  token,
}: KanbanBoardProps) {
  // ── Local UI state (no data fetching here) ────────────────────────────────
  const [addingCardToColumn, setAddingCardToColumn] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);

  /** The card currently being dragged — used to render the DragOverlay. */
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  // ── DnD sensors ──────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } })
  );

  // ── Group cards by column ─────────────────────────────────────────────────
  const cardsByColumn = cards.reduce<Record<number, KanbanCard[]>>((acc, card) => {
    if (!acc[card.column_id]) acc[card.column_id] = [];
    acc[card.column_id].push(card);
    return acc;
  }, {});

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const cardData = event.active.data.current?.card as KanbanCard | undefined;
    if (cardData) setActiveCard(cardData);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId   = String(over.id);
    const cardId   = parseInt(activeId.replace("card-", ""));

    let targetColumnId: number | null = null;

    if (overId.startsWith("column-")) {
      targetColumnId = parseInt(overId.replace("column-", ""));
    } else if (overId.startsWith("card-")) {
      const overCard = cards.find(
        (c) => c.id === parseInt(overId.replace("card-", ""))
      );
      if (overCard) targetColumnId = overCard.column_id;
    }

    if (!targetColumnId) return;

    const currentCard = cards.find((c) => c.id === cardId);
    if (!currentCard || currentCard.column_id === targetColumnId) return;

    await onCardMove(cardId, targetColumnId, 0);
  };

  // ── Inline card creation ──────────────────────────────────────────────────
  const handleCreateCard = async (columnId: number) => {
    if (!newCardTitle.trim()) return;
    setIsCreatingCard(true);
    try {
      await onCreateCard(columnId, newCardTitle.trim());
      setNewCardTitle("");
      setAddingCardToColumn(null);
    } finally {
      setIsCreatingCard(false);
    }
  };

  // ── Inline column creation ────────────────────────────────────────────────
  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) return;
    setIsCreatingColumn(true);
    try {
      await onCreateColumn(newColumnName.trim());
      setNewColumnName("");
      setIsAddingColumn(false);
    } finally {
      setIsCreatingColumn(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full">
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            cards={cardsByColumn[column.id] ?? []}
            token={token}
            canManage={canManage}
            hasActiveFilters={hasActiveFilters}
            isAddingCard={addingCardToColumn === column.id}
            newCardTitle={newCardTitle}
            isCreatingCard={isCreatingCard}
            onCardClick={onCardClick}
            onUpdate={onColumnUpdate}
            onAddCardStart={() => setAddingCardToColumn(column.id)}
            onAddCardCancel={() => {
              setAddingCardToColumn(null);
              setNewCardTitle("");
            }}
            onCardTitleChange={setNewCardTitle}
            onCreateCard={() => handleCreateCard(column.id)}
            onToggleCardComplete={onToggleCardComplete}
          />
        ))}

        {/* Add column control */}
        {canManage && (
          <div className="w-64 md:w-72 shrink-0">
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
        )}
      </div>

      {/* Drag overlay — renders a ghost card while dragging */}
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
  );
}
