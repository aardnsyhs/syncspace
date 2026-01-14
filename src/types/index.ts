/**
 * Centralized Type Exports
 *
 * Import types from here instead of feature-specific files:
 * import type { User, Board, Card } from "@/types";
 */

// API Types
export type { ApiResponse, PaginatedResponse, ApiError } from "./api";

// User Types
export type {
  User,
  UserProfile,
  UserSummary,
  NotificationPreferences,
} from "./user";

// Team Types
export type {
  Team,
  TeamMember,
  TeamWithRole,
  TeamInvite,
  TeamRole,
} from "./team";

// Board Types
export type {
  Board,
  BoardSummary,
  Column,
  ColumnWithWip,
  Card,
  Label,
  BoardTemplate,
  PublicBoardData,
} from "./board";

// Card Detail Types
export type {
  CardDetail,
  Checklist,
  ChecklistItem,
  Attachment,
  Comment,
  Activity,
} from "./card";

// Notification Types
export type {
  Notification,
  NotificationGroup,
  NotificationType,
} from "./notification";

// Event Types
export type {
  BoardEventPayload,
  ColumnEventPayload,
  ColumnDeletedPayload,
  CardEventPayload,
  CardDeletedPayload,
  CardMovedPayload,
  CommentCreatedPayload,
  CommentDeletedPayload,
  LabelCreatedPayload,
  LabelUpdatedPayload,
  LabelDeletedPayload,
  ActivityCreatedPayload,
  TeamEventPayload,
  TeamMemberAddedPayload,
  TeamMemberUpdatedPayload,
  TeamMemberRemovedPayload,
  TeamDeletedPayload,
  BoardCreatedPayload,
  BoardDeletedPayload,
} from "./events";

// Event Constants
export { BOARD_EVENTS, TEAM_EVENTS } from "./events";
