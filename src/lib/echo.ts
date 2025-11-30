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

export function initializeEcho(): Echo<"pusher"> {
  if (echoInstance) {
    return echoInstance;
  }

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

export function disconnectEcho() {
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
