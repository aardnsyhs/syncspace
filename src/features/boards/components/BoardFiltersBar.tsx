import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, User, Tag, Calendar } from "lucide-react";
import type { FilterState } from "../hooks/useBoardFilters";
import type { Label } from "@/features/cards/types";

interface TeamMember {
  id: number;
  name: string;
  avatar_url?: string;
}

interface Props {
  filters: FilterState;
  onSearchChange: (search: string) => void;
  onAssigneeChange: (assigneeId: number | null) => void;
  onLabelsChange: (labels: number[]) => void;
  onDueChange: (due: FilterState["due"]) => void;
  onMyCardsChange: (myCards: boolean) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  teamMembers: TeamMember[];
  boardLabels: Label[];
  isLoading?: boolean;
}

export function BoardFiltersBar({
  filters,
  onSearchChange,
  onAssigneeChange,
  onLabelsChange,
  onDueChange,
  onMyCardsChange,
  onClearFilters,
  hasActiveFilters,
  teamMembers,
  boardLabels,
  isLoading,
}: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 p-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search cards..."
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
        {filters.search && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {}
      <Button
        variant={filters.myCards ? "default" : "outline"}
        size="sm"
        onClick={() => onMyCardsChange(!filters.myCards)}
        className="h-9"
      >
        <User className="h-4 w-4 mr-1" />
        My Cards
      </Button>

      {}
      <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                Active
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          {}
          <DropdownMenuLabel className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Assignee
          </DropdownMenuLabel>
          <div className="px-2 pb-2">
            <Select
              value={filters.assigneeId?.toString() || "any"}
              onValueChange={(v) =>
                onAssigneeChange(v === "any" ? null : parseInt(v))
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Any assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any assignee</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DropdownMenuSeparator />

          {}
          <DropdownMenuLabel className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Labels
          </DropdownMenuLabel>
          {boardLabels.length === 0 ? (
            <div className="px-2 pb-2 text-sm text-muted-foreground">
              No labels
            </div>
          ) : (
            boardLabels.map((label) => (
              <DropdownMenuCheckboxItem
                key={label.id}
                checked={filters.labels.includes(label.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onLabelsChange([...filters.labels, label.id]);
                  } else {
                    onLabelsChange(
                      filters.labels.filter((id) => id !== label.id)
                    );
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: label.color }}
                  />
                  {label.name}
                </div>
              </DropdownMenuCheckboxItem>
            ))
          )}

          <DropdownMenuSeparator />

          {}
          <DropdownMenuLabel className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Due Date
          </DropdownMenuLabel>
          <div className="px-2 pb-2">
            <Select
              value={filters.due}
              onValueChange={(v) => onDueChange(v as FilterState["due"])}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="today">Due Today</SelectItem>
                <SelectItem value="this_week">Due This Week</SelectItem>
                <SelectItem value="no_due">No Due Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-9"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}

      {}
      {isLoading && (
        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  );
}
