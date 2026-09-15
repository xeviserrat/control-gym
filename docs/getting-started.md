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

| Variable | Development (`.env.local`) | Production (Vercel) |
|----------|---------------------------|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Same |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Same |
| `DATABASE_URL` | Pooler URL (port 6543) | Same |
| `DIRECT_URL` | Direct URL (port 5432) | Same |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://control-gym-bay.vercel.app` |

Copy `.env.example` to `.env.local` for local dev. In Vercel, set **Production** env vars separately (Settings → Environment Variables → scope: Production).

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

**URL Configuration** (Authentication → URL Configuration):

| Setting | Development | Production |
|---------|-------------|------------|
| Site URL | `http://localhost:3000` | `https://control-gym-bay.vercel.app` |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://control-gym-bay.vercel.app/auth/callback` |

Add **both** redirect URLs so password reset works locally and in production.
