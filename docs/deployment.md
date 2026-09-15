# Deployment

## Vercel

1. Import Git repository
2. Framework preset: Next.js
3. Add environment variables from `.env.example`
4. Deploy

Build runs `prisma generate` via `postinstall` script.

## Database migrations (production)

```bash
DATABASE_URL="..." DIRECT_URL="..." npx prisma migrate deploy
```

## Supabase

- Use **Transaction pooler** URL for `DATABASE_URL` (port 6543, `?pgbouncer=true`)
- Use **Direct** URL for `DIRECT_URL` (migrations)
- Run `supabase/rls.sql` in SQL Editor (optional)
- Configure Auth redirect URLs: `https://your-domain.vercel.app/auth/callback`

## PWA

`public/manifest.json` is linked in root layout metadata. Add `icon-192.png` and `icon-512.png` to `public/` for install prompts.

## Cost

Designed for Vercel Hobby + Supabase Free — no Redis, workers, or persistent servers required.
