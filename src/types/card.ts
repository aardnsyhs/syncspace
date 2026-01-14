/**
 * Card Detail Types
 * Extended card types with checklists, attachments, comments
 */

import type { Label } from "./board";
import type { UserSummary } from "./user";

export interface ChecklistItem {
  id: number;
  checklist_id: number;
  title: string;
  is_completed: boolean;
  position: number;
  completed_at: string | null;
}

export interface Checklist {
  id: number;
  card_id: number;
  title: string;
  position: number;
  items: ChecklistItem[];
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export interface Attachment {
  id: number;
  card_id: number;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  is_external: boolean;
  url: string;
  uploader: UserSummary;
  created_at: string;
}

export interface Comment {
  id: number;
  card_id: number;
  body: string;
  user: UserSummary;
  created_at: string;
  updated_at?: string;
}

export interface CardDetail {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  position: number;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  assignee: UserSummary | null;
  labels: Label[];
  checklists: Checklist[];
  attachments: Attachment[];
  comments_count?: number;
}

export interface Activity {
  id: number;
  board_id: number;
  card_id?: number | null;
  user: UserSummary;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}
