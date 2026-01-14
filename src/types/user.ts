/**
 * User Types
 */

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  email_verified_at?: string | null;
  notification_preferences?: NotificationPreferences;
  created_at: string;
  updated_at?: string;
}

export interface NotificationPreferences {
  email_card_assigned: boolean;
  email_card_due_soon: boolean;
  email_mentioned: boolean;
  email_card_moved: boolean;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

/** Compact user info for assignments, comments, etc. */
export interface UserSummary {
  id: number;
  name: string;
  avatar_url?: string;
}
