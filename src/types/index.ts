export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  owner_id: number;
  created_at: string;
}

export interface Board {
  id: number;
  workspace_id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Column {
  id: number;
  board_id: number;
  name: string;
  position: number;
  cards?: Card[];
}

export interface Card {
  id: number;
  column_id: number;
  title: string;
  description?: string;
  position: number;
  assignee_id?: number;
  due_date?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
