import Echo from "laravel-echo";
import * as Ably from "ably";

interface AuthData {
  auth: string;
  channel_data?: string;
}

// Make Ably available globally for Laravel Echo
declare global {
  interface Window {
    Ably: typeof Ably;
    Echo: Echo<"ably"> | null;
  }
}

window.Ably = Ably;
window.Echo = null;

let echoInstance: Echo<"ably"> | null = null;

// Lazy initialization - only create Echo when authenticated
export function initializeEcho(): Echo<"ably"> {
  if (echoInstance) {
    return echoInstance;
  }

  echoInstance = new Echo({
    broadcaster: "ably",
    authEndpoint: `${import.meta.env.VITE_API_URL}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    },
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
export function getEcho(): Echo<"ably"> | null {
  return echoInstance;
}

// For backward compatibility - but prefer using initializeEcho
export default {
  get instance() {
    return echoInstance;
  },
};
