# Doctor Feature — Quickstart

## Prerequisites

- Node.js >= 18
- Backend API running at the configured base URL (default: `http://localhost:8080/api/v1`)
- Valid auth token for doctor or admin role

## Setup

1. Switch to the feature branch:

```bash
git checkout -b 003-doctor
```

2. Install dependencies (if not already installed):

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Pages

| URL | Description |
|---|---|
| `/doctors` | Doctor list with filters and pagination |
| `/doctors/:id` | Doctor profile (view/edit) |
| `/doctors/:id/schedule` | Schedule configuration and slot viewer |

## Development Flow

1. Start with entities: define types, API functions, and TanStack Query hooks in `src/entities/doctor/` and `src/entities/schedule/`.
2. Build pages top-down: DoctorProfilePage → DoctorSchedulePage → DoctorListPage.
3. Add validation, error handling, and optimistic updates after basic flows work.
4. Polish with loading skeletons, empty states, and toast notifications.

## Key Commands

```bash
npm run dev          # Start dev server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm run test         # Run tests
npm run build        # Production build
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Backend API base URL |

## Testing

Run the full test suite:

```bash
npm run test
```

Run tests for a specific entity:

```bash
npm run test -- src/entities/doctor
```
