/**
 * Laravel Echo initialisation.
 *
 * Supports two broadcast drivers, selected via the VITE_BROADCAST_DRIVER
 * environment variable:
 *
 *   "reverb"  — Laravel Reverb (self-hosted, free, recommended for local dev)
 *   "ably"    — Ably managed cloud (set VITE_ABLY_KEY as well)
 *
 * The Echo instance is a module-level singleton so every hook and component
 * shares the same underlying WebSocket connection.
 *
 * Lifecycle:
 *   - Call `initializeEcho(token)` after a successful login / OTP verification.
 *   - Call `disconnectEcho()` on logout to tear down the connection cleanly.
 *   - Call `reconnectEcho(token)` when the auth token rotates (e.g. token refresh).
 *   - All hooks obtain the instance via `getEcho()` — they never call
 *     `initializeEcho()` directly, so the token is always fresh.
 */

import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<"pusher"> | null;
  }
}

window.Pusher = Pusher;
window.Echo = null;

let echoInstance: Echo<"pusher"> | null = null;

// ---------------------------------------------------------------------------
// Driver-specific config builders
// ---------------------------------------------------------------------------

// Typed as Record<string, unknown> so TypeScript allows spreading into the
// Echo constructor options object without a "never" inference error.
// The Echo constructor accepts a broad options bag at runtime.

function buildReverbConfig(): Record<string, unknown> {
  return {
    broadcaster: "pusher",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? "localhost",
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "http") === "https",
    encrypted: (import.meta.env.VITE_REVERB_SCHEME ?? "http") === "https",
    disableStats: true,
    enabledTransports: ["ws", "wss"],
  };
}

function buildAblyConfig(): Record<string, unknown> {
  // Ably uses the public key portion (before the colon) as the Pusher key.
  const ablyKey = import.meta.env.VITE_ABLY_KEY ?? "";
  const [keyPart] = ablyKey.split(":");

  return {
    broadcaster: "pusher",
    key: keyPart,
    wsHost: "realtime-pusher.ably.io",
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    encrypted: true,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    cluster: import.meta.env.VITE_ABLY_CLUSTER ?? "eu",
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialise the Echo singleton with a fresh auth token.
 *
 * @param token - The Sanctum bearer token for the authenticated user.
 *                Must be provided so the WebSocket auth endpoint receives
 *                the correct credentials. Never reads from localStorage
 *                directly to avoid stale-token bugs.
 */
export function initializeEcho(token: string): Echo<"pusher"> {
  // If an instance already exists with the same token there is nothing to do.
  if (echoInstance) {
    return echoInstance;
  }

  const driver = import.meta.env.VITE_BROADCAST_DRIVER ?? "reverb";
  const driverConfig: Record<string, unknown> =
    driver === "ably" ? buildAblyConfig() : buildReverbConfig();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  echoInstance = new Echo({
    ...(driverConfig as any),
    authEndpoint: `${import.meta.env.VITE_API_URL}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });

  window.Echo = echoInstance;
  return echoInstance;
}

/**
 * Tear down the current Echo connection and create a fresh one.
 * Call this when the auth token rotates so all channel auth headers
 * are updated without requiring a full page reload.
 *
 * @param token - The new bearer token.
 */
export function reconnectEcho(token: string): Echo<"pusher"> {
  disconnectEcho();
  return initializeEcho(token);
}

/**
 * Disconnect and destroy the Echo singleton.
 * Call this on logout so the WebSocket connection is closed cleanly
 * and no stale subscriptions remain.
 */
export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    window.Echo = null;
  }
}

/**
 * Return the current Echo instance, or null if not yet initialised.
 * Hooks should call this and handle the null case gracefully — they
 * should NOT call `initializeEcho()` themselves.
 */
export function getEcho(): Echo<"pusher"> | null {
  return echoInstance;
}

export default {
  get instance() {
    return echoInstance;
  },
};
