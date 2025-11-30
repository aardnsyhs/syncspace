import { useEffect, useCallback } from "react";
import { getEcho, initializeEcho } from "@/lib/echo";
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

  const subscribe = useCallback(() => {
    if (!boardId) return null;

    const echo = getEcho() || initializeEcho();
    const channel = echo.private(`board.${boardId}`);

    if (onBoardUpdated) {
      channel.listen(BOARD_EVENTS.BOARD_UPDATED, onBoardUpdated);
    }

    if (onColumnCreated) {
      channel.listen(BOARD_EVENTS.COLUMN_CREATED, onColumnCreated);
    }
    if (onColumnUpdated) {
      channel.listen(BOARD_EVENTS.COLUMN_UPDATED, onColumnUpdated);
    }
    if (onColumnDeleted) {
      channel.listen(BOARD_EVENTS.COLUMN_DELETED, onColumnDeleted);
    }

    if (onCardCreated) {
      channel.listen(BOARD_EVENTS.CARD_CREATED, (payload: CardEventPayload) => {
        onCardCreated(payload);
      });
    }
    if (onCardUpdated) {
      channel.listen(BOARD_EVENTS.CARD_UPDATED, (payload: CardEventPayload) => {
        onCardUpdated(payload);
      });
    }
    if (onCardDeleted) {
      channel.listen(
        BOARD_EVENTS.CARD_DELETED,
        (payload: CardDeletedPayload) => {
          onCardDeleted(payload);
        }
      );
    }
    if (onCardMoved) {
      channel.listen(BOARD_EVENTS.CARD_MOVED, (payload: CardMovedPayload) => {
        onCardMoved(payload);
      });
    }

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

    return () => {
      if (boardId) {
        const echo = getEcho();
        if (echo) {
          echo.leave(`board.${boardId}`);
        }
      }
    };
  }, [boardId, subscribe]);
}
