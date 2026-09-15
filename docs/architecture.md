# Architecture

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js App Router, React 19, Tailwind CSS 4 |
| Auth | Supabase Auth via `@supabase/ssr` |
| Database | PostgreSQL (Supabase Free) |
| ORM | Prisma |
| Validation | Zod |
| Hosting | Vercel serverless |

## Data flow

```
Browser → Server Components (read via Prisma)
       → Server Actions (mutations, auth checks)
       → Prisma → PostgreSQL
```

Auth session is managed by Supabase cookies. Every Server Action calls `requireUser()` and verifies resource ownership before mutations.

## Auth gate

- `src/middleware.ts` — refreshes Supabase session, redirects unauthenticated users
- `src/app/(app)/layout.tsx` — calls `requireUser()` for all private routes
- `src/app/page.tsx` — redirects `/` to `/dashboard` or `/login`
- Server Actions — `requireUser()` on every mutation

## Routing

| Group | Routes |
|-------|--------|
| Public | `/`, `/login`, `/register`, `/forgot-password`, `/auth/callback` |
| App `(app)` | `/dashboard`, `/routines`, `/train`, `/history`, `/profile`, `/exercises` |
| Workout | `/train/[id]` — full-screen session (bottom nav hidden) |

## Key modules

| Path | Purpose |
|------|---------|
| `src/lib/actions/` | Server Actions (auth, exercises, routines, workouts) |
| `src/lib/workout/steps.ts` | Builds ordered workout steps including supersets |
| `src/lib/workout/progression.ts` | Double progression logic |
| `src/lib/supabase/` | Browser and server Supabase clients |
| `src/lib/prisma.ts` | Singleton Prisma client |

## Security

- All mutations verify `userId` from Supabase session
- IDs from client are never trusted without ownership check
- Optional RLS policies in `supabase/rls.sql` for defense in depth

## Workout persistence

- Each set saved immediately via `completeSet` Server Action
- Client state persisted in `localStorage` for accidental reload recovery
