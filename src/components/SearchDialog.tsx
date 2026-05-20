import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  PanelsTopLeft,
  FileText,
  Users,
  Settings,
  Loader2,
} from "lucide-react";

import { TOKEN_KEY } from "@/lib/constants";

const API_URL = import.meta.env.VITE_API_URL;

interface SearchResult {
  boards: Array<{ id: number; name: string; color: string | null }>;
  cards: Array<{
    id: number;
    title: string;
    board_id: number;
    board_name: string;
  }>;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({
    boards: [],
    cards: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ boards: [], cards: [] });
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    setIsLoading(true);
    try {
      const boardsRes = await fetch(
        `${API_URL}/api/teams?search=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (boardsRes.ok) {
        const data = await boardsRes.json();
        const allBoards = (data.data || []).flatMap(
          (team: {
            boards: Array<{ id: number; name: string; color: string | null }>;
          }) => team.boards || []
        );
        const filteredBoards = allBoards.filter((b: { name: string }) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setResults((prev) => ({ ...prev, boards: filteredBoards.slice(0, 5) }));
      }
    } catch {
      console.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (type: string, id?: number) => {
    onOpenChange(false);
    setQuery("");

    switch (type) {
      case "board":
        if (id) navigate(`/app/boards/${id}`);
        break;
      case "dashboard":
        navigate("/app");
        break;
      case "members":
        navigate("/app/members");
        break;
      case "settings":
        navigate("/app/settings");
        break;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search boards, cards, or navigate..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect("dashboard")}>
            <PanelsTopLeft className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("members")}>
            <Users className="mr-2 h-4 w-4" />
            Members
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>

        {results.boards.length > 0 && (
          <CommandGroup heading="Boards">
            {results.boards.map((board) => (
              <CommandItem
                key={board.id}
                onSelect={() => handleSelect("board", board.id)}
              >
                <div
                  className="mr-2 h-3 w-3 rounded-sm"
                  style={{ backgroundColor: board.color || "#3b82f6" }}
                />
                {board.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.cards.length > 0 && (
          <CommandGroup heading="Cards">
            {results.cards.map((card) => (
              <CommandItem
                key={card.id}
                onSelect={() => handleSelect("board", card.board_id)}
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{card.title}</span>
                  <span className="text-xs text-muted-foreground">
                    in {card.board_name}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
