import { CheckSquare, Paperclip, MessageSquare, Calendar } from "lucide-react";

interface CardLabel {
  id: number;
  name: string;
  color: string;
}

interface Props {
  labels?: CardLabel[];
  checklistProgress?: { completed: number; total: number };
  attachmentCount?: number;
  commentCount?: number;
  dueDate?: string | null;
}

export function CardQuickInfo({
  labels = [],
  checklistProgress,
  attachmentCount = 0,
  commentCount = 0,
  dueDate,
}: Props) {
  const hasLabels = labels.length > 0;
  const hasChecklist = checklistProgress && checklistProgress.total > 0;
  const hasAttachments = attachmentCount > 0;
  const hasComments = commentCount > 0;
  const hasDueDate = !!dueDate;

  if (
    !hasLabels &&
    !hasChecklist &&
    !hasAttachments &&
    !hasComments &&
    !hasDueDate
  ) {
    return null;
  }

  const isOverdue = dueDate && new Date(dueDate) < new Date();
  const isDueSoon =
    dueDate &&
    !isOverdue &&
    new Date(dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-2">
      {}
      {hasLabels && (
        <div className="flex flex-wrap gap-1">
          {labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="h-2 w-8 rounded"
              style={{ backgroundColor: label.color }}
              title={label.name}
            />
          ))}
          {labels.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{labels.length - 3}
            </span>
          )}
        </div>
      )}

      {}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {hasDueDate && (
          <span
            className={`flex items-center gap-1 ${
              isOverdue ? "text-red-500" : isDueSoon ? "text-yellow-600" : ""
            }`}
            title={`Due: ${new Date(dueDate!).toLocaleDateString()}`}
          >
            <Calendar className="h-3 w-3" />
            {formatDueDate(dueDate!)}
          </span>
        )}

        {hasChecklist && (
          <span
            className={`flex items-center gap-1 ${
              checklistProgress.completed === checklistProgress.total
                ? "text-green-600"
                : ""
            }`}
            title="Checklist progress"
          >
            <CheckSquare className="h-3 w-3" />
            {checklistProgress.completed}/{checklistProgress.total}
          </span>
        )}

        {hasAttachments && (
          <span className="flex items-center gap-1" title="Attachments">
            <Paperclip className="h-3 w-3" />
            {attachmentCount}
          </span>
        )}

        {hasComments && (
          <span className="flex items-center gap-1" title="Comments">
            <MessageSquare className="h-3 w-3" />
            {commentCount}
          </span>
        )}
      </div>
    </div>
  );
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
