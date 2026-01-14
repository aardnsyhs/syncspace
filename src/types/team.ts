/**
 * Team Types
 */

import type { UserSummary } from "./user";

export type TeamRole = "owner" | "admin" | "member" | "viewer";

export interface Team {
  id: number;
  name: string;
  slug: string;
  owner_id: number;
  owner?: UserSummary;
  created_at: string;
  updated_at?: string;
  members_count?: number;
  boards_count?: number;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  role: TeamRole;
  joined_at?: string;
}

export interface TeamWithRole extends Team {
  pivot: {
    role: TeamRole;
  };
}

export interface TeamInvite {
  email: string;
  role: TeamRole;
}
