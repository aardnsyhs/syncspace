import { ColumnWipSettings } from "./ColumnWipSettings";
import { AlertTriangle } from "lucide-react";

interface Props {
  columnId: number;
  name: string;
  cardCount: number;
  wipLimit: number | null;
  wipExceeded: boolean;
  token: string;
  canEdit: boolean;
  onUpdate: () => void;
}

export function ColumnHeader({
  columnId,
  name,
  cardCount,
  wipLimit,
  wipExceeded,
  token,
  canEdit,
  onUpdate,
}: Props) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-t-lg ${
        wipExceeded
          ? "bg-red-50 dark:bg-red-900/20 border-b-2 border-red-400"
          : "bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-sm">{name}</h3>
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${
            wipExceeded
              ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {cardCount}
          {wipLimit !== null && ` / ${wipLimit}`}
        </span>
        {wipExceeded && (
          <span title="WIP limit exceeded">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </span>
        )}
      </div>

      <ColumnWipSettings
        columnId={columnId}
        columnName={name}
        currentLimit={wipLimit}
        currentCount={cardCount}
        token={token}
        canEdit={canEdit}
        onUpdate={onUpdate}
      />
    </div>
  );
}
