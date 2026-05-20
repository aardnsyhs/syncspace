/**
 * DroppableColumn
 * ===============
 * A purely presentational column component. It renders cards, handles the
 * drop target for drag-and-drop, and exposes the inline card-creation form.
 *
 * This component makes NO API calls. All mutations are delegated upward via
 * callback props so the parent (KanbanBoard / BoardPage) owns the data layer.
 */

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnHeader } from "./ColumnHeader";
import { DraggableCard } from "./DraggableCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CardLabel {
  id: number;
  name: string;
  color: string;
}

interface CardData {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed?: boolean;
  labels: CardLabel[];
  column_id: number;
}

interface ColumnData {
  id: number;
  name: string;
  card_count: number;
  wip_limit: number | null;
  wip_exceeded: boolean;
}

export interface DroppableColumnProps {
  column: ColumnData;
  cards: CardData[];

  /**
   * Bearer token forwarded to `ColumnWipSettings` for its PATCH request.
   * This will be replaced by an `onWipLimitChange` callback in a future
   * iteration once all mutations are fully lifted.
   */
  token: string;

  /** Whether the current user can manage columns and cards. */
  canManage: boolean;

  /** Show "No matching cards" instead of "No cards" when a filter is active. */
  hasActiveFilters: boolean;

  // ── Inline card creation state (controlled by parent) ────────────────────
  isAddingCard: boolean;
  newCardTitle: string;
  isCreatingCard: boolean;

  // ── Callbacks ─────────────────────────────────────────────────────────────

  /** Called when the user clicks a card. */
  onCardClick: (cardId: number) => void;

  /** Called after a column rename or WIP limit change to trigger a refetch. */
  onUpdate: () => void;

  /** Called when the user clicks "Add card" to open the inline form. */
  onAddCardStart: () => void;

  /** Called when the user cancels the inline card form. */
  onAddCardCancel: () => void;

  /** Called on every keystroke in the new-card title input. */
  onCardTitleChange: (title: string) => void;

  /** Called when the user submits the inline card form. */
  onCreateCard: () => void;

  /**
   * Called when the user toggles the completion checkbox on a card.
   * Optional — if not provided the checkbox is not rendered.
   */
  onToggleCardComplete?: (cardId: number, isCompleted: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DroppableColumn({
  column,
  cards,
  token,
  canManage,
  hasActiveFilters,
  isAddingCard,
  newCardTitle,
  isCreatingCard,
  onCardClick,
  onUpdate,
  onAddCardStart,
  onAddCardCancel,
  onCardTitleChange,
  onCreateCard,
  onToggleCardComplete,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: "column", column },
  });

  const cardIds = cards.map((card) => `card-${card.id}`);

  return (
    <div
      className={`w-64 md:w-72 shrink-0 flex flex-col rounded-lg transition-colors ${
        column.wip_exceeded
          ? "bg-destructive/5"
          : isOver
          ? "bg-accent/50"
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
        onUpdate={onUpdate}
      />

      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[100px]"
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <DraggableCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card.id)}
              onToggleComplete={onToggleCardComplete}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground">
            {hasActiveFilters ? "No matching cards" : "No cards"}
          </div>
        )}
      </div>

      {canManage && (
        <div className="p-2">
          {isAddingCard ? (
            <div className="space-y-2">
              <Input
                placeholder="Enter card title..."
                value={newCardTitle}
                onChange={(e) => onCardTitleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCreateCard();
                  if (e.key === "Escape") onAddCardCancel();
                }}
                autoFocus
                disabled={isCreatingCard}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onCreateCard}
                  disabled={isCreatingCard || !newCardTitle.trim()}
                >
                  {isCreatingCard && (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  )}
                  Add
                </Button>
                <Button size="sm" variant="ghost" onClick={onAddCardCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={onAddCardStart}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add card
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
