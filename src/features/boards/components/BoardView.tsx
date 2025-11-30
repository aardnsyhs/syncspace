import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBoardChannel } from "../hooks/useBoardChannel";
import type {
  CardEventPayload,
  CardDeletedPayload,
  CardMovedPayload,
  ColumnEventPayload,
  ColumnDeletedPayload,
  CommentCreatedPayload,
} from "../types";
import type { Board, Column, Card } from "@/types";

const initialBoard: Board & { columns: (Column & { cards: Card[] })[] } = {
  id: 1,
  workspace_id: 1,
  name: "Project Alpha",
  description: "Main project board",
  created_at: new Date().toISOString(),
  columns: [
    { id: 1, board_id: 1, name: "To Do", position: 0, cards: [] },
    { id: 2, board_id: 1, name: "In Progress", position: 1, cards: [] },
    { id: 3, board_id: 1, name: "Review", position: 2, cards: [] },
    { id: 4, board_id: 1, name: "Done", position: 3, cards: [] },
  ],
};

export function BoardView() {
  const [board, setBoard] = useState(initialBoard);

  const handleColumnCreated = useCallback((payload: ColumnEventPayload) => {
    setBoard((prev) => ({
      ...prev,
      columns: [...prev.columns, { ...payload.column, cards: [] }].sort(
        (a, b) => a.position - b.position
      ),
    }));
  }, []);

  const handleColumnUpdated = useCallback((payload: ColumnEventPayload) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns
        .map((col) =>
          col.id === payload.column.id ? { ...col, ...payload.column } : col
        )
        .sort((a, b) => a.position - b.position),
    }));
  }, []);

  const handleColumnDeleted = useCallback((payload: ColumnDeletedPayload) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.filter((col) => col.id !== payload.column_id),
    }));
  }, []);

  const handleCardCreated = useCallback((payload: CardEventPayload) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === payload.column_id
          ? {
              ...col,
              cards: [
                ...(col.cards || []),
                {
                  ...payload.card,
                  created_at: new Date().toISOString(),
                } as Card,
              ].sort((a, b) => a.position - b.position),
            }
          : col
      ),
    }));
  }, []);

  const handleCardUpdated = useCallback((payload: CardEventPayload) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        cards: (col.cards || []).map((card) =>
          card.id === payload.card.id ? { ...card, ...payload.card } : card
        ),
      })),
    }));
  }, []);

  const handleCardDeleted = useCallback((payload: CardDeletedPayload) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === payload.column_id
          ? {
              ...col,
              cards: (col.cards || []).filter(
                (card) => card.id !== payload.card_id
              ),
            }
          : col
      ),
    }));
  }, []);

  const handleCardMoved = useCallback((payload: CardMovedPayload) => {
    setBoard((prev) => {
      
      let movedCard: Card | undefined;
      const columnsWithoutCard = prev.columns.map((col) => {
        if (col.id === payload.from_column_id) {
          const card = (col.cards || []).find((c) => c.id === payload.card.id);
          if (card) movedCard = card;
          return {
            ...col,
            cards: (col.cards || []).filter((c) => c.id !== payload.card.id),
          };
        }
        return col;
      });

      if (!movedCard) return prev;

      return {
        ...prev,
        columns: columnsWithoutCard.map((col) => {
          if (col.id === payload.to_column_id) {
            const updatedCard = {
              ...movedCard!,
              ...payload.card,
              column_id: payload.to_column_id,
              position: payload.position,
            };
            const newCards = [...(col.cards || [])];
            newCards.splice(payload.position, 0, updatedCard);
            return {
              ...col,
              cards: newCards.map((c, idx) => ({ ...c, position: idx })),
            };
          }
          return col;
        }),
      };
    });
  }, []);

  const handleCommentCreated = useCallback(
    (_payload: CommentCreatedPayload) => {
      
      console.log("New comment on card:", _payload.card_id);
    },
    []
  );

  useBoardChannel(board.id, {
    onColumnCreated: handleColumnCreated,
    onColumnUpdated: handleColumnUpdated,
    onColumnDeleted: handleColumnDeleted,
    onCardCreated: handleCardCreated,
    onCardUpdated: handleCardUpdated,
    onCardDeleted: handleCardDeleted,
    onCardMoved: handleCardMoved,
    onCommentCreated: handleCommentCreated,
  });

  return (
    <div className="h-full">
      {}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{board.name}</h2>
          <p className="text-sm text-muted-foreground">
            {board.description ||
              "Manage your project tasks and collaborate with your team"}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>

      {}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.columns.map((column) => (
          <div
            key={column.id}
            className="flex w-72 flex-shrink-0 flex-col rounded-lg bg-muted/50 p-3"
          >
            {}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">{column.name}</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {column.cards?.length || 0}
              </span>
            </div>

            {}
            <div className="flex-1 space-y-2">
              {column.cards && column.cards.length > 0 ? (
                column.cards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-md border bg-card p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <p className="font-medium text-sm">{card.title}</p>
                    {card.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {card.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex h-24 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground">
                  No cards yet
                </div>
              )}
            </div>

            {}
            <Button variant="ghost" className="mt-3 w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Add a card
            </Button>
          </div>
        ))}

        {}
        <div className="flex w-72 flex-shrink-0 items-start">
          <Button variant="outline" className="w-full justify-start">
            <Plus className="mr-2 h-4 w-4" />
            Add column
          </Button>
        </div>
      </div>
    </div>
  );
}
