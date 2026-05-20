/**
 * Vite environment variable type declarations.
 *
 * Add any new VITE_* variables here so TypeScript can validate them at
 * compile time. All variables are `string` unless explicitly typed otherwise.
 */
interface ImportMetaEnv {
  // -------------------------------------------------------------------------
  // Core
  // -------------------------------------------------------------------------
  /** Base URL of the Laravel API backend. E.g. http://localhost:8000 */
  readonly VITE_API_URL: string;

  /** Display name of the application. Used in the UI (auth pages, footer, etc.) */
  readonly VITE_APP_NAME?: string;

  // -------------------------------------------------------------------------
  // Broadcasting — driver selection
  // -------------------------------------------------------------------------
  /**
   * Which WebSocket driver to use.
   * Options: "reverb" (default, self-hosted) | "ably" (managed cloud)
   */
  readonly VITE_BROADCAST_DRIVER?: string;

  // -------------------------------------------------------------------------
  // Laravel Reverb (self-hosted — recommended for local development)
  // -------------------------------------------------------------------------
  readonly VITE_REVERB_APP_KEY?: string;
  readonly VITE_REVERB_HOST?: string;
  readonly VITE_REVERB_PORT?: string;
  readonly VITE_REVERB_SCHEME?: string;

  // -------------------------------------------------------------------------
  // Ably (managed cloud — optional, for production)
  // -------------------------------------------------------------------------
  /** Full Ably API key (format: "appId.keyId:keySecret") */
  readonly VITE_ABLY_KEY?: string;
  /** Ably cluster region. Defaults to "eu". */
  readonly VITE_ABLY_CLUSTER?: string;

  // -------------------------------------------------------------------------
  // Google OAuth (optional — remove if not using Google login)
  // -------------------------------------------------------------------------
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
