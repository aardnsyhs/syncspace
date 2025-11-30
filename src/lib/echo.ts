import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Make Pusher available globally for Laravel Echo
declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<"pusher"> | null;
  }
}

window.Pusher = Pusher;
window.Echo = null;

let echoInstance: Echo<"pusher"> | null = null;

// Lazy initialization - only create Echo when authenticated
export function initializeEcho(): Echo<"pusher"> {
  if (echoInstance) {
    return echoInstance;
  }

  // For Ably with Pusher protocol, we need the full key for connection
  // Format: appKey.keyId:keySecret -> use appKey.keyId for Pusher key
  const ablyKey = import.meta.env.VITE_ABLY_KEY || "";
  const [keyPart] = ablyKey.split(":");

  echoInstance = new Echo({
    broadcaster: "pusher",
    key: keyPart,
    wsHost: "realtime-pusher.ably.io",
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    encrypted: true,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    cluster: "eu",
    authEndpoint: `${import.meta.env.VITE_API_URL}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    },
  });

  window.Echo = echoInstance;
  return echoInstance;
}

// Disconnect and cleanup Echo
export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    window.Echo = null;
  }
}

// Get current Echo instance (may be null if not authenticated)
export function getEcho(): Echo<"pusher"> | null {
  return echoInstance;
}

export default {
  get instance() {
    return echoInstance;
  },
};
