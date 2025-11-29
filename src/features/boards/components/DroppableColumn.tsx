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

interface DroppableColumnProps {
  column: ColumnData;
  cards: CardData[];
  token: string;
  canManage: boolean;
  hasActiveFilters: boolean;
  isAddingCard: boolean;
  newCardTitle: string;
  isCreatingCard: boolean;
  onCardClick: (cardId: number) => void;
  onUpdate: () => void;
  onAddCardStart: () => void;
  onAddCardCancel: () => void;
  onCardTitleChange: (title: string) => void;
  onCreateCard: () => void;
}

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
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: "column",
      column,
    },
  });

  const cardIds = cards.map((card) => `card-${card.id}`);

  return (
    <div
      className={`w-72 flex-shrink-0 flex flex-col rounded-lg transition-colors ${
        column.wip_exceeded
          ? "bg-red-50 dark:bg-red-900/10"
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

      {/* Cards */}
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
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground">
            {hasActiveFilters ? "No matching cards" : "No cards"}
          </div>
        )}
      </div>

      {/* Add Card */}
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
    </div>
  );
}
