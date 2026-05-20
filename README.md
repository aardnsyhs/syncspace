# SyncSpace

Frontend aplikasi SyncSpace - Collaborative Kanban Board.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite 7
- **Styling**: Tailwind CSS v4
- **UI**: Radix UI + shadcn/ui components
- **Data Fetching**: @tanstack/react-query
- **Drag & Drop**: @dnd-kit
- **Realtime**: Laravel Echo + Ably
- **Testing**: Vitest + Testing Library + MSW

## Quick Start

```bash
# Install dependencies
yarn install

# Copy environment
cp .env.example .env

# Start development server
yarn dev
```

## Project Structure

```
src/
├── components/     # Shared UI components
├── features/       # Feature modules
│   ├── auth/       # Authentication
│   ├── boards/     # Board management
│   ├── cards/      # Card details
│   ├── dashboard/  # Dashboard
│   ├── team/       # Team management
│   └── ...
├── hooks/          # Reusable hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useOnClickOutside.ts
│   └── useTheme.ts
├── lib/            # Utilities
│   ├── api.ts      # API client
│   ├── queries/    # React Query hooks
│   └── utils.ts
├── types/          # Centralized types
│   ├── api.ts
│   ├── user.ts
│   ├── team.ts
│   ├── board.ts
│   ├── card.ts
│   ├── notification.ts
│   └── events.ts
└── test/           # Test setup & mocks
```

## Scripts

```bash
yarn dev          # Start dev server
yarn build        # Build for production
yarn preview      # Preview production build
yarn test         # Run tests in watch mode
yarn test:run     # Run tests once
yarn lint         # Run ESLint
```

## Testing

```bash
# Run all tests
yarn test:run

# Run specific test file
yarn test:run src/features/boards/__tests__/

# With coverage
yarn test:coverage
```

## Environment Variables

```env
VITE_API_URL=http://localhost:8000  # Backend API URL
```

## Deployment

Build untuk production:

```bash
yarn build
```

Deploy folder `dist/` ke static hosting (Vercel, Netlify, dll).
