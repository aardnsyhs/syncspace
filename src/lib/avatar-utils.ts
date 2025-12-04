const API_URL = import.meta.env.VITE_API_URL || "";

if (import.meta.env.MODE === "production") {
  console.log(
    "[Avatar Utils Init] VITE_API_URL:",
    import.meta.env.VITE_API_URL
  );
  console.log("[Avatar Utils Init] API_URL:", API_URL);
}

export function normalizeAvatarUrl(
  avatarUrl?: string | null
): string | undefined {
  if (!avatarUrl) return undefined;

  try {
    if (import.meta.env.MODE === "production") {
      console.log("[Avatar Utils] Input URL:", avatarUrl);
      console.log("[Avatar Utils] API_URL:", API_URL);
    }

    if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
      const url = new URL(avatarUrl);

      const path = url.pathname;

      const normalizedUrl = `${API_URL}${path}`;

      if (import.meta.env.MODE === "production") {
        console.log("[Avatar Utils] Normalized URL:", normalizedUrl);
      }

      return normalizedUrl;
    }

    if (avatarUrl.startsWith("/")) {
      const normalizedUrl = `${API_URL}${avatarUrl}`;

      if (import.meta.env.MODE === "production") {
        console.log("[Avatar Utils] Normalized URL (relative):", normalizedUrl);
      }

      return normalizedUrl;
    }

    if (import.meta.env.MODE === "production") {
      console.log("[Avatar Utils] Returned as-is:", avatarUrl);
    }

    return avatarUrl;
  } catch (error) {
    console.error("Error normalizing avatar URL:", error);
    return avatarUrl;
  }
}
