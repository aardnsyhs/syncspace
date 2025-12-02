export interface TeamEventPayload {
  team: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface TeamMemberAddedPayload {
  member: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
  };
  role: string;
}

export interface TeamMemberUpdatedPayload {
  member: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
  };
  new_role: string;
}

export interface TeamMemberRemovedPayload {
  user_id: number;
}

export interface TeamDeletedPayload {
  team_id: number;
}

export interface BoardDeletedPayload {
  board_id: number;
}

export interface BoardCreatedPayload {
  board: {
    id: number;
    name: string;
    description: string | null;
    color: string | null;
  };
}

export const TEAM_EVENTS = {
  TEAM_UPDATED: ".TeamUpdated",
  TEAM_DELETED: ".TeamDeleted",
  TEAM_MEMBER_ADDED: ".TeamMemberAdded",
  TEAM_MEMBER_UPDATED: ".TeamMemberUpdated",
  TEAM_MEMBER_REMOVED: ".TeamMemberRemoved",
  BOARD_CREATED: ".BoardCreated",
  BOARD_DELETED: ".BoardDeleted",
} as const;
