import { useEffect, useCallback } from "react";
import echo from "@/lib/echo";
import {
  BOARD_EVENTS,
  type BoardEventPayload,
  type ColumnEventPayload,
  type ColumnDeletedPayload,
  type CardEventPayload,
  type CardDeletedPayload,
  type CardMovedPayload,
  type CommentCreatedPayload,
} from "../types";

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
}

export function useBoardChannel(
  boardId: number | null,
  callbacks: BoardChannelCallbacks
) {
  const {
    onBoardUpdated,
    onColumnCreated,
    onColumnUpdated,
    onColumnDeleted,
    onCardCreated,
    onCardUpdated,
    onCardDeleted,
    onCardMoved,
    onCommentCreated,
  } = callbacks;

  // Memoize the subscribe function
  const subscribe = useCallback(() => {
    if (!boardId) return null;

    const channel = echo.private(`board.${boardId}`);

    // Board events
    if (onBoardUpdated) {
      channel.listen(BOARD_EVENTS.BOARD_UPDATED, onBoardUpdated);
    }

    // Column events
    if (onColumnCreated) {
      channel.listen(BOARD_EVENTS.COLUMN_CREATED, onColumnCreated);
    }
    if (onColumnUpdated) {
      channel.listen(BOARD_EVENTS.COLUMN_UPDATED, onColumnUpdated);
    }
    if (onColumnDeleted) {
      channel.listen(BOARD_EVENTS.COLUMN_DELETED, onColumnDeleted);
    }

    // Card events
    if (onCardCreated) {
      channel.listen(BOARD_EVENTS.CARD_CREATED, onCardCreated);
    }
    if (onCardUpdated) {
      channel.listen(BOARD_EVENTS.CARD_UPDATED, onCardUpdated);
    }
    if (onCardDeleted) {
      channel.listen(BOARD_EVENTS.CARD_DELETED, onCardDeleted);
    }
    if (onCardMoved) {
      channel.listen(BOARD_EVENTS.CARD_MOVED, onCardMoved);
    }

    // Comment events
    if (onCommentCreated) {
      channel.listen(BOARD_EVENTS.COMMENT_CREATED, onCommentCreated);
    }

    return channel;
  }, [
    boardId,
    onBoardUpdated,
    onColumnCreated,
    onColumnUpdated,
    onColumnDeleted,
    onCardCreated,
    onCardUpdated,
    onCardDeleted,
    onCardMoved,
    onCommentCreated,
  ]);

  useEffect(() => {
    subscribe();

    // Cleanup: unsubscribe when component unmounts or boardId changes
    return () => {
      if (boardId) {
        echo.leave(`board.${boardId}`);
      }
    };
  }, [boardId, subscribe]);
}
