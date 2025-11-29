import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardQuickInfo } from "@/features/cards/components/CardQuickInfo";

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

interface DraggableCardProps {
  card: CardData;
  onClick: () => void;
}

export function DraggableCard({ card, onClick }: DraggableCardProps) {
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
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-background rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      onClick={onClick}
    >
      <CardQuickInfo labels={card.labels} dueDate={card.due_date} />
      <h4 className="text-sm font-medium mt-1">{card.title}</h4>
      {card.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {card.description}
        </p>
      )}
    </div>
  );
}
