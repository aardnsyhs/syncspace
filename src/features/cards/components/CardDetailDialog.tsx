import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useCard } from "../hooks/useCard";
import { useBoardLabels } from "../hooks/useBoardLabels";
import { useComments } from "../hooks/useComments";
import { LabelBadge } from "./LabelBadge";
import { LabelPicker } from "./LabelPicker";
import { ChecklistView } from "./ChecklistView";
import { AttachmentList } from "./AttachmentList";
import { CommentsSection } from "./CommentsSection";
import {
  Tag,
  Calendar as CalendarIcon,
  User,
  AlignLeft,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface TeamMember {
  id: number;
  name: string;
  avatar_url?: string;
}

interface Props {
  cardId: number | null;
  boardId: number;
  token: string;
  currentUserId: number;
  isOpen: boolean;
  onClose: () => void;
  onCardUpdated?: () => void;
  teamMembers?: TeamMember[];
}

export function CardDetailDialog({
  cardId,
  boardId,
  token,
  currentUserId,
  isOpen,
  onClose,
  onCardUpdated,
  teamMembers = [],
}: Props) {
  const {
    card,
    isLoading,
    error,
    updateCard,
    deleteCard,
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

  const {
    comments,
    isLoading: commentsLoading,
    addComment,
    deleteComment,
  } = useComments(isOpen ? cardId : null);

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

  const [showComments, setShowComments] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
        {isLoading || !card ? (
          <div className="p-6">
            <CardDetailSkeleton />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-[85vh]">
            {/* Left Panel - Card Details */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <DialogHeader className="pr-8">
                <div className="flex items-start justify-between gap-2">
                  {/* Title */}
                  {isEditingTitle ? (
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onBlur={handleSaveTitle}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                      autoFocus
                      className="text-lg font-semibold flex-1"
                    />
                  ) : (
                    <DialogTitle
                      className="cursor-pointer hover:bg-muted px-2 py-1 -mx-2 rounded flex-1"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {card.title}
                    </DialogTitle>
                  )}
                  {/* Delete Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Card</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{card.title}"? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={async () => {
                            try {
                              await deleteCard();
                              toast.success("Card deleted");
                              onCardUpdated?.();
                              onClose();
                            } catch {
                              toast.error("Failed to delete card");
                            }
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
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
                  {/* Due Date */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      Due date
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-[180px] justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {card.due_date ? (
                            format(new Date(card.due_date), "PPP")
                          ) : (
                            <span className="text-muted-foreground">
                              Set due date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={
                            card.due_date
                              ? new Date(card.due_date + "T00:00:00")
                              : undefined
                          }
                          onSelect={async (date: Date | undefined) => {
                            try {
                              // Format date in local timezone (YYYY-MM-DD)
                              const formattedDate = date
                                ? `${date.getFullYear()}-${String(
                                    date.getMonth() + 1
                                  ).padStart(2, "0")}-${String(
                                    date.getDate()
                                  ).padStart(2, "0")}`
                                : null;
                              await updateCard({
                                due_date: formattedDate,
                              });
                              onCardUpdated?.();
                            } catch {
                              toast.error("Failed to update due date");
                            }
                          }}
                          initialFocus
                        />
                        {card.due_date && (
                          <div className="p-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-destructive"
                              onClick={async () => {
                                try {
                                  await updateCard({ due_date: null });
                                  onCardUpdated?.();
                                } catch {
                                  toast.error("Failed to remove due date");
                                }
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove due date
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Assignee */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Assignee
                    </div>
                    <Select
                      value={card.assignee?.id?.toString() || "unassigned"}
                      onValueChange={async (value) => {
                        try {
                          await updateCard({
                            assignee_id:
                              value === "unassigned" ? null : parseInt(value),
                          });
                          onCardUpdated?.();
                        } catch {
                          toast.error("Failed to update assignee");
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 w-[180px]">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem
                            key={member.id}
                            value={member.id.toString()}
                          >
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
            </div>

            {/* Mobile Comments Toggle */}
            <div className="md:hidden border-t p-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowComments(!showComments)}
              >
                {showComments ? "Hide Comments" : "Show Comments"}
              </Button>
            </div>

            {/* Right Panel - Comments (hidden on mobile unless toggled) */}
            <div
              className={`${
                showComments ? "block" : "hidden"
              } md:block md:w-80 border-l bg-muted/20 flex flex-col`}
            >
              <div className="flex-1 overflow-y-auto p-4">
                <CommentsSection
                  comments={comments}
                  currentUserId={currentUserId}
                  teamMembers={teamMembers}
                  isLoading={commentsLoading}
                  onAddComment={async (body) => {
                    try {
                      await addComment(body);
                      toast.success("Comment added");
                    } catch {
                      toast.error("Failed to add comment");
                    }
                  }}
                  onDeleteComment={async (commentId) => {
                    try {
                      await deleteComment(commentId);
                      toast.success("Comment deleted");
                    } catch {
                      toast.error("Failed to delete comment");
                    }
                  }}
                />
              </div>
            </div>
          </div>
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
