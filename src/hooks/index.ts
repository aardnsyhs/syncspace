/**
 * Reusable Hooks
 *
 * Import hooks from here:
 * import { useDebounce, useLocalStorage, useTheme, useWorkspaceSocket } from "@/hooks";
 */

export { useDebounce } from "./useDebounce";
export { useLocalStorage } from "./useLocalStorage";
export { useOnClickOutside } from "./useOnClickOutside";
export { useTheme } from "./useTheme";
export { useWorkspaceSocket } from "./useWorkspaceSocket";
export type {
  SocketEventHandler,
  PresenceCallbacks,
  UseWorkspaceSocketReturn,
} from "./useWorkspaceSocket";
