import type { Label } from "../types";

interface Props {
  label: Label;
  size?: "sm" | "md";
  onClick?: () => void;
  showName?: boolean;
}

export function LabelBadge({
  label,
  size = "md",
  onClick,
  showName = true,
}: Props) {
  const sizeClasses = size === "sm" ? "h-2 min-w-6" : "h-5 px-2";

  return (
    <span
      className={`inline-flex items-center rounded text-xs font-medium text-white ${sizeClasses} ${
        onClick ? "cursor-pointer hover:opacity-80" : ""
      }`}
      style={{ backgroundColor: label.color }}
      onClick={onClick}
      title={label.name}
    >
      {showName && size === "md" && label.name}
    </span>
  );
}
