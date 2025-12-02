import { useEffect, useCallback } from "react";
import { getEcho, initializeEcho } from "@/lib/echo";
import {
  TEAM_EVENTS,
  type TeamEventPayload,
  type TeamDeletedPayload,
  type TeamMemberAddedPayload,
  type TeamMemberUpdatedPayload,
  type TeamMemberRemovedPayload,
  type BoardCreatedPayload,
  type BoardDeletedPayload,
} from "../types";

export interface TeamChannelCallbacks {
  onTeamUpdated?: (payload: TeamEventPayload) => void;
  onTeamDeleted?: (payload: TeamDeletedPayload) => void;
  onMemberAdded?: (payload: TeamMemberAddedPayload) => void;
  onMemberUpdated?: (payload: TeamMemberUpdatedPayload) => void;
  onMemberRemoved?: (payload: TeamMemberRemovedPayload) => void;
  onBoardCreated?: (payload: BoardCreatedPayload) => void;
  onBoardDeleted?: (payload: BoardDeletedPayload) => void;
}

export function useTeamChannel(
  teamId: number | null,
  callbacks: TeamChannelCallbacks
) {
  const {
    onTeamUpdated,
    onTeamDeleted,
    onMemberAdded,
    onMemberUpdated,
    onMemberRemoved,
    onBoardCreated,
    onBoardDeleted,
  } = callbacks;

  const subscribe = useCallback(() => {
    if (!teamId) return null;

    const echo = getEcho() || initializeEcho();
    const channel = echo.private(`team.${teamId}`);

    if (onTeamUpdated) {
      channel.listen(TEAM_EVENTS.TEAM_UPDATED, onTeamUpdated);
    }

    if (onTeamDeleted) {
      channel.listen(TEAM_EVENTS.TEAM_DELETED, onTeamDeleted);
    }

    if (onMemberAdded) {
      channel.listen(TEAM_EVENTS.TEAM_MEMBER_ADDED, onMemberAdded);
    }

    if (onMemberUpdated) {
      channel.listen(TEAM_EVENTS.TEAM_MEMBER_UPDATED, onMemberUpdated);
    }

    if (onMemberRemoved) {
      channel.listen(TEAM_EVENTS.TEAM_MEMBER_REMOVED, onMemberRemoved);
    }

    if (onBoardCreated) {
      channel.listen(TEAM_EVENTS.BOARD_CREATED, onBoardCreated);
    }

    if (onBoardDeleted) {
      channel.listen(TEAM_EVENTS.BOARD_DELETED, onBoardDeleted);
    }

    return channel;
  }, [
    teamId,
    onTeamUpdated,
    onTeamDeleted,
    onMemberAdded,
    onMemberUpdated,
    onMemberRemoved,
    onBoardCreated,
    onBoardDeleted,
  ]);

  useEffect(() => {
    subscribe();

    return () => {
      if (teamId) {
        const echo = getEcho();
        if (echo) {
          echo.leave(`team.${teamId}`);
        }
      }
    };
  }, [teamId, subscribe]);
}
