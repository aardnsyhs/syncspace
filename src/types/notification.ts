/**
 * Notification Types
 */

export type NotificationType =
  | "card_assigned"
  | "card_due_soon"
  | "card_overdue"
  | "card_commented"
  | "card_mentioned"
  | "team_invite"
  | "board_shared";

export interface Notification {
  id: string;
  type: NotificationType;
  data: {
    title: string;
    message: string;
    card_id?: number;
    board_id?: number;
    team_id?: number;
    action_url?: string;
  };
  read_at: string | null;
  created_at: string;
}

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}
