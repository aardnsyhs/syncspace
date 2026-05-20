import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Circle, CheckCircle2 } from "lucide-react";
import { CardQuickInfo } from "@/features/cards/components/CardQuickInfo";
import { cn } from "@/lib/utils";

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

interface DraggableCardProps {
  card: CardData;
  onClick: () => void;
  /** Optional — if not provided the completion toggle is not rendered. */
  onToggleComplete?: (cardId: number, isCompleted: boolean) => void | Promise<void>;
}

export function DraggableCard({
  card,
  onClick,
  onToggleComplete,
}: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `card-${card.id}`,
    data: {
      type: "card",
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete?.(card.id, !card.is_completed);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group bg-background rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing",
        card.is_completed && "opacity-60"
      )}
      onClick={onClick}
    >
      <CardQuickInfo labels={card.labels} dueDate={card.due_date} />
      <div className="flex items-start mt-1">
        <div
          className={cn(
            "flex-shrink-0 overflow-hidden transition-all duration-150",
            card.is_completed
              ? "w-6 opacity-100"
              : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-100"
          )}
        >
          <button
            onClick={handleCheckboxClick}
            className="text-muted-foreground hover:text-primary mt-0.5"
            aria-label={
              card.is_completed ? "Mark as incomplete" : "Mark as complete"
            }
          >
            {card.is_completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "text-sm font-medium",
              card.is_completed && "line-through text-muted-foreground"
            )}
          >
            {card.title}
          </h4>
          {card.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {card.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
