import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Placeholder column untuk demo
const columns = [
  { id: 1, name: "To Do", cards: [] },
  { id: 2, name: "In Progress", cards: [] },
  { id: 3, name: "Review", cards: [] },
  { id: 4, name: "Done", cards: [] },
];

export function BoardView() {
  return (
    <div className="h-full">
      {/* Board Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Alpha</h2>
          <p className="text-sm text-muted-foreground">
            Manage your project tasks and collaborate with your team
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex w-72 flex-shrink-0 flex-col rounded-lg bg-muted/50 p-3"
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">{column.name}</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {column.cards.length}
              </span>
            </div>

            {/* Cards Area */}
            <div className="flex-1 space-y-2">
              {/* Empty state */}
              <div className="flex h-24 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground">
                No cards yet
              </div>
            </div>

            {/* Add Card Button */}
            <Button variant="ghost" className="mt-3 w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Add a card
            </Button>
          </div>
        ))}

        {/* Add Column Button */}
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
