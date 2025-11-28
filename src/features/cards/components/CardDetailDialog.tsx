import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCard } from "../hooks/useCard";
import { useBoardLabels } from "../hooks/useBoardLabels";
import { LabelBadge } from "./LabelBadge";
import { LabelPicker } from "./LabelPicker";
import { ChecklistView } from "./ChecklistView";
import { AttachmentList } from "./AttachmentList";
import { Tag, Calendar, User, AlignLeft } from "lucide-react";
import { toast } from "sonner";

interface Props {
  cardId: number | null;
  boardId: number;
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onCardUpdated?: () => void;
}

export function CardDetailDialog({
  cardId,
  boardId,
  token,
  isOpen,
  onClose,
  onCardUpdated,
}: Props) {
  const {
    card,
    isLoading,
    error,
    updateCard,
    attachLabel,
    detachLabel,
    addChecklist,
    deleteChecklist,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    uploadAttachment,
    addExternalAttachment,
    deleteAttachment,
  } = useCard(cardId, token);

  const { labels: boardLabels, createLabel } = useBoardLabels(boardId, token);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");

  // Sync edited values when card loads
  useEffect(() => {
    if (card) {
      setEditedTitle(card.title);
      setEditedDescription(card.description || "");
    }
  }, [card]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSaveTitle = async () => {
    if (!editedTitle.trim() || editedTitle === card?.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await updateCard({ title: editedTitle.trim() });
      setIsEditingTitle(false);
      onCardUpdated?.();
    } catch {
      toast.error("Failed to update title");
    }
  };

  const handleSaveDescription = async () => {
    if (editedDescription === (card?.description || "")) {
      setIsEditingDescription(false);
      return;
    }
    try {
      await updateCard({ description: editedDescription || null });
      setIsEditingDescription(false);
      onCardUpdated?.();
    } catch {
      toast.error("Failed to update description");
    }
  };

  const handleLabelToggle = async (labelId: number, shouldAttach: boolean) => {
    try {
      if (shouldAttach) {
        await attachLabel([labelId]);
      } else {
        await detachLabel(labelId);
      }
      onCardUpdated?.();
    } catch {
      toast.error("Failed to update labels");
    }
  };

  const handleCreateLabel = async (name: string, color: string) => {
    try {
      const newLabel = await createLabel(name, color);
      await attachLabel([newLabel.id]);
      onCardUpdated?.();
    } catch {
      toast.error("Failed to create label");
    }
  };

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8 text-destructive">
            Failed to load card: {error}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading || !card ? (
          <CardDetailSkeleton />
        ) : (
          <>
            <DialogHeader className="pr-8">
              {/* Title */}
              {isEditingTitle ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                  autoFocus
                  className="text-lg font-semibold"
                />
              ) : (
                <DialogTitle
                  className="cursor-pointer hover:bg-muted px-2 py-1 -mx-2 rounded"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {card.title}
                </DialogTitle>
              )}
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Labels */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Labels</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        Edit
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 p-3">
                      <LabelPicker
                        boardLabels={boardLabels}
                        selectedLabels={card.labels}
                        onToggle={handleLabelToggle}
                        onCreate={handleCreateLabel}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap gap-1">
                  {card.labels.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      No labels
                    </span>
                  ) : (
                    card.labels.map((label) => (
                      <LabelBadge key={label.id} label={label} />
                    ))
                  )}
                </div>
              </div>

              {/* Due Date & Assignee row */}
              <div className="flex gap-6">
                {card.due_date && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Due date
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(card.due_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {card.assignee && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Assignee
                    </div>
                    <p className="text-sm font-medium">{card.assignee.name}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlignLeft className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Description</span>
                </div>
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="w-full min-h-[100px] p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Add a description..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveDescription}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditedDescription(card.description || "");
                          setIsEditingDescription(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="min-h-[60px] p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted text-sm"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    {card.description || (
                      <span className="text-muted-foreground">
                        Click to add a description...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Checklists */}
              <ChecklistView
                checklists={card.checklists}
                onAddChecklist={async (title) => {
                  try {
                    await addChecklist(title);
                    onCardUpdated?.();
                  } catch {
                    toast.error("Failed to add checklist");
                  }
                }}
                onDeleteChecklist={async (id) => {
                  try {
                    await deleteChecklist(id);
                    onCardUpdated?.();
                  } catch {
                    toast.error("Failed to delete checklist");
                  }
                }}
                onAddItem={async (checklistId, title) => {
                  try {
                    await addChecklistItem(checklistId, title);
                  } catch {
                    toast.error("Failed to add item");
                  }
                }}
                onToggleItem={async (itemId, isCompleted) => {
                  try {
                    await toggleChecklistItem(itemId, isCompleted);
                    onCardUpdated?.();
                  } catch {
                    toast.error("Failed to update item");
                  }
                }}
                onDeleteItem={async (itemId) => {
                  try {
                    await deleteChecklistItem(itemId);
                  } catch {
                    toast.error("Failed to delete item");
                  }
                }}
              />

              {/* Attachments */}
              <AttachmentList
                attachments={card.attachments}
                onUpload={async (file) => {
                  try {
                    await uploadAttachment(file);
                    onCardUpdated?.();
                    toast.success("Attachment uploaded");
                  } catch {
                    toast.error("Failed to upload attachment");
                  }
                }}
                onAddExternal={async (url, fileName) => {
                  try {
                    await addExternalAttachment(url, fileName);
                    onCardUpdated?.();
                    toast.success("Link added");
                  } catch {
                    toast.error("Failed to add link");
                  }
                }}
                onDelete={async (id) => {
                  try {
                    await deleteAttachment(id);
                    onCardUpdated?.();
                    toast.success("Attachment deleted");
                  } catch {
                    toast.error("Failed to delete attachment");
                  }
                }}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CardDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
