# E2E & CI strategy

## Goals

- Catch regressions in auth, routing, and critical UI before merge.
- Keep fast feedback: unit tests and lint run on every change; E2E stays a small, stable suite.
- Use the same Supabase + Postgres stack as production (no auth mocks).

## Pipeline layers

| Layer | Tool | When | Duration target |
|-------|------|------|-----------------|
| Lint | ESLint | Every PR / push | ~30s |
| Unit | Vitest (`src/**/*.test.ts`) | Every PR / push | ~30s |
| Build | `next build` + Prisma | Every PR / push | ~2–3 min |
| E2E smoke | Playwright (`e2e/smoke.spec.ts`) | Every PR / push | ~1–2 min |
| E2E auth | Playwright (`e2e/auth.spec.ts`) | When secrets set | +~30s |

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

### Smoke vs authenticated tests

**Smoke** (always run):

- Login page renders.
- Protected routes redirect to `/login`.
- `/manifest.json` returns JSON (no auth redirect).

**Auth** (optional until secrets exist):

- Login with a dedicated test user → `/dashboard`.

Skipped automatically when `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` are missing (local and CI).

### What we add later (not in v1)

- Train flow: start workout → complete one set → rest screen.
- Routine editor smoke.
- Scheduled run against production URL (read-only smoke).
- Vercel Preview deployments + Playwright `PLAYWRIGHT_BASE_URL` (optional job).

## GitHub secrets

Configure in **Settings → Secrets and variables → Actions** (repository `xeviserrat/control-gym`):

| Secret | Required | Where to copy it |
|--------|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** (build + E2E smoke) | Supabase → Settings → API → Project URL (`https://xxx.supabase.co`, **without** `/rest/v1/`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase → Settings → API → anon / publishable key |
| `DATABASE_URL` | **Yes** | Supabase → Database → Transaction pooler (port **6543**, `?pgbouncer=true`) |
| `DIRECT_URL` | **Yes** | Supabase → Database → Direct connection (port **5432**) |
| `E2E_TEST_EMAIL` | No | Dedicated test user email |
| `E2E_TEST_PASSWORD` | No | Password for that user |

**Minimum for green CI:** the first four secrets. Smoke E2E runs without login credentials; the auth spec is skipped if `E2E_TEST_*` are empty.

Values should match your local `.env` / Vercel production (same Supabase project is fine).

Fork PRs from external contributors will not receive secrets; smoke tests still need repo secrets on the default workflow for `build` to succeed if the project requires real env vars.

## Local E2E

```bash
# App env (.env or .env.local) — same as dev
npm run test:e2e:install   # once per machine / after @playwright/test upgrade
npm run build
npm run test:e2e

# Or let Playwright start the server (dev mode, faster iteration)
npm run test:e2e

# UI mode
npm run test:e2e:ui
```

Optional auth tests:

```bash
export E2E_TEST_EMAIL=...
export E2E_TEST_PASSWORD=...
npm run test:e2e
```

Against an already running server:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

## Conventions for new E2E tests

- Place specs under `e2e/` with `.spec.ts` suffix.
- Prefer roles and labels (`getByRole`, `getByLabel`) — matches Spanish UI copy.
- No `data-testid` unless accessibility selectors are insufficient.
- Shared login: `e2e/helpers/auth.ts`.
- Keep tests independent; one browser context per test (Playwright default).

## Failure artifacts

On CI failure, the workflow uploads `playwright-report/` for seven days. Download from the Actions run → **Artifacts**.
