import Echo from "laravel-echo";
import Pusher from "pusher-js";

interface AuthData {
  auth: string;
  channel_data?: string;
}

// Make Pusher available globally for Laravel Echo
declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<"reverb"> | null;
  }
}

window.Pusher = Pusher;
window.Echo = null;

let echoInstance: Echo<"reverb"> | null = null;

// Lazy initialization - only create Echo when authenticated
export function initializeEcho(): Echo<"reverb"> {
  if (echoInstance) {
    return echoInstance;
  }

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
    enabledTransports: ["ws", "wss"],
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
export function getEcho(): Echo<"reverb"> | null {
  return echoInstance;
}

// For backward compatibility - but prefer using initializeEcho
export default {
  get instance() {
    return echoInstance;
  },
};
