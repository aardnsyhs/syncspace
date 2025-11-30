export interface BoardEventPayload {
  board: {
    id: number;
    name: string;
    description?: string;
    color?: string;
  };
}

export interface ColumnEventPayload {
  column: {
    id: number;
    board_id: number;
    name: string;
    position: number;
  };
}

export interface ColumnDeletedPayload {
  column_id: number;
}

export interface CardEventPayload {
  card: {
    id: number;
    column_id: number;
    title: string;
    description?: string;
    position: number;
    assignee_id?: number;
    assignee?: {
      id: number;
      name: string;
      avatar_url?: string;
    };
    due_date?: string;
    labels: Array<{
      id: number;
      name: string;
      color: string;
    }>;
  };
  column_id?: number; 
}

export interface CardDeletedPayload {
  card_id: number;
  column_id: number;
}

export interface CardMovedPayload {
  card: CardEventPayload["card"];
  from_column_id: number;
  to_column_id: number;
  position: number;
}

export interface CommentCreatedPayload {
  comment: {
    id: number;
    body: string;
    user: {
      id: number;
      name: string;
      avatar_url?: string;
    };
    created_at: string;
  };
  card_id: number;
}

export const BOARD_EVENTS = {
  BOARD_UPDATED: ".BoardUpdated",
  COLUMN_CREATED: ".ColumnCreated",
  COLUMN_UPDATED: ".ColumnUpdated",
  COLUMN_DELETED: ".ColumnDeleted",
  CARD_CREATED: ".CardCreated",
  CARD_UPDATED: ".CardUpdated",
  CARD_DELETED: ".CardDeleted",
  CARD_MOVED: ".CardMoved",
  COMMENT_CREATED: ".CommentCreated",
  ACTIVITY_CREATED: ".ActivityCreated",
} as const;
