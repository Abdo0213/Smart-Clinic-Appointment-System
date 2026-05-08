# Patient Feature — Quickstart

## Prerequisites

- Node.js >= 20
- Next.js 16 project initialized
- API server running at `http://localhost:8080/api`

## Setup

```bash
# 1. Create and switch to feature branch
git checkout -b 002-patient

# 2. Install dependencies
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod

# 3. Create FSD directories
mkdir -p src/entities/patient/{model,api,ui}
mkdir -p src/pages/patient-profile
mkdir -p src/pages/patient-list
```

## Development Order

1. **Types & Schemas** — `src/entities/patient/model/types.ts`, `schemas.ts`, `constants.ts`
2. **API Layer** — `src/shared/lib/api-client.ts`, `src/entities/patient/api/patient-api.ts`
3. **Hooks** — `src/entities/patient/model/hooks.ts`
4. **UI Components** — `patient-fields.tsx` → `patient-form.tsx` → `patient-card.tsx` → `patient-columns.tsx`
5. **Pages** — Registration → Profile → List
6. **Role Guards** — Access control per route

## Running

```bash
# Start dev server
npm run dev

# Run linter
npm run lint

# Run type check
npm run typecheck
```

## Key Files

| Purpose | Path |
|---|---|
| Patient types | `src/entities/patient/model/types.ts` |
| Zod schemas | `src/entities/patient/model/schemas.ts` |
| API functions | `src/entities/patient/api/patient-api.ts` |
| React Query hooks | `src/entities/patient/model/hooks.ts` |
| Patient form | `src/entities/patient/ui/patient-form.tsx` |
| Patient card | `src/entities/patient/ui/patient-card.tsx` |
| Patient list page | `src/pages/patient-list/page.tsx` |
| Patient profile page | `src/pages/patient-profile/page.tsx` |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/patients` | Create patient |
| GET | `/patients/{id}` | Get patient by ID |
| GET | `/patients?name=&phone=&page=&size=` | List patients |
| PUT | `/patients/{id}` | Update patient |
