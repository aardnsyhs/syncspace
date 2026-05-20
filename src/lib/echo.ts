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
 */

import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { TOKEN_KEY } from "./constants";

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

function buildReverbConfig(): ConstructorParameters<typeof Echo>[0] {
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

function buildAblyConfig(): ConstructorParameters<typeof Echo>[0] {
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

export function initializeEcho(): Echo<"pusher"> {
  if (echoInstance) {
    return echoInstance;
  }

  const driver = import.meta.env.VITE_BROADCAST_DRIVER ?? "reverb";
  const driverConfig =
    driver === "ably" ? buildAblyConfig() : buildReverbConfig();

  echoInstance = new Echo({
    ...driverConfig,
    authEndpoint: `${import.meta.env.VITE_API_URL}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        Accept: "application/json",
      },
    },
  });

  window.Echo = echoInstance;
  return echoInstance;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    window.Echo = null;
  }
}

export function getEcho(): Echo<"pusher"> | null {
  return echoInstance;
}

export default {
  get instance() {
    return echoInstance;
  },
};
