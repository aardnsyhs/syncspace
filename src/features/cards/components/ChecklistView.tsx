import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckSquare,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { Checklist, ChecklistItem } from "../types";

interface Props {
  checklists: Checklist[];
  onAddChecklist: (title: string) => Promise<void>;
  onDeleteChecklist: (checklistId: number) => Promise<void>;
  onAddItem: (checklistId: number, title: string) => Promise<void>;
  onToggleItem: (itemId: number, isCompleted: boolean) => Promise<void>;
  onDeleteItem: (itemId: number) => Promise<void>;
}

export function ChecklistView({
  checklists,
  onAddChecklist,
  onDeleteChecklist,
  onAddItem,
  onToggleItem,
  onDeleteItem,
}: Props) {
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [expandedChecklists, setExpandedChecklists] = useState<Set<number>>(
    new Set(checklists.map((c) => c.id))
  );

  const handleAddChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    await onAddChecklist(newChecklistTitle.trim());
    setNewChecklistTitle("");
    setIsAddingChecklist(false);
  };

  const toggleExpanded = (id: number) => {
    setExpandedChecklists((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CheckSquare className="h-4 w-4" />
          Checklists
        </div>
        {!isAddingChecklist && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingChecklist(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Add new checklist */}
      {isAddingChecklist && (
        <div className="flex gap-2">
          <Input
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            placeholder="Checklist title"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAddChecklist()}
          />
          <Button size="sm" onClick={handleAddChecklist}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAddingChecklist(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Checklists */}
      {checklists.length === 0 && !isAddingChecklist && (
        <p className="text-sm text-muted-foreground">No checklists yet</p>
      )}

      {checklists.map((checklist) => (
        <ChecklistSection
          key={checklist.id}
          checklist={checklist}
          isExpanded={expandedChecklists.has(checklist.id)}
          onToggleExpand={() => toggleExpanded(checklist.id)}
          onDelete={() => onDeleteChecklist(checklist.id)}
          onAddItem={(title) => onAddItem(checklist.id, title)}
          onToggleItem={onToggleItem}
          onDeleteItem={onDeleteItem}
        />
      ))}
    </div>
  );
}

interface ChecklistSectionProps {
  checklist: Checklist;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onAddItem: (title: string) => Promise<void>;
  onToggleItem: (itemId: number, isCompleted: boolean) => Promise<void>;
  onDeleteItem: (itemId: number) => Promise<void>;
}

function ChecklistSection({
  checklist,
  isExpanded,
  onToggleExpand,
  onDelete,
  onAddItem,
  onToggleItem,
  onDeleteItem,
}: ChecklistSectionProps) {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;
    await onAddItem(newItemTitle.trim());
    setNewItemTitle("");
  };

  return (
    <div className="border rounded-lg p-3 space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={onToggleExpand} className="p-1 hover:bg-muted rounded">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        <span className="font-medium flex-1">{checklist.title}</span>
        <span className="text-xs text-muted-foreground">
          {checklist.progress.completed}/{checklist.progress.total}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${checklist.progress.percentage}%` }}
        />
      </div>

      {/* Items */}
      {isExpanded && (
        <div className="space-y-1 pt-2">
          {checklist.items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              onToggle={() => onToggleItem(item.id, !item.is_completed)}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))}

          {/* Add item */}
          {isAddingItem ? (
            <div className="flex gap-2 pt-1">
              <Input
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Item title"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                className="h-8"
              />
              <Button size="sm" className="h-8" onClick={handleAddItem}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8"
                onClick={() => setIsAddingItem(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setIsAddingItem(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add item
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onToggle: () => void;
  onDelete: () => void;
}

function ChecklistItemRow({ item, onToggle, onDelete }: ChecklistItemRowProps) {
  return (
    <div className="flex items-center gap-2 group">
      <Checkbox
        checked={item.is_completed}
        onCheckedChange={onToggle}
        className="h-4 w-4"
      />
      <span
        className={`flex-1 text-sm ${
          item.is_completed ? "line-through text-muted-foreground" : ""
        }`}
      >
        {item.title}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
