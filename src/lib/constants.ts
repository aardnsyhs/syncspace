/**
 * Application-wide constants.
 *
 * All localStorage keys, magic strings, and tuneable defaults live here so
 * buyers can change them in a single place without hunting through the codebase.
 */

// ---------------------------------------------------------------------------
// localStorage keys
// ---------------------------------------------------------------------------

/** Bearer token returned by the API after login / OTP verification. */
export const TOKEN_KEY = "token";

/**
 * Persists the last-selected workspace (team) ID across page reloads.
 * Change this string if you rename the concept of "workspace" in your product.
 */
export const SELECTED_WORKSPACE_KEY = "app_selected_workspace_id";

// ---------------------------------------------------------------------------
// TanStack Query defaults
// ---------------------------------------------------------------------------

/** How long (ms) cached server data is considered fresh before a background refetch. */
export const QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutes

/** How long (ms) inactive query data is kept in the cache before garbage collection. */
export const QUERY_GC_TIME = 10 * 60 * 1000; // 10 minutes

// ---------------------------------------------------------------------------
// UI / UX defaults
// ---------------------------------------------------------------------------

/** Debounce delay (ms) for search / filter inputs. */
export const FILTER_DEBOUNCE_MS = 300;

/** Maximum number of notifications fetched per request. */
export const NOTIFICATIONS_FETCH_LIMIT = 20;

/** Default application theme. Options: "light" | "dark" | "system" */
export const DEFAULT_THEME = "dark" as const;
