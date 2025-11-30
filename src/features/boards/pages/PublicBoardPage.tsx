import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Calendar, CheckSquare, AlertCircle } from "lucide-react";
import type { PublicBoardData } from "../hooks/usePublicSharing";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  publicToken: string;
}

export function PublicBoardPage({ publicToken }: Props) {
  const [board, setBoard] = useState<PublicBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/api/public/boards/${publicToken}`, {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Board not found or link has expired");
          }
          throw new Error("Failed to load board");
        }

        const json = await res.json();
        setBoard(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoard();
  }, [publicToken]);

  if (isLoading) {
    return <PublicBoardSkeleton />;
  }

  if (error || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Board Not Found</h1>
          <p className="text-muted-foreground max-w-md">
            {error || "This board doesn't exist or the link has expired."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{board.name}</h1>
                <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Public View
                </span>
              </div>
              {board.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {board.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {}
      <main className="p-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {board.columns.map((column) => (
            <div
              key={column.id}
              className="w-72 flex-shrink-0 bg-muted/30 rounded-lg"
            >
              {}
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{column.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {column.cards.length}
                    {column.wip_limit && ` / ${column.wip_limit}`}
                  </span>
                </div>
              </div>

              {}
              <div className="p-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {column.cards.map((card) => (
                  <PublicCardItem key={card.id} card={card} />
                ))}
                {column.cards.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No cards
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {}
      <footer className="fixed bottom-0 left-0 right-0 p-2 bg-muted/50 text-center text-xs text-muted-foreground">
        Powered by Syncspace • Read-only public view
      </footer>
    </div>
  );
}

function PublicCardItem({
  card,
}: {
  card: PublicBoardData["columns"][0]["cards"][0];
}) {
  return (
    <div className="bg-background rounded-lg border p-3 shadow-sm">
      {}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((label) => (
            <span
              key={label.id}
              className="h-2 w-8 rounded"
              style={{ backgroundColor: label.color }}
              title={label.name}
            />
          ))}
        </div>
      )}

      {}
      <h4 className="text-sm font-medium">{card.title}</h4>

      {}
      {card.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {card.description}
        </p>
      )}

      {}
      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        {card.due_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(card.due_date).toLocaleDateString()}
          </span>
        )}
        {card.checklist_progress && card.checklist_progress.total > 0 && (
          <span
            className={`flex items-center gap-1 ${
              card.checklist_progress.completed ===
              card.checklist_progress.total
                ? "text-green-600"
                : ""
            }`}
          >
            <CheckSquare className="h-3 w-3" />
            {card.checklist_progress.completed}/{card.checklist_progress.total}
          </span>
        )}
      </div>
    </div>
  );
}

function PublicBoardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </header>
      <main className="p-4 flex gap-4">
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
      </main>
    </div>
  );
}
