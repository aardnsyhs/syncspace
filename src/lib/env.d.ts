interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ABLY_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
