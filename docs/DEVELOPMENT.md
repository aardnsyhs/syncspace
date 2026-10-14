# Client development and deployment

## Extension points

[src/App.tsx](../src/App.tsx) declares guest, authenticated, and public routes. Keep pages within the relevant feature folder; shared primitives live under `src/components/ui/`. [src/lib/permissions.ts](../src/lib/permissions.ts) controls visible actions, while server policies make authorization decisions.

[src/styles/tokens.css](../src/styles/tokens.css) contains light/dark color and radius tokens. [src/index.css](../src/index.css) consumes them. Typography and several local styles remain in CSS and components, so changing one token does not prove that every screen changed correctly. Preserve both themes and verify contrast when changing colors.

[KanbanBoard.tsx](../src/features/boards/components/KanbanBoard.tsx) exports `KanbanBoardProps`, `KanbanCard`, and `KanbanColumn`. It accepts movement/creation callbacks, but also imports application components and permission-related controls. It is not a separately packaged, backend-independent component library. Inspect its props and dependencies before reuse. [DraggableCard.tsx](../src/features/boards/components/DraggableCard.tsx) and [ColumnHeader.tsx](../src/features/boards/components/ColumnHeader.tsx) are further board extension points.

## Real-time changes

[src/hooks/useWorkspaceSocket.ts](../src/hooks/useWorkspaceSocket.ts) wraps Echo subscriptions. [useBoardChannel.ts](../src/features/boards/hooks/useBoardChannel.ts) maps named events to callbacks; [board types](../src/features/boards/types.ts) contain event constants. Match server channel names, payloads, and `broadcastAs()` values, including Echo's leading dot for custom names. Release subscriptions on cleanup. [AuthContext.tsx](../src/features/auth/store/AuthContext.tsx) initializes and disconnects Echo as authentication changes.

For a new event, update the backend event/controller first, then the client types and subscription callback, and verify with two sessions. Avoid documenting a proposed event as an existing feature.

## Checks and smoke testing

[package.json](../package.json) defines lint, build, and Vitest commands. [vitest.config.ts](../vitest.config.ts) uses jsdom and [src/test/setup.ts](../src/test/setup.ts); mocks live under `src/test/mocks/`. There are no matching test cases yet. No tracked CI workflow runs these checks automatically.

Suggested manual checks after a relevant change: register and verify a local account, sign in/out, switch workspaces, create a board/card, move a card, comment, attach a file, share/revoke a board link, and compare live updates in two authenticated sessions. Check keyboard use, both themes, errors, and narrow viewports. These are contributor instructions, not evidence that this audit clicked those controls.

## Static hosting

Run `corepack yarn build` with the target's [public configuration](CONFIGURATION.md), then serve `dist/` over HTTPS. `corepack yarn preview` is for local inspection, not a production server. Configure SPA fallbacks so direct navigation to `/boards/...` or `/auth/google/callback` returns `index.html`. [vercel.json](../vercel.json) supplies that rewrite for Vercel.

The backend needs a matching CORS origin, Google redirect if enabled, and browser-reachable secure WebSocket endpoint. HTTPS pages cannot use insecure WebSockets. Never copy API secrets into build variables. Google Fonts loads Inter from an external service in [index.html](../index.html); assess offline and privacy requirements before deployment.

## Troubleshooting

| Symptom | Check |
|---|---|
| API calls fail or contain `/api/api` | Set `VITE_API_URL` to the server origin only, restart Vite, inspect the request URL. |
| CORS/CSRF errors | Match browser origin and backend `FRONTEND_URL`; inspect allowed headers and CSRF-cookie requests. Do not disable authorization. |
| Port 5173 is occupied | Stop the conflicting local process or explicitly choose another Vite port and update origins. The current local Vite configuration uses a strict port. |
| Google code exchange fails | Match the browser's actual callback origin, backend redirect URI, and provider registration. |
| Live updates fail | Follow the backend [real-time guide](https://github.com/aardnsyhs/syncspace-api/blob/main/docs/REALTIME.md); check WS connection and channel authorization separately. |
| Avatar or attachment fails | Check API origin and backend storage setup; inspect the response and authorization status. |
| A deep link returns 404 | Add the static host's SPA fallback. |
| Lint or tests fail on an unchanged checkout | Compare with the [audit baseline](OSS_READINESS_AUDIT.md); do not hide failures. |
