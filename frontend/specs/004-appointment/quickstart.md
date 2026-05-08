# Appointment Feature — Quickstart

## Prerequisites

- Node.js >= 18
- Package manager (pnpm preferred)
- Backend API running (see API contracts in `contracts/appointment-api.md`)
- Auth service providing JWT tokens with role claims

## Setup

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

## Key Paths

| What | Path |
|---|---|
| Patient appointments page | `/appointments` |
| Book new appointment | `/appointments/book` |
| Doctor daily queue | `/doctor/queue` |
| Reception dashboard | `/reception/dashboard` |

## Key Files to Start With

1. **Types** — `src/entities/appointment/model/types.ts`  
   All shared type definitions. Start here to understand the data model.

2. **API Client** — `src/shared/api/appointment.ts`  
   Raw HTTP functions. Configure base URL and auth headers here.

3. **React Query Hooks** — `src/entities/appointment/model/appointment-api.ts`  
   Server-state hooks used by all features and pages.

4. **Booking Store** — `src/features/appointment-booking/model/bookingStore.ts`  
   Zustand store for the multi-step booking wizard.

## Development Flow

1. **Start with entities**: Define types and API hooks first — everything depends on these.
2. **Build features bottom-up**: Booking store → Wizard steps → Wizard container.
3. **Compose pages last**: Pages assemble widgets and features.
4. **Test as you go**: Each layer should be independently testable.

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_QUEUE_POLL_INTERVAL=30000
```

## Mocking (Development)

If the backend is not yet available, use MSW handlers:

```bash
pnpm add -D msw
pnpm msw init public/
```

Create mock handlers in `src/shared/api/mocks/appointment.handlers.ts` covering all endpoints from the API contracts.

## Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm typecheck

# Linting
pnpm lint
```
