# SaaS Boilerplate — Real-Time Collaborative Workspace

A production-ready, full-stack SaaS starter kit built with **Laravel 12** and **React 19**. Ships with a fully functional multi-tenant Kanban board, real-time collaboration via WebSockets, role-based access control, Google OAuth, email OTP verification, board analytics, and a white-label-ready UI.

---

## Table of Contents

1. [What's Included](#whats-included)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [⚡ Real-Time WebSocket Configuration](#-real-time-websocket-configuration)
8. [Google OAuth Setup](#google-oauth-setup)
9. [Customization](#customization)
10. [Role & Permission System](#role--permission-system)
11. [How to Add New Real-Time Events](#how-to-add-new-real-time-events)
12. [How to Customize the Board UI](#how-to-customize-the-board-ui)
13. [Deployment](#deployment)
14. [Demo Credentials](#demo-credentials)

---

## What's Included

| Feature | Details |
|---|---|
| **Authentication** | Email + password with OTP email verification, Google OAuth, password reset |
| **Multi-tenant Workspaces** | Each user gets a personal workspace on signup; teams can be created and shared |
| **Kanban Board** | Drag-and-drop columns and cards, WIP limits, card labels, due dates, checklists, attachments, comments |
| **Real-Time Collaboration** | Live card moves, column changes, presence indicators (who's online), notifications |
| **Board Analytics** | Throughput chart, cumulative flow diagram, assignee distribution, cycle time, lead time |
| **Board Templates** | 5 built-in global templates (Sprint Board, Bug Tracking, Product Roadmap, etc.) |
| **Public Board Sharing** | Share a read-only board via a public URL with optional expiry |
| **Notifications** | In-app + real-time push notifications for assignments, comments, mentions, due dates |
| **Role-Based Access** | 4-tier system: Owner → Admin → Member → Viewer |
| **Dark / Light Mode** | Animated theme toggle with View Transitions API |
| **Activity Feed** | Full audit trail of every board action |

---

## Tech Stack

### Backend (`syncspace-api`)
- **PHP 8.2+** / **Laravel 12**
- **Laravel Sanctum** — token-based API authentication
- **Laravel Reverb** — self-hosted WebSocket server (default)
- **MySQL** or **PostgreSQL**
- **PestPHP** — testing framework

### Frontend (`syncspace`)
- **React 19** + **TypeScript 5.9**
- **Vite 7** — build tool
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui** + **Radix UI** — accessible component primitives
- **@dnd-kit** — drag-and-drop
- **TanStack Query v5** — server state management
- **Laravel Echo** + **Pusher.js** — WebSocket client
- **Recharts** — analytics charts
- **Vitest** + **Testing Library** + **MSW** — testing

---

## Prerequisites

Install the following before you begin. **All versions listed are the minimum required.**

| Software | Minimum Version | Check |
|---|---|---|
| PHP | 8.2 | `php -v` |
| Composer | 2.x | `composer -V` |
| Node.js | 20.x | `node -v` |
| Yarn | 1.22+ | `yarn -v` |
| MySQL | 8.0 **or** PostgreSQL 15 | — |
| Git | any | `git -v` |

> **Windows users:** Use [Laravel Herd](https://herd.laravel.com/) or [Laragon](https://laragon.org/) for the easiest PHP + MySQL setup.
>
> **macOS users:** [Laravel Herd](https://herd.laravel.com/) or `brew install php composer mysql`.

---

## Project Structure

This boilerplate ships as **two separate repositories** that must be run simultaneously.

```
/
├── syncspace-api/     ← Laravel 12 backend (API + WebSocket server)
└── syncspace/         ← React 19 frontend (SPA)
```

Both must be running at the same time during development. The frontend calls the backend API and connects to the backend WebSocket server.

---

## Backend Setup

All commands below are run from inside the **`syncspace-api`** directory.

### 1. Install PHP dependencies

```bash
composer install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

### 3. Generate the application key

```bash
php artisan key:generate
```

### 4. Configure your database

Open `.env` and set your database credentials:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=saas_boilerplate
DB_USERNAME=root
DB_PASSWORD=your_password
```

> Create the database first if it doesn't exist:
> ```sql
> CREATE DATABASE saas_boilerplate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> ```

### 5. Run migrations and seed demo data

```bash
php artisan migrate:fresh --seed
```

This runs all migrations and seeds the database with:
- **4 demo users** (one per role — see [Demo Credentials](#demo-credentials))
- **1 demo workspace** called "Demo Workspace"
- **2 sample boards** with columns, cards, labels, and comments
- **5 global board templates** (Sprint Board, Bug Tracking, Product Roadmap, Marketing Campaign, Personal Tasks)

### 6. Configure mail (for OTP verification)

For local development, the `log` driver writes emails to `storage/logs/laravel.log` — no mail server needed.

```dotenv
MAIL_MAILER=log
```

For production, configure a real mail provider (Mailgun, Resend, SES, etc.):

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS="hello@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 7. Start the API server

```bash
php artisan serve
```

The API is now running at **`http://localhost:8000`**.

> **Keep this terminal open.** You need the API server running alongside the WebSocket server and the frontend dev server.

---

## Frontend Setup

All commands below are run from inside the **`syncspace`** directory.

### 1. Install Node dependencies

```bash
yarn install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

### 3. Set the API URL

Open `.env` and confirm this matches where your backend is running:

```dotenv
VITE_API_URL=http://localhost:8000
VITE_APP_NAME="Your App Name"
```

### 4. Start the development server

```bash
yarn dev
```

The frontend is now running at **`http://localhost:5173`**.

---

## ⚡ Real-Time WebSocket Configuration

> **This section is the most common source of setup issues. Read it carefully.**

The boilerplate uses **Laravel Reverb** by default — a free, self-hosted WebSocket server built into Laravel. No third-party account is required for local development.

### How it works

```
Browser (React)  ──WS──►  Laravel Reverb  ◄──  Laravel API
     │                         │
     └── subscribes to         └── broadcasts events
         private channels          when data changes
```

The frontend connects to Reverb using the **Pusher protocol** via `laravel-echo` + `pusher-js`. The backend broadcasts events to Reverb, which pushes them to all subscribed clients.

---

### Step 1 — Configure the backend `.env`

Open `syncspace-api/.env` and set these values:

```dotenv
# Tell Laravel to use Reverb for broadcasting
BROADCAST_CONNECTION=reverb

# Reverb server credentials — these must match Step 2
REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

> **Important:** `REVERB_APP_KEY` is the value the frontend uses to connect. It can be any string — just keep it consistent between backend and frontend.

### Step 2 — Configure the frontend `.env`

Open `syncspace/.env` and set these values to **exactly match** the backend:

```dotenv
# Must match BROADCAST_CONNECTION in the backend
VITE_BROADCAST_DRIVER=reverb

# Must match REVERB_APP_KEY in the backend
VITE_REVERB_APP_KEY=my-app-key

# Must match REVERB_HOST and REVERB_PORT in the backend
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

> **The `VITE_REVERB_APP_KEY` must be identical to `REVERB_APP_KEY` in the backend `.env`.** This is the most common misconfiguration.

### Step 3 — Start the Reverb WebSocket server

Open a **new terminal** in the `syncspace-api` directory and run:

```bash
php artisan reverb:start
```

You should see:

```
  INFO  Starting server on 0.0.0.0:8080
```

> **Keep this terminal open.** You now have three processes running:
> 1. `php artisan serve` — API server on port 8000
> 2. `php artisan reverb:start` — WebSocket server on port 8080
> 3. `yarn dev` — Frontend on port 5173

### Step 4 — Verify the connection

1. Open the app at `http://localhost:5173` and log in.
2. Open your browser's DevTools → Network tab → filter by **WS**.
3. You should see an active WebSocket connection to `ws://localhost:8080`.
4. Open the same board in two browser tabs — you should see the online presence indicator update in real time.

---

### Using Ably Instead of Reverb (Optional — Production)

If you prefer a managed cloud WebSocket service, the boilerplate supports [Ably](https://ably.com) out of the box.

**Backend `syncspace-api/.env`:**
```dotenv
BROADCAST_CONNECTION=ably
ABLY_KEY=your-ably-api-key
```

**Frontend `syncspace/.env`:**
```dotenv
VITE_BROADCAST_DRIVER=ably
VITE_ABLY_KEY=your-ably-public-key   # The part BEFORE the colon in your Ably key
VITE_ABLY_CLUSTER=eu                 # Your Ably cluster region
```

> Your full Ably key looks like `appId.keyId:keySecret`. The **public key** for the frontend is everything **before** the colon. The **full key** goes in the backend.

---

### WebSocket Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| No WS connection in DevTools | Reverb not running | Run `php artisan reverb:start` |
| WS connects but no events fire | `BROADCAST_CONNECTION` not set to `reverb` | Check backend `.env` |
| 403 on channel auth | Token not sent to auth endpoint | Ensure you're logged in and `VITE_API_URL` is correct |
| Frontend can't reach Reverb | Port mismatch | Confirm `VITE_REVERB_PORT` matches `REVERB_PORT` |
| Events fire but UI doesn't update | Wrong channel name | Check browser console for Echo subscription errors |

---

## Google OAuth Setup

Google OAuth is optional. If you don't need it, you can ignore this section — the email/password flow works without it.

### 1. Create a Google OAuth app

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Click **Create Credentials** → **OAuth 2.0 Client ID**.
3. Application type: **Web application**.
4. Add to **Authorized redirect URIs**: `http://localhost:5173/auth/google/callback`

### 2. Configure the backend

```dotenv
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

### 3. Configure the frontend

```dotenv
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

> The frontend builds the Google OAuth URL directly and posts the authorization code to the backend. No Socialite package is used — the implementation is a clean, dependency-free HTTP exchange.

---

## Customization

### Changing the App Name

Set `VITE_APP_NAME` in `syncspace/.env`. This value appears in the auth pages, footer, and browser tab.

```dotenv
VITE_APP_NAME="Acme Tasks"
```

Set `APP_NAME` in `syncspace-api/.env` for email subjects and notifications:

```dotenv
APP_NAME="Acme Tasks"
```

---

### Changing the Brand Theme

**All brand colours live in a single file: `src/styles/tokens.css`.**

Open it and you'll find two sections — `:root` (light mode) and `.dark` (dark mode) — with every colour variable clearly labelled.

#### Quick example — switching to an indigo brand

Find the `--primary` variables and change them:

```css
/* src/styles/tokens.css */

:root {
  /* BEFORE (neutral grey) */
  --primary:            oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);

  /* AFTER (indigo) */
  --primary:            oklch(0.5 0.24 264);
  --primary-foreground: oklch(0.98 0 0);
}

.dark {
  /* BEFORE */
  --primary:            oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);

  /* AFTER (lighter indigo for dark backgrounds) */
  --primary:            oklch(0.72 0.18 264);
  --primary-foreground: oklch(0.1 0 0);
}
```

**That's it.** Every button, link, focus ring, badge, and interactive element in the app updates automatically because they all reference `var(--primary)`.

#### OKLCH colour reference

The colour format is `oklch(lightness chroma hue)`:

| Value | Range | Effect |
|---|---|---|
| `lightness` | `0` → `1` | `0` = black, `1` = white |
| `chroma` | `0` → `~0.4` | `0` = grey, `0.4` = vivid |
| `hue` | `0` → `360` | Colour wheel position |

**Common hues:**

```
  0 / 360 = red       30 = orange      60 = yellow
        120 = green      180 = cyan      240 = blue
        270 = violet     300 = magenta
```

#### Changing the border radius

```css
:root {
  --radius: 0.625rem;  /* default — subtle rounding */
  /* --radius: 0rem;   sharp corners */
  /* --radius: 1rem;   pill-style */
}
```

#### Changing the default workspace name

When a new user registers, a personal workspace is created automatically. Change its name in `syncspace-api/.env`:

```dotenv
APP_DEFAULT_WORKSPACE_NAME="My Workspace"
```

#### Changing the default board columns

When a new board is created without a template, these columns are used. Edit `syncspace-api/config/board.php`:

```php
'default_columns' => [
    'Backlog',
    'In Progress',
    'Review',
    'Done',
],
```

---

## Role & Permission System

The boilerplate ships with a 4-tier role hierarchy. Roles are scoped per workspace (team).

| Role | Manage Team | Manage Members | Manage Boards | Edit Cards | View | Comment |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Member** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Viewer** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### Checking permissions on the frontend

```tsx
import { getPermissions } from "@/lib/permissions";

const permissions = getPermissions(currentUserRole); // "owner" | "admin" | "member" | "viewer"

if (permissions.canManageBoards) {
  // show board settings button
}
```

### Checking permissions on the backend

```php
// In a controller
$this->authorize('update', $board); // uses BoardPolicy

// In a policy
public function update(User $user, Board $board): bool
{
    $role = TeamRole::from($board->team->getMemberRole($user));
    return $role->canManageBoards();
}
```

---

## How to Add New Real-Time Events

This is a 4-step process. The example below adds a `CardPinned` event.

### Step 1 — Create the Laravel event

```bash
php artisan make:event CardPinned
```

```php
// app/Events/CardPinned.php
class CardPinned implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Card $card) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("board.{$this->card->column->board_id}")];
    }

    public function broadcastAs(): string
    {
        return 'CardPinned'; // becomes ".CardPinned" on the frontend
    }

    public function broadcastWith(): array
    {
        return ['card' => ['id' => $this->card->id, 'is_pinned' => true]];
    }
}
```

### Step 2 — Broadcast the event from a controller or service

```php
broadcast(new CardPinned($card))->toOthers();
```

### Step 3 — Add the event name to the frontend constants

```typescript
// src/features/boards/types.ts
export const BOARD_EVENTS = {
  // ... existing events
  CARD_PINNED: ".CardPinned",  // add this
} as const;
```

### Step 4 — Subscribe to the event in a component

```typescript
// Using the useWorkspaceSocket hook directly
const { subscribePrivate, leave } = useWorkspaceSocket();

useEffect(() => {
  subscribePrivate<{ card: { id: number; is_pinned: boolean } }>(
    `board.${boardId}`,
    ".CardPinned",
    (payload) => {
      console.log("Card pinned:", payload.card.id);
    }
  );
  return () => leave(`board.${boardId}`);
}, [boardId]);

// Or via useBoardChannel (add to BoardChannelCallbacks interface first)
useBoardChannel(boardId, {
  onCardPinned: (payload) => handleCardPinned(payload),
});
```

---

## How to Customize the Board UI

The Kanban board is a standalone `<KanbanBoard />` component that accepts typed props. You can use it independently of `BoardPage` with any data source.

### KanbanBoard props

```typescript
import { KanbanBoard } from "@/features/boards/components/KanbanBoard";
import type { KanbanColumn, KanbanCard } from "@/features/boards/components/KanbanBoard";

<KanbanBoard
  columns={columns}          // KanbanColumn[]
  cards={cards}              // KanbanCard[]
  canManage={true}           // show/hide edit controls
  hasActiveFilters={false}   // changes empty state message
  token={token}              // bearer token for WIP limit PATCH
  onCardClick={(id) => {}}   // open card detail
  onCardMove={async (cardId, toColumnId, position) => {}}
  onToggleCardComplete={async (cardId, isCompleted) => {}}
  onCreateCard={async (columnId, title) => {}}
  onCreateColumn={async (name) => {}}
  onColumnUpdate={() => {}}  // called after rename / WIP change
/>
```

### Adding a custom card renderer

To render cards differently, fork `DraggableCard.tsx`. It receives a `card: CardData` prop and is purely presentational — no API calls inside.

### Adding a custom column header

Fork `ColumnHeader.tsx`. It receives `columnId`, `name`, `cardCount`, `wipLimit`, `wipExceeded` as props.

---

## Deployment

### Backend

1. Set `APP_ENV=production` and `APP_DEBUG=false` in `.env`.
2. Set a strong `APP_KEY` (already generated — don't regenerate in production).
3. Configure a production database and run `php artisan migrate --force`.
4. Run `php artisan config:cache && php artisan route:cache && php artisan view:cache`.
5. Set up a queue worker: `php artisan queue:work --daemon`.
6. For WebSockets in production, use **Ably** (managed) or run Reverb behind a reverse proxy (Nginx/Caddy with WebSocket support).

### Frontend

```bash
yarn build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, S3 + CloudFront).

Set these environment variables on your hosting platform:

```dotenv
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME="Your App Name"
VITE_BROADCAST_DRIVER=ably          # recommended for production
VITE_ABLY_KEY=your-ably-public-key
```

### CORS

Update `FRONTEND_URL` and `FRONTEND_URL_PROD` in the backend `.env` to match your production frontend domain:

```dotenv
FRONTEND_URL=https://app.yourdomain.com
FRONTEND_URL_PROD=https://app.yourdomain.com
```

---

## Demo Credentials

After running `php artisan migrate:fresh --seed`, these accounts are available:

| Role | Email | Password |
|---|---|---|
| **Owner** | `owner@demo.com` | `password` |
| **Admin** | `admin@demo.com` | `password` |
| **Member** | `member@demo.com` | `password` |
| **Viewer** | `viewer@demo.com` | `password` |

Log in with each account to explore the different permission levels.

> **Remove or replace these accounts before going to production.**
> Run `php artisan migrate:fresh` (without `--seed`) on a clean production database.

---

## Scripts Reference

### Backend

```bash
php artisan serve              # Start API server (port 8000)
php artisan reverb:start       # Start WebSocket server (port 8080)
php artisan migrate:fresh --seed  # Reset DB and seed demo data
php artisan queue:work         # Start queue worker (for async jobs)
composer test                  # Run PestPHP test suite
```

### Frontend

```bash
yarn dev          # Start dev server (port 5173)
yarn build        # Build for production
yarn preview      # Preview production build locally
yarn test         # Run Vitest in watch mode
yarn test:run     # Run tests once (CI)
yarn test:coverage  # Run tests with coverage report
yarn lint         # Run ESLint
```

---

*Built with ❤️ as a high-ticket SaaS boilerplate. Designed to be extended, not rewritten.*
