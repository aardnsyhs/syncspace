import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  columnId: number;
  columnName: string;
  currentLimit: number | null;
  currentCount: number;
  token: string;
  canEdit: boolean;
  onUpdate: () => void;
}

export function ColumnWipSettings({
  columnId,
  columnName,
  currentLimit,
  currentCount,
  token,
  canEdit,
  onUpdate,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [limit, setLimit] = useState<string>(currentLimit?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const wipLimit = limit.trim() === "" ? null : parseInt(limit);

      const res = await fetch(`${API_URL}/api/columns/${columnId}/wip-limit`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ wip_limit: wipLimit }),
      });

      if (!res.ok) throw new Error("Failed to update WIP limit");

      toast.success("WIP limit updated");
      onUpdate();
      setIsOpen(false);
    } catch {
      toast.error("Failed to update WIP limit");
    } finally {
      setIsLoading(false);
    }
  };

  if (!canEdit) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Column settings"
      >
        <Settings className="h-4 w-4" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Column Settings: {columnName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="wip-limit">WIP Limit</Label>
              <Input
                id="wip-limit"
                type="number"
                min="1"
                max="100"
                placeholder="No limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for no limit. Current cards: {currentCount}
              </p>
            </div>

            {limit && parseInt(limit) < currentCount && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>
                  Current card count ({currentCount}) exceeds the new limit (
                  {limit})
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
