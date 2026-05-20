/**
 * useTeamChannel
 * ==============
 * Subscribes to the private `team.{teamId}` channel.
 * Uses the same `useRef` stability pattern as `useBoardChannel` to prevent
 * re-subscription churn when callback references change.
 */

import { useEffect, useRef } from "react";
import { useWorkspaceSocket } from "@/hooks/useWorkspaceSocket";
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
): void {
  const { subscribePrivateMany, leave } = useWorkspaceSocket();

  const callbacksRef = useRef<TeamChannelCallbacks>(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    if (!teamId) return;

    const channelName = `team.${teamId}`;

    const events: Record<string, (payload: unknown) => void> = {
      [TEAM_EVENTS.TEAM_UPDATED]: (p) =>
        callbacksRef.current.onTeamUpdated?.(p as TeamEventPayload),
      [TEAM_EVENTS.TEAM_DELETED]: (p) =>
        callbacksRef.current.onTeamDeleted?.(p as TeamDeletedPayload),
      [TEAM_EVENTS.TEAM_MEMBER_ADDED]: (p) =>
        callbacksRef.current.onMemberAdded?.(p as TeamMemberAddedPayload),
      [TEAM_EVENTS.TEAM_MEMBER_UPDATED]: (p) =>
        callbacksRef.current.onMemberUpdated?.(p as TeamMemberUpdatedPayload),
      [TEAM_EVENTS.TEAM_MEMBER_REMOVED]: (p) =>
        callbacksRef.current.onMemberRemoved?.(p as TeamMemberRemovedPayload),
      [TEAM_EVENTS.BOARD_CREATED]: (p) =>
        callbacksRef.current.onBoardCreated?.(p as BoardCreatedPayload),
      [TEAM_EVENTS.BOARD_DELETED]: (p) =>
        callbacksRef.current.onBoardDeleted?.(p as BoardDeletedPayload),
    };

    subscribePrivateMany(channelName, events);

    return () => {
      leave(channelName);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, subscribePrivateMany, leave]);
}
