export interface Label {
  id: number;
  board_id: number;
  name: string;
  color: string;
}

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
  uploader: {
    id: number;
    name: string;
    avatar_url?: string;
  };
  created_at: string;
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
  assignee: {
    id: number;
    name: string;
    avatar_url?: string;
  } | null;
  labels: Label[];
  checklists: Checklist[];
  attachments: Attachment[];
  comments_count?: number;
}
