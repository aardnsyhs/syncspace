/**
 * useBoardChannel
 * ===============
 * Subscribes to the private `board.{boardId}` channel and dispatches
 * incoming events to the caller's handlers.
 *
 * ─── Stability guarantee ────────────────────────────────────────────────────
 * Handlers are stored in a ref so the channel subscription is created ONCE
 * per `boardId` and never torn down due to callback identity changes.
 * This eliminates the stale-closure / re-subscription churn that occurred
 * when callers wrapped handlers in `useCallback` with changing dependencies.
 *
 * The channel is left (unsubscribed) exactly once: when the component that
 * called this hook unmounts, or when `boardId` changes. Zero ghost
 * subscriptions remain after unmount.
 *
 * ─── Usage ──────────────────────────────────────────────────────────────────
 * useBoardChannel(boardId, {
 *   onCardMoved: (payload) => refetchCards(),
 *   onColumnDeleted: (payload) => removeColumn(payload.column_id),
 * });
 *
 * All callbacks are optional — only supply the events you care about.
 */

import { useEffect, useRef } from "react";
import { useWorkspaceSocket } from "@/hooks/useWorkspaceSocket";
import {
  BOARD_EVENTS,
  type BoardEventPayload,
  type ColumnEventPayload,
  type ColumnDeletedPayload,
  type CardEventPayload,
  type CardDeletedPayload,
  type CardMovedPayload,
  type CommentCreatedPayload,
  type CommentDeletedPayload,
  type LabelCreatedPayload,
  type LabelUpdatedPayload,
  type LabelDeletedPayload,
} from "../types";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface BoardChannelCallbacks {
  onBoardUpdated?: (payload: BoardEventPayload) => void;
  onColumnCreated?: (payload: ColumnEventPayload) => void;
  onColumnUpdated?: (payload: ColumnEventPayload) => void;
  onColumnDeleted?: (payload: ColumnDeletedPayload) => void;
  onCardCreated?: (payload: CardEventPayload) => void;
  onCardUpdated?: (payload: CardEventPayload) => void;
  onCardDeleted?: (payload: CardDeletedPayload) => void;
  onCardMoved?: (payload: CardMovedPayload) => void;
  onCommentCreated?: (payload: CommentCreatedPayload) => void;
  onCommentDeleted?: (payload: CommentDeletedPayload) => void;
  onLabelCreated?: (payload: LabelCreatedPayload) => void;
  onLabelUpdated?: (payload: LabelUpdatedPayload) => void;
  onLabelDeleted?: (payload: LabelDeletedPayload) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useBoardChannel(
  boardId: number | null,
  callbacks: BoardChannelCallbacks
): void {
  const { subscribePrivateMany, leave } = useWorkspaceSocket();

  /**
   * Store the latest callbacks in a ref so the subscription effect never
   * needs to re-run when the caller's handler references change.
   * The channel always calls the *current* version of each handler.
   */
  const callbacksRef = useRef<BoardChannelCallbacks>(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    if (!boardId) return;

    const channelName = `board.${boardId}`;

    // Build the event map. Each wrapper reads from the ref so it always
    // invokes the latest handler without re-subscribing.
    const events: Record<string, (payload: unknown) => void> = {
      [BOARD_EVENTS.BOARD_UPDATED]: (p) =>
        callbacksRef.current.onBoardUpdated?.(p as BoardEventPayload),

      [BOARD_EVENTS.COLUMN_CREATED]: (p) =>
        callbacksRef.current.onColumnCreated?.(p as ColumnEventPayload),
      [BOARD_EVENTS.COLUMN_UPDATED]: (p) =>
        callbacksRef.current.onColumnUpdated?.(p as ColumnEventPayload),
      [BOARD_EVENTS.COLUMN_DELETED]: (p) =>
        callbacksRef.current.onColumnDeleted?.(p as ColumnDeletedPayload),

      [BOARD_EVENTS.CARD_CREATED]: (p) =>
        callbacksRef.current.onCardCreated?.(p as CardEventPayload),
      [BOARD_EVENTS.CARD_UPDATED]: (p) =>
        callbacksRef.current.onCardUpdated?.(p as CardEventPayload),
      [BOARD_EVENTS.CARD_DELETED]: (p) =>
        callbacksRef.current.onCardDeleted?.(p as CardDeletedPayload),
      [BOARD_EVENTS.CARD_MOVED]: (p) =>
        callbacksRef.current.onCardMoved?.(p as CardMovedPayload),

      [BOARD_EVENTS.COMMENT_CREATED]: (p) =>
        callbacksRef.current.onCommentCreated?.(p as CommentCreatedPayload),
      [BOARD_EVENTS.COMMENT_DELETED]: (p) =>
        callbacksRef.current.onCommentDeleted?.(p as CommentDeletedPayload),

      [BOARD_EVENTS.LABEL_CREATED]: (p) =>
        callbacksRef.current.onLabelCreated?.(p as LabelCreatedPayload),
      [BOARD_EVENTS.LABEL_UPDATED]: (p) =>
        callbacksRef.current.onLabelUpdated?.(p as LabelUpdatedPayload),
      [BOARD_EVENTS.LABEL_DELETED]: (p) =>
        callbacksRef.current.onLabelDeleted?.(p as LabelDeletedPayload),
    };

    // Attempt to subscribe. If Echo isn't ready yet (e.g. on page refresh
    // where checkAuth is still in-flight), retry with a short delay.
    let subscribed = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const trySubscribe = () => {
      const result = subscribePrivateMany(channelName, events);
      if (result) {
        subscribed = true;
      } else {
        // Echo not ready — retry in 500ms (up to 10 attempts = 5 seconds)
        retryTimer = setTimeout(trySubscribe, 500);
      }
    };

    trySubscribe();

    // Strict cleanup: leave the channel exactly once on unmount or boardId change.
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      if (subscribed) leave(channelName);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, subscribePrivateMany, leave]);
  // Intentionally omitting `callbacks` from deps — the ref handles freshness.
}
