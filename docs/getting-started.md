# Getting Started

## Prerequisites

- Node.js 20+
- npm
- Supabase project (Free tier)
- Vercel account (Hobby tier) for deployment

## Install

```bash
npm install
cp .env.example .env.local
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `DATABASE_URL` | PostgreSQL connection (Transaction pooler, port 6543) |
| `DIRECT_URL` | Direct PostgreSQL connection (port 5432, for migrations) |
| `NEXT_PUBLIC_SITE_URL` | Site URL for password reset emails (optional locally) |

## Database setup

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Global exercises are seeded. Example routine "Torso A" is created automatically on first login.

## Development

```bash
npm run dev    # http://localhost:3000
npm run test   # Vitest unit tests
npm run lint   # ESLint
```

## Supabase Auth

Enable Email provider in Supabase Dashboard → Authentication → Providers.

For password recovery, set Site URL and redirect URLs in Auth settings to include `/auth/callback`.
