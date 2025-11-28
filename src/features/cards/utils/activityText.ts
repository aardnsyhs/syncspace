// Convert activity type to human-readable text
export function getActivityText(
  type: string,
  data: Record<string, unknown>
): string {
  switch (type) {
    case "created":
      if (data.entity === "card") {
        return `created card "${data.card_title}" in ${data.column_name}`;
      }
      if (data.entity === "column") {
        return `created column "${data.column_name}"`;
      }
      return "created an item";

    case "updated":
      if (data.action === "deleted") {
        if (data.entity === "card") {
          return `deleted card "${data.card_title}" from ${data.column_name}`;
        }
        if (data.entity === "column") {
          return `deleted column "${data.column_name}"`;
        }
      }
      if (data.entity === "card") {
        return `updated card "${data.card_title}"`;
      }
      return "updated an item";

    case "moved":
      return `moved "${data.card_title}" from ${data.from_column} to ${data.to_column}`;

    case "assigned":
      return `assigned "${data.card_title}" to ${data.assignee_name}`;

    case "unassigned":
      return `unassigned "${data.card_title}"`;

    case "commented":
      return `commented on "${data.card_title}"`;

    case "label_added":
      return `added label "${data.label_name}" to "${data.card_title}"`;

    case "label_removed":
      return `removed label "${data.label_name}" from "${data.card_title}"`;

    case "checklist_added":
      return `added checklist "${data.checklist_title}" to "${data.card_title}"`;

    case "checklist_removed":
      return `removed checklist "${data.checklist_title}" from "${data.card_title}"`;

    case "checklist_item_completed":
      return `completed "${data.item_title}" in "${data.card_title}"`;

    case "checklist_item_uncompleted":
      return `uncompleted "${data.item_title}" in "${data.card_title}"`;

    case "attachment_added":
      return `attached "${data.file_name}" to "${data.card_title}"`;

    case "attachment_removed":
      return `removed attachment "${data.file_name}" from "${data.card_title}"`;

    case "due_date_set":
      return `set due date on "${data.card_title}"`;

    case "due_date_removed":
      return `removed due date from "${data.card_title}"`;

    default:
      return "performed an action";
  }
}
