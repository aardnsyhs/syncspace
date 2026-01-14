/**
 * Realtime Event Payload Types
 * Used with Laravel Echo / Ably broadcasting
 */

import type { Card, Column, Label } from "./board";
import type { UserSummary } from "./user";

// Board Events
export interface BoardEventPayload {
  board: {
    id: number;
    name: string;
    description?: string;
    color?: string;
  };
}

// Column Events
export interface ColumnEventPayload {
  column: Column;
}

export interface ColumnDeletedPayload {
  column_id: number;
}

// Card Events
export interface CardEventPayload {
  card: Card & {
    labels: Array<{
      id: number;
      name: string;
      color: string;
      board_id?: number;
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

// Comment Events
export interface CommentCreatedPayload {
  comment: {
    id: number;
    body: string;
    user: UserSummary;
    created_at: string;
  };
  card_id: number;
}

export interface CommentDeletedPayload {
  card_id: number;
  comment_id: number;
}

// Label Events
export interface LabelCreatedPayload {
  label: Label;
}

export interface LabelUpdatedPayload {
  label: Label;
}

export interface LabelDeletedPayload {
  label_id: number;
}

// Activity Events
export interface ActivityCreatedPayload {
  activity: {
    id: number;
    action: string;
    description: string;
    user: UserSummary;
    created_at: string;
  };
}

// Team Events
export interface TeamEventPayload {
  team: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface TeamMemberAddedPayload {
  member: UserSummary & { email: string };
  role: string;
}

export interface TeamMemberUpdatedPayload {
  member: UserSummary & { email: string };
  new_role: string;
}

export interface TeamMemberRemovedPayload {
  user_id: number;
}

export interface TeamDeletedPayload {
  team_id: number;
}

export interface BoardCreatedPayload {
  board: {
    id: number;
    name: string;
    description: string | null;
    color: string | null;
  };
}

export interface BoardDeletedPayload {
  board_id: number;
}

// Event name constants
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
  COMMENT_DELETED: ".CommentDeleted",
  LABEL_CREATED: ".LabelCreated",
  LABEL_UPDATED: ".LabelUpdated",
  LABEL_DELETED: ".LabelDeleted",
  ACTIVITY_CREATED: ".ActivityCreated",
} as const;

export const TEAM_EVENTS = {
  TEAM_UPDATED: ".TeamUpdated",
  TEAM_DELETED: ".TeamDeleted",
  TEAM_MEMBER_ADDED: ".TeamMemberAdded",
  TEAM_MEMBER_UPDATED: ".TeamMemberUpdated",
  TEAM_MEMBER_REMOVED: ".TeamMemberRemoved",
  BOARD_CREATED: ".BoardCreated",
  BOARD_DELETED: ".BoardDeleted",
} as const;
