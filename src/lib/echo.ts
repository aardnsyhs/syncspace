import Echo from "laravel-echo";
import Pusher from "pusher-js";

interface AuthData {
  auth: string;
  channel_data?: string;
}

// Make Pusher available globally for Laravel Echo (Ably uses Pusher protocol)
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

  // Ably uses Pusher protocol adapter
  // Key format: appKey.clientId (we only need the appKey part for client)
  const ablyKey = import.meta.env.VITE_ABLY_KEY || "";
  const appKey = ablyKey.split(":")[0]; // Get the public part before ":"

  echoInstance = new Echo({
    broadcaster: "pusher",
    key: appKey,
    wsHost: "realtime-pusher.ably.io",
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    encrypted: true,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    cluster: "eu", // Ably ignores this but Pusher requires it
    authEndpoint: `${import.meta.env.VITE_API_URL}/api/broadcasting/auth`,
    authorizer: (channel: { name: string }) => ({
      authorize: (
        socketId: string,
        callback: (error: Error | null, data: AuthData | null) => void
      ) => {
        const token = localStorage.getItem("token");
        fetch(`${import.meta.env.VITE_API_URL}/api/broadcasting/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Socket-ID": socketId,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Unauthorized");
            }
            return response.json();
          })
          .then((data: AuthData) => callback(null, data))
          .catch((error) =>
            callback(
              error instanceof Error ? error : new Error(String(error)),
              null
            )
          );
      },
    }),
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

// For backward compatibility - but prefer using initializeEcho
export default {
  get instance() {
    return echoInstance;
  },
};
