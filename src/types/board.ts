/**
 * Board and Column Types
 */

export interface Board {
  id: number;
  team_id: number;
  name: string;
  description?: string | null;
  color?: string | null;
  is_public?: boolean;
  public_token?: string | null;
  columns?: Column[];
  created_at: string;
  updated_at?: string;
}

export interface BoardSummary {
  id: number;
  name: string;
  description?: string | null;
  color?: string | null;
}

export interface Column {
  id: number;
  board_id: number;
  name: string;
  position: number;
  wip_limit?: number | null;
  cards: Card[];
}

export interface ColumnWithWip {
  id: number;
  name: string;
  position: number;
  wip_limit: number | null;
  card_count: number;
  wip_exceeded: boolean;
}

export interface Card {
  id: number;
  column_id: number;
  title: string;
  description?: string | null;
  position: number;
  assignee_id?: number | null;
  assignee?: import("./user").UserSummary | null;
  due_date?: string | null;
  is_completed?: boolean;
  completed_at?: string | null;
  labels?: Label[];
  created_at?: string;
  updated_at?: string;
}

export interface Label {
  id: number;
  board_id?: number;
  name: string;
  color: string;
}

export interface BoardTemplate {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  team_id: number | null;
  columns_data: Array<{
    name: string;
    position: number;
    wip_limit: number | null;
  }>;
  labels_data: Array<{
    name: string;
    color: string;
  }>;
  created_at: string;
}

export interface PublicBoardData {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  team: {
    id: number;
    name: string;
  };
  columns: Array<Column & { cards: Card[] }>;
  labels: Label[];
  generated_at: string;
}
