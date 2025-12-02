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
  type CommentDeletedPayload,
  type LabelCreatedPayload,
  type LabelUpdatedPayload,
  type LabelDeletedPayload,
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
  onCommentDeleted?: (payload: CommentDeletedPayload) => void;
  onLabelCreated?: (payload: LabelCreatedPayload) => void;
  onLabelUpdated?: (payload: LabelUpdatedPayload) => void;
  onLabelDeleted?: (payload: LabelDeletedPayload) => void;
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
    onCommentDeleted,
    onLabelCreated,
    onLabelUpdated,
    onLabelDeleted,
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

    if (onCommentDeleted) {
      channel.listen(BOARD_EVENTS.COMMENT_DELETED, onCommentDeleted);
    }

    if (onLabelCreated) {
      channel.listen(BOARD_EVENTS.LABEL_CREATED, onLabelCreated);
    }

    if (onLabelUpdated) {
      channel.listen(BOARD_EVENTS.LABEL_UPDATED, onLabelUpdated);
    }

    if (onLabelDeleted) {
      channel.listen(BOARD_EVENTS.LABEL_DELETED, onLabelDeleted);
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
    onCommentDeleted,
    onLabelCreated,
    onLabelUpdated,
    onLabelDeleted,
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
