/**
 * useWorkspaceSocket
 * ==================
 * A fully-typed, generic abstraction over Laravel Echo that all real-time
 * hooks in this codebase consume. It provides a stable, lifecycle-safe API
 * for subscribing to private and presence channels.
 *
 * ─── Why this exists ────────────────────────────────────────────────────────
 * Previously every hook called `getEcho() || initializeEcho()` independently.
 * That pattern has two problems:
 *   1. Hooks could race to initialise Echo before AuthContext had stored the
 *      token, resulting in unauthenticated WebSocket connections.
 *   2. There was no single place to observe the connection state.
 *
 * This hook solves both by:
 *   - Only returning a channel when Echo is already initialised (by AuthContext).
 *   - Providing `subscribe` / `leave` helpers that are safe to call from
 *     cleanup functions even after the Echo instance has been destroyed.
 *
 * ─── Usage ──────────────────────────────────────────────────────────────────
 *
 * // 1. Subscribe to a private channel
 * const { subscribePrivate, leave } = useWorkspaceSocket();
 *
 * useEffect(() => {
 *   const channel = subscribePrivate<MyPayload>(
 *     `board.${boardId}`,
 *     ".MyEvent",
 *     (payload) => console.log(payload)
 *   );
 *   return () => leave(`board.${boardId}`);
 * }, [boardId]);
 *
 * // 2. Subscribe to a presence channel
 * const { joinPresence, leave } = useWorkspaceSocket();
 *
 * useEffect(() => {
 *   joinPresence<Member>(
 *     `presence-board.${boardId}`,
 *     { here: setMembers, joining: addMember, leaving: removeMember }
 *   );
 *   return () => leave(`presence-board.${boardId}`);
 * }, [boardId]);
 */

import { useCallback } from "react";
import { getEcho } from "@/lib/echo";
import type Echo from "laravel-echo";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A handler function for a single WebSocket event. */
export type SocketEventHandler<TPayload = unknown> = (
  payload: TPayload
) => void;

/**
 * Callbacks for a presence channel.
 * All three are optional — supply only the ones you need.
 */
export interface PresenceCallbacks<TMember> {
  /** Called once with the full list of currently-online members. */
  here?: (members: TMember[]) => void;
  /** Called when a new member joins. */
  joining?: (member: TMember) => void;
  /** Called when a member leaves. */
  leaving?: (member: TMember) => void;
  /** Called on channel auth / connection errors. */
  error?: (err: Error) => void;
}

/** Return type of the hook. */
export interface UseWorkspaceSocketReturn {
  /**
   * Subscribe to a single event on a private channel.
   *
   * @param channelName - Channel name WITHOUT the "private-" prefix.
   *                      E.g. `"board.42"` not `"private-board.42"`.
   * @param eventName   - Dot-prefixed event name as broadcast by Laravel.
   *                      E.g. `".CardMoved"`.
   * @param handler     - Typed callback invoked on each event.
   * @returns The Echo channel instance, or null if Echo is not yet ready.
   *
   * @example
   * subscribePrivate<CardMovedPayload>("board.1", ".CardMoved", (p) => ...)
   */
  subscribePrivate: <TPayload>(
    channelName: string,
    eventName: string,
    handler: SocketEventHandler<TPayload>
  ) => ReturnType<Echo<"pusher">["private"]> | null;

  /**
   * Subscribe to multiple events on the same private channel in one call.
   * More efficient than calling `subscribePrivate` repeatedly for the same
   * channel because Echo reuses the underlying subscription.
   *
   * @param channelName - Channel name WITHOUT the "private-" prefix.
   * @param events      - Map of event name → typed handler.
   * @returns The Echo channel instance, or null if Echo is not yet ready.
   *
   * @example
   * subscribePrivateMany("board.1", {
   *   ".CardMoved":   (p: CardMovedPayload)   => ...,
   *   ".CardCreated": (p: CardEventPayload)   => ...,
   * })
   */
  subscribePrivateMany: (
    channelName: string,
    events: Record<string, SocketEventHandler>
  ) => ReturnType<Echo<"pusher">["private"]> | null;

  /**
   * Join a presence channel and register member lifecycle callbacks.
   *
   * @param channelName - Channel name WITHOUT the "presence-" prefix.
   *                      E.g. `"board.42"` — Echo will prepend "presence-".
   * @param callbacks   - `here`, `joining`, `leaving`, `error` handlers.
   * @returns The Echo presence channel instance, or null if Echo is not ready.
   *
   * @example
   * joinPresence<PresenceMember>("board.1", {
   *   here:    (members) => setMembers(members),
   *   joining: (member)  => addMember(member),
   *   leaving: (member)  => removeMember(member),
   * })
   */
  joinPresence: <TMember>(
    channelName: string,
    callbacks: PresenceCallbacks<TMember>
  ) => ReturnType<Echo<"pusher">["join"]> | null;

  /**
   * Leave a channel by name. Safe to call even if Echo has been destroyed
   * (e.g. during logout cleanup). Handles both private and presence channels.
   *
   * @param channelName - The bare channel name used when subscribing.
   *                      E.g. `"board.42"` or `"presence-board.42"`.
   */
  leave: (channelName: string) => void;

  /**
   * Whether the Echo singleton is currently initialised.
   * Useful for conditional rendering of "connecting…" states.
   */
  isReady: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns a stable set of WebSocket helpers backed by the shared Echo
 * singleton. All methods are safe to call from `useEffect` cleanup functions.
 *
 * The hook does NOT initialise Echo — that is AuthContext's responsibility.
 * If Echo is not yet ready, `subscribePrivate`, `subscribePrivateMany`, and
 * `joinPresence` return `null` and are no-ops.
 */
export function useWorkspaceSocket(): UseWorkspaceSocketReturn {
  const subscribePrivate = useCallback(
    <TPayload>(
      channelName: string,
      eventName: string,
      handler: SocketEventHandler<TPayload>
    ) => {
      const echo = getEcho();
      if (!echo) return null;

      const channel = echo.private(channelName);
      channel.listen(eventName, handler as SocketEventHandler);
      return channel;
    },
    []
  );

  const subscribePrivateMany = useCallback(
    (
      channelName: string,
      events: Record<string, SocketEventHandler>
    ) => {
      const echo = getEcho();
      if (!echo) return null;

      const channel = echo.private(channelName);
      Object.entries(events).forEach(([eventName, handler]) => {
        channel.listen(eventName, handler);
      });
      return channel;
    },
    []
  );

  const joinPresence = useCallback(
    <TMember>(
      channelName: string,
      callbacks: PresenceCallbacks<TMember>
    ) => {
      const echo = getEcho();
      if (!echo) return null;

      // Echo's join() prepends "presence-" internally.
      const channel = echo.join(channelName);

      if (callbacks.here) {
        channel.here(callbacks.here as (members: object[]) => void);
      }
      if (callbacks.joining) {
        channel.joining(callbacks.joining as (member: object) => void);
      }
      if (callbacks.leaving) {
        channel.leaving(callbacks.leaving as (member: object) => void);
      }
      if (callbacks.error) {
        channel.error(callbacks.error);
      }

      return channel;
    },
    []
  );

  const leave = useCallback((channelName: string) => {
    const echo = getEcho();
    if (!echo) return;
    try {
      echo.leave(channelName);
    } catch {
      // Silently ignore — Echo may have already been disconnected on logout.
    }
  }, []);

  return {
    subscribePrivate,
    subscribePrivateMany,
    joinPresence,
    leave,
    isReady: getEcho() !== null,
  };
}
