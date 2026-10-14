# SyncSpace

SyncSpace is a React application for team workspaces and Kanban boards. It uses the [SyncSpace API](https://github.com/aardnsyhs/syncspace-api) for authentication, persistence, authorization, and broadcasting.

Use it to organize project tasks across columns, discuss cards, and follow board activity. This repository contains the browser client; authenticated workflows need the API.

## Implemented features

Source inspection confirms these client workflows. A successful build does not establish end-to-end correctness; see the [readiness audit](docs/OSS_READINESS_AUDIT.md) for verification limits.

- Email/password registration, email OTP verification, password reset, and optional Google login.
- Workspace selection and membership management with owner, admin, member, and viewer roles.
- Boards, card movement, column management, filtering, labels, due dates, completion, comments, checklists, and attachments.
- Board templates, read-only public sharing, activity feeds, and analytics views.
- Echo subscriptions for board/team updates, user notifications, and board presence.
- Light, dark, and system theme selection.

Due-date notifications are not scheduled by the backend. Ably has configuration code but was not tested. Keyboard card movement is not implemented in the board's pointer-only sensor configuration. Component libraries do not establish accessibility compliance.

## Stack and architecture

React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Radix UI components, dnd-kit, TanStack Query, Recharts, Laravel Echo, and Pusher.js. [package.json](package.json) and [yarn.lock](yarn.lock) define dependency versions.

[src/App.tsx](src/App.tsx) defines routes. Feature folders under `src/features/` contain pages, hooks, and components. [src/lib/api.ts](src/lib/api.ts) sends bearer-authenticated HTTP requests. [src/lib/echo.ts](src/lib/echo.ts) owns the WebSocket connection. The API's [architecture guide](https://github.com/aardnsyhs/syncspace-api/blob/main/docs/ARCHITECTURE.md) explains data and server authorization.

## Local development

Use Node.js 22.12 or newer within the 22.x line, or Node.js 24, and Corepack with Yarn 4.9.2 (the declared package manager). Check dependency engine constraints if choosing another runtime. The API needs PHP, Composer, and a MySQL-compatible database; follow its [setup instructions](https://github.com/aardnsyhs/syncspace-api#local-development) first.

From this repository:

```bash
corepack yarn install --immutable
cp .env.example .env
corepack yarn dev
```

Set `VITE_API_URL=http://localhost:8000` for the local API. This is the server origin, without `/api` or a trailing slash. The dev server uses port 5173. Use the same frontend hostname in backend CORS and Google redirect configuration.

For live updates, configure matching Reverb application keys in both repositories and start `php artisan reverb:start` in a separate backend terminal. See [configuration](docs/CONFIGURATION.md) and [real-time setup](https://github.com/aardnsyhs/syncspace-api/blob/main/docs/REALTIME.md). Reverb is unnecessary for HTTP-only work if the backend uses `BROADCAST_CONNECTION=null`; the client may still attempt WebSocket connections.

## Validation

```bash
corepack yarn lint
corepack yarn test:run
corepack yarn build
corepack yarn preview
```

`corepack yarn build` includes TypeScript checking. `corepack yarn test` starts Vitest in watch mode. Test utilities and mocks exist but there are no matching test cases, so `corepack yarn test:run` exits unsuccessfully. The audit lists existing lint failures. The coverage script exists, but the V8 coverage provider is not declared as a development dependency; coverage is not a validated workflow.

## Deployment and troubleshooting

Build with the deployment's public `VITE_*` configuration and serve `dist/`. These values are embedded at build time, not read from the host after deployment. Never place secrets in a `VITE_*` value. Static hosting must fall back to `index.html` for browser routes; [vercel.json](vercel.json) provides a Vercel rewrite.

See [development and deployment notes](docs/DEVELOPMENT.md) for extension points, smoke checks, setup errors, and hosting caveats. No hosted demo or screenshot has been verified for this audit.

## Contributing, security, and license

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request and [SECURITY.md](SECURITY.md) before reporting a vulnerability. Renovate configuration already exists; no duplicate dependency automation was added.

No LICENSE file exists in this repository. Licensing is blocked pending maintainer approval and provenance review. Public repository access does not establish redistribution permission. The backend's MIT package metadata does not license this client. See the [licensing review](docs/OSS_READINESS_AUDIT.md#licensing-review).
