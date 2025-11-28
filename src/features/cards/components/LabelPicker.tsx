import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Plus, X } from "lucide-react";
import type { Label as LabelType } from "../types";

interface Props {
  boardLabels: LabelType[];
  selectedLabels: LabelType[];
  onToggle: (labelId: number, isSelected: boolean) => void;
  onCreate: (name: string, color: string) => Promise<void>;
  isLoading?: boolean;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

export function LabelPicker({
  boardLabels,
  selectedLabels,
  onToggle,
  onCreate,
  isLoading,
}: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const selectedIds = new Set(selectedLabels.map((l) => l.id));

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await onCreate(newName.trim(), newColor);
    setNewName("");
    setIsCreating(false);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Labels</div>

      {/* Existing labels */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {boardLabels.length === 0 && !isCreating && (
          <p className="text-sm text-muted-foreground py-2">No labels yet</p>
        )}
        {boardLabels.map((label) => {
          const isSelected = selectedIds.has(label.id);
          return (
            <button
              key={label.id}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
              onClick={() => onToggle(label.id, !isSelected)}
              disabled={isLoading}
            >
              <div
                className="w-8 h-6 rounded"
                style={{ backgroundColor: label.color }}
              />
              <span className="flex-1 text-left text-sm">{label.name}</span>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </button>
          );
        })}
      </div>

      {/* Create new label */}
      {isCreating ? (
        <div className="space-y-2 pt-2 border-t">
          <Label htmlFor="label-name">Name</Label>
          <Input
            id="label-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Label name"
            autoFocus
          />
          <Label>Color</Label>
          <div className="flex gap-1 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded ${
                  newColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setNewColor(color)}
              />
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
              Create
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCreating(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Create label
        </Button>
      )}
    </div>
  );
}
