# Client configuration

Copy [.env.example](../.env.example) to `.env` for local development. Restart Vite after changing it. [src/lib/env.d.ts](../src/lib/env.d.ts) lists application-specific environment types; declarations do not validate values at runtime. Vite exposes `VITE_*` values in the browser bundle, so they must contain only public configuration.

| Variable | Requirement and behavior | Source |
|---|---|---|
| `VITE_API_URL` | Required server origin, e.g. `http://localhost:8000`. Do not append `/api` or a trailing slash; callers add API paths. | [API client](../src/lib/api.ts) |
| `VITE_APP_NAME` | Optional display name on auth/public-board pages; does not replace the static browser title. | [Auth layout](../src/features/auth/components/AuthLayout.tsx), [index.html](../index.html) |
| `VITE_BROADCAST_DRIVER` | Optional; defaults to `reverb`. Only `ably` selects the alternate branch; no client disable/pusher selector exists. | [Echo](../src/lib/echo.ts) |
| `VITE_REVERB_APP_KEY` | Required for Reverb; match the backend public application key. | [Echo](../src/lib/echo.ts) |
| `VITE_REVERB_HOST` | Defaults to `localhost`; browser-reachable hostname, without scheme. | [Echo](../src/lib/echo.ts) |
| `VITE_REVERB_PORT` | Defaults to `8080`; used for both WS and WSS ports. | [Echo](../src/lib/echo.ts) |
| `VITE_REVERB_SCHEME` | Defaults to `http`; `https` enables TLS. | [Echo](../src/lib/echo.ts) |
| `VITE_ABLY_KEY` | Optional, only with the Ably branch. Code takes the portion before `:` and connects through Pusher compatibility. Do not expose a secret; this integration is not validated. | [Echo](../src/lib/echo.ts) |
| `VITE_ABLY_CLUSTER` | Optional Ably compatibility setting, defaults to `eu`. | [Echo](../src/lib/echo.ts) |
| `VITE_GOOGLE_CLIENT_ID` | Required only for Google login. Configure the backend client secret and redirect separately. | [Auth API](../src/features/auth/api/authApi.ts) |

The frontend builds the Google redirect as `${window.location.origin}/auth/google/callback`. Register that exact URI with Google and set the backend `GOOGLE_REDIRECT_URI` to match. The UI still renders a Google button without a configured client ID; an unconfigured provider is not a working login method.

Use [env.production.template](../env.production.template) as public example configuration for a deployment build. Its example domains are placeholders, not a hosted SyncSpace service. `.env.production` takes precedence during a production build. Check for unintended overrides before building. No tracked deployment workflow injects secrets automatically.

The backend's [configuration](https://github.com/aardnsyhs/syncspace-api/blob/main/docs/CONFIGURATION.md) and [real-time guide](https://github.com/aardnsyhs/syncspace-api/blob/main/docs/REALTIME.md) explain matching server settings.
